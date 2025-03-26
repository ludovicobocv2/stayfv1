import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env.test
dotenv.config({ path: '.env.test' });

const testEmail = process.env.TEST_USER_EMAIL;
const testPassword = process.env.TEST_USER_PASSWORD;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verificar se todas as variáveis de ambiente necessárias estão definidas
if (!testEmail || !testPassword || !supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente necessárias não estão definidas');
}

console.log('Variáveis de ambiente carregadas:');
console.log('TEST_USER_EMAIL:', testEmail);
console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey);

test('monitor sync and request issues', async ({ page }) => {
  // Mapear requisições para detectar duplicações
  const requestMap = new Map();
  let syncStatusResponse: any = null;
  
  // Criar cliente Supabase para teste
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Fazer login com usuário de teste
  console.log('Tentando fazer login com:', testEmail);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });

  if (authError) {
    console.error('Erro ao autenticar:', authError);
    throw authError;
  }

  console.log('Login bem-sucedido:', authData);
  
  // Monitorar requisições ao Supabase
  page.on('request', request => {
    if (request.url().includes('supabase')) {
      const url = request.url();
      const count = requestMap.get(url) || 0;
      requestMap.set(url, count + 1);
      
      console.log(`📡 [${new Date().toISOString()}] Requisição #${count + 1} - ${request.method()} ${url}`);
      
      // Log do corpo da requisição para POST/PUT
      if (['POST', 'PUT'].includes(request.method())) {
        const data = request.postData();
        console.log('Corpo da requisição:', data);
        
        // Identificar chamada de teste de sincronização
        if (url.includes('test_sync_status')) {
          console.log('🔄 Verificando status de sincronização...');
          try {
            const body = JSON.parse(data || '{}');
            console.log('Parâmetros de sincronização:', body);
          } catch (e) {
            console.log('Não foi possível parsear o corpo da requisição:', e);
          }
        }
      }
    }
  });

  // Monitorar respostas do Supabase
  page.on('response', async response => {
    if (response.url().includes('supabase')) {
      const url = response.url();
      console.log(`📥 [${new Date().toISOString()}] Resposta ${response.status()} para ${url}`);
      
      try {
        const responseBody = await response.text();
        
        // Capturar resposta do status de sincronização
        if (url.includes('test_sync_status')) {
          try {
            syncStatusResponse = JSON.parse(responseBody);
            console.log('Status de sincronização:', syncStatusResponse);
          } catch (e) {
            console.error('Erro ao parsear resposta de sincronização:', e);
            console.log('Resposta bruta:', responseBody);
          }
        }
        
        // Se for erro, logar detalhes
        if (response.status() >= 400) {
          console.log('Detalhes da resposta de erro:', responseBody);
          try {
            const errorJson = JSON.parse(responseBody);
            console.log('Erro estruturado:', errorJson);
          } catch {
            console.log('Resposta de erro não é JSON válido');
          }
        }
      } catch (e) {
        console.log('Não foi possível ler o corpo da resposta:', e);
      }
    }
  });

  // Capturar erros de rede
  page.on('requestfailed', request => {
    console.log(`❌ [${new Date().toISOString()}] Falha na requisição: ${request.url()}`);
    console.log('Erro:', request.failure()?.errorText);
  });

  // Navegar para a página
  console.log('🚀 Iniciando monitoramento...');
  await page.goto('http://localhost:3000');
  
  // Aguardar carregamento inicial
  await page.waitForLoadState('networkidle');
  console.log('📋 Página carregada, analisando padrões de requisição...');

  // Testar função de sincronização diretamente
  try {
    const { data, error } = await supabase.rpc('test_sync_status', {
      test_user_id: authData.user?.id
    });
    
    if (error) {
      console.error('❌ Erro ao testar sincronização:', error);
    } else {
      console.log('✅ Teste de sincronização bem-sucedido:', data);
      syncStatusResponse = data;
    }
  } catch (e) {
    console.error('❌ Exceção ao testar sincronização:', e);
  }

  // Aguardar tempo suficiente para sincronização inicial e teste de status
  await page.waitForTimeout(2000);

  // Analisar resultados
  console.log('\n📊 Análise de Requisições:');
  
  // Verificar duplicações
  let hasDuplicates = false;
  Array.from(requestMap).forEach(([url, count]) => {
    if (count > 1) {
      hasDuplicates = true;
      console.log(`⚠️ Requisição duplicada (${count}x): ${url}`);
    }
  });

  // Verificar status de sincronização
  if (syncStatusResponse) {
    console.log('\n🔄 Resultado do Status de Sincronização:');
    console.log('Status:', syncStatusResponse.status);
    console.log('Última sincronização:', new Date(syncStatusResponse.last_sync).toLocaleString());
    console.log('Mudanças pendentes:', syncStatusResponse.pending_changes ? 'Sim' : 'Não');
  } else {
    console.log('\n⚠️ Não foi possível obter o status de sincronização');
  }

  // Validar resultados
  expect(hasDuplicates, 'Não deveria haver requisições duplicadas').toBe(false);
  if (syncStatusResponse) {
    expect(syncStatusResponse.status, 'Status de sincronização deveria ser success').toBe('success');
  } else {
    throw new Error('Teste de sincronização falhou: não foi possível obter o status');
  }

  // Fazer logout
  await supabase.auth.signOut();
}); 
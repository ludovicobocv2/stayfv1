'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/app/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';

export default function SupabaseConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [tableCheckResults, setTableCheckResults] = useState<{table: string, exists: boolean}[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLog((prev) => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };

  const clearLog = () => setLog([]);

  const testConnection = async () => {
    clearLog();
    setConnectionStatus('testing');
    setTableCheckResults([]);
    setErrorMessage(null);
    
    try {
      const supabase = createClient();
      addLog('Iniciando teste de conexão com o Supabase...');
      
      // Teste básico de conexão
      const { data, error } = await supabase.from('profiles').select('count()', { count: 'exact', head: true });
      
      if (error) {
        throw new Error(`Erro na conexão: ${error.message}`);
      }
      
      addLog('Conexão com o Supabase estabelecida com sucesso!');
      setConnectionStatus('success');
      
      // Verificar existência das tabelas
      const tables = [
        'profiles',
        'priorities',
        'sleep_records',
        'sleep_reminders',
        'mood_records',
        'medications',
        'medication_doses',
        'meals',
        'meal_plans',
        'hydration',
        'expenses',
        'envelopes',
        'payments',
        'hyperfocuses',
        'hyperfocus_tasks',
        'study_sessions',
        'leisure_activities',
        'leisure_sessions',
        'self_knowledge_notes'
      ];
      
      addLog('Verificando existência das tabelas...');
      
      for (const table of tables) {
        try {
          // Tenta fazer uma consulta na tabela
          const { count, error: tableError } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          const exists = !tableError;
          setTableCheckResults(prev => [...prev, { table, exists }]);
          
          if (exists) {
            addLog(`✅ Tabela '${table}' existe`);
          } else {
            addLog(`❌ Tabela '${table}' não existe: ${tableError.message}`);
          }
        } catch (err: any) {
          setTableCheckResults(prev => [...prev, { table, exists: false }]);
          addLog(`❌ Erro ao verificar tabela '${table}': ${err.message}`);
        }
      }
      
    } catch (err: any) {
      setConnectionStatus('error');
      setErrorMessage(err.message);
      addLog(`ERRO: ${err.message}`);
    }
  };

  const testCreateTable = async () => {
    setConnectionStatus('testing');
    try {
      const supabase = createClient();
      addLog('Tentando criar tabelas prioritárias...');
      
      // Verificar se pode executar operações de DDL
      const { data: rpcResult, error: rpcError } = await supabase.rpc(
        'create_test_tables',
        {}
      );
      
      if (rpcError) {
        // Se não conseguir usar RPC, tenta consultar diretamente
        addLog(`Erro ao usar RPC: ${rpcError.message}`);
        addLog('Verificando permissões para criar tabelas...');
        
        const { data: authData } = await supabase.auth.getSession();
        addLog(`Status de autenticação: ${authData.session ? 'Autenticado' : 'Não autenticado'}`);
        
        if (authData.session) {
          addLog(`Usuário: ${authData.session.user.email}`);
          addLog(`Perfil: ${authData.session.user.id}`);
        }
        
        throw new Error('Sem permissão para criar tabelas diretamente. Um administrador deve criar as tabelas no painel do Supabase.');
      }
      
      addLog('Tabelas criadas com sucesso!');
      setConnectionStatus('success');
      
      // Verificar novamente as tabelas
      testConnection();
      
    } catch (err: any) {
      setErrorMessage(err.message);
      addLog(`ERRO: ${err.message}`);
      setConnectionStatus('error');
    }
  };

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Conexão com Supabase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <Button 
                onClick={testConnection}
                disabled={connectionStatus === 'testing'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {connectionStatus === 'testing' ? 'Testando...' : 'Testar Conexão'}
              </Button>
              
              <Button 
                onClick={testCreateTable}
                disabled={connectionStatus === 'testing'}
                className="bg-green-600 hover:bg-green-700"
              >
                Tentar Criar Tabelas
              </Button>
            </div>
            
            {/* Status da conexão */}
            {connectionStatus !== 'idle' && (
              <div className={`p-4 rounded ${
                connectionStatus === 'testing' ? 'bg-yellow-100' : 
                connectionStatus === 'success' ? 'bg-green-100' : 
                'bg-red-100'
              }`}>
                <h2 className="font-bold mb-2">
                  {connectionStatus === 'testing' ? 'Testando conexão...' : 
                   connectionStatus === 'success' ? 'Conexão estabelecida com sucesso!' : 
                   'Erro na conexão'}
                </h2>
                
                {errorMessage && <p className="text-red-600">{errorMessage}</p>}
              </div>
            )}
            
            {/* Log de execução */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Log de Execução:</h2>
              <div className="bg-gray-100 p-4 rounded h-60 overflow-y-auto font-mono text-sm">
                {log.map((entry, index) => (
                  <div key={index} className="mb-1">{entry}</div>
                ))}
                {log.length === 0 && <div className="text-gray-500">Nenhum log disponível</div>}
              </div>
            </div>
            
            {/* Resultados da verificação de tabelas */}
            {tableCheckResults.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Status das Tabelas:</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {tableCheckResults.map(({ table, exists }, index) => (
                    <div 
                      key={index} 
                      className={`p-2 rounded ${exists ? 'bg-green-100' : 'bg-red-100'}`}
                    >
                      <span className="font-medium">{table}:</span> {exists ? '✅ Existe' : '❌ Não existe'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Solução de Problemas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg">Tabelas não existem?</h3>
              <p className="text-gray-600">
                Se as tabelas não existem, há duas soluções possíveis:
              </p>
              <ul className="list-disc pl-6 mt-2 text-gray-600">
                <li>Acesse o painel de administração do Supabase e execute os scripts SQL para criar as tabelas</li>
                <li>Verifique se a aplicação tem as permissões necessárias para criar tabelas via RPC</li>
                <li>Confirme que está usando a URL e a chave anônima corretas do Supabase</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-lg">Erro de conexão?</h3>
              <p className="text-gray-600">
                Se houver erro na conexão, verifique:
              </p>
              <ul className="list-disc pl-6 mt-2 text-gray-600">
                <li>Valores corretos de NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env</li>
                <li>Se o projeto Supabase está ativo e acessível</li>
                <li>Se há restrições de CORS que impedem a conexão</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
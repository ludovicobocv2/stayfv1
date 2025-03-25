'use client';

import { useState } from 'react';
import { createClient } from '@/app/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { Label } from '@/app/components/ui/Label';

export default function AuthenticationTest() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLog((prev) => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };

  const clearLog = () => setLog([]);

  const signUp = async () => {
    setStatus('loading');
    clearLog();
    setErrorMessage(null);
    
    try {
      addLog(`Tentando criar usuário: ${email}`);
      const supabase = createClient();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });
      
      if (error) throw error;
      
      addLog('Usuário criado com sucesso!');
      addLog('Verifique seu email para confirmar o cadastro');
      setStatus('success');
      
      // Verificar se o usuário foi criado ou se é apenas um email confirmado
      if (data.user) {
        setCurrentUser(data.user);
        addLog(`ID do usuário: ${data.user.id}`);
      } else {
        addLog('Email de confirmação enviado.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message);
      addLog(`ERRO: ${err.message}`);
    }
  };

  const signIn = async () => {
    setStatus('loading');
    clearLog();
    setErrorMessage(null);
    
    try {
      addLog(`Tentando autenticar: ${email}`);
      const supabase = createClient();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      setCurrentUser(data.user);
      setStatus('success');
      addLog('Autenticação bem-sucedida!');
      addLog(`ID do usuário: ${data.user.id}`);
      
      // Verificar o perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        addLog(`Erro ao buscar perfil: ${profileError.message}`);
      } else if (profileData) {
        addLog(`Perfil encontrado: ${JSON.stringify(profileData)}`);
      } else {
        addLog('Perfil não encontrado.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message);
      addLog(`ERRO: ${err.message}`);
    }
  };

  const signOut = async () => {
    setStatus('loading');
    
    try {
      addLog('Finalizando sessão...');
      const supabase = createClient();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setCurrentUser(null);
      setStatus('idle');
      addLog('Sessão finalizada com sucesso');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message);
      addLog(`ERRO: ${err.message}`);
    }
  };

  const checkSession = async () => {
    setStatus('loading');
    clearLog();
    
    try {
      addLog('Verificando sessão atual...');
      const supabase = createClient();
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (data.session) {
        setCurrentUser(data.session.user);
        addLog('Sessão ativa encontrada');
        addLog(`Usuário: ${data.session.user.email}`);
        addLog(`ID: ${data.session.user.id}`);
        
        // Verificar o perfil
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        
        if (profileError) {
          addLog(`Erro ao buscar perfil: ${profileError.message}`);
        } else if (profileData) {
          addLog(`Perfil encontrado: ${JSON.stringify(profileData)}`);
        } else {
          addLog('Perfil não encontrado.');
        }
      } else {
        setCurrentUser(null);
        addLog('Nenhuma sessão ativa');
      }
      
      setStatus('idle');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message);
      addLog(`ERRO: ${err.message}`);
    }
  };

  const createTestUser = async () => {
    setStatus('loading');
    clearLog();
    setErrorMessage(null);
    
    const testEmail = `teste.${Date.now()}@neurodivergente.app`;
    const testPassword = 'Teste@123456';
    const testName = 'Usuário de Teste';
    
    try {
      addLog(`Criando usuário de teste: ${testEmail}`);
      const supabase = createClient();
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: testName
          }
        }
      });
      
      if (error) throw error;
      
      setEmail(testEmail);
      setPassword(testPassword);
      setName(testName);
      
      setStatus('success');
      
      if (data.user) {
        setCurrentUser(data.user);
        addLog('Usuário de teste criado com sucesso!');
        addLog(`Email: ${testEmail}`);
        addLog(`Senha: ${testPassword}`);
        addLog(`ID: ${data.user.id}`);
      } else {
        addLog('Email de confirmação enviado para o usuário de teste.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message);
      addLog(`ERRO: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Autenticação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Formulário de login/cadastro */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="name">Nome (apenas para cadastro)</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={signIn}
                disabled={status === 'loading' || !email || !password}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {status === 'loading' ? 'Processando...' : 'Entrar'}
              </Button>
              
              <Button
                onClick={signUp}
                disabled={status === 'loading' || !email || !password || !name}
                className="bg-green-600 hover:bg-green-700"
              >
                Cadastrar
              </Button>
              
              <Button
                onClick={signOut}
                disabled={status === 'loading' || !currentUser}
                className="bg-red-600 hover:bg-red-700"
              >
                Sair
              </Button>
              
              <Button
                onClick={checkSession}
                disabled={status === 'loading'}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Verificar Sessão
              </Button>
              
              <Button
                onClick={createTestUser}
                disabled={status === 'loading'}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Criar Usuário de Teste
              </Button>
            </div>
            
            {/* Status atual */}
            {currentUser && (
              <div className="bg-green-100 p-4 rounded-md">
                <h3 className="font-medium">Usuário atual:</h3>
                <p>Email: {currentUser.email}</p>
                <p>ID: {currentUser.id}</p>
              </div>
            )}
            
            {errorMessage && (
              <div className="bg-red-100 p-4 rounded-md text-red-700">
                <h3 className="font-medium">Erro:</h3>
                <p>{errorMessage}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Log de execução */}
      <Card>
        <CardHeader>
          <CardTitle>Log de Execução</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded h-60 overflow-y-auto font-mono text-sm">
            {log.map((entry, index) => (
              <div key={index} className="mb-1">{entry}</div>
            ))}
            {log.length === 0 && <div className="text-gray-500">Nenhum log disponível</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
import AuthenticationTest from './auth-test';

export const metadata = {
  title: 'Teste de Autenticação',
  description: 'Ferramenta para testar a autenticação de usuários no Supabase',
};

export default function AuthTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-800 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Teste de Autenticação</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-8 px-4">
        <AuthenticationTest />
      </main>
    </div>
  );
} 
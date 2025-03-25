import SupabaseConnectionTest from '../supabase-connection-test';

export const metadata = {
  title: 'Teste de Conexão Supabase',
  description: 'Ferramenta de diagnóstico para verificar a conexão com o Supabase e existência de tabelas',
};

export default function SupabaseTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-800 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Teste do Supabase</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-8 px-4">
        <SupabaseConnectionTest />
      </main>
    </div>
  );
} 
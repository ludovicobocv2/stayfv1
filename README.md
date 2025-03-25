# Painel de Produtividade para Neurodivergentes

Este projeto implementa um painel de produtividade focado em pessoas neurodivergentes, especialmente com TDAH, seguindo princípios de simplicidade, foco e redução de sobrecarga cognitiva.

## Estrutura do Projeto

O projeto segue uma estrutura clara e previsível usando Next.js com App Router. Para mais detalhes sobre a estrutura e boas práticas de desenvolvimento, consulte nosso [Guia de Contribuição](CONTRIBUTING.md).

```
/app
  /[seção]           # Páginas específicas (alimentacao, saude, etc.)
    /page.tsx        # Página principal de cada seção
  /components        # Componentes compartilhados
    /ui             # Componentes de UI reutilizáveis
    /providers      # Provedores de contexto
    /[seção]        # Componentes específicos de cada seção
  /hooks            # Hooks personalizados
  /lib              # Biblioteca de código
    /services       # Serviços da aplicação (API, etc.)
    /utils          # Utilitários e helpers
  /context          # Contextos React
  /store            # Gerenciamento de estado com Zustand
  /types            # Definições de tipos TypeScript
```

## Princípios de Desenvolvimento

- **Simplicidade Acima de Tudo**: Menos é mais
- **Foco no Essencial**: Apenas funcionalidades que agregam valor imediato
- **Redução de Sobrecarga Cognitiva**: Interfaces claras e previsíveis
- **Estímulos Visuais Adequados**: Uso estratégico de cores e ícones
- **Lembretes e Estrutura**: Apoio para funções executivas

## Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Estilização**: Tailwind CSS
- **Componentes**: Headless UI
- **Ícones**: Lucide ou Phosphor Icons
- **Gerenciamento de Estado**: Zustand com persistência local
- **Backend**: Supabase
- **Cache & Offline**: Estratégia de cache local e suporte offline

## Instalação

```bash
npm install
npm run dev
```

## Seções do Aplicativo

1. **Início**: Dashboard com visão geral e lembretes
2. **Alimentação**: Controle e planejamento de refeições
3. **Estudos**: Organização e técnicas de aprendizado
4. **Saúde**: Monitoramento de bem-estar e medicações
5. **Lazer**: Atividades recreativas e descanso
6. **Sono**: Monitoramento de padrões de sono
7. **Hiperfocos**: Gestão de interesses intensos
8. **Autoconhecimento**: Reflexões e notas pessoais

## Funcionalidades de Sincronização

O aplicativo implementa uma estratégia robusta de sincronização que inclui:
- Cache local para melhor performance
- Suporte offline para uso sem internet
- Sincronização automática quando online
- Resolução de conflitos
- Backup de dados

## Desenvolvimento

Para contribuir com o projeto:

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente:
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave
   ```
4. Execute o projeto: `npm run dev`

## Boas Práticas

- Use TypeScript para melhor tipagem
- Siga os padrões de componentes existentes
- Mantenha a estrutura de arquivos organizada
- Documente alterações significativas
- Teste as funcionalidades offline

## Contribuindo

Veja nosso [Guia de Contribuição](CONTRIBUTING.md) para informações sobre como contribuir com o projeto, incluindo:
- Estrutura do código
- Boas práticas
- Processo de desenvolvimento
- Checklist de PR

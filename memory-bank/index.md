# Índice do Memory Bank

**Status**: [CURRENT] | Última atualização: 25/03/2025 | Versão: 2.4

## Introdução
Este documento serve como ponto central de navegação para toda a documentação do projeto, fornecendo links rápidos e resumos dos documentos disponíveis no Memory Bank.

## Resumo Executivo
O Memory Bank contém documentação abrangente sobre o projeto MyNeuroApp, cobrindo desde decisões arquiteturais até detalhes de implementação. Atualmente, o foco está na migração dos módulos para o Supabase, com os módulos de Prioridades, Sono, Humor e Medicamentos já migrados, e na implementação de funcionalidades de exportação de dados.

## Documentos Principais

### Documentos Core
| Documento | Versão | Última Atualização | Descrição |
|-----------|--------|---------------------|-----------|
| [ActiveContext](./activeContext.md) | 2.5 | 22/03/2025 | Contexto atual do projeto, incluindo trabalho em andamento, decisões recentes e próximos passos. Foco na exportação de dados e conclusão da migração. |
| [Progress](./progress.md) | 2.2 | 26/09/2023 | Status detalhado do projeto, incluindo o que está funcionando, o que falta construir e problemas conhecidos. |
| [Decisions](./decisions.md) | 1.4 | 26/09/2023 | Registro de decisões técnicas e arquiteturais importantes, incluindo a estruturação das tabelas de humor. |
| [TechDebt](./techDebt.md) | 1.2 | 25/09/2023 | Catálogo de dívidas técnicas identificadas, com priorização e planos de mitigação. |
| [Debug Mode](./debug_mode.md) | 1.0 | 24/03/2025 | Procedimentos e metodologias para identificação e resolução de problemas no sistema. |
| [Code Mode](./code_mode.md) | 1.0 | 25/03/2025 | Práticas, procedimentos e diretrizes para implementação e desenvolvimento de código. |

### Documentos de Navegação
| Documento | Versão | Última Atualização | Descrição |
|-----------|--------|---------------------|-----------|
| [Changelog](./changelog.md) | 1.7 | 24/03/2025 | Histórico cronológico de todas as alterações na documentação. |
| [KnowledgeGraph](./navigation/knowledgeGraph.md) | 1.1 | 23/09/2023 | Mapa visual das relações entre componentes do projeto. |
| [Timeline](./navigation/timeline.md) | 1.0 | 15/09/2023 | Linha do tempo do projeto com marcos importantes. |

### Documentação Especializada
| Documento | Versão | Última Atualização | Descrição |
|-----------|--------|---------------------|-----------|
| [Hooks](./specialized/hooks.md) | 1.2 | 24/09/2023 | Documentação sobre padrões de hooks React usados no projeto. |
| [Migration](./specialized/migration.md) | 1.0 | 22/09/2023 | Estratégias e padrões para migração de dados de localStorage para Supabase. |
| [Authentication](./specialized/authentication.md) | 1.0 | 15/09/2023 | Detalhes sobre o sistema de autenticação com Supabase. |

### Documentação de Módulos
| Documento | Versão | Última Atualização | Descrição |
|-----------|--------|---------------------|-----------|
| [Prioridades](./modules/priorities.md) | 1.1 | 22/09/2023 | Documentação do módulo de Prioridades, incluindo hooks, componentes e migração. |
| [Sono](./modules/sleep.md) | 1.1 | 24/09/2023 | Documentação do módulo de Sono, incluindo estrutura de tabelas, hooks e migração. |
| [Humor](./modules/mood.md) | 0.8 | 15/09/2023 | Documentação do módulo de Humor, parcialmente atualizada com planejamento para migração. |
| [Medicamentos](./modules/medications.md) | 0.7 | 15/09/2023 | Documentação inicial do módulo de Medicamentos com foco na implementação localStorage. |

## Visões Específicas

### Visões por Papel
| Documento | Versão | Última Atualização | Descrição |
|-----------|--------|---------------------|-----------|
| [Desenvolvedor](./views/developer_view.md) | 1.1 | 23/09/2023 | Visão técnica focada na implementação e desenvolvimento. |
| [Product Owner](./views/product_owner_view.md) | 1.0 | 15/09/2023 | Visão com foco em progresso, funcionalidades e roadmap. |

### Visões por Tarefa
| Documento | Versão | Última Atualização | Descrição |
|-----------|--------|---------------------|-----------|
| [Onboarding](./views/onboarding_view.md) | 1.0 | 15/09/2023 | Guia para novos membros da equipe. |
| [Migração](./views/migration_view.md) | 1.1 | 23/09/2023 | Visão específica para o processo de migração para Supabase. |

## Atualizações Recentes
As atualizações mais recentes na documentação (últimos 7 dias):

### 25/03/2025
- **[Code Mode](./code_mode.md)**: Criado na v1.0 com práticas, procedimentos e diretrizes para o desenvolvimento de código.
- **[Changelog](./changelog.md)**: Atualizado para v1.8 para registrar a adição do modo Código.
- **[Index](./index.md)**: Atualizado para v2.4 para incluir referência ao documento de modo Código.

### 24/03/2025
- **[Debug Mode](./debug_mode.md)**: Criado na v1.0 com procedimentos e metodologias para debugging.
- **[Changelog](./changelog.md)**: Atualizado para v1.7 para registrar a adição do modo Debug.
- **[Index](./index.md)**: Atualizado para v2.3 para incluir referência ao documento de modo Debug.

### 26/09/2023
- **[ActiveContext](./activeContext.md)**: Atualizado para v2.3 com a conclusão da adaptação dos componentes do módulo de Sono e planejamento para a migração do módulo de Humor.
- **[Decisions](./decisions.md)**: Atualizado para v1.4 com a adição da decisão DEC-007 sobre a estruturação das tabelas de humor.
- **[Changelog](./changelog.md)**: Atualizado para v1.6 com as entradas das alterações mais recentes.

### 25/09/2023
- **[Decisions](./decisions.md)**: Atualizado para v1.3 com a adição da decisão DEC-006 sobre a estruturação das tabelas de sono.
- **[TechDebt](./techDebt.md)**: Atualizado para v1.2 com a adição de novos itens relacionados à duplicação de código nos hooks.

### 24/09/2023
- **[ActiveContext](./activeContext.md)**: Atualizado para v2.1 com detalhes da implementação da interface de migração.
- **[Sleep](./modules/sleep.md)**: Atualizado para v1.1 com documentação detalhada sobre o hook useSleep.
- **[Hooks](./specialized/hooks.md)**: Atualizado para v1.2 com padrões comuns identificados em hooks de acesso ao Supabase.

## Próximas Atualizações Planejadas
Documentos que serão atualizados em breve:

- **[Mood](./modules/mood.md)**: Será atualizado para v1.0 com a implementação completa da migração para Supabase.
- **[KnowledgeGraph](./navigation/knowledgeGraph.md)**: Será atualizado com as novas relações do módulo de Humor.
- **[Migration](./specialized/migration.md)**: Será expandido com os aprendizados da migração dos módulos de Prioridades e Sono.

## Histórico de Revisões

| Data | Versão | Autor | Alterações |
|------|--------|-------|------------|
| 24/03/2025 | 2.3 | DevTeam | Atualizado com a adição do documento de Debug Mode e atualizações recentes |
| 26/09/2023 | 2.2 | DevTeam | Atualizado com os documentos modificados relacionados à conclusão da migração do módulo de Sono e planejamento para o módulo de Humor |
| 25/09/2023 | 2.1 | DevTeam | Atualizado com as alterações relacionadas ao módulo de Sono |
| 23/09/2023 | 2.0 | DevTeam | Reestruturação completa do índice com novas seções e categorias |
| 15/09/2023 | 1.1 | DevTeam | Adicionados links para documentação de módulos |
| 01/09/2023 | 1.0 | DevTeam | Versão inicial do documento |

## Links Rápidos

- **Trabalho Atual**: Migração para Supabase - [activeContext.md](core/activeContext.md)
- **Detalhes da Migração**: [migracao_supabase.md](specialized/migracao_supabase.md)
- **Padrões de Hooks**: [hooks_supabase.md](specialized/hooks_supabase.md)

## Tarefas Pendentes no Memory Bank

1. Atualizar `systemPatterns.md` com os novos padrões de armazenamento com Supabase
2. Documentar o fluxo de autenticação e segurança no sistema 
3. Criar um documento para as políticas de Row Level Security (RLS) no Supabase
4. Atualizar `techContext.md` com informações sobre as novas dependências 
# Modo Código

**Status**: [CURRENT] | Última atualização: 25/03/2025 | Versão: 1.0

## Introdução
Este documento define as práticas, procedimentos e diretrizes para trabalhar no Modo Código do projeto StayFocus. O Modo Código é centrado na implementação e desenvolvimento de código, com foco em qualidade, reutilização e manutenção da documentação.

## Resumo Executivo
O Modo Código é um dos modos operacionais principais do Memory Bank, focado na implementação e modificação de código, atualização de documentação e controle de qualidade. Este documento estabelece as práticas recomendadas para trabalhar neste modo, garantindo consistência e qualidade no desenvolvimento.

## Pontos-Chave
- O Modo Código foca na implementação e modificação de código-fonte
- As convenções do projeto devem ser seguidas rigorosamente
- A documentação deve ser atualizada em conjunto com alterações de código
- Testes devem ser escritos ou atualizados para todas as implementações
- As alterações devem seguir os padrões arquiteturais estabelecidos

## Procedimentos do Modo Código

### Inicialização
1. Ler o arquivo activeContext.md para entender o foco atual de desenvolvimento
2. Consultar systemPatterns.md para entender os padrões arquiteturais
3. Revisar codeDocMap.md para identificar a documentação relacionada ao código-alvo
4. Verificar decisions.md para decisões técnicas relevantes
5. Avaliar techDebt.md para identificar oportunidades de melhoria durante o desenvolvimento

### Durante o Desenvolvimento
1. Seguir consistentemente os padrões de código estabelecidos
2. Implementar código autoexplicativo com nomes claros e semânticos
3. Adicionar comentários apenas onde necessário para explicar "por quê", não "como"
4. Estruturar o código seguindo os princípios de DRY (Don't Repeat Yourself)
5. Desenvolver testes para novas funcionalidades
6. Verificar impactos em outros componentes ou módulos
7. Documentar arquitetura e decisões de design importantes

### Antes do Commit
1. Executar todos os testes relevantes
2. Verificar a conformidade com os linters e formatos estabelecidos
3. Revisar o código para possíveis melhorias ou simplificações
4. Garantir que toda a documentação relacionada esteja atualizada
5. Validar que nenhuma dívida técnica não-intencional foi introduzida

### Após o Desenvolvimento
1. Atualizar activeContext.md com as mudanças implementadas
2. Documentar decisões técnicas em decisions.md, se aplicável
3. Registrar qualquer dívida técnica intencional em techDebt.md
4. Atualizar codeDocMap.md com novas relações código-documentação
5. Registrar as alterações em changelog.md

## Tipos de Tarefas

### Implementação de Novas Funcionalidades
- Iniciar com uma definição clara dos requisitos
- Consultar systemPatterns.md para entender como a nova funcionalidade se encaixa na arquitetura
- Desenvolver seguindo o padrão TDD (Test-Driven Development) quando apropriado
- Seguir um processo de design incremental
- Documentar em parallel com o desenvolvimento

### Refatoração de Código Existente
- Identificar claramente o objetivo da refatoração
- Garantir cobertura de testes adequada antes de começar
- Fazer alterações incrementais e testáveis
- Manter a compatibilidade com interfaces existentes, a menos que explicitamente planejado para mudança
- Documentar as melhorias e razões para a refatoração

### Correção de Bugs
- Reproduzir o bug de forma confiável
- Criar um teste que demonstre o bug antes de corrigi-lo
- Identificar a causa raiz antes de aplicar correções
- Considerar o impacto da correção em outras partes do sistema
- Documentar a natureza do bug e da correção em debug_mode.md ou no sistema de rastreamento de problemas

### Otimização de Performance
- Estabelecer uma linha de base mensurável antes da otimização
- Identificar gargalos através de profiling e métricas
- Priorizar otimizações com maior impacto
- Validar que a otimização não compromete a qualidade ou manutenibilidade do código
- Documentar os ganhos de performance e abordagens utilizadas

## Melhores Práticas

### Padrões de Código
- Usar TypeScript para tirar proveito da verificação de tipos
- Implementar componentes React usando funções (não classes)
- Utilizar hooks para lógica reutilizável
- Seguir o padrão de "apresentação/contêiner" para componentes de UI
- Aplicar nomes descritivos para funções, variáveis e componentes

### Gerenciamento de Estado
- Preferir useState e useReducer para estado local
- Utilizar Context API para estados que precisam ser compartilhados entre componentes
- Evitar props drilling (passagem excessiva de props)
- Considerar o uso de bibliotecas de gerenciamento de estado para casos complexos
- Documentar fluxos de dados complexos

### Integração com Supabase
- Seguir os padrões estabelecidos nos hooks personalizados para Supabase
- Utilizar as políticas de RLS (Row Level Security) para segurança de dados
- Implementar tratamento de erros consistente em todas as operações de banco de dados
- Garantir que as queries sejam otimizadas para performance
- Documentar todas as tabelas, relacionamentos e políticas

### Testes
- Escrever testes unitários para lógica de negócios
- Criar testes de integração para fluxos complexos
- Utilizar testes de componentes para validar o comportamento da UI
- Manter uma cobertura de testes adequada para áreas críticas
- Automatizar testes como parte do processo de CI/CD

## Ferramentas e Recursos

### Ferramentas de Desenvolvimento
- Visual Studio Code com extensões recomendadas
- ESLint e Prettier para formatação e linting
- TypeScript para verificação de tipos
- Jest para testes
- React DevTools para debugging de componentes

### Recursos de Documentação
- systemPatterns.md para arquitetura global
- codeDocMap.md para mapeamento código-documentação
- decisions.md para decisões técnicas importantes
- templates/feature_template.md para documentação de novas funcionalidades

## Histórico de Revisões

| Data | Versão | Autor | Alterações |
|------|--------|-------|------------|
| 25/03/2025 | 1.0 | DevTeam | Versão inicial do documento | 
# Guia de Contribuição

## Estrutura do Projeto

O projeto segue a estrutura do Next.js 14 com App Router:

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

## Boas Práticas

### Componentes

1. Use o componente `Image` do Next.js em vez de `<img>`:
```tsx
import Image from 'next/image'

// Correto
<Image 
  src={imageUrl} 
  alt="Descrição da imagem"
  width={200}
  height={200}
  className="rounded-lg object-cover"
/>

// Incorreto
<img src={imageUrl} alt="Descrição da imagem" />
```

2. Sempre inclua atributos de acessibilidade:
```tsx
// Botões devem ter aria-label
<button aria-label="Fechar modal">
  <X className="h-5 w-5" />
</button>

// Imagens devem ter alt descritivo
<Image alt="Foto do perfil do usuário" ... />
```

### Hooks

1. Sempre inclua todas as dependências necessárias nos hooks:
```tsx
// Correto
useEffect(() => {
  fetchData();
}, [fetchData, shouldRefresh]);

// Incorreto
useEffect(() => {
  fetchData();
}, []);
```

2. Use useCallback quando necessário:
```tsx
const handleRefresh = useCallback(() => {
  setShouldRefresh(prev => prev + 1);
  fetchData();
}, [fetchData]);
```

### Estado e Cache

1. Use o Zustand para estado global
2. Implemente estratégia de cache local para dados frequentes
3. Mantenha suporte offline quando possível

### Sincronização

1. Implemente retentativas automáticas para falhas de rede
2. Use backoff exponencial para retentativas
3. Mantenha dados em cache local para resiliência

### Performance

1. Otimize imagens usando Next/Image
2. Implemente lazy loading para componentes pesados
3. Use memoização quando apropriado

### TypeScript

1. Defina tipos para todas as props:
```tsx
type ComponentProps = {
  title: string;
  onAction: () => void;
  isActive?: boolean;
}
```

2. Use enums para valores fixos:
```tsx
enum NotaSecao {
  QuemSou = 'quem-sou',
  MeusPorques = 'meus-porques',
  MeusPadroes = 'meus-padroes'
}
```

### Estilização

1. Use Tailwind CSS para estilos
2. Mantenha consistência com as cores do tema
3. Garanta contraste adequado para acessibilidade

### Testes

1. Escreva testes para lógica crítica
2. Teste comportamentos offline
3. Verifique acessibilidade

## Processo de Desenvolvimento

1. Crie uma branch para sua feature
2. Mantenha commits atômicos e descritivos
3. Faça self-review antes de submeter PRs
4. Atualize a documentação quando necessário

## Checklist de PR

- [ ] Código segue as boas práticas
- [ ] Testes passando
- [ ] Documentação atualizada
- [ ] Revisão de acessibilidade
- [ ] Performance verificada
- [ ] Suporte offline testado 
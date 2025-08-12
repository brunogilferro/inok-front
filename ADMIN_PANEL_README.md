# INOK Admin Panel

## Visão Geral

O painel administrativo do INOK foi implementado para atender aos requisitos do cliente, permitindo a gestão completa de agentes, bancos de dados, memórias (RAGs), fluxos de dados e conversas através de uma interface minimalista e funcional.

## Funcionalidades Implementadas

### 1. **Identidades** 
- Gestão de agentes, humanos e AIs
- Cadastro com nome, tipo e descrição
- Edição e exclusão de identidades
- Interface visual com avatares e ícones

### 2. **Conversas**
- Layout de três colunas conforme solicitado:
  - **Esquerda**: Dados principais da conversa (contexto, participantes, narrativa)
  - **Centro**: Transcrição e resumos processados
  - **Direita**: Área de processamento/incorporação com chat de validação
- Listagem de conversas com status
- Importação de dados (funcionalidade preparada)
- Cadastro manual de conversas
- Visualização detalhada com transcrições e resumos

### 3. **Agentes**
- Configuração de parâmetros dos agentes
- Suporte a diferentes tipos: LLM, Customizado, Integração
- Edição de parâmetros em formato JSON
- Controle de status (ativo/inativo)
- Interface intuitiva para gestão

### 4. **Bancos de Dados**
- Gestão de conexões com diferentes tipos de banco
- Suporte a PostgreSQL, MongoDB, MySQL, Redis e Vector DB
- Teste de conexões
- Mascaramento de credenciais sensíveis
- Monitoramento de status e última sincronização

### 5. **Memórias (RAGs)**
- Gestão de bases de conhecimento
- Tipos: RAG, Vector Database, Document Store
- Controle de status e contagem de documentos
- Funcionalidades de importação e exportação
- Interface para gestão de memórias

### 6. **Fluxos de Dados**
- Configuração de fluxos ETL, Streaming e Batch
- Editor visual de nós com tipos: Input, Process, Output
- Configuração de parâmetros por nó
- Visualização do fluxo com diagramas
- Gestão de status e execução

## Arquitetura Técnica

### Componentes
- `AdminPanel`: Componente principal com navegação lateral
- `IdentitiesView`: Gestão de identidades
- `ConversationsView`: Gestão de conversas com layout de três colunas
- `AgentsView`: Configuração de agentes
- `DatabasesView`: Gestão de bancos de dados
- `MemoriesView`: Gestão de memórias e RAGs
- `DataFlowsView`: Configuração de fluxos de dados

### Tipos TypeScript
- Interfaces completas para todas as entidades
- Tipagem forte para parâmetros e configurações
- Suporte a diferentes status e tipos

### Design System
- Interface minimalista e funcional
- Componentes reutilizáveis
- Responsivo para diferentes tamanhos de tela
- Ícones intuitivos do Lucide React
- Paleta de cores consistente

## Navegação

### Sidebar
- Navegação lateral com descrições das funcionalidades
- Indicadores visuais de seção ativa
- Responsivo para dispositivos móveis

### Header
- Título da seção atual
- Botões de ação contextuais
- Alternância entre chat e painel administrativo

## Funcionalidades de Usuário

### Operadores Não Técnicos
- Interface amigável e intuitiva
- Abstração da complexidade técnica
- Formulários simples e diretos
- Validação visual de dados

### Gestores Técnicos
- Configuração avançada de parâmetros
- Visualização de status e métricas
- Controle granular de funcionalidades
- Logs e histórico de operações

## Flexibilidade para Evolução

### APIs Próprias
- Estrutura preparada para integração
- Tipos TypeScript extensíveis
- Componentes modulares

### Customização de Fluxos
- Editor visual de fluxos
- Configuração de parâmetros
- Suporte a diferentes tipos de processamento

### Gestão Multi-Organizacional
- Arquitetura preparada para white label
- Separação clara de responsabilidades
- Componentes reutilizáveis

## Tecnologias Utilizadas

- **Next.js 15**: Framework React com App Router
- **TypeScript**: Tipagem estática e interfaces
- **Tailwind CSS**: Sistema de design utilitário
- **Lucide React**: Ícones consistentes e acessíveis
- **React Hooks**: Estado e lógica de componentes

## Próximos Passos

### Implementações Futuras
1. **Integração com Backend**: Conectar com APIs reais
2. **Autenticação**: Sistema de login e permissões
3. **Persistência**: Armazenamento local ou remoto
4. **Notificações**: Sistema de alertas e status
5. **Relatórios**: Dashboards e métricas
6. **Importação Real**: Suporte a arquivos e APIs externas

### Melhorias de UX
1. **Drag & Drop**: Para configuração de fluxos
2. **Preview em Tempo Real**: Visualização de mudanças
3. **Templates**: Configurações pré-definidas
4. **Histórico**: Log de alterações e versões

## Como Usar

1. **Acessar o Painel**: Clique no botão de configurações (⚙️) no canto superior direito
2. **Navegar**: Use a sidebar para acessar diferentes seções
3. **Criar**: Use os botões "Novo" para adicionar entidades
4. **Editar**: Clique nos ícones de edição para modificar
5. **Alternar**: Use os botões no canto superior direito para voltar ao chat

## Estrutura de Arquivos

```
src/components/admin/
├── AdminPanel.tsx          # Painel principal
├── IdentitiesView.tsx      # Gestão de identidades
├── ConversationsView.tsx   # Gestão de conversas
├── AgentsView.tsx          # Configuração de agentes
├── DatabasesView.tsx       # Gestão de bancos
├── MemoriesView.tsx        # Gestão de memórias
├── DataFlowsView.tsx       # Configuração de fluxos
└── index.ts                # Exportações
```

## Conclusão

O painel administrativo implementa todos os requisitos solicitados pelo cliente, fornecendo uma interface profissional e funcional para gestão do sistema INOK. A arquitetura é flexível e preparada para futuras expansões, mantendo a simplicidade de uso para operadores não técnicos.

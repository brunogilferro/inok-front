# INOK Frontend - Painel Administrativo e Interface de Chat

## 📋 Visão Geral

Este é o frontend completo do sistema INOK, desenvolvido em **Next.js 14** com **TypeScript**. Oferece uma interface moderna e intuitiva para gerenciar todos os recursos do sistema INOK, incluindo identidades, conversas, agentes, bancos de dados, memórias e fluxos de dados.

### 🌟 Funcionalidades Principais

- **🔐 Autenticação JWT completa** - Login, registro e gerenciamento de sessão
- **👤 Painel Administrativo** - Gestão completa de todos os recursos INOK
- **💬 Interface de Chat com IA** - Chat inteligente com salvamento automático
- **🌙 Tema Escuro/Claro** - Alternância entre modos com persistência
- **🌐 Internacionalização** - Suporte a português, inglês e espanhol
- **📱 Design Responsivo** - Interface adaptável para todos os dispositivos
- **⚡ Performance Otimizada** - Carregamento rápido e UX fluida

---

## 🚀 Início Rápido

### Pré-requisitos

- **Node.js** 18+ 
- **Yarn** ou npm
- **Backend INOK** rodando na porta 3333

### Instalação

1. **Clone o repositório:**
   ```bash
   git clone <repository-url>
   cd inok-front
   ```

2. **Instale as dependências:**
   ```bash
   yarn install
   # ou
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edite `.env.local`:
   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:3333
   
   # App Configuration
   NEXT_PUBLIC_APP_NAME=INOK Admin Panel
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```

4. **Execute o projeto:**
   ```bash
   yarn dev
   # ou
   npm run dev
   ```

5. **Acesse:** http://localhost:3000

---

## 🔐 Autenticação

### Credenciais Padrão (Demo)
- **Email:** admin@inok.com
- **Senha:** admin123

### Fluxo de Autenticação
1. **Login/Registro** - Telas dedicadas com validação
2. **Token JWT** - Armazenamento seguro no localStorage
3. **Auto-refresh** - Renovação automática de tokens
4. **Redirecionamento** - Proteção de rotas automática

---

## 📊 Painel Administrativo

### Módulos Disponíveis

#### 🆔 **Identidades**
- **Listagem** com busca e filtros
- **CRUD completo** - Criar, editar, excluir
- **Tipos:** Humano, IA, Agente
- **Metadados** personalizáveis
- **Paginação** automática

#### 💬 **Conversas**
- **Gerenciamento** de transcrições
- **Resumos** automáticos
- **Base de conhecimento** extraída
- **Status** de conversas

#### 🤖 **Agentes**
- **Configuração** de parâmetros
- **Teste** de funcionalidade
- **Gerenciamento** de capabilities
- **Monitoramento** de performance

#### 🗄️ **Bancos de Dados**
- **Conexões** múltiplas
- **Teste** de conectividade
- **Status** em tempo real
- **Tipos:** MySQL, PostgreSQL, MongoDB

#### 🧠 **Memórias**
- **RAG** (Retrieval Augmented Generation)
- **Importação** de documentos
- **Bases de conhecimento**
- **Vectorização** automática

#### 🔄 **Fluxos de Dados**
- **ETL** pipelines
- **Integrações** automatizadas
- **Execução** de workflows
- **Monitoramento** de status

#### 👥 **Usuários** (Apenas Admin)
- **Gestão** de usuários do sistema
- **Roles:** Admin, Manager, User
- **Status:** Ativo, Inativo, Suspenso
- **Permissões** granulares

---

## 💬 Interface de Chat

### Funcionalidades
- **Chat em tempo real** com assistente IA
- **Salvamento automático** de conversas (usuários logados)
- **Múltiplas conversas** simultâneas
- **Histórico** persistente
- **Suporte multilíngue**

### Recursos do Chat
- **Respostas contextuais** sobre o sistema INOK
- **Orientação** sobre funcionalidades
- **Ajuda** técnica e processos
- **Integração** com backend para persistência

---

## 🎨 Personalização

### Temas
- **Modo Claro/Escuro** com alternância automática
- **Persistência** de preferência do usuário
- **Detecção** de preferência do sistema

### Idiomas
- **Português** (padrão)
- **Inglês**
- **Espanhol**
- **Seleção** dinâmica com persistência

---

## 🔧 Tecnologias Utilizadas

### Core
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **React i18next** - Internacionalização

### UI Components
- **Lucide React** - Ícones modernos
- **Sonner** - Toast notifications
- **Headless UI** - Componentes acessíveis

### Estado e Dados
- **React Context** - Gerenciamento de estado
- **API Client** - Cliente HTTP customizado
- **JWT** - Autenticação segura

---

## 📡 Integração com Backend

### APIs Utilizadas

#### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Perfil do usuário

#### Recursos (CRUD completo)
- `/api/identities` - Identidades
- `/api/conversations` - Conversas
- `/api/agents` - Agentes
- `/api/databases` - Bancos de dados
- `/api/memories` - Memórias
- `/api/flows` - Fluxos de dados
- `/api/users` - Usuários (Admin)

#### Chat
- `POST /api/chat` - Enviar mensagem
- `PUT /api/chat` - Criar conversa

### Tratamento de Erros
- **Interceptors** automáticos
- **Toast notifications** para feedback
- **Retry logic** para requisições
- **Loading states** visuais

---

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── api/chat/          # API de chat local
│   ├── admin/             # Página do painel admin
│   ├── login/             # Página de login
│   ├── register/          # Página de registro
│   └── layout.tsx         # Layout principal
├── components/            # Componentes reutilizáveis
│   ├── admin/            # Componentes do painel
│   ├── chat/             # Interface de chat
│   └── ui/               # Componentes base
├── contexts/             # Contextos React
│   └── AuthContext.tsx   # Contexto de autenticação
├── lib/                  # Utilitários
│   ├── api-client.ts     # Cliente API
│   └── utils.ts          # Funções utilitárias
├── types/                # Definições TypeScript
└── i18n/                # Configuração i18n
```

---

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
yarn dev

# Build para produção
yarn build

# Iniciar build de produção
yarn start

# Linting
yarn lint

# Checagem de tipos
yarn type-check
```

---

## 🔒 Segurança

### Implementações
- **JWT Tokens** com expiração
- **Interceptors** de autenticação
- **Proteção de rotas** automática
- **Validação** de permissões por role
- **Sanitização** de inputs
- **HTTPS** ready

### Roles e Permissões
- **Admin:** Acesso completo
- **Manager:** Gestão limitada
- **User:** Acesso básico

---

## 📱 Responsividade

### Breakpoints
- **Mobile:** 640px
- **Tablet:** 768px
- **Desktop:** 1024px
- **Large:** 1280px

### Adaptações
- **Menu lateral** colapsível
- **Tabelas** responsivas
- **Formulários** otimizados
- **Chat** mobile-friendly

---

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Deploy automático
vercel

# Deploy com configurações
vercel --prod
```

### Variáveis de Ambiente (Produção)
```env
NEXT_PUBLIC_API_URL=https://api.inok.com
NEXT_PUBLIC_APP_NAME=INOK Admin Panel
NEXT_PUBLIC_APP_VERSION=1.0.0
```

---

## 🤝 Contribuição

### Padrões de Código
- **ESLint** + **Prettier**
- **TypeScript** strict mode
- **Commit conventions**
- **Component patterns**

### Workflow
1. Fork do repositório
2. Feature branch
3. Pull request
4. Code review
5. Merge

---

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

## 📞 Suporte

Para suporte técnico ou dúvidas:
- **Email:** suporte@inok.com
- **Documentação:** [docs.inok.com](https://docs.inok.com)
- **Issues:** GitHub Issues

---

**Versão:** 1.0.0  
**Última atualização:** Janeiro 2025  
**Compatível com:** INOK Backend API v1.0.0

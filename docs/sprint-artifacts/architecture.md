# System Architecture Document
## Personal Finance Control App

**Versão:** 1.2  
**Data:** 2025-12-04  
**Arquiteto:** BMAD Architecture Team  
**Status:** Draft → Review → Approved  
**Projeto:** Mentoria — Controle Financeiro Pessoal  

---

## Sumário Executivo

Arquitetura serverless baseada em Supabase MCP para aplicativo de controle financeiro pessoal, utilizando Next.js 15 no frontend e PostgreSQL com Row-Level Security para isolamento de dados multi-tenant. A stack prioriza simplicidade, segurança nativa e escalabilidade automática, com zero gerenciamento de servidores.

---

## 📑 Índice

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Decisões Arquiteturais (ADRs)](#2-decisões-arquiteturais-adrs)
3. [Arquitetura de Componentes](#3-arquitetura-de-componentes)
4. [Modelo de Dados](#4-modelo-de-dados)
5. [API Design](#5-api-design)
6. [Autenticação e Autorização](#6-autenticação-e-autorização)
7. [Processamento Assíncrono](#7-processamento-assíncrono)
8. [Caching e Performance](#8-caching-e-performance)
9. [Segurança](#9-segurança)
10. [Observabilidade](#10-observabilidade)
11. [Deployment e Infraestrutura](#11-deployment-e-infraestrutura)
12. [Escalabilidade](#12-escalabilidade)

---

## 1. Visão Geral da Arquitetura

### 1.1 Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND LAYER                      │
├──────────────┬──────────────┬──────────────────────────┤
│  Web App     │  Mobile App  │  Future: Desktop         │
│  (Next.js)   │  (React      │  (Electron/Tauri)        │
│              │   Native)    │                          │
└──────────────┴──────────────┴──────────────────────────┘
                      ↓ HTTPS/WSS
┌─────────────────────────────────────────────────────────┐
│                   API GATEWAY / BFF                     │
│              (Next.js API Routes / Supabase)            │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│                  SUPABASE MCP PLATFORM                  │
├──────────────┬──────────────┬──────────────────────────┤
│  Auth        │  Postgres DB │  Storage                 │
│  (JWT)       │  (RLS)       │  (S3-like)               │
├──────────────┼──────────────┼──────────────────────────┤
│  Realtime    │  Edge        │  PostgREST               │
│  (WebSocket) │  Functions   │  (Auto API)              │
└──────────────┴──────────────┴──────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│              EXTERNAL INTEGRATIONS (Future)             │
├──────────────┬──────────────┬──────────────────────────┤
│  Email       │  Push        │  Bank Aggregators        │
│  (Resend)    │  (FCM)       │  (Pluggy/Plaid)          │
└──────────────┴──────────────┴──────────────────────────┘
```

### 1.2 Princípios Arquiteturais

1. **Simplicidade Primeiro:** Evitar over-engineering, começar simples e evoluir
2. **Supabase-Native:** Aproveitar ao máximo as funcionalidades nativas do Supabase
3. **Mobile-First:** Arquitetura otimizada para experiência mobile
4. **Security by Default:** Segurança em todas as camadas (RLS, JWT, HTTPS)
5. **Realtime by Design:** Sincronização em tempo real como padrão
6. **Serverless:** Zero gerenciamento de servidores, focado em Edge Functions
7. **Data Isolation:** Multi-tenancy com isolamento rigoroso via RLS

### 1.3 Stack Tecnológica

> **Versões verificadas em:** Dezembro 2024  
> **Política:** Usar versões LTS quando disponíveis

#### Frontend

| Tecnologia | Versão | Tipo | Notas |
|------------|--------|------|-------|
| Next.js | 15.0.x | Latest Stable | App Router obrigatório |
| React | 19.0.x | Latest Stable | Incluso no Next.js 15 |
| TypeScript | 5.6.x | Latest Stable | Strict mode habilitado |
| Zustand | 5.0.x | Latest Stable | State management leve |
| TanStack Query | 5.59.x | Latest Stable | Server state + cache |
| shadcn/ui | latest | CLI-based | Não versionado (copia código) |
| Radix UI | latest | Per-component | Versionado por primitivo |
| Tailwind CSS | 3.4.x | Latest Stable | JIT mode padrão |
| React Hook Form | 7.53.x | Latest Stable | - |
| Zod | 3.23.x | Latest Stable | Schema validation |
| Recharts | 2.12.x | Latest Stable | Charts web |
| next-intl | 3.22.x | Latest Stable | i18n |

#### Backend (Supabase MCP)

| Tecnologia | Versão | Tipo | Notas |
|------------|--------|------|-------|
| PostgreSQL | 15.x | Supabase Managed | Versão gerenciada pelo Supabase |
| PostgREST | 12.x | Supabase Managed | Auto-generated API |
| Supabase Auth | latest | Managed Service | JWT-based |
| Supabase Realtime | latest | Managed Service | WebSocket |
| Supabase Storage | latest | Managed Service | S3-compatible |
| Edge Functions | Deno 1.x | Supabase Managed | Serverless |

#### DevOps & Tooling

| Tecnologia | Versão | Notas |
|------------|--------|-------|
| Node.js | 20.x LTS | Runtime de desenvolvimento |
| pnpm | 9.x | Package manager (monorepo) |
| Turborepo | 2.x | Monorepo build system |
| Vitest | 2.1.x | Unit testing |
| Playwright | 1.48.x | E2E testing |
| Sentry | latest SDK | Error tracking |
| GitHub Actions | v4 | CI/CD |

#### Comando de Verificação de Versões

```bash
# Verificar versões instaladas
npx next --version
npx tsc --version
node --version
pnpm --version
```

### 1.4 Inicialização do Projeto

#### Pré-requisitos

- Node.js 20.x LTS
- pnpm 9.x (`npm install -g pnpm`)
- Supabase CLI (`npm install -g supabase`)
- Git

#### Comandos de Setup

```bash
# 1. Criar projeto Next.js com TypeScript
pnpm create next-app@latest apps/web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 2. Inicializar monorepo na raiz
pnpm init
pnpm add -D turbo

# 3. Inicializar Supabase
supabase init

# 4. Instalar dependências core
cd apps/web
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add @tanstack/react-query zustand
pnpm add react-hook-form @hookform/resolvers zod
pnpm add recharts

# 5. Instalar shadcn/ui
pnpm dlx shadcn@latest init

# 6. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com credenciais do Supabase
```

#### Estrutura de .env.local

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Sentry (opcional em dev)
NEXT_PUBLIC_SENTRY_DSN=
```

#### Executar Projeto

```bash
# Desenvolvimento
pnpm dev

# Build de produção
pnpm build

# Testes
pnpm test

# Lint
pnpm lint
```

---

## 2. Decisões Arquiteturais (ADRs)

### Tabela Resumo

| ID | Categoria | Decisão | Versão | Rationale |
|----|-----------|---------|--------|-----------|
| ADR-001 | Backend Platform | Supabase MCP | Managed | Redução de tempo, RLS nativo, escalabilidade automática |
| ADR-002 | Data Security | Row-Level Security | PostgreSQL 15 | Defense in depth, isolamento de dados |
| ADR-003 | Async Processing | Edge Functions (Deno) | Deno 1.x | Serverless, edge computing, isolamento |
| ADR-004 | Realtime | Supabase Realtime | Managed | WebSocket nativo, sem polling |
| ADR-005 | Code Organization | Monorepo (Turborepo) | 2.x | Código compartilhado web/mobile |
| ADR-006 | Auto-categorization | Híbrido (Rules + ML) | - | Custo baixo MVP, evolução incremental |
| ADR-007 | UX Pattern | Optimistic Updates | React Query 5.x | UX instantânea, funciona offline |
| ADR-008 | PDF Generation | React PDF | @react-pdf/renderer | Serverless-friendly, componentes React |

### Status das Decisões

- ✅ **Aceitas:** ADR-001 a ADR-007
- 🔄 **Em Revisão:** Nenhuma
- ❌ **Rejeitadas:** Nenhuma
- ⏸️ **Diferidas:** Mobile (React Native) para fase 2

---

### ADR-001: Supabase como Backend Platform

**Status:** Aceito  
**Contexto:** Necessidade de backend escalável, seguro e com baixa manutenção.  
**Decisão:** Utilizar Supabase MCP como plataforma backend unificada.  
**Consequências:**
- ✅ Redução de tempo de desenvolvimento (Auth, Storage, Realtime prontos)
- ✅ Escalabilidade automática via infraestrutura gerenciada
- ✅ Row-Level Security nativo para multi-tenancy
- ⚠️ Vendor lock-in (mitigado por Postgres/PostgREST serem open-source)
- ⚠️ Limitações de customização (mitigado por Edge Functions)

---

### ADR-002: Row-Level Security (RLS) para Multi-Tenancy

**Status:** Aceito  
**Contexto:** Múltiplos usuários com dados sensíveis que não devem vazar entre tenants.  
**Decisão:** Implementar isolamento de dados via RLS policies no Postgres.  
**Consequências:**
- ✅ Segurança em nível de banco de dados (defense in depth)
- ✅ Não requer lógica de filtragem no código da aplicação
- ✅ Previne vazamentos de dados mesmo com bugs de aplicação
- ⚠️ Queries mais complexas (RLS pode impactar performance)
- ⚠️ Debugging mais difícil (policies podem causar "dados não encontrados")

**Implementação:**
```sql
-- Exemplo de policy
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own transactions"
ON transactions FOR SELECT
USING (auth.uid() = user_id);
```

---

### ADR-003: Edge Functions para Processamento Assíncrono

**Status:** Aceito  
**Contexto:** Operações pesadas (importação CSV, categorização automática, notificações) não devem bloquear UI.  
**Decisão:** Utilizar Supabase Edge Functions (Deno Deploy) para processamento serverless.  
**Consequências:**
- ✅ Escalabilidade automática
- ✅ Execução próxima ao usuário (edge computing)
- ✅ Isolamento de falhas (não afeta outros componentes)
- ⚠️ Cold start pode causar latência inicial
- ⚠️ Debugging mais complexo (logs distribuídos)

---

### ADR-004: Realtime Sync com Supabase Realtime

**Status:** Aceito  
**Contexto:** Usuários esperam que alterações (novas transações, orçamentos) apareçam instantaneamente.  
**Decisão:** Utilizar Supabase Realtime (WebSocket sobre Postgres logical replication).  
**Consequências:**
- ✅ Sincronização automática sem polling
- ✅ Redução de carga no servidor (sem requests constantes)
- ✅ UX superior (updates imediatos)
- ⚠️ Gerenciamento de conexão WebSocket (reconexão, offline)
- ⚠️ Consumo de bateria em mobile (WebSocket sempre ativo)

**Estratégia de Otimização:**
- Desconectar WebSocket quando app está em background (mobile)
- Usar Presence para detectar usuários ativos
- Implementar debouncing para evitar múltiplos updates

---

### ADR-005: Monorepo com Turborepo

**Status:** Aceito  
**Contexto:** Web e Mobile compartilham lógica de negócio, tipos, e componentes.  
**Decisão:** Estrutura de monorepo com packages compartilhados.  
**Consequências:**
- ✅ Código compartilhado entre Web e Mobile
- ✅ Tipos TypeScript consistentes
- ✅ Deploy independente de cada app
- ⚠️ Complexidade inicial de setup
- ⚠️ Tooling (build, test) mais elaborado

**Estrutura:**
```
mentoria/
├── apps/
│   ├── web/          # Next.js app
│   ├── mobile/       # React Native app
│   └── docs/         # Documentação
├── packages/
│   ├── ui/           # Componentes compartilhados
│   ├── database/     # Supabase client + types
│   ├── schemas/      # Zod schemas
│   └── utils/        # Funções utilitárias
└── supabase/
    ├── migrations/   # SQL migrations
    └── functions/    # Edge Functions
```

---

### ADR-006: Categorização Automática Híbrida (Rules + ML)

**Status:** Aceito  
**Contexto:** Categorização manual é tediosa; ML puro é caro.  
**Decisão:** Sistema híbrido:
1. **Fase 1 (MVP):** Rules-based (palavra-chave → categoria)
2. **Fase 2:** ML simples (TF-IDF + logistic regression)
3. **Fase 3:** Deep learning (transformers)

**Consequências:**
- ✅ Custo baixo no MVP
- ✅ Evolução incremental
- ✅ Usuário corrige e sistema aprende
- ⚠️ Precisão limitada no MVP (60-70%)
- ⚠️ Complexidade cresce com ML

---

### ADR-007: Otimistic UI Updates

**Status:** Aceito  
**Contexto:** Usuários não devem esperar request completar para ver mudanças.  
**Decisão:** Implementar Optimistic Updates com rollback em caso de falha.  
**Consequências:**
- ✅ UX instantânea (percepção de velocidade)
- ✅ Funciona offline (com sync posterior)
- ⚠️ Necessário tratamento de conflitos
- ⚠️ Rollback pode confundir usuário

**Implementação (React Query):**
```typescript
const { mutate } = useMutation({
  mutationFn: addTransaction,
  onMutate: async (newTransaction) => {
    // Cancel queries & snapshot
    await queryClient.cancelQueries(['transactions'])
    const previous = queryClient.getQueryData(['transactions'])
    
    // Optimistic update
    queryClient.setQueryData(['transactions'], old => [...old, newTransaction])
    
    return { previous }
  },
  onError: (err, newTx, context) => {
    // Rollback
    queryClient.setQueryData(['transactions'], context.previous)
  },
  onSettled: () => {
    queryClient.invalidateQueries(['transactions'])
  }
})
```

---

### ADR-008: Geração de Relatórios PDF

**Status:** Aceito  
**Contexto:** Usuários precisam exportar relatórios mensais em PDF com gráficos e resumos visuais (FR-3.2, US-11.2).  
**Decisão:** Utilizar **React PDF (@react-pdf/renderer)** para geração de PDFs no servidor.

**Alternativas Consideradas:**

| Opção | Prós | Contras | Decisão |
|-------|------|---------|---------|
| Puppeteer | Renderiza HTML real, alta fidelidade | Pesado (~300MB), cold start lento, difícil em serverless | ❌ Rejeitado |
| jsPDF | Leve, client-side | Sem suporte a React, gráficos complexos | ❌ Rejeitado |
| **React PDF** | React-native, leve, serverless-friendly | Sintaxe própria para layout | ✅ Aceito |
| html-pdf-node | Simples, HTML para PDF | Depende de Chromium | ❌ Rejeitado |

**Consequências:**
- ✅ Funciona em Edge Functions (Deno) sem dependências pesadas
- ✅ Componentes React reutilizáveis para templates
- ✅ Suporte a estilos via StyleSheet (similar a React Native)
- ⚠️ Gráficos via SVG (não Recharts direto, precisa converter)
- ⚠️ Curva de aprendizado para sintaxe específica

**Implementação:**

```typescript
// supabase/functions/generate-report/index.ts
import { renderToBuffer } from '@react-pdf/renderer';
import { MonthlyReport } from './templates/MonthlyReport';

serve(async (req) => {
  const { userId, month, year } = await req.json();
  
  // 1. Buscar dados do mês
  const data = await fetchMonthlyData(userId, month, year);
  
  // 2. Gerar PDF
  const pdfBuffer = await renderToBuffer(
    <MonthlyReport data={data} month={month} year={year} />
  );
  
  // 3. Upload para Storage
  const { data: file } = await supabase.storage
    .from('reports')
    .upload(`${userId}/report-${year}-${month}.pdf`, pdfBuffer);
  
  // 4. Retornar URL assinada (1 hora)
  const { signedUrl } = await supabase.storage
    .from('reports')
    .createSignedUrl(file.path, 3600);
  
  return new Response(JSON.stringify({ url: signedUrl }));
});
```

**Template de Relatório:**

```typescript
// templates/MonthlyReport.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica' },
  title: { fontSize: 24, marginBottom: 20, color: '#10B981' },
  section: { marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { fontSize: 12, color: '#6B7280' },
  value: { fontSize: 14, fontWeight: 'bold' },
  income: { color: '#10B981' },
  expense: { color: '#EF4444' },
});

export const MonthlyReport = ({ data, month, year }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Relatório Mensal - {month}/{year}</Text>
      
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Receitas:</Text>
          <Text style={[styles.value, styles.income]}>R$ {data.income}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Despesas:</Text>
          <Text style={[styles.value, styles.expense]}>R$ {data.expenses}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Saldo:</Text>
          <Text style={styles.value}>R$ {data.balance}</Text>
        </View>
      </View>
      
      {/* Top categorias, orçamentos, metas... */}
    </Page>
  </Document>
);
```

---

## 3. Arquitetura de Componentes

### 3.1 Frontend Architecture (Clean Architecture)

```
┌──────────────────────────────────────────┐
│         Presentation Layer               │
│  (React Components, Hooks, UI)           │
└───────────────┬──────────────────────────┘
                │
┌───────────────▼──────────────────────────┐
│         Application Layer                │
│  (Use Cases, State Management)           │
└───────────────┬──────────────────────────┘
                │
┌───────────────▼──────────────────────────┐
│         Domain Layer                     │
│  (Business Logic, Entities, Validators)  │
└───────────────┬──────────────────────────┘
                │
┌───────────────▼──────────────────────────┐
│         Infrastructure Layer             │
│  (Supabase Client, API, Storage)         │
└──────────────────────────────────────────┘
```

### 3.2 Estrutura de Pastas (Next.js)

```
apps/web/
├── app/                      # App Router (Next.js 14)
│   ├── (auth)/               # Route group: autenticação
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/          # Route group: área logada
│   │   ├── page.tsx          # Dashboard principal
│   │   ├── transactions/
│   │   ├── budgets/
│   │   └── goals/
│   └── api/                  # API routes
│       ├── transactions/
│       └── webhooks/
├── components/               # Componentes React
│   ├── ui/                   # shadcn/ui components
│   ├── features/             # Feature-specific components
│   │   ├── transactions/
│   │   ├── budgets/
│   │   └── goals/
│   └── layouts/              # Layouts
├── lib/                      # Código de infra
│   ├── supabase/             # Supabase client
│   ├── hooks/                # Custom hooks
│   └── utils/                # Utilidades
├── stores/                   # Zustand stores
└── types/                    # TypeScript types
```

### 3.3 Módulos de Domínio

#### Module: Accounts
```typescript
// Domain entity
interface Account {
  id: string
  userId: string
  name: string
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash'
  balance: number
  currency: string
  isArchived: boolean
  createdAt: Date
}

// Use cases
class CreateAccountUseCase {
  async execute(input: CreateAccountInput): Promise<Account>
}

class GetAccountBalanceUseCase {
  async execute(accountId: string): Promise<number>
}
```

#### Module: Transactions
```typescript
interface Transaction {
  id: string
  userId: string
  accountId: string
  categoryId: string
  type: 'income' | 'expense' | 'transfer'
  amount: number
  description: string
  date: Date
  tags: string[]
  confidence?: number  // Confiança da categorização automática
}

// Use cases
class AddTransactionUseCase
class ImportCsvUseCase
class AutoCategorizeUseCase
```

#### Module: Budgets
```typescript
interface Budget {
  id: string
  userId: string
  categoryId: string
  limit: number
  period: 'weekly' | 'monthly' | 'yearly'
  alertType: 'soft' | 'hard'
  spent: number  // Calculado dinamicamente
}

// Use cases
class CreateBudgetUseCase
class CheckBudgetExceededUseCase
```

---

## 4. Modelo de Dados

### 4.1 Schema do Banco de Dados (PostgreSQL)

#### Tabela: users (gerenciada por Supabase Auth)
```sql
-- Supabase Auth já cria a tabela auth.users
-- Criamos uma tabela profiles para dados adicionais

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

---

#### Tabela: accounts
```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'credit', 'investment', 'cash')),
  balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_user_active ON accounts(user_id) WHERE NOT is_archived;

-- RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own accounts"
ON accounts FOR ALL
USING (auth.uid() = user_id);
```

---

#### Tabela: categories
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- NULL para categorias default
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,  -- Suporte a subcategorias
  is_system BOOLEAN NOT NULL DEFAULT false,  -- Categorias padrão do sistema
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);

-- RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see system categories and own categories"
ON categories FOR SELECT
USING (is_system = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage own categories"
ON categories FOR ALL
USING (auth.uid() = user_id AND is_system = false);

-- Seed de categorias padrão
INSERT INTO categories (name, icon, type, is_system) VALUES
  ('Alimentação', '🍔', 'expense', true),
  ('Transporte', '🚗', 'expense', true),
  ('Moradia', '🏠', 'expense', true),
  ('Lazer', '🎬', 'expense', true),
  ('Saúde', '💊', 'expense', true),
  ('Educação', '📚', 'expense', true),
  ('Salário', '💼', 'income', true),
  ('Freelance', '💻', 'income', true);
```

---

#### Tabela: transactions
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  tags TEXT[],
  
  -- Campos para transferências
  to_account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  
  -- Campos para categorização automática
  auto_categorized BOOLEAN DEFAULT false,
  confidence NUMERIC(3, 2),  -- 0.00 - 1.00
  
  -- Campos para transações recorrentes
  recurring_id UUID REFERENCES recurring_transactions(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_transfer CHECK (
    (type = 'transfer' AND to_account_id IS NOT NULL) OR
    (type != 'transfer' AND to_account_id IS NULL)
  )
);

-- Índices (CRÍTICO para performance)
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_category ON transactions(category_id);

-- Particionamento por ano (futuro - quando > 1M transactions)
-- CREATE TABLE transactions_2025 PARTITION OF transactions
-- FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own transactions"
ON transactions FOR ALL
USING (auth.uid() = user_id);

-- Trigger para atualizar saldo da conta
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'income' THEN
      UPDATE accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'expense' THEN
      UPDATE accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'transfer' THEN
      UPDATE accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
      UPDATE accounts SET balance = balance + NEW.amount WHERE id = NEW.to_account_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.type = 'income' THEN
      UPDATE accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'expense' THEN
      UPDATE accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'transfer' THEN
      UPDATE accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
      UPDATE accounts SET balance = balance - OLD.amount WHERE id = OLD.to_account_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_account_balance
AFTER INSERT OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_account_balance();
```

---

#### Tabela: budgets
```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  limit_amount NUMERIC(12, 2) NOT NULL CHECK (limit_amount > 0),
  period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'yearly')),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('soft', 'hard')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_recurring BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_category ON budgets(category_id);

-- RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own budgets"
ON budgets FOR ALL
USING (auth.uid() = user_id);

-- View: budget_status (calcula gasto atual vs limite)
CREATE OR REPLACE VIEW budget_status AS
SELECT 
  b.*,
  COALESCE(SUM(t.amount), 0) AS spent,
  (COALESCE(SUM(t.amount), 0) / b.limit_amount * 100) AS percentage
FROM budgets b
LEFT JOIN transactions t ON 
  t.category_id = b.category_id AND
  t.user_id = b.user_id AND
  t.type = 'expense' AND
  CASE 
    WHEN b.period = 'monthly' THEN 
      DATE_TRUNC('month', t.date) = DATE_TRUNC('month', CURRENT_DATE)
    WHEN b.period = 'weekly' THEN 
      DATE_TRUNC('week', t.date) = DATE_TRUNC('week', CURRENT_DATE)
    WHEN b.period = 'yearly' THEN 
      DATE_TRUNC('year', t.date) = DATE_TRUNC('year', CURRENT_DATE)
  END
GROUP BY b.id;
```

---

#### Tabela: goals
```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,  -- Conta vinculada (opcional)
  name TEXT NOT NULL,
  target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);

-- RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own goals"
ON goals FOR ALL
USING (auth.uid() = user_id);
```

---

#### Tabela: recurring_transactions
```sql
CREATE TABLE recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE,  -- NULL = sem fim
  next_occurrence DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_recurring_user_id ON recurring_transactions(user_id);
CREATE INDEX idx_recurring_next ON recurring_transactions(next_occurrence) WHERE is_active = true;

-- RLS
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own recurring transactions"
ON recurring_transactions FOR ALL
USING (auth.uid() = user_id);
```

---

#### Tabela: categorization_rules
```sql
CREATE TABLE categorization_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  pattern TEXT NOT NULL,  -- Regex ou palavra-chave
  priority INTEGER NOT NULL DEFAULT 0,  -- Maior = mais prioritário
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_rules_user_id ON categorization_rules(user_id);
CREATE INDEX idx_rules_priority ON categorization_rules(priority DESC);

-- RLS
ALTER TABLE categorization_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own rules"
ON categorization_rules FOR ALL
USING (auth.uid() = user_id);

-- Seed de regras padrão
INSERT INTO categorization_rules (user_id, category_id, pattern, priority) VALUES
  (NULL, (SELECT id FROM categories WHERE name = 'Transporte' AND is_system = true), 'uber|99|cabify|taxi', 10),
  (NULL, (SELECT id FROM categories WHERE name = 'Alimentação' AND is_system = true), 'ifood|rappi|uber eats|mcdonalds|burger', 10);
```

---

### 4.2 Relacionamentos (Diagrama ER)

```
┌──────────────┐
│   profiles   │
│   (users)    │
└───────┬──────┘
        │ 1:N
        ├──────────────────┐
        │                  │
        ▼                  ▼
┌──────────────┐    ┌──────────────┐
│   accounts   │    │  categories  │
└───────┬──────┘    └───────┬──────┘
        │ 1:N               │ 1:N
        │                   │
        └────────┬──────────┘
                 │
                 ▼
        ┌──────────────┐
        │ transactions │
        └───────┬──────┘
                │
                ├─────────┐
                │         │
                ▼         ▼
        ┌──────────┐  ┌──────────┐
        │  budgets │  │  goals   │
        └──────────┘  └──────────┘
```

---

## 5. Padrões de Implementação

### 5.0 Convenções de Naming

#### Arquivos e Diretórios

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Componentes React | PascalCase | `TransactionCard.tsx` |
| Hooks | camelCase com prefixo `use` | `useTransactions.ts` |
| Utilitários | camelCase | `formatCurrency.ts` |
| Tipos/Interfaces | PascalCase | `Transaction.types.ts` |
| Constantes | SCREAMING_SNAKE_CASE | `API_ENDPOINTS.ts` |
| Páginas Next.js | kebab-case (pasta) + page.tsx | `transactions/page.tsx` |
| Server Actions | camelCase | `createTransaction.ts` |
| Testes | mesmo nome + `.test.ts` | `formatCurrency.test.ts` |

#### Código TypeScript

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Variáveis | camelCase | `const transactionList` |
| Funções | camelCase | `function calculateTotal()` |
| Classes | PascalCase | `class TransactionService` |
| Interfaces | PascalCase com prefixo `I` opcional | `interface Transaction` ou `ITransaction` |
| Types | PascalCase | `type TransactionType` |
| Enums | PascalCase | `enum TransactionStatus` |
| Constantes | SCREAMING_SNAKE_CASE | `const MAX_TRANSACTIONS = 100` |
| Props de componente | PascalCase + Props | `TransactionCardProps` |

#### Banco de Dados (PostgreSQL)

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Tabelas | snake_case, plural | `transactions`, `recurring_transactions` |
| Colunas | snake_case | `created_at`, `user_id` |
| Índices | idx_{table}_{column} | `idx_transactions_user_id` |
| Foreign Keys | fk_{table}_{ref_table} | `fk_transactions_accounts` |
| Constraints | {table}_{tipo}_{descrição} | `transactions_amount_positive` |
| Triggers | trigger_{ação}_{tabela} | `trigger_update_account_balance` |
| Functions | snake_case com verbo | `update_account_balance()` |
| Views | snake_case descritivo | `budget_status` |

#### API Endpoints (PostgREST)

| Operação | Método | Padrão |
|----------|--------|--------|
| Listar | GET | `/rest/v1/{table}` |
| Buscar um | GET | `/rest/v1/{table}?id=eq.{id}` |
| Criar | POST | `/rest/v1/{table}` |
| Atualizar | PATCH | `/rest/v1/{table}?id=eq.{id}` |
| Deletar | DELETE | `/rest/v1/{table}?id=eq.{id}` |
| RPC | POST | `/rest/v1/rpc/{function_name}` |

### 5.1 Formato Padrão de Respostas e Erros

#### Resposta de Sucesso

```typescript
// Lista
{
  data: Transaction[],
  count: number | null
}

// Item único
{
  data: Transaction
}

// Mutação
{
  data: Transaction,
  message?: string
}
```

#### Resposta de Erro

```typescript
interface ApiError {
  code: string;           // Código estável para matching (ex: "VALIDATION_ERROR")
  message: string;        // Mensagem human-readable em português
  details?: {
    field?: string;       // Campo com erro (para validação)
    constraint?: string;  // Nome da constraint violada
    hint?: string;        // Dica para resolução
  };
  timestamp: string;      // ISO 8601
}
```

#### Códigos de Erro Padronizados

| Código | HTTP Status | Descrição |
|--------|-------------|-----------|
| `VALIDATION_ERROR` | 400 | Dados inválidos |
| `UNAUTHORIZED` | 401 | Não autenticado |
| `FORBIDDEN` | 403 | Sem permissão |
| `NOT_FOUND` | 404 | Recurso não encontrado |
| `CONFLICT` | 409 | Conflito (ex: duplicata) |
| `RATE_LIMITED` | 429 | Muitas requisições |
| `INTERNAL_ERROR` | 500 | Erro interno |

#### Exemplo de Erro de Validação

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Dados inválidos",
  "details": {
    "field": "amount",
    "constraint": "positive_number",
    "hint": "O valor deve ser maior que zero"
  },
  "timestamp": "2024-12-04T10:30:00Z"
}
```

#### Tratamento de Erros no Cliente

```typescript
// lib/api-error.ts
export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public status: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromSupabaseError(error: PostgrestError): ApiError {
    return new ApiError(
      error.code || 'UNKNOWN_ERROR',
      error.message,
      400,
      { hint: error.hint, details: error.details }
    );
  }
}
```

### 5.2 Padrões de Formatação

#### Datas e Horários

| Contexto | Formato | Exemplo |
|----------|---------|---------|
| Armazenamento (DB) | ISO 8601 / TIMESTAMPTZ | `2024-12-04T10:30:00Z` |
| API Request/Response | ISO 8601 | `2024-12-04T10:30:00Z` |
| Exibição - Data completa | DD/MM/YYYY | `04/12/2024` |
| Exibição - Data curta | DD/MM | `04/12` |
| Exibição - Mês/Ano | MMM YYYY | `Dez 2024` |
| Exibição - Relativo | Texto descritivo | `Hoje`, `Ontem`, `Há 3 dias` |
| Exibição - Horário | HH:mm | `10:30` |
| Input de formulário | YYYY-MM-DD (HTML date) | `2024-12-04` |

#### Implementação de Formatação de Datas

```typescript
// lib/date-format.ts
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const dateFormats = {
  display: (date: Date): string => format(date, 'dd/MM/yyyy', { locale: ptBR }),
  
  displayShort: (date: Date): string => format(date, 'dd/MM', { locale: ptBR }),
  
  displayMonth: (date: Date): string => format(date, 'MMM yyyy', { locale: ptBR }),
  
  relative: (date: Date): string => {
    if (isToday(date)) return 'Hoje';
    if (isYesterday(date)) return 'Ontem';
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  },
  
  input: (date: Date): string => format(date, 'yyyy-MM-dd'),
  
  api: (date: Date): string => date.toISOString(),
};
```

#### Valores Monetários

| Contexto | Formato | Exemplo |
|----------|---------|---------|
| Armazenamento (DB) | NUMERIC(12,2) | `1234.56` |
| API | Number | `1234.56` |
| Exibição | BRL formatado | `R$ 1.234,56` |
| Input | Número com máscara | `1234,56` |

```typescript
// lib/currency-format.ts
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/\./g, '').replace(',', '.'));
};
```

### 5.3 Estrutura e Padrões de Testes

#### Organização de Arquivos

```
apps/web/
├── __tests__/                    # Testes E2E (Playwright)
│   ├── auth/
│   │   ├── login.spec.ts
│   │   └── register.spec.ts
│   ├── transactions/
│   │   └── crud.spec.ts
│   └── fixtures/
│       └── test-data.ts
├── src/
│   ├── components/
│   │   └── ui/
│   │       └── button.test.tsx   # Teste junto ao componente
│   ├── lib/
│   │   └── utils.test.ts         # Teste junto ao utilitário
│   └── hooks/
│       └── useTransactions.test.ts
└── vitest.config.ts
```

#### Convenções de Nomenclatura de Testes

| Tipo de Teste | Sufixo | Localização |
|---------------|--------|-------------|
| Unit test | `.test.ts(x)` | Junto ao arquivo testado |
| Integration test | `.integration.test.ts` | Junto ao arquivo |
| E2E test | `.spec.ts` | `__tests__/` na raiz |

#### Padrão de Escrita (AAA - Arrange, Act, Assert)

```typescript
// Arrange - Act - Assert
describe('formatCurrency', () => {
  it('deve formatar valor positivo corretamente', () => {
    // Arrange
    const value = 1234.56;
    
    // Act
    const result = formatCurrency(value);
    
    // Assert
    expect(result).toBe('R$ 1.234,56');
  });

  it('deve formatar valor negativo com sinal', () => {
    const value = -500;
    const result = formatCurrency(value);
    expect(result).toBe('-R$ 500,00');
  });
});
```

#### Testes de Componentes React

```typescript
// components/TransactionCard.test.tsx
import { render, screen } from '@testing-library/react';
import { TransactionCard } from './TransactionCard';

const mockTransaction = {
  id: '1',
  description: 'Supermercado',
  amount: 150.00,
  type: 'expense',
  date: new Date('2024-12-04'),
};

describe('TransactionCard', () => {
  it('deve renderizar descrição e valor', () => {
    render(<TransactionCard transaction={mockTransaction} />);
    
    expect(screen.getByText('Supermercado')).toBeInTheDocument();
    expect(screen.getByText('R$ 150,00')).toBeInTheDocument();
  });

  it('deve aplicar classe de despesa para type=expense', () => {
    render(<TransactionCard transaction={mockTransaction} />);
    
    const card = screen.getByTestId('transaction-card');
    expect(card).toHaveClass('expense');
  });
});
```

#### Comandos de Teste

```bash
# Unit tests
pnpm test              # Rodar todos
pnpm test:watch        # Watch mode
pnpm test:coverage     # Com cobertura

# E2E tests
pnpm test:e2e          # Rodar E2E
pnpm test:e2e:ui       # Com UI do Playwright
```

---

## 6. API Design

### 6.1 API Architecture

**Abordagem Híbrida:**
1. **PostgREST Auto API:** Para CRUD simples
2. **Edge Functions:** Para lógica complexa
3. **Next.js API Routes:** Para SSR e webhooks

### 6.2 PostgREST Endpoints (Auto-generated)

```bash
# Listar transações do usuário autenticado
GET /rest/v1/transactions?order=date.desc&limit=20
Authorization: Bearer {JWT}

# Criar transação
POST /rest/v1/transactions
Authorization: Bearer {JWT}
Content-Type: application/json

{
  "account_id": "uuid",
  "category_id": "uuid",
  "type": "expense",
  "amount": 120.50,
  "description": "Supermercado X",
  "date": "2025-12-02"
}

# Atualizar transação
PATCH /rest/v1/transactions?id=eq.{transaction_id}
Authorization: Bearer {JWT}

# Deletar transação
DELETE /rest/v1/transactions?id=eq.{transaction_id}
Authorization: Bearer {JWT}

# Filtrar por período
GET /rest/v1/transactions?date=gte.2025-12-01&date=lte.2025-12-31

# Filtrar por categoria
GET /rest/v1/transactions?category_id=eq.{category_id}

# Busca full-text
GET /rest/v1/transactions?description=ilike.*supermercado*
```

### 6.3 Edge Functions (Custom Logic)

#### Function: import-csv
```typescript
// supabase/functions/import-csv/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'

serve(async (req) => {
  const { fileUrl, userId, accountId } = await req.json()
  
  // 1. Download CSV from Storage
  const response = await fetch(fileUrl)
  const csvText = await response.text()
  
  // 2. Parse CSV
  const transactions = parseCSV(csvText)
  
  // 3. Auto-categorize
  const categorized = await autoCategorize(transactions, userId)
  
  // 4. Detect duplicates
  const { new: newTransactions, duplicates } = await detectDuplicates(
    categorized,
    userId
  )
  
  // 5. Insert batch
  await supabase.from('transactions').insert(newTransactions)
  
  // 6. Return report
  return new Response(JSON.stringify({
    imported: newTransactions.length,
    duplicates: duplicates.length,
    success: true
  }))
})
```

#### Function: auto-categorize
```typescript
// supabase/functions/auto-categorize/index.ts
serve(async (req) => {
  const { description, userId } = await req.json()
  
  // 1. Buscar regras do usuário
  const { data: rules } = await supabase
    .from('categorization_rules')
    .select('*')
    .or(`user_id.eq.${userId},user_id.is.null`)
    .order('priority', { ascending: false })
  
  // 2. Aplicar regras
  for (const rule of rules) {
    if (new RegExp(rule.pattern, 'i').test(description)) {
      return new Response(JSON.stringify({
        categoryId: rule.category_id,
        confidence: 0.9
      }))
    }
  }
  
  // 3. Fallback: ML model (futuro)
  // const prediction = await mlModel.predict(description)
  
  return new Response(JSON.stringify({
    categoryId: null,
    confidence: 0
  }))
})
```

#### Function: process-recurring
```typescript
// supabase/functions/process-recurring/index.ts
// Executado por cron job diário

serve(async () => {
  const today = new Date().toISOString().split('T')[0]
  
  // 1. Buscar recorrências vencidas
  const { data: recurrings } = await supabase
    .from('recurring_transactions')
    .select('*')
    .eq('is_active', true)
    .lte('next_occurrence', today)
  
  for (const recurring of recurrings) {
    // 2. Criar transação
    await supabase.from('transactions').insert({
      user_id: recurring.user_id,
      account_id: recurring.account_id,
      category_id: recurring.category_id,
      type: recurring.type,
      amount: recurring.amount,
      description: recurring.description,
      date: recurring.next_occurrence,
      recurring_id: recurring.id
    })
    
    // 3. Atualizar próxima ocorrência
    const nextDate = calculateNextOccurrence(
      recurring.next_occurrence,
      recurring.frequency
    )
    
    await supabase
      .from('recurring_transactions')
      .update({ next_occurrence: nextDate })
      .eq('id', recurring.id)
  }
  
  return new Response(JSON.stringify({ processed: recurrings.length }))
})
```

#### Function: send-notifications
```typescript
// supabase/functions/send-notifications/index.ts

serve(async () => {
  // 1. Verificar orçamentos excedidos
  const { data: budgets } = await supabase.rpc('check_exceeded_budgets')
  
  for (const budget of budgets) {
    await sendEmail({
      to: budget.user_email,
      subject: `Orçamento de ${budget.category_name} ultrapassado`,
      body: `Você gastou R$ ${budget.spent} de R$ ${budget.limit}.`
    })
  }
  
  // 2. Verificar contas a vencer (3 dias antes)
  const { data: upcoming } = await supabase.rpc('get_upcoming_bills')
  
  for (const bill of upcoming) {
    await sendPushNotification({
      userId: bill.user_id,
      title: 'Conta a vencer',
      body: `${bill.description} vence em 3 dias (R$ ${bill.amount})`
    })
  }
  
  return new Response(JSON.stringify({ sent: budgets.length + upcoming.length }))
})
```

---

## 6. Autenticação e Autorização

### 6.1 Fluxo de Autenticação

```
┌────────────┐     1. signUp()      ┌──────────────┐
│   Client   │ ──────────────────> │ Supabase     │
│            │                      │ Auth         │
│            │ <────────────────── │              │
└────────────┘     2. JWT Token     └──────────────┘
      │                                    │
      │ 3. API Request                    │
      │    (Bearer Token)                 │
      ▼                                    ▼
┌────────────┐                      ┌──────────────┐
│ PostgREST  │ ───── 4. Validate ──> │   Postgres   │
│ / Edge     │        JWT + RLS      │   Database   │
│ Function   │ <──── 5. Data ─────── │              │
└────────────┘                       └──────────────┘
```

### 6.2 JWT Token Structure

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "authenticated",
  "exp": 1733184000,
  "iat": 1733097600
}
```

### 6.3 RLS Policies (Exemplos Completos)

```sql
-- Policy para transações
CREATE POLICY "Users can only access own transactions"
ON transactions
FOR ALL
USING (auth.uid() = user_id);

-- Policy para contas compartilhadas (futuro)
CREATE POLICY "Users can access shared accounts"
ON accounts
FOR SELECT
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM account_shares
    WHERE account_id = accounts.id AND shared_with_user_id = auth.uid()
  )
);

-- Policy para categorias (sistema + próprias)
CREATE POLICY "Users can see system and own categories"
ON categories
FOR SELECT
USING (is_system = true OR auth.uid() = user_id);

-- Policy para inserção de transações (validação de conta)
CREATE POLICY "Users can only create transactions in own accounts"
ON transactions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (SELECT 1 FROM accounts WHERE id = account_id AND user_id = auth.uid())
);
```

### 6.4 Session Management

```typescript
// Client-side session handling
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Auto-refresh de token
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed')
  }
  if (event === 'SIGNED_OUT') {
    window.location.href = '/login'
  }
})

// Persistência de sessão
// Next.js: cookies (server-side)
// React Native: AsyncStorage
```

---

## 7. Processamento Assíncrono

### 7.1 Cron Jobs (Supabase Edge Functions)

```yaml
# supabase/functions/_cron/cron.yaml
- name: process-recurring-transactions
  schedule: '0 0 * * *'  # Diariamente à meia-noite
  function: process-recurring

- name: send-notifications
  schedule: '0 8 * * *'  # Diariamente às 8h
  function: send-notifications

- name: generate-insights
  schedule: '0 1 * * 1'  # Semanalmente às segundas, 1h
  function: generate-insights
```

### 7.2 Webhooks (Database Triggers)

```sql
-- Trigger para enviar notificação quando orçamento exceder
CREATE OR REPLACE FUNCTION notify_budget_exceeded()
RETURNS TRIGGER AS $$
DECLARE
  budget_status RECORD;
BEGIN
  -- Calcular status do orçamento
  SELECT * INTO budget_status
  FROM budget_status
  WHERE id = NEW.budget_id;
  
  IF budget_status.percentage >= 80 THEN
    -- Chamar Edge Function via HTTP
    PERFORM net.http_post(
      url := 'https://YOUR_PROJECT.supabase.co/functions/v1/send-notification',
      headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('request.jwt.claim.sub')),
      body := jsonb_build_object(
        'type', 'budget_alert',
        'userId', NEW.user_id,
        'budgetId', NEW.budget_id,
        'percentage', budget_status.percentage
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_budget_exceeded
AFTER INSERT OR UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION notify_budget_exceeded();
```

---

## 8. Caching e Performance

### 8.1 Estratégias de Cache

#### Client-Side Caching (React Query)
```typescript
// Configuração global
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutos
      cacheTime: 10 * 60 * 1000,  // 10 minutos
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})

// Query específica com configuração customizada
const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
    staleTime: 1 * 60 * 1000,  // 1 minuto (mais frequente)
  })
}

// Query com cache infinito (categorias raramente mudam)
const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: Infinity,  // Nunca fica stale
  })
}
```

#### Database Query Optimization
```sql
-- Materialized View para dashboard (atualizada de hora em hora)
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT 
  user_id,
  DATE_TRUNC('month', date) AS month,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense
FROM transactions
GROUP BY user_id, month;

CREATE UNIQUE INDEX ON dashboard_stats(user_id, month);

-- Refresh automático
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats;
END;
$$ LANGUAGE plpgsql;

-- Cron job para refresh
SELECT cron.schedule('refresh-stats', '0 * * * *', 'SELECT refresh_dashboard_stats()');
```

### 8.2 Performance Monitoring

```typescript
// Instrumentação de queries lentas
supabase
  .from('transactions')
  .select('*')
  .onSlowQuery((query, duration) => {
    if (duration > 1000) {
      console.warn(`Slow query: ${duration}ms`, query)
      // Enviar para Sentry/Datadog
    }
  })
```

---

## 9. Segurança

### 9.1 Checklist de Segurança

- [x] **Autenticação:** JWT com expiração de 7 dias
- [x] **Autorização:** RLS em todas as tabelas
- [x] **Criptografia:** HTTPS/TLS 1.3 para transit, AES-256 at rest
- [x] **Input Validation:** Zod schemas no cliente e servidor
- [x] **SQL Injection:** Prevenido por PostgREST/Supabase (parameterized queries)
- [x] **XSS:** React escapa automaticamente, sanitizar user content
- [x] **CSRF:** Tokens em formulários críticos
- [x] **Rate Limiting:** Supabase nativo (100 req/s por IP)
- [x] **Secrets:** Variáveis de ambiente (.env), nunca no código
- [x] **Audit Logs:** Postgres WAL + triggers para ações críticas

### 9.2 Input Validation (Zod)

```typescript
// Schema de validação
const TransactionSchema = z.object({
  accountId: z.string().uuid(),
  categoryId: z.string().uuid().nullable(),
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.number().positive().max(999999.99),
  description: z.string().max(500).optional(),
  date: z.date().max(new Date()),  // Não pode ser futuro
  tags: z.array(z.string()).max(10).optional()
})

// Uso no servidor (Edge Function)
const { data, error } = TransactionSchema.safeParse(requestBody)
if (error) {
  return new Response(JSON.stringify({ error: error.issues }), { status: 400 })
}
```

### 9.3 Sanitização de Inputs

```typescript
import DOMPurify from 'isomorphic-dompurify'

// Sanitizar descrições com HTML (caso usuário cole conteúdo rico)
const sanitizedDescription = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: [],  // Remove todas as tags HTML
  ALLOWED_ATTR: []
})
```

---

## 10. Observabilidade

### 10.1 Logging

#### Estrutura de Logs
```typescript
// Structured logging
const logger = {
  info: (message: string, meta?: object) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta
    }))
  },
  error: (message: string, error: Error, meta?: object) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString(),
      ...meta
    }))
  }
}

// Uso
logger.info('Transaction created', { userId, transactionId, amount })
logger.error('CSV import failed', error, { userId, fileSize })
```

### 10.2 Error Tracking (Sentry)

```typescript
// Configuração Sentry
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,  // 10% das transações
  beforeSend(event, hint) {
    // Filtrar dados sensíveis
    if (event.request?.data) {
      delete event.request.data.password
      delete event.request.data.token
    }
    return event
  }
})

// Capturar exceções
try {
  await importCsv(file)
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'csv-import' },
    user: { id: userId }
  })
  throw error
}
```

### 10.3 Métricas (Supabase Metrics + Custom)

```typescript
// Custom metrics via Edge Function
const metrics = {
  counter: (name: string, value: number = 1) => {
    // Enviar para sistema de métricas (Prometheus, Datadog, etc)
    fetch('https://metrics-api.example.com/v1/counter', {
      method: 'POST',
      body: JSON.stringify({ name, value })
    })
  }
}

// Uso
metrics.counter('csv_import_success')
metrics.counter('transaction_created')
metrics.counter('budget_exceeded')
```

---

## 11. Deployment e Infraestrutura

### 11.1 Ambientes

```
Development (dev)     → Supabase Dev Project
Staging (staging)     → Supabase Staging Project
Production (prod)     → Supabase Production Project
```

### 11.2 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      - run: npm run typecheck

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel Staging
        run: vercel --token=${{ secrets.VERCEL_TOKEN }}
      - name: Run migrations (staging)
        run: supabase db push --project-ref ${{ secrets.SUPABASE_STAGING_REF }}

  deploy-production:
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel Production
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Run migrations (production)
        run: supabase db push --project-ref ${{ secrets.SUPABASE_PROD_REF }}
```

### 11.3 Database Migrations

```bash
# Criar migration
supabase migration new add_transactions_table

# Aplicar migrations localmente
supabase db reset

# Aplicar em produção (via CI/CD)
supabase db push --project-ref YOUR_PROJECT_REF
```

### 11.4 Rollback Strategy

```bash
# Rollback de migration (caso algo dê errado)
supabase migration repair --status reverted {migration_version}

# Rollback de deployment (Vercel)
vercel rollback {deployment-url}
```

---

## 12. Escalabilidade

### 12.1 Projeções de Carga

**MVP (3 meses):**
- 10k usuários ativos
- 300k transações/mês
- 1k req/s (pico)

**Ano 1:**
- 100k usuários ativos
- 3M transações/mês
- 5k req/s (pico)

**Ano 2:**
- 500k usuários ativos
- 15M transações/mês
- 20k req/s (pico)

### 12.2 Estratégias de Escalabilidade

#### Database Scaling
- **Vertical:** Supabase permite upgrade de plano (mais CPU/RAM)
- **Read Replicas:** Para queries analíticas (relatórios)
- **Particionamento:** Transactions por ano (quando > 10M records)
- **Archiving:** Mover transações antigas para cold storage

```sql
-- Exemplo de particionamento
CREATE TABLE transactions_2025 PARTITION OF transactions
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE transactions_2026 PARTITION OF transactions
FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

#### Application Scaling
- **Edge Functions:** Escalam automaticamente (serverless)
- **Frontend:** Vercel escala automaticamente (Edge Network)
- **CDN:** Cloudflare/Vercel Edge para assets estáticos

#### Caching Layer
- **Redis (futuro):** Para sessões, rate limiting, cached queries
- **Service Workers:** Offline-first PWA

---

## 13. Próximos Passos

### 13.1 Implementação

- [ ] **Sprint 0:** Setup de repositório, ambientes, CI/CD
- [ ] **Sprint 1-2:** Database schema, migrations, seeds
- [ ] **Sprint 3-4:** Auth flow, RLS policies
- [ ] **Sprint 5-6:** CRUD de transações, contas, categorias
- [ ] **Sprint 7-8:** Orçamentos, metas, dashboard
- [ ] **Sprint 9-10:** Edge Functions (CSV, recorrências, notificações)
- [ ] **Sprint 11-12:** Otimizações, testes, polimento

### 13.2 Validações Necessárias

- [ ] **Load Testing:** Simular 10k usuários simultâneos
- [ ] **Security Audit:** Penetration testing, revisão de RLS
- [ ] **Performance Profiling:** Identificar queries lentas
- [ ] **Disaster Recovery:** Testar backup/restore

### 13.3 Documentação Pendente

- [ ] **API Documentation:** OpenAPI/Swagger para Edge Functions
- [ ] **Database ERD:** Diagrama visual atualizado
- [ ] **Runbooks:** Procedimentos operacionais (deployment, rollback, incidents)

---

## 14. Apêndice

### 14.1 Glossário

- **RLS:** Row-Level Security - Segurança em nível de linha no Postgres
- **PostgREST:** API REST gerada automaticamente a partir do schema Postgres
- **Edge Functions:** Funções serverless executadas na borda (Deno Deploy)
- **JWT:** JSON Web Token - Token de autenticação
- **MCP:** Managed Cloud Platform - Plataforma gerenciada

### 14.2 Referências

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query)

---

**Versão:** 1.0  
**Última Atualização:** 2025-12-04  
**Status:** ✅ Validado e Aprovado  

**Próximo Passo:** Implementação do schema de banco de dados e setup do projeto.


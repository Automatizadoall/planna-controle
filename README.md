# 💰 Controle Financeiro Pessoal

Aplicativo de controle financeiro pessoal desenvolvido com Next.js 14, Supabase e shadcn/ui.

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- npm ou pnpm
- Docker (para Supabase local)

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Supabase Local

```bash
# Iniciar containers do Supabase
npm run db:start

# Aplicar migrations
npm run db:push

# Gerar tipos TypeScript (opcional)
npm run db:types
```

### 3. Configurar variáveis de ambiente

Crie o arquivo `apps/web/.env.local`:

```env
# Supabase (local)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-do-supabase-start>
```

Para obter as chaves, execute `supabase status` após iniciar o Supabase.

### 4. Iniciar desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## 📁 Estrutura do Projeto

```
mentoria/
├── apps/
│   └── web/              # Next.js 14 App
├── packages/
│   └── database/         # Supabase client + types
├── supabase/
│   ├── migrations/       # SQL migrations
│   ├── functions/        # Edge Functions
│   └── seed.sql          # Dados iniciais
└── docs/
    └── sprint-artifacts/ # Documentação do projeto
```

## 🛠️ Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | Executa linter |
| `npm run db:start` | Inicia Supabase local |
| `npm run db:stop` | Para Supabase local |
| `npm run db:reset` | Reseta banco de dados |
| `npm run db:types` | Gera tipos TypeScript |

## 🔧 Tecnologias

- **Frontend:** Next.js 14, React 18, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Postgres, Auth, Storage, Realtime, Edge Functions)
- **Monorepo:** Turborepo
- **Linguagem:** TypeScript

## 📚 Documentação

- [Product Brief](docs/sprint-artifacts/personal_finance_control_app_project_brief.md)
- [PRD](docs/sprint-artifacts/prd.md)
- [UX Design](docs/sprint-artifacts/ux-design-specification.md)
- [Architecture](docs/sprint-artifacts/architecture.md)
- [Epics & Stories](docs/sprint-artifacts/epics-and-stories.md)

## 📝 License

MIT


# Epic Technical Specification: Autenticação e Perfil

**Date:** 2025-12-12  
**Author:** BMad  
**Epic ID:** 1  
**Status:** Draft  
**Stories:** US-1.1, US-1.2, US-1.3  
**Story Points:** 5  
**Sprint:** 1

---

## Overview

Este epic implementa o sistema completo de autenticação, registro e gerenciamento de perfil de usuário para o aplicativo de Controle Financeiro Pessoal. É a fundação de segurança e identidade para todo o sistema, utilizando Supabase Auth como backend de autenticação com JWT tokens e Row-Level Security (RLS) para isolamento de dados.

O epic é **P0 (crítico)** e deve ser completado no Sprint 1, pois todos os outros épicos dependem de um usuário autenticado para funcionar.

---

## Objectives and Scope

### ✅ In Scope

- **US-1.1:** Registro de novo usuário com email/senha
- **US-1.2:** Login de usuário existente
- **US-1.3:** Visualização e edição de perfil (nome, avatar)
- Integração completa com Supabase Auth
- Criação automática de perfil via database trigger
- Validação client-side com Zod
- Email de verificação (gerenciado pelo Supabase)
- Fluxo de "Esqueci minha senha" (redirect para Supabase)
- Persistência de sessão via cookies (Next.js SSR)
- RLS policies para tabela `profiles`

### ❌ Out of Scope

- Login social (Google, Apple) — planejado para P2
- Two-Factor Authentication (2FA) — futuro
- Gerenciamento de múltiplas sessões
- Recuperação de conta bloqueada (suporte manual)
- Onboarding wizard (será Epic 2 ou separado)

---

## System Architecture Alignment

### Componentes Referenciados

| Componente | Responsabilidade |
|------------|------------------|
| `Supabase Auth` | Autenticação, JWT tokens, email verification |
| `PostgreSQL` | Tabela `profiles` com RLS |
| `Next.js Middleware` | Proteção de rotas autenticadas |
| `PostgREST` | API automática para CRUD de profiles |

### Constraints da Arquitetura

1. **JWT-based authentication** — Tokens gerenciados pelo Supabase
2. **Row-Level Security** — Todas as queries filtradas por `auth.uid()`
3. **Cookie storage** — Sessão via cookies HTTP-only para SSR
4. **Email verification** — Obrigatório antes de acesso completo
5. **Password policy** — Mínimo 8 chars, 1 maiúscula, 1 número, 1 símbolo

### Diagrama de Fluxo

```
┌─────────────┐     signUp()      ┌──────────────┐     Trigger      ┌──────────────┐
│  RegisterForm│ ───────────────> │ Supabase Auth │ ─────────────> │  profiles    │
│  (Client)    │                   │               │                 │  (created)   │
└─────────────┘                    └───────┬───────┘                 └──────────────┘
                                           │
                                           ▼
                                   Email de Verificação
                                           │
                                           ▼
┌─────────────┐    signIn()       ┌──────────────┐
│  LoginForm  │ ───────────────> │ Supabase Auth │ ──> JWT Token ──> Cookie
│  (Client)   │                   │               │
└─────────────┘                   └───────────────┘
                                           │
                                           ▼
                                   Redirect Dashboard
```

---

## Detailed Design

### Services and Modules

| Módulo | Responsabilidade | Inputs | Outputs |
|--------|------------------|--------|---------|
| `RegisterForm` | Formulário de registro | email, password, name | Supabase Auth response |
| `LoginForm` | Formulário de login | email, password | JWT Token, redirect |
| `AuthContext` | Estado global de autenticação | - | user, session, loading |
| `ProfilePage` | Visualização/edição de perfil | user_id | profile data |
| `ProfileForm` | Edição de nome e avatar | name, avatar_file | updated profile |
| `useAuth` | Hook para ações de auth | - | signIn, signUp, signOut |
| `useProfile` | Hook para dados de perfil | - | profile, updateProfile |

### Estrutura de Arquivos

```
apps/web/src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx           # Página de login
│   │   ├── register/
│   │   │   └── page.tsx           # Página de registro
│   │   ├── verify-email/
│   │   │   └── page.tsx           # Aguardando verificação
│   │   └── layout.tsx             # Layout sem sidebar
│   ├── (dashboard)/
│   │   ├── profile/
│   │   │   └── page.tsx           # Página de perfil
│   │   └── layout.tsx             # Layout com sidebar
│   └── layout.tsx                 # Root layout
├── components/
│   ├── auth/
│   │   ├── RegisterForm.tsx
│   │   ├── LoginForm.tsx
│   │   └── AuthProvider.tsx
│   └── profile/
│       ├── ProfileForm.tsx
│       └── AvatarUpload.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useProfile.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # createBrowserClient
│   │   ├── server.ts              # createServerClient
│   │   └── middleware.ts          # updateSession
│   └── validations/
│       └── auth.schema.ts         # Zod schemas
└── middleware.ts                  # Next.js middleware
```

---

### Data Models and Contracts

#### Tabela: profiles

```sql
-- Supabase Auth gerencia auth.users
-- profiles é nossa extensão com dados adicionais

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

#### TypeScript Types

```typescript
// types/auth.ts
export interface User {
  id: string;
  email: string;
  emailConfirmedAt?: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: User;
}

// Zod Schemas
export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Deve conter letra maiúscula')
    .regex(/[0-9]/, 'Deve conter número')
    .regex(/[^A-Za-z0-9]/, 'Deve conter símbolo'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Nome obrigatório'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Nome obrigatório'),
});
```

---

### APIs and Interfaces

#### Supabase Auth API (Client-side)

| Ação | Método | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| Registro | `signUp` | POST /auth/v1/signup | `{ email, password, options: { data: { full_name } } }` | `{ user, session }` |
| Login | `signInWithPassword` | POST /auth/v1/token | `{ email, password }` | `{ user, session }` |
| Logout | `signOut` | POST /auth/v1/logout | - | `{ error }` |
| Get Session | `getSession` | GET /auth/v1/user | Bearer token | `{ session }` |
| Refresh | `refreshSession` | POST /auth/v1/token?grant_type=refresh_token | refresh_token | `{ session }` |

#### Profile API (PostgREST)

| Ação | Método | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| Get Profile | GET | `/rest/v1/profiles?id=eq.{userId}` | - | `Profile` |
| Update Profile | PATCH | `/rest/v1/profiles?id=eq.{userId}` | `{ full_name }` | `Profile` |

#### Storage API (Avatar)

| Ação | Método | Endpoint | Request | Response |
|------|--------|----------|---------|----------|
| Upload Avatar | POST | `/storage/v1/object/avatars/{userId}` | FormData (file) | `{ path }` |
| Get Avatar URL | - | `getPublicUrl()` | path | signed URL |

#### Error Codes

| Código | HTTP | Descrição | Ação |
|--------|------|-----------|------|
| `user_already_exists` | 400 | Email já cadastrado | Mostrar erro no form |
| `invalid_credentials` | 401 | Email/senha incorretos | Mostrar erro genérico |
| `email_not_confirmed` | 401 | Email não verificado | Redirect para verify-email |
| `user_banned` | 403 | Conta bloqueada | Mostrar erro e suporte |
| `weak_password` | 422 | Senha não atende critérios | Mostrar requisitos |

---

### Workflows and Sequencing

#### Fluxo de Registro

```
1. Usuário abre /register
2. Preenche: email, senha, confirmar senha, nome
3. Client valida com Zod
4. Se válido: supabase.auth.signUp({ email, password, options: { data: { full_name } } })
5. Supabase:
   a. Cria user em auth.users
   b. Trigger cria profile em profiles
   c. Envia email de verificação
6. Client recebe response
7. Se sucesso: redirect para /verify-email com mensagem
8. Se erro: mostra erro inline no form
9. Usuário clica link no email
10. Redirect para /login com ?verified=true
```

#### Fluxo de Login

```
1. Usuário abre /login
2. Preenche: email, senha
3. Client valida com Zod
4. supabase.auth.signInWithPassword({ email, password })
5. Supabase valida credenciais
6. Se sucesso:
   a. JWT token retornado
   b. Cookie setado via middleware
   c. Redirect para /dashboard
7. Se erro:
   a. email_not_confirmed → Redirect /verify-email
   b. invalid_credentials → Erro inline
   c. user_banned → Modal de conta bloqueada
```

#### Fluxo de Edição de Perfil

```
1. Usuário logado acessa /profile
2. useProfile hook busca dados: supabase.from('profiles').select().single()
3. Form pré-preenchido com fullName e avatarUrl
4. Usuário edita nome e/ou faz upload de avatar
5. Se avatar:
   a. Upload para storage: supabase.storage.from('avatars').upload()
   b. Get public URL
6. Update profile: supabase.from('profiles').update({ full_name, avatar_url })
7. Optimistic update no React Query cache
8. Toast: "Perfil atualizado!"
```

---

## Non-Functional Requirements

### Performance

| Métrica | Target | Fonte |
|---------|--------|-------|
| Login response time | < 500ms | PRD NFR-1 |
| Profile page load | < 1s | PRD NFR-1 |
| Avatar upload | < 3s (max 2MB) | Best practice |
| JWT validation | < 50ms (edge) | Supabase SLA |

**Implementação:**
- Supabase Auth é gerenciado, performance garantida
- Profile carregado via React Query com staleTime
- Avatar comprimido client-side antes de upload

### Security

| Requisito | Implementação | Fonte |
|-----------|---------------|-------|
| Password hashing | bcrypt (Supabase) | ADR-001 |
| JWT expiry | 1 hora (auto-refresh) | Security best practice |
| RLS enforcement | `auth.uid() = id` | ADR-002 |
| HTTPS only | Vercel/Supabase default | Infra |
| Rate limiting | Supabase built-in | Platform |
| CSRF protection | SameSite cookies | Next.js |

**Password Policy:**
- Mínimo 8 caracteres
- 1 letra maiúscula
- 1 número
- 1 símbolo especial
- Validado client-side (Zod) + server-side (Supabase)

### Reliability/Availability

| Requisito | Target | Mitigação |
|-----------|--------|-----------|
| Auth service uptime | 99.9% | Supabase SLA |
| Session persistence | Across page reloads | Cookies + auto-refresh |
| Token refresh | Seamless | onAuthStateChange listener |
| Graceful degradation | Show cached profile | React Query offline |

### Observability

| Sinal | Implementação | Ferramenta |
|-------|---------------|------------|
| Auth errors | Capturar e reportar | Sentry |
| Login success rate | Custom metric | Sentry |
| Failed login attempts | Log com rate limiting | Supabase Logs |
| Profile update latency | Performance span | Sentry |

```typescript
// Exemplo de tracking
Sentry.setUser({ id: user.id, email: user.email });

try {
  await supabase.auth.signIn(...)
} catch (error) {
  Sentry.captureException(error, { tags: { action: 'login' } });
}
```

---

## Dependencies and Integrations

### NPM Dependencies

```json
{
  "@supabase/supabase-js": "^2.45.x",
  "@supabase/ssr": "^0.5.x",
  "zod": "^3.23.x",
  "react-hook-form": "^7.53.x",
  "@hookform/resolvers": "^3.9.x"
}
```

### Supabase Services

| Serviço | Uso | Configuração |
|---------|-----|--------------|
| Auth | Signup, Login, Logout | Email templates em PT-BR |
| Database | Tabela profiles | RLS enabled |
| Storage | Bucket avatars | Public read, auth write |

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Acceptance Criteria (Authoritative)

### US-1.1: Registro de Novo Usuário

| # | Critério | Testável |
|---|----------|----------|
| AC-1.1.1 | Formulário exibe campos: Email, Senha, Confirmar Senha, Nome Completo | Sim |
| AC-1.1.2 | Email inválido mostra erro inline | Sim |
| AC-1.1.3 | Senha < 8 chars mostra erro | Sim |
| AC-1.1.4 | Senha sem maiúscula mostra erro | Sim |
| AC-1.1.5 | Senha sem número mostra erro | Sim |
| AC-1.1.6 | Senha sem símbolo mostra erro | Sim |
| AC-1.1.7 | Senhas diferentes mostra erro | Sim |
| AC-1.1.8 | Registro com email válido cria user | Sim |
| AC-1.1.9 | Email de verificação enviado | Sim |
| AC-1.1.10 | Profile criado automaticamente | Sim |
| AC-1.1.11 | Email já existente mostra erro "Email já cadastrado" | Sim |
| AC-1.1.12 | Redirect para /verify-email após sucesso | Sim |

### US-1.2: Login de Usuário

| # | Critério | Testável |
|---|----------|----------|
| AC-1.2.1 | Formulário exibe Email e Senha | Sim |
| AC-1.2.2 | Campos vazios mostram erro | Sim |
| AC-1.2.3 | Credenciais corretas → Redirect dashboard | Sim |
| AC-1.2.4 | Credenciais incorretas → Erro "Credenciais inválidas" | Sim |
| AC-1.2.5 | Email não verificado → Redirect /verify-email | Sim |
| AC-1.2.6 | Sessão persistida após refresh | Sim |
| AC-1.2.7 | Link "Esqueci minha senha" presente | Sim |
| AC-1.2.8 | JWT token armazenado em cookie | Sim |

### US-1.3: Gerenciamento de Perfil

| # | Critério | Testável |
|---|----------|----------|
| AC-1.3.1 | Página exibe: Nome, Email, Avatar, Data de Criação | Sim |
| AC-1.3.2 | Nome editável e salvável | Sim |
| AC-1.3.3 | Upload de avatar funciona | Sim |
| AC-1.3.4 | Avatar exibido após upload | Sim |
| AC-1.3.5 | Loading state durante save | Sim |
| AC-1.3.6 | Toast de sucesso após save | Sim |
| AC-1.3.7 | Erro de upload mostra mensagem | Sim |
| AC-1.3.8 | RLS impede editar perfil de outro usuário | Sim |

---

## Traceability Mapping

| AC | Spec Section | Component | API | Test |
|----|--------------|-----------|-----|------|
| AC-1.1.1 | Data Models | RegisterForm | - | E2E: form fields visible |
| AC-1.1.2-7 | Data Models | RegisterForm | - | Unit: Zod validation |
| AC-1.1.8-10 | Data Models, Workflows | useAuth | signUp | E2E: register flow |
| AC-1.1.11 | APIs | RegisterForm | signUp | E2E: duplicate email |
| AC-1.1.12 | Workflows | RegisterForm | - | E2E: redirect |
| AC-1.2.1-2 | Data Models | LoginForm | - | Unit: validation |
| AC-1.2.3-5 | Workflows | useAuth | signIn | E2E: login scenarios |
| AC-1.2.6 | NFR Security | middleware | getSession | E2E: session persist |
| AC-1.2.8 | NFR Security | middleware | - | Manual: cookie check |
| AC-1.3.1-4 | Data Models | ProfilePage | profiles API | E2E: profile edit |
| AC-1.3.5-7 | Services | ProfileForm | storage API | E2E: avatar upload |
| AC-1.3.8 | Data Models (RLS) | - | profiles API | Integration: RLS test |

---

## Risks, Assumptions, Open Questions

### Risks

| # | Risco | Probabilidade | Impacto | Mitigação |
|---|-------|---------------|---------|-----------|
| R1 | Email delivery delay | Média | Médio | Instruir usuário a verificar spam |
| R2 | Rate limiting agressivo | Baixa | Alto | Implementar retry com backoff |
| R3 | Token expiry durante uso | Média | Baixo | Auto-refresh via onAuthStateChange |

### Assumptions

| # | Assunção |
|---|----------|
| A1 | Supabase Auth está configurado e funcionando |
| A2 | Email templates personalizados já configurados |
| A3 | Bucket "avatars" já criado no Storage |
| A4 | Database migrations já aplicadas |

### Open Questions

| # | Questão | Owner | Status |
|---|---------|-------|--------|
| Q1 | Qual limite de tamanho para avatar? | PM | **Decidido: 2MB** |
| Q2 | Precisamos de captcha no registro? | Arch | **Diferido: MVP sem captcha** |
| Q3 | Logout deve limpar todos os devices? | PM | **Decidido: Apenas sessão atual** |

---

## Test Strategy Summary

### Níveis de Teste

| Nível | Cobertura | Framework |
|-------|-----------|-----------|
| Unit | Validação Zod, hooks | Vitest |
| Integration | RLS policies, triggers | Vitest + Supabase local |
| E2E | Fluxos completos | Playwright |

### Testes Prioritários

1. **E2E:** Registro completo → verificação → login → dashboard
2. **E2E:** Login com credenciais inválidas
3. **Unit:** Todas as validações do registerSchema
4. **Integration:** RLS impede acesso a perfil de outro usuário
5. **E2E:** Upload de avatar e visualização

### Comandos

```bash
# Unit + Integration
pnpm test

# E2E
pnpm test:e2e

# Coverage
pnpm test:coverage
```

---

**Status:** ✅ Tech Spec Completo  
**Próximo Passo:** Executar `create-story` para US-1.1


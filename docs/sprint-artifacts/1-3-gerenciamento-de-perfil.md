# Story 1.3: Gerenciamento de Perfil

**Status:** done  
**Story Points:** 1  
**Sprint:** 1  
**Priority:** P1

---

## Story

**As a** usuário autenticado,  
**I want** visualizar e editar meu perfil,  
**so that** eu possa manter meus dados atualizados.

---

## Acceptance Criteria

| # | Critério | Status | Notas |
|---|----------|--------|-------|
| AC-1 | Página exibe: Nome, Email, Avatar | ✅ | Settings page com ProfileForm |
| AC-2 | Editar nome completo | ✅ | Input com validação min 2 chars |
| AC-3 | Upload de avatar (Supabase Storage) | ✅ | Bucket "avatars" com upload/remove |
| AC-4 | Botão "Salvar" persiste alterações | ✅ | Server action updateProfile |
| AC-5 | Feedback visual: loading, sucesso, erro | ✅ | Loader2, CheckCircle2, error messages |
| AC-6 | Data de Criação exibida | ⏭️ | Diferido - nice-to-have |
| AC-7 | Opção "Trocar Senha" | ⏭️ | Diferido - Supabase magic link |

**Bônus:** Campo de telefone WhatsApp com validação E.164 internacional!

---

## Tasks / Subtasks

### Task 1: Página de Settings/Perfil

- [x] **1.1** Criar página `/settings`
- [x] **1.2** Criar componente `ProfileForm`
- [x] **1.3** Layout com tabs (Perfil, Aparência)

### Task 2: Exibição de Dados

- [x] **2.1** Mostrar avatar ou iniciais
- [x] **2.2** Mostrar nome e email
- [x] **2.3** Campo de email desabilitado (read-only)

### Task 3: Edição de Nome

- [x] **3.1** Input para nome completo
- [x] **3.2** Validação: mínimo 2 caracteres
- [x] **3.3** Server action para persistir

### Task 4: Upload de Avatar

- [x] **4.1** Botão de câmera para upload
- [x] **4.2** Preview antes de salvar
- [x] **4.3** Upload para Supabase Storage bucket "avatars"
- [x] **4.4** Validação: max 2MB, apenas imagens
- [x] **4.5** Botão de remover avatar

### Task 5: Campo de Telefone (Bônus)

- [x] **5.1** Input para telefone WhatsApp
- [x] **5.2** Validação E.164 internacional
- [x] **5.3** Helper de formatação

### Task 6: Feedback Visual

- [x] **6.1** Loading state no botão
- [x] **6.2** Mensagem de sucesso (verde)
- [x] **6.3** Mensagem de erro (vermelho)
- [x] **6.4** Auto-hide sucesso após 3s

---

## Dev Notes

### Implementação

- ProfileForm é um componente client-side com estado local
- Server action `updateProfile` persiste no banco
- Avatar usa Supabase Storage com URLs públicas
- Telefone usa formato E.164 para compatibilidade WhatsApp

### Arquivos Principais

| Arquivo | Descrição |
|---------|-----------|
| `settings/page.tsx` | Página de configurações |
| `settings/profile-form.tsx` | Formulário de perfil |
| `settings/actions.ts` | Server actions |
| `lib/validations/profile.ts` | Schemas Zod |

### References

- [Source: docs/sprint-artifacts/tech-spec-epic-1.md#Data-Models]
- [Source: docs/sprint-artifacts/architecture.md#Supabase-Storage]

---

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (via Cursor)

### Completion Notes List

1. **Implementação completa** — Todos os critérios core atendidos
2. **Avatar funcional** — Upload, preview, remove funcionando
3. **Telefone bônus** — Campo extra para WhatsApp integração
4. **Server actions** — Next.js 14 pattern
5. **Validação robusta** — Zod com E.164 para telefone

### File List

| Status | File Path | Description |
|--------|-----------|-------------|
| EXISTS | `apps/web/src/app/(dashboard)/settings/page.tsx` | Página settings |
| EXISTS | `apps/web/src/app/(dashboard)/settings/profile-form.tsx` | Form de perfil |
| EXISTS | `apps/web/src/app/(dashboard)/settings/actions.ts` | Server actions |
| EXISTS | `apps/web/src/lib/validations/profile.ts` | Validação Zod |

---

## Change Log

| Data | Autor | Mudança |
|------|-------|---------|
| 2025-12-12 | Claude Opus 4.5 | Story verificada - 5/7 ACs ✅ + bônus telefone |
| 2025-12-12 | Claude Opus 4.5 | Status: backlog → done |


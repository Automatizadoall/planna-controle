# Epics and User Stories
## Personal Finance Control App

**Versão:** 1.0  
**Data:** 2025-12-02  
**Product Manager:** BMAD PM Team  
**Status:** Ready for Sprint Planning  
**Projeto:** Mentoria — Controle Financeiro Pessoal  

---

## 📑 Índice

1. [Visão Geral](#1-visão-geral)
2. [Epic 1: Autenticação e Perfil](#epic-1-autenticação-e-perfil)
3. [Epic 2: Contas e Saldo](#epic-2-contas-e-saldo)
4. [Epic 3: Transações Manuais](#epic-3-transações-manuais)
5. [Epic 4: Categorização Automática](#epic-4-categorização-automática)
6. [Epic 5: Importação de CSV](#epic-5-importação-de-csv)
7. [Epic 6: Orçamentos](#epic-6-orçamentos)
8. [Epic 7: Metas de Poupança](#epic-7-metas-de-poupança)
9. [Epic 8: Dashboard e Visualizações](#epic-8-dashboard-e-visualizações)
10. [Epic 9: Transações Recorrentes](#epic-9-transações-recorrentes)
11. [Epic 10: Notificações e Alertas](#epic-10-notificações-e-alertas)
12. [Epic 11: Relatórios e Exportação](#epic-11-relatórios-e-exportação)
13. [Backlog Priorizado](#backlog-priorizado)

---

## 1. Visão Geral

### 1.1 Resumo de Épicos

| Epic | Título | Stories | Story Points | Prioridade | Sprint |
|------|--------|---------|--------------|------------|--------|
| 1 | Autenticação e Perfil | 3 | 5 | P0 | 1 |
| 2 | Contas e Saldo | 4 | 8 | P0 | 1-2 |
| 3 | Transações Manuais | 5 | 13 | P0 | 2-3 |
| 4 | Categorização Automática | 4 | 8 | P1 | 3-4 |
| 5 | Importação de CSV | 4 | 13 | P1 | 4-5 |
| 6 | Orçamentos | 5 | 13 | P0 | 5-6 |
| 7 | Metas de Poupança | 4 | 10 | P1 | 6-7 |
| 8 | Dashboard e Visualizações | 6 | 13 | P0 | 7-8 |
| 9 | Transações Recorrentes | 4 | 8 | P1 | 8-9 |
| 10 | Notificações e Alertas | 5 | 14 | P1-P2 | 9-10 |
| 11 | Relatórios e Exportação | 3 | 5 | P2 | 10-11 |

**Total MVP:** 47 histórias, 110 story points (~11 sprints de 2 semanas)

### 1.2 Convenções

**Story Points (Fibonacci):**
- 1: Trivial (< 4 horas)
- 2: Simples (4-8 horas)
- 3: Médio (1-2 dias)
- 5: Complexo (3-5 dias)
- 8: Muito complexo (1 semana)
- 13: Épico (precisa ser quebrado)

**Prioridades:**
- **P0:** Crítico - MVP blocker
- **P1:** Alta - MVP importante
- **P2:** Média - Nice to have MVP
- **P3:** Baixa - Pós-MVP

**Formato de História:**
```
Como [persona],
Quero [objetivo],
Para que [valor/benefício].
```

---

## Epic 1: Autenticação e Perfil

**Descrição:** Sistema completo de autenticação, registro, e gerenciamento de perfil de usuário.  
**Valor de Negócio:** Fundação de segurança e identidade para todo o sistema.  
**Dependências:** Nenhuma  
**Total:** 5 story points

---

### 🎫 US-1.1: Registro de Novo Usuário

**Prioridade:** P0  
**Story Points:** 2  
**Sprint:** 1

**História:**
> Como um novo usuário,  
> Quero criar uma conta com email e senha,  
> Para que eu possa começar a usar o aplicativo de finanças.

**Critérios de Aceitação:**
- [ ] Formulário de registro exibe campos: Email, Senha, Confirmar Senha, Nome Completo
- [ ] Validação client-side:
  - Email válido (formato)
  - Senha mínimo 8 caracteres, 1 maiúscula, 1 número, 1 símbolo
  - Senhas coincidem
- [ ] Integração com Supabase Auth (`signUp()`)
- [ ] Email de verificação enviado automaticamente
- [ ] Mensagem de sucesso: "Conta criada! Verifique seu email."
- [ ] Redirect para tela de onboarding após verificação
- [ ] Tratamento de erros:
  - Email já cadastrado
  - Senha fraca
  - Erro de rede

**Tarefas Técnicas:**
- [ ] Criar schema Zod para validação
- [ ] Implementar componente `RegisterForm`
- [ ] Integrar Supabase Auth
- [ ] Criar tabela `profiles` com trigger
- [ ] Testes unitários (validação)
- [ ] Testes E2E (fluxo completo)

**Testes de Aceitação:**
1. Registrar com email válido → Sucesso, email enviado
2. Registrar com email já existente → Erro "Email já cadastrado"
3. Registrar com senha fraca → Erro de validação
4. Verificar email → Redirect para onboarding

---

### 🎫 US-1.2: Login de Usuário

**Prioridade:** P0  
**Story Points:** 2  
**Sprint:** 1

**História:**
> Como um usuário existente,  
> Quero fazer login com email e senha,  
> Para que eu possa acessar meus dados financeiros.

**Critérios de Aceitação:**
- [ ] Formulário de login com Email e Senha
- [ ] Validação de campos obrigatórios
- [ ] Integração com Supabase Auth (`signInWithPassword()`)
- [ ] JWT token armazenado (cookies no web, AsyncStorage no mobile)
- [ ] Redirect para dashboard após login bem-sucedido
- [ ] Opção "Lembrar-me" (sessão persistente)
- [ ] Link para "Esqueci minha senha"
- [ ] Tratamento de erros:
  - Credenciais inválidas
  - Email não verificado
  - Conta bloqueada

**Tarefas Técnicas:**
- [ ] Criar componente `LoginForm`
- [ ] Implementar context `AuthContext` para estado global
- [ ] Configurar middleware de autenticação (Next.js)
- [ ] Testes E2E (login flow)

**Testes de Aceitação:**
1. Login com credenciais válidas → Redirect para dashboard
2. Login com senha incorreta → Erro "Credenciais inválidas"
3. Login sem verificar email → Erro "Verifique seu email"

---

### 🎫 US-1.3: Gerenciamento de Perfil

**Prioridade:** P1  
**Story Points:** 1  
**Sprint:** 1

**História:**
> Como usuário autenticado,  
> Quero visualizar e editar meu perfil,  
> Para que eu possa manter meus dados atualizados.

**Critérios de Aceitação:**
- [ ] Página de perfil exibe: Nome, Email, Avatar, Data de Criação
- [ ] Editar nome completo
- [ ] Upload de avatar (Supabase Storage)
- [ ] Botão "Salvar" persiste alterações
- [ ] Feedback visual: loading, sucesso, erro
- [ ] Opção "Trocar Senha" (redirect para fluxo de reset)

**Tarefas Técnicas:**
- [ ] Criar página `/profile`
- [ ] Implementar upload de imagem
- [ ] RLS policy para `profiles` table
- [ ] Testes E2E

**Testes de Aceitação:**
1. Editar nome → Nome atualizado no banco
2. Upload de avatar → Imagem salva e exibida
3. Perfil não pode ser editado por outro usuário (RLS)

---

## Epic 2: Contas e Saldo

**Descrição:** Gerenciamento de contas financeiras (corrente, poupança, crédito, etc) e visualização de saldos.  
**Valor de Negócio:** Base para rastreamento de patrimônio líquido.  
**Dependências:** Epic 1 (Auth)  
**Total:** 8 story points

---

### 🎫 US-2.1: Criar Conta Financeira

**Prioridade:** P0  
**Story Points:** 2  
**Sprint:** 1

**História:**
> Como usuário autenticado,  
> Quero criar contas financeiras (corrente, poupança, crédito),  
> Para que eu possa organizar meu patrimônio.

**Critérios de Aceitação:**
- [ ] Modal/form "Nova Conta" com campos:
  - Nome da conta (ex: "Nubank", "Itaú Corrente")
  - Tipo (dropdown: Corrente, Poupança, Crédito, Investimento, Dinheiro)
  - Saldo inicial (opcional, default 0)
  - Moeda (default BRL)
- [ ] Validação: Nome obrigatório, Saldo não negativo
- [ ] Salvar no banco (tabela `accounts`)
- [ ] RLS policy: usuário só cria contas próprias
- [ ] Conta aparece na lista imediatamente (optimistic update)
- [ ] Toast de sucesso: "Conta criada com sucesso!"

**Tarefas Técnicas:**
- [ ] Migration: `CREATE TABLE accounts`
- [ ] RLS policies para `accounts`
- [ ] Componente `CreateAccountModal`
- [ ] Hook `useCreateAccount` (React Query)
- [ ] Validação Zod

**Testes de Aceitação:**
1. Criar conta "Nubank Corrente", saldo R$ 1000 → Conta salva e visível
2. Criar conta sem nome → Erro de validação
3. Criar conta com saldo negativo → Erro de validação

---

### 🎫 US-2.2: Listar Contas do Usuário

**Prioridade:** P0  
**Story Points:** 2  
**Sprint:** 1

**História:**
> Como usuário autenticado,  
> Quero visualizar todas as minhas contas,  
> Para que eu possa acompanhar meus saldos.

**Critérios de Aceitação:**
- [ ] Página `/accounts` lista todas as contas ativas
- [ ] Card de conta exibe: Nome, Tipo (ícone), Saldo, Data de criação
- [ ] Saldo formatado: "R$ 1.234,56"
- [ ] Saldo total (soma de todas as contas) exibido no topo
- [ ] Ordenação: contas mais recentes primeiro
- [ ] Skeleton loading enquanto carrega
- [ ] Empty state: "Nenhuma conta cadastrada. Crie sua primeira conta!"

**Tarefas Técnicas:**
- [ ] Query `SELECT * FROM accounts WHERE user_id = ? AND NOT is_archived`
- [ ] Componente `AccountCard`
- [ ] Hook `useAccounts` (React Query)

**Testes de Aceitação:**
1. Usuário com 3 contas → 3 cards exibidos + total correto
2. Usuário sem contas → Empty state
3. Adicionar nova conta → Lista atualizada em tempo real (Realtime)

---

### 🎫 US-2.3: Editar Conta

**Prioridade:** P1  
**Story Points:** 2  
**Sprint:** 2

**História:**
> Como usuário autenticado,  
> Quero editar nome e tipo de uma conta,  
> Para que eu possa corrigir informações.

**Critérios de Aceitação:**
- [ ] Botão "Editar" no card da conta
- [ ] Modal com campos pré-preenchidos (nome, tipo)
- [ ] Saldo não é editável (apenas via transações)
- [ ] Salvar alterações
- [ ] Validação de campos
- [ ] Toast: "Conta atualizada!"

**Tarefas Técnicas:**
- [ ] Componente `EditAccountModal`
- [ ] Hook `useUpdateAccount`
- [ ] RLS policy para UPDATE

**Testes de Aceitação:**
1. Editar nome de "Nubank" para "Nubank Principal" → Nome atualizado
2. Tentar editar conta de outro usuário → Erro 403 (RLS)

---

### 🎫 US-2.4: Arquivar Conta

**Prioridade:** P1  
**Story Points:** 2  
**Sprint:** 2

**História:**
> Como usuário autenticado,  
> Quero arquivar contas não utilizadas,  
> Para que eu possa manter minha lista organizada sem perder dados históricos.

**Critérios de Aceitação:**
- [ ] Botão "Arquivar" no modal de edição
- [ ] Confirmação: "Tem certeza? A conta não será deletada, apenas arquivada."
- [ ] Conta arquivada (`is_archived = true`) desaparece da lista principal
- [ ] Link "Ver contas arquivadas" exibe contas inativas
- [ ] Opção de "Desarquivar"
- [ ] Transações antigas permanecem visíveis

**Tarefas Técnicas:**
- [ ] Soft delete: `UPDATE accounts SET is_archived = true`
- [ ] Filtro em queries: `WHERE NOT is_archived`
- [ ] Componente `ArchivedAccountsList`

**Testes de Aceitação:**
1. Arquivar conta → Desaparece da lista principal
2. Ver arquivadas → Conta aparece
3. Desarquivar → Conta volta para lista principal

---

## Epic 3: Transações Manuais

**Descrição:** CRUD completo de transações (receitas, despesas, transferências) com validação e atualização de saldos.  
**Valor de Negócio:** Core do aplicativo - rastreamento de movimentações financeiras.  
**Dependências:** Epic 2 (Contas)  
**Total:** 13 story points

---

### 🎫 US-3.1: Adicionar Despesa Manual

**Prioridade:** P0  
**Story Points:** 3  
**Sprint:** 2

**História:**
> Como usuário autenticado,  
> Quero registrar despesas manualmente,  
> Para que eu possa rastrear meus gastos.

**Critérios de Aceitação:**
- [ ] Modal "Nova Transação" abre ao clicar no FAB (+)
- [ ] Tipo padrão: "Despesa"
- [ ] Campos obrigatórios:
  - Valor (input numérico, prefixo "R$")
  - Categoria (dropdown)
  - Conta (dropdown)
  - Data (date picker, default hoje)
- [ ] Campos opcionais:
  - Descrição (text input)
  - Tags (multi-select)
- [ ] Validações:
  - Valor > 0
  - Data não pode ser futura > 30 dias
- [ ] Salvar transação → Saldo da conta reduzido automaticamente (trigger)
- [ ] Optimistic update (transação aparece imediatamente)
- [ ] Toast: "Despesa de R$ X adicionada!"

**Tarefas Técnicas:**
- [ ] Migration: `CREATE TABLE transactions`
- [ ] Trigger: `update_account_balance()`
- [ ] Componente `TransactionModal`
- [ ] Hook `useCreateTransaction`
- [ ] Validação Zod

**Testes de Aceitação:**
1. Adicionar despesa R$ 100 → Saldo reduzido em R$ 100
2. Adicionar com data futura (>30 dias) → Erro de validação
3. Adicionar sem valor → Erro de validação

---

### 🎫 US-3.2: Adicionar Receita Manual

**Prioridade:** P0  
**Story Points:** 2  
**Sprint:** 2

**História:**
> Como usuário autenticado,  
> Quero registrar receitas manualmente,  
> Para que eu possa rastrear meus ganhos.

**Critérios de Aceitação:**
- [ ] Toggle "Receita/Despesa" no modal de transação
- [ ] Campos iguais a despesa
- [ ] Valor adicionado ao saldo da conta
- [ ] Cor verde para valores de receita
- [ ] Toast: "Receita de R$ X adicionada!"

**Tarefas Técnicas:**
- [ ] Adicionar lógica de tipo no `TransactionModal`
- [ ] Trigger já suporta receitas (IF type = 'income')

**Testes de Aceitação:**
1. Adicionar receita R$ 5000 (Salário) → Saldo aumentado
2. Verificar cor verde no histórico

---

### 🎫 US-3.3: Transferência Entre Contas

**Prioridade:** P1  
**Story Points:** 3  
**Sprint:** 3

**História:**
> Como usuário autenticado,  
> Quero transferir valores entre minhas contas,  
> Para que eu possa refletir movimentações internas sem afetar orçamentos.

**Critérios de Aceitação:**
- [ ] Tipo "Transferência" no modal
- [ ] Campos específicos:
  - Conta Origem (dropdown)
  - Conta Destino (dropdown, não pode ser igual à origem)
  - Valor
  - Data
- [ ] Saldo da conta origem reduzido
- [ ] Saldo da conta destino aumentado
- [ ] Transferência NÃO conta como receita/despesa (não afeta orçamentos)
- [ ] Toast: "Transferência de R$ X realizada!"

**Tarefas Técnicas:**
- [ ] Adicionar campo `to_account_id` na tabela `transactions`
- [ ] Constraint: `CHECK (type = 'transfer' => to_account_id IS NOT NULL)`
- [ ] Atualizar trigger para lidar com transferências
- [ ] Excluir transferências de cálculos de orçamento

**Testes de Aceitação:**
1. Transferir R$ 500 de Conta A para Conta B → Saldos ajustados
2. Transferência não aparece em cálculos de orçamento
3. Tentar transferir para mesma conta → Erro de validação

---

### 🎫 US-3.4: Visualizar Histórico de Transações

**Prioridade:** P0  
**Story Points:** 3  
**Sprint:** 3

**História:**
> Como usuário autenticado,  
> Quero visualizar histórico de transações,  
> Para que eu possa revisar meus gastos e receitas.

**Critérios de Aceitação:**
- [ ] Página `/transactions` lista transações ordenadas por data (desc)
- [ ] Agrupamento por data (Hoje, Ontem, datas anteriores)
- [ ] Card de transação exibe:
  - Ícone da categoria
  - Descrição
  - Categoria e conta (pequeno, cinza)
  - Valor (verde se receita, vermelho se despesa, azul se transferência)
  - Data e hora
- [ ] Infinite scroll ou paginação (20 por página)
- [ ] Skeleton loading
- [ ] Empty state: "Nenhuma transação. Adicione sua primeira!"

**Tarefas Técnicas:**
- [ ] Query com paginação: `LIMIT 20 OFFSET ?`
- [ ] Componente `TransactionCard`
- [ ] Hook `useTransactions` (React Query infinite)
- [ ] Agrupamento por data (client-side)

**Testes de Aceitação:**
1. Usuário com 50 transações → Carrega 20, scroll carrega mais
2. Usuário sem transações → Empty state
3. Adicionar nova transação → Aparece no topo imediatamente (Realtime)

---

### 🎫 US-3.5: Editar e Deletar Transação

**Prioridade:** P1  
**Story Points:** 2  
**Sprint:** 3

**História:**
> Como usuário autenticado,  
> Quero editar ou deletar transações,  
> Para que eu possa corrigir erros.

**Critérios de Aceitação:**
- [ ] Clicar em card de transação abre modal de edição
- [ ] Campos pré-preenchidos
- [ ] Editar valor → Saldo da conta ajustado (rollback + nova transação via trigger)
- [ ] Botão "Deletar" com confirmação
- [ ] Deletar → Saldo restaurado (trigger)
- [ ] Toast: "Transação atualizada/deletada"

**Tarefas Técnicas:**
- [ ] Trigger para DELETE: reverter ajuste de saldo
- [ ] Trigger para UPDATE: recalcular diferença
- [ ] Hook `useUpdateTransaction`, `useDeleteTransaction`

**Testes de Aceitação:**
1. Editar valor de R$ 100 para R$ 150 → Saldo ajustado (-R$ 50)
2. Deletar transação R$ 100 → Saldo aumenta R$ 100
3. Tentar editar transação de outro usuário → Erro 403 (RLS)

---

## Epic 4: Categorização Automática

**Descrição:** Sistema híbrido de categorização (regras + ML) para automatizar classificação de transações.  
**Valor de Negócio:** Reduzir trabalho manual, melhorar precisão.  
**Dependências:** Epic 3 (Transações)  
**Total:** 8 story points

---

### 🎫 US-4.1: Categorização Baseada em Regras (MVP)

**Prioridade:** P1  
**Story Points:** 3  
**Sprint:** 3

**História:**
> Como usuário autenticado,  
> Quero que transações sejam categorizadas automaticamente com base em palavras-chave,  
> Para que eu economize tempo.

**Critérios de Aceitação:**
- [ ] Ao adicionar transação, sistema sugere categoria baseado em:
  - Descrição contém palavra-chave (ex: "uber" → Transporte)
  - Regras do sistema (padrão) ou do usuário (customizadas)
- [ ] Sugestão exibida no modal com badge: "Sugerido: Transporte"
- [ ] Usuário pode aceitar ou trocar manualmente
- [ ] Confiança exibida: Alta (>80%), Média (50-80%), Baixa (<50%)
- [ ] Campo `auto_categorized` = true, `confidence` armazenado

**Tarefas Técnicas:**
- [ ] Migration: adicionar campos `auto_categorized`, `confidence`
- [ ] Tabela `categorization_rules` (padrão do sistema + usuário)
- [ ] Edge Function `auto-categorize`
- [ ] Seed de regras padrão (20-30 regras)

**Testes de Aceitação:**
1. Adicionar "UBER*TRIP" → Sugerido "Transporte" (confiança alta)
2. Adicionar "Supermercado XYZ" → Sugerido "Alimentação"
3. Adicionar "ABC123" (sem match) → Sem sugestão

---

### 🎫 US-4.2: Correção de Categorização (Aprendizado)

**Prioridade:** P1  
**Story Points:** 2  
**Sprint:** 4

**História:**
> Como usuário autenticado,  
> Quero que o sistema aprenda com minhas correções,  
> Para que futuras categorizações sejam mais precisas.

**Critérios de Aceitação:**
- [ ] Quando usuário corrige categoria manualmente, sistema pergunta:
  - "Sempre categorizar [descrição/padrão] como [categoria]?"
  - [Sim, criar regra] [Não, apenas desta vez]
- [ ] Se "Sim": criar regra personalizada na tabela `categorization_rules`
- [ ] Regras do usuário têm prioridade sobre regras padrão
- [ ] Próximas transações com mesmo padrão usam nova regra

**Tarefas Técnicas:**
- [ ] Componente `CategoryCorrectionDialog`
- [ ] Criar regra: `INSERT INTO categorization_rules`
- [ ] Ordenar regras por prioridade (user > system)

**Testes de Aceitação:**
1. Corrigir "Netflix" de Outros para Lazer + criar regra → Próximas "Netflix" sugeridas como Lazer
2. Regra personalizada sobrescreve regra padrão

---

### 🎫 US-4.3: Gerenciamento de Regras de Categorização

**Prioridade:** P2  
**Story Points:** 2  
**Sprint:** 4

**História:**
> Como usuário autenticado,  
> Quero visualizar e editar minhas regras de categorização,  
> Para que eu possa ajustar o comportamento do sistema.

**Critérios de Aceitação:**
- [ ] Página `/settings/categorization-rules`
- [ ] Lista de regras do usuário com:
  - Padrão (ex: "uber")
  - Categoria mapeada
  - Número de transações afetadas
  - Botão Editar/Deletar
- [ ] Criar regra manualmente (sem esperar correção)
- [ ] Aplicar regra retroativamente (opcional): recategorizar transações antigas

**Tarefas Técnicas:**
- [ ] Query: `SELECT * FROM categorization_rules WHERE user_id = ?`
- [ ] Componente `CategoryRulesList`
- [ ] Função `applyRuleRetroactively()` (batch update)

**Testes de Aceitação:**
1. Criar regra "farmácia → Saúde" → Aplicar retroativamente → 10 transações recategorizadas
2. Deletar regra → Próximas transações não usam mais a regra

---

### 🎫 US-4.4: Sugestão de Categorias (ML - Pós-MVP)

**Prioridade:** P3  
**Story Points:** 1 (spike/placeholder)  
**Sprint:** Pós-MVP

**História:**
> Como usuário autenticado,  
> Quero categorização ainda mais precisa usando machine learning,  
> Para que o sistema entenda contexto além de palavras-chave.

**Critérios de Aceitação (futuro):**
- [ ] Modelo TF-IDF + Logistic Regression treinado com dados do usuário
- [ ] Fallback para ML quando regras não encontram match
- [ ] Confiança do modelo exibida
- [ ] Retreinar modelo mensalmente

**Tarefas Técnicas (futuro):**
- [ ] Treinar modelo inicial (Python/Scikit-learn)
- [ ] Edge Function para inferência (Deno + TensorFlow.js ou API externa)
- [ ] Pipeline de retreinamento

---

## Epic 5: Importação de CSV

**Descrição:** Upload, parse, validação e importação em lote de transações via arquivo CSV.  
**Valor de Negócio:** Onboarding rápido, migração de outros sistemas.  
**Dependências:** Epic 3 (Transações), Epic 4 (Categorização)  
**Total:** 13 story points

---

### 🎫 US-5.1: Upload de Arquivo CSV

**Prioridade:** P1  
**Story Points:** 3  
**Sprint:** 4

**História:**
> Como usuário autenticado,  
> Quero fazer upload de arquivo CSV com transações,  
> Para que eu possa importar dados em lote.

**Critérios de Aceitação:**
- [ ] Botão "Importar CSV" na página de transações
- [ ] Modal com drag-and-drop ou file picker
- [ ] Aceita apenas arquivos .csv (max 5 MB)
- [ ] Upload para Supabase Storage (`/uploads/{userId}/{filename}`)
- [ ] Progress bar durante upload
- [ ] Após upload, ir para tela de mapeamento

**Tarefas Técnicas:**
- [ ] Supabase Storage bucket: `csv-uploads`
- [ ] RLS policy: usuário só acessa próprios arquivos
- [ ] Componente `CsvUploadModal`
- [ ] Hook `useUploadCsv`

**Testes de Aceitação:**
1. Upload CSV 2 MB → Sucesso, file URL retornado
2. Upload arquivo 6 MB → Erro "Tamanho máximo 5 MB"
3. Upload .xlsx → Erro "Formato inválido"

---

### 🎫 US-5.2: Mapeamento de Colunas

**Prioridade:** P1  
**Story Points:** 5  
**Sprint:** 4-5

**História:**
> Como usuário autenticado,  
> Quero mapear colunas do CSV para campos de transação,  
> Para que o sistema entenda meu formato de arquivo.

**Critérios de Aceitação:**
- [ ] Tela de mapeamento exibe:
  - Preview das primeiras 5 linhas do CSV
  - Dropdowns para mapear colunas:
    - Data (obrigatório)
    - Descrição (obrigatório)
    - Valor (obrigatório)
    - Tipo (opcional, default "expense")
    - Categoria (opcional)
- [ ] Auto-detecção inteligente:
  - Coluna com nome "data/date" → Data
  - Coluna com valores numéricos → Valor
- [ ] Validação: colunas obrigatórias mapeadas
- [ ] Botão "Avançar" vai para tela de preview

**Tarefas Técnicas:**
- [ ] Edge Function `parse-csv`: parse CSV com Papa Parse
- [ ] Retornar colunas + preview de dados
- [ ] Componente `CsvMappingStep`
- [ ] Lógica de auto-detecção (heurísticas)

**Testes de Aceitação:**
1. CSV com colunas "Data, Descrição, Valor" → Auto-detectado corretamente
2. CSV com colunas customizadas → Mapear manualmente
3. Não mapear campo obrigatório → Erro de validação

---

### 🎫 US-5.3: Preview e Detecção de Duplicatas

**Prioridade:** P1  
**Story Points:** 3  
**Sprint:** 5

**História:**
> Como usuário autenticado,  
> Quero visualizar preview de transações antes de importar,  
> Para que eu possa revisar e detectar duplicatas.

**Critérios de Aceitação:**
- [ ] Tela de preview exibe:
  - Transações parseadas (primeiras 20)
  - Categoria sugerida (auto-categorização)
  - Badge "Duplicata" para transações já existentes
- [ ] Detecção de duplicata: mesma conta, data, descrição, valor
- [ ] Opções:
  - [Ignorar todas as duplicatas]
  - [Importar mesmo assim]
  - [Revisar uma a uma]
- [ ] Contador: "100 novas, 5 duplicatas"
- [ ] Botão "Confirmar Importação"

**Tarefas Técnicas:**
- [ ] Edge Function `detect-duplicates`:
  - Query: `SELECT * FROM transactions WHERE user_id = ? AND date = ? AND description ILIKE ? AND amount = ?`
  - Retornar IDs de duplicatas
- [ ] Componente `CsvPreviewStep`

**Testes de Aceitação:**
1. CSV com 10 transações, 2 duplicadas → Preview mostra 8 novas + 2 duplicatas
2. Ignorar duplicatas → Apenas 8 importadas
3. Importar mesmo assim → 10 importadas (duplicatas criadas)

---

### 🎫 US-5.4: Processamento e Importação Assíncrona

**Prioridade:** P1  
**Story Points:** 2  
**Sprint:** 5

**História:**
> Como usuário autenticado,  
> Quero que importações grandes sejam processadas em background,  
> Para que eu não precise esperar com a tela aberta.

**Critérios de Aceitação:**
- [ ] Importação > 100 transações: processamento assíncrono
- [ ] Progress modal com:
  - Barra de progresso (% concluído)
  - "Processando... 250/1000 transações"
  - Opção de fechar modal (continua em background)
- [ ] Notificação quando concluído:
  - "Importação completa! 950 transações adicionadas, 50 duplicatas ignoradas."
- [ ] Atualização da lista de transações em tempo real (Realtime)
- [ ] Logs de erro: transações que falharam (formato inválido, etc)

**Tarefas Técnicas:**
- [ ] Edge Function `import-csv` (longa duração):
  - Batch insert (100 por vez)
  - Atualizar progresso via database trigger
  - Realtime subscription para progress
- [ ] Componente `CsvImportProgress`

**Testes de Aceitação:**
1. Importar 1000 transações → Processamento em < 10 segundos
2. Fechar modal durante importação → Notificação ao concluir
3. 10 transações com erro (data inválida) → Log de erros exibido

---

## Epic 6: Orçamentos

**Descrição:** Sistema de orçamentos mensais por categoria com alertas e tracking de progresso.  
**Valor de Negócio:** Controle de gastos, prevenção de overspending.  
**Dependências:** Epic 3 (Transações), Epic 4 (Categorização)  
**Total:** 13 story points

---

### 🎫 US-6.1: Criar Orçamento

**Prioridade:** P0  
**Story Points:** 3  
**Sprint:** 5

**História:**
> Como usuário autenticado,  
> Quero criar orçamentos mensais por categoria,  
> Para que eu possa controlar meus gastos.

**Critérios de Aceitação:**
- [ ] Modal "Novo Orçamento" com campos:
  - Categoria (dropdown)
  - Limite (valor, ex: R$ 500)
  - Período (dropdown: Semanal, Mensal, Anual)
  - Tipo de Alerta (radio: Soft, Hard)
    - Soft: apenas avisa ao atingir limite
    - Hard: bloqueia novas despesas acima do limite
- [ ] Validação: Categoria única por período (não pode ter 2 orçamentos mensais de Alimentação)
- [ ] Salvar orçamento
- [ ] Toast: "Orçamento de [Categoria] criado!"

**Tarefas Técnicas:**
- [ ] Migration: `CREATE TABLE budgets`
- [ ] Constraint: `UNIQUE (user_id, category_id, period)`
- [ ] Componente `CreateBudgetModal`
- [ ] Hook `useCreateBudget`

**Testes de Aceitação:**
1. Criar orçamento "Alimentação, R$ 500/mês" → Salvo com sucesso
2. Criar segundo orçamento para mesma categoria → Erro "Orçamento já existe"
3. Criar com limite negativo → Erro de validação

---

### 🎫 US-6.2: Visualizar Status de Orçamentos

**Prioridade:** P0  
**Story Points:** 3  
**Sprint:** 6

**História:**
> Como usuário autenticado,  
> Quero visualizar progresso dos meus orçamentos,  
> Para que eu saiba quanto já gastei.

**Critérios de Aceitação:**
- [ ] Página `/budgets` lista orçamentos ativos
- [ ] Card de orçamento exibe:
  - Ícone e nome da categoria
  - Progress bar (% gasto)
  - "R$ X gastado de R$ Y"
  - Badge de status:
    - Verde: "No caminho certo" (< 75%)
    - Âmbar: "Próximo do limite" (75-100%)
    - Vermelho: "Limite ultrapassado!" (> 100%)
  - Período (Este mês, Esta semana)
- [ ] Ordenação: orçamentos mais críticos (%) primeiro
- [ ] Gasto calculado dinamicamente via view `budget_status`

**Tarefas Técnicas:**
- [ ] View materializada `budget_status`:
  ```sql
  CREATE VIEW budget_status AS
  SELECT b.*, COALESCE(SUM(t.amount), 0) AS spent
  FROM budgets b
  LEFT JOIN transactions t ON t.category_id = b.category_id AND t.type = 'expense'
  WHERE DATE_TRUNC('month', t.date) = DATE_TRUNC('month', NOW())
  GROUP BY b.id;
  ```
- [ ] Componente `BudgetCard`
- [ ] Hook `useBudgets`

**Testes de Aceitação:**
1. Orçamento R$ 500, gasto R$ 400 → Progress 80%, badge âmbar
2. Orçamento R$ 500, gasto R$ 550 → Progress 110%, badge vermelho
3. Adicionar despesa → Progress atualizado em tempo real (Realtime)

---

### 🎫 US-6.3: Alertas de Orçamento

**Prioridade:** P1  
**Story Points:** 3  
**Sprint:** 6

**História:**
> Como usuário autenticado,  
> Quero receber alertas quando atingir limites de orçamento,  
> Para que eu possa ajustar meus gastos.

**Critérios de Aceitação:**
- [ ] Alerta ao atingir 80% do limite:
  - Toast in-app: "Você gastou 80% do orçamento de Alimentação"
  - Email (se configurado)
- [ ] Alerta ao atingir 100%:
  - Toast: "Limite de Alimentação atingido! R$ 500 de R$ 500"
  - Push notification (mobile)
- [ ] Alerta ao ultrapassar (>100%):
  - Toast: "Você ultrapassou o orçamento de Alimentação em R$ 50"
- [ ] Hard limit: ao tentar adicionar despesa que ultrapassaria limite
  - Modal de bloqueio: "Orçamento de Alimentação não permite esta despesa. Ajuste o limite ou escolha outra categoria."
  - Opção: "Adicionar mesmo assim" (desabilita hard limit)

**Tarefas Técnicas:**
- [ ] Trigger `notify_budget_threshold`:
  - Após INSERT/UPDATE em `transactions`
  - Verificar budget status
  - Chamar Edge Function `send-notification`
- [ ] Edge Function `send-notification` (email + push)
- [ ] Componente `BudgetBlockModal` (hard limit)

**Testes de Aceitação:**
1. Gastar R$ 400 de orçamento R$ 500 → Toast "80% atingido"
2. Gastar mais R$ 100 → Toast "Limite atingido"
3. Hard limit: tentar gastar R$ 150 além do limite → Bloqueado

---

### 🎫 US-6.4: Editar e Deletar Orçamento

**Prioridade:** P1  
**Story Points:** 2  
**Sprint:** 6

**História:**
> Como usuário autenticado,  
> Quero editar limites de orçamento,  
> Para que eu possa ajustar conforme necessário.

**Critérios de Aceitação:**
- [ ] Clicar em card de orçamento abre modal de edição
- [ ] Editar limite (valor)
- [ ] Editar tipo de alerta (soft/hard)
- [ ] Deletar orçamento (com confirmação)
- [ ] Histórico de alterações (futuro): log de quando limite foi ajustado

**Tarefas Técnicas:**
- [ ] Hook `useUpdateBudget`, `useDeleteBudget`
- [ ] RLS policies para UPDATE/DELETE

**Testes de Aceitação:**
1. Editar limite de R$ 500 para R$ 600 → Limite atualizado
2. Deletar orçamento → Desaparece da lista, transações não afetadas

---

### 🎫 US-6.5: Orçamentos Recorrentes

**Prioridade:** P2  
**Story Points:** 2  
**Sprint:** Pós-MVP

**História:**
> Como usuário autenticado,  
> Quero que orçamentos se renovem automaticamente a cada período,  
> Para que eu não precise recriá-los manualmente.

**Critérios de Aceitação:**
- [ ] Flag `is_recurring` (default true)
- [ ] Orçamentos mensais renovam automaticamente no dia 1 do mês
- [ ] Cron job diário verifica orçamentos a renovar
- [ ] Histórico mensal preservado (relatórios)

**Tarefas Técnicas:**
- [ ] Campo `is_recurring` na tabela `budgets`
- [ ] Edge Function `renew-budgets` (cron diário)
- [ ] Tabela `budget_history` para arquivar períodos passados

---

## Epic 7: Metas de Poupança

**Descrição:** Sistema de metas financeiras com tracking de progresso e sugestões de alocação.  
**Valor de Negócio:** Motivação, gamificação, retenção.  
**Dependências:** Epic 2 (Contas)  
**Total:** 10 story points

---

### 🎫 US-7.1: Criar Meta de Poupança

**Prioridade:** P1  
**Story Points:** 3  
**Sprint:** 6

**História:**
> Como usuário autenticado,  
> Quero definir metas de poupança,  
> Para que eu possa me organizar para atingir objetivos financeiros.

**Critérios de Aceitação:**
- [ ] Modal "Nova Meta" com campos:
  - Nome (ex: "Viagem para Europa")
  - Valor alvo (ex: R$ 10.000)
  - Prazo (date picker, opcional)
  - Conta vinculada (opcional): onde alocar valores
- [ ] Cálculo automático: "Economize R$ X por mês para atingir a meta"
- [ ] Salvar meta (status: "active")
- [ ] Toast: "Meta criada com sucesso!"

**Tarefas Técnicas:**
- [ ] Migration: `CREATE TABLE goals`
- [ ] Componente `CreateGoalModal`
- [ ] Hook `useCreateGoal`
- [ ] Cálculo: `(target_amount - current_amount) / meses_restantes`

**Testes de Aceitação:**
1. Criar meta R$ 10.000 em 12 meses → Sugestão "R$ 833/mês"
2. Criar meta sem prazo → Sugestão não exibida
3. Criar meta com valor negativo → Erro de validação

---

### 🎫 US-7.2: Visualizar Progresso de Metas

**Prioridade:** P1  
**Story Points:** 3  
**Sprint:** 7

**História:**
> Como usuário autenticado,  
> Quero visualizar progresso das minhas metas,  
> Para que eu saiba se estou no caminho certo.

**Critérios de Aceitação:**
- [ ] Página `/goals` lista metas ativas
- [ ] Card de meta exibe:
  - Nome e ícone (emoji picker futuro)
  - Progress ring circular (% concluído)
  - "R$ X de R$ Y" (current / target)
  - Prazo: "10 meses restantes" ou "Sem prazo"
  - Sugestão: "Economize R$ X/mês"
  - Botão "Alocar Valor"
- [ ] Metas concluídas (100%) em seção separada
- [ ] Ordenação: mais próximas do prazo primeiro

**Tarefas Técnicas:**
- [ ] Componente `GoalCard` com progress ring (SVG/Canvas)
- [ ] Hook `useGoals`
- [ ] Query: `SELECT * FROM goals WHERE user_id = ? ORDER BY deadline ASC`

**Testes de Aceitação:**
1. Meta 25% concluída → Progress ring mostra 25%
2. Meta vencida (deadline passou, <100%) → Badge "Atrasada"
3. Meta 100% → Badge "Concluída", confetti animation

---

### 🎫 US-7.3: Alocar Valor para Meta

**Prioridade:** P1  
**Story Points:** 2  
**Sprint:** 7

**História:**
> Como usuário autenticado,  
> Quero alocar valores para minhas metas,  
> Para que eu possa acompanhar meu progresso.

**Critérios de Aceitação:**
- [ ] Botão "Alocar Valor" abre modal
- [ ] Input de valor: "Quanto deseja alocar?"
- [ ] Opção: criar transação automaticamente (transferência para conta vinculada)
- [ ] Atualizar `current_amount` da meta
- [ ] Progress ring atualizado
- [ ] Toast: "R$ X alocados para [Meta]"
- [ ] Ao atingir 100%: celebração (confetti + modal)

**Tarefas Técnicas:**
- [ ] Componente `AllocateToGoalModal`
- [ ] Hook `useAllocateToGoal`
- [ ] Atualizar: `UPDATE goals SET current_amount = current_amount + ?`
- [ ] Opcional: criar transação de transferência

**Testes de Aceitação:**
1. Alocar R$ 1000 para meta → `current_amount` aumentado, progress atualizado
2. Alocar valor que ultrapassa target → Aviso "Você ultrapassará a meta"
3. Atingir 100% → Confetti + modal "Parabéns!"

---

### 🎫 US-7.4: Notificações de Milestone

**Prioridade:** P2  
**Story Points:** 2  
**Sprint:** 7

**História:**
> Como usuário autenticado,  
> Quero receber notificações ao atingir marcos da meta,  
> Para que eu me sinta motivado.

**Critérios de Aceitação:**
- [ ] Milestones: 25%, 50%, 75%, 100%
- [ ] Ao atingir milestone:
  - Toast in-app: "🎉 Você atingiu 25% da meta [Nome]!"
  - Push notification (mobile)
  - Email (opcional)
- [ ] Milestone 100%:
  - Modal de celebração com confetti
  - "Parabéns! Você atingiu sua meta!"
  - Opção: criar nova meta relacionada

**Tarefas Técnicas:**
- [ ] Trigger `notify_goal_milestone`:
  - Após UPDATE em `goals`
  - Verificar % concluído
  - Chamar Edge Function `send-notification`
- [ ] Componente `GoalAchievementModal`
- [ ] Biblioteca confetti: `react-confetti` ou `canvas-confetti`

**Testes de Aceitação:**
1. Alocar valor que atinge 25% → Toast "25% atingido"
2. Atingir 100% → Modal de celebração + confetti

---

## Epic 8: Dashboard e Visualizações

**Descrição:** Dashboard principal com resumo financeiro, gráficos e insights.  
**Valor de Negócio:** Clareza financeira, retenção, satisfação.  
**Dependências:** Épicos 2, 3, 6, 7  
**Total:** 13 story points

---

### 🎫 US-8.1: Dashboard - Patrimônio Líquido

**Prioridade:** P0  
**Story Points:** 2  
**Sprint:** 7

**História:**
> Como usuário autenticado,  
> Quero visualizar meu patrimônio líquido total,  
> Para que eu tenha visão geral da minha saúde financeira.

**Critérios de Aceitação:**
- [ ] Hero section no dashboard exibe:
  - "Patrimônio Líquido"
  - Valor total (soma de todas as contas ativas)
  - Variação percentual vs mês anterior
  - Ícone: ↑ verde se positivo, ↓ vermelho se negativo
- [ ] Valor formatado: "R$ 15.847,32"
- [ ] Count-up animation ao carregar

**Tarefas Técnicas:**
- [ ] Query: `SELECT SUM(balance) FROM accounts WHERE user_id = ? AND NOT is_archived`
- [ ] Calcular variação: comparar com snapshot do mês anterior
- [ ] Componente `NetWorthHero` com CountUp
- [ ] Hook `useNetWorth`

**Testes de Aceitação:**
1. Usuário com 3 contas (R$ 5k, R$ 8k, R$ 2k) → Total R$ 15k
2. Adicionar transação → Valor atualizado em tempo real

---

### 🎫 US-8.2: Dashboard - Resumo Mensal (Receitas vs Despesas)

**Prioridade:** P0  
**Story Points:** 3  
**Sprint:** 7

**História:**
> Como usuário autenticado,  
> Quero visualizar receitas e despesas do mês atual,  
> Para que eu entenda meu fluxo de caixa.

**Critérios de Aceitação:**
- [ ] Cards "Receitas" e "Despesas" lado a lado
- [ ] Valores do mês atual
- [ ] Variação vs mês anterior (ex: "+5%", "-8%")
- [ ] Gráfico de barras horizontal: receitas (verde) vs despesas (vermelho)
- [ ] Saldo do mês: receitas - despesas (grande, centralizado)

**Tarefas Técnicas:**
- [ ] Query:
  ```sql
  SELECT type, SUM(amount) 
  FROM transactions 
  WHERE user_id = ? AND DATE_TRUNC('month', date) = DATE_TRUNC('month', NOW())
  GROUP BY type;
  ```
- [ ] Componente `MonthlyS ummaryCards`
- [ ] Hook `useMonthlyStats`

**Testes de Aceitação:**
1. Receitas R$ 5k, Despesas R$ 3k → Saldo +R$ 2k (verde)
2. Despesas > Receitas → Saldo negativo (vermelho)

---

### 🎫 US-8.3: Dashboard - Top Categorias

**Prioridade:** P1  
**Story Points:** 3  
**Sprint:** 8

**História:**
> Como usuário autenticado,  
> Quero visualizar minhas principais categorias de gasto,  
> Para que eu identifique onde gasto mais.

**Critérios de Aceitação:**
- [ ] Gráfico de pizza (donut chart) com top 5 categorias
- [ ] Cores distintas para cada categoria
- [ ] Hover: tooltip com valor e %
- [ ] Legenda ao lado do gráfico
- [ ] Link "Ver detalhes" → página de análises

**Tarefas Técnicas:**
- [ ] Query:
  ```sql
  SELECT c.name, c.color, SUM(t.amount) as total
  FROM transactions t
  JOIN categories c ON t.category_id = c.id
  WHERE t.user_id = ? AND t.type = 'expense' AND DATE_TRUNC('month', t.date) = DATE_TRUNC('month', NOW())
  GROUP BY c.id
  ORDER BY total DESC
  LIMIT 5;
  ```
- [ ] Biblioteca: Recharts (web) / Victory (mobile)
- [ ] Componente `TopCategoriesChart`

**Testes de Aceitação:**
1. Top categoria "Alimentação" R$ 800 (40%) → Maior fatia do gráfico
2. Hover em fatia → Tooltip com valor exato

---

### 🎫 US-8.4: Dashboard - Orçamentos em Destaque

**Prioridade:** P1  
**Story Points:** 2  
**Sprint:** 8

**História:**
> Como usuário autenticado,  
> Quero visualizar status dos orçamentos no dashboard,  
> Para que eu tenha visão rápida sem navegar para outra página.

**Critérios de Aceitação:**
- [ ] Seção "Orçamentos" no dashboard
- [ ] Top 3 orçamentos mais críticos (maior %)
- [ ] Mini progress bars com nome da categoria e %
- [ ] Badge de status (verde/âmbar/vermelho)
- [ ] Link "Ver todos" → página de orçamentos

**Tarefas Técnicas:**
- [ ] Query: buscar orçamentos ordenados por % DESC, limit 3
- [ ] Componente `DashboardBudgets`

**Testes de Aceitação:**
1. Orçamento 95% gasto aparece no topo (vermelho)
2. Sem orçamentos → Seção oculta ou CTA "Criar primeiro orçamento"

---

### 🎫 US-8.5: Dashboard - Metas em Destaque

**Prioridade:** P1  
**Story Points:** 2  
**Sprint:** 8

**História:**
> Como usuário autenticado,  
> Quero visualizar minhas metas no dashboard,  
> Para que eu me mantenha motivado.

**Critérios de Aceitação:**
- [ ] Seção "Metas" no dashboard
- [ ] Top 2 metas em andamento (mais próximas do prazo)
- [ ] Progress ring pequeno + nome + % concluído
- [ ] Link "Ver todas" → página de metas

**Tarefas Técnicas:**
- [ ] Query: `SELECT * FROM goals WHERE status = 'active' ORDER BY deadline ASC LIMIT 2`
- [ ] Componente `DashboardGoals`

**Testes de Aceitação:**
1. Meta "Viagem" 60% → Exibida no dashboard
2. Sem metas → CTA "Defina sua primeira meta"

---

### 🎫 US-8.6: Dashboard - Transações Recentes

**Prioridade:** P1  
**Story Points:** 1  
**Sprint:** 8

**História:**
> Como usuário autenticado,  
> Quero visualizar minhas últimas transações no dashboard,  
> Para que eu tenha acesso rápido ao histórico.

**Critérios de Aceitação:**
- [ ] Seção "Transações Recentes" (últimas 5)
- [ ] Mini cards com: ícone, descrição, categoria, valor
- [ ] Link "Ver todas" → página de transações
- [ ] Realtime: novas transações aparecem imediatamente

**Tarefas Técnicas:**
- [ ] Query: `SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT 5`
- [ ] Componente `RecentTransactions`
- [ ] Supabase Realtime subscription

**Testes de Aceitação:**
1. Adicionar transação → Aparece no topo da lista imediatamente
2. Clicar em transação → Redirect para detalhes

---

## Epic 9: Transações Recorrentes

**Descrição:** Gerenciamento de transações recorrentes (assinaturas, contas fixas) com criação automática.  
**Valor de Negócio:** Automação, redução de trabalho manual.  
**Dependências:** Epic 3 (Transações)  
**Total:** 8 story points

---

### 🎫 US-9.1: Criar Transação Recorrente

**Prioridade:** P1  
**Story Points:** 3  
**Sprint:** 8

**História:**
> Como usuário autenticado,  
> Quero cadastrar transações recorrentes,  
> Para que o sistema as crie automaticamente nas datas previstas.

**Critérios de Aceitação:**
- [ ] Modal "Nova Transação Recorrente" com campos:
  - Descrição (ex: "Aluguel", "Netflix")
  - Valor
  - Categoria
  - Conta
  - Frequência (dropdown: Diária, Semanal, Mensal, Anual)
  - Data de início
  - Data de fim (opcional, default: sem fim)
- [ ] Validação: campos obrigatórios
- [ ] Salvar recorrência (status: "active")
- [ ] Toast: "Recorrência criada! Primeira transação será criada em [data]"

**Tarefas Técnicas:**
- [ ] Migration: `CREATE TABLE recurring_transactions`
- [ ] Componente `CreateRecurringModal`
- [ ] Hook `useCreateRecurring`
- [ ] Calcular `next_occurrence` baseado em frequência

**Testes de Aceitação:**
1. Criar "Aluguel" mensal, R$ 1200, início dia 5 → Primeira transação criada dia 5
2. Criar com frequência semanal → Próxima ocorrência calculada (+7 dias)

---

### 🎫 US-9.2: Visualizar Transações Recorrentes

**Prioridade:** P1  
**Story Points:** 2  
**Sprint:** 9

**História:**
> Como usuário autenticado,  
> Quero visualizar minhas transações recorrentes,  
> Para que eu possa gerenciá-las.

**Critérios de Aceitação:**
- [ ] Página `/recurring` lista recorrências ativas
- [ ] Card exibe:
  - Descrição e categoria
  - Valor e frequência
  - Próxima ocorrência: "Dia 5 de cada mês"
  - Badge de status: "Ativa", "Pausada"
  - Botão Editar/Pausar/Deletar
- [ ] Calendário de recorrências (view mensal, opcional)

**Tarefas Técnicas:**
- [ ] Query: `SELECT * FROM recurring_transactions WHERE user_id = ? AND is_active = true`
- [ ] Componente `RecurringTransactionsList`
- [ ] Hook `useRecurringTransactions`

**Testes de Aceitação:**
1. Usuário com 3 recorrências → 3 cards exibidos
2. Sem recorrências → Empty state "Crie sua primeira recorrência"

---

### 🎫 US-9.3: Processamento Automático (Cron Job)

**Prioridade:** P0  
**Story Points:** 3  
**Sprint:** 9

**História:**
> Como sistema,  
> Quero criar transações automaticamente de recorrências vencidas,  
> Para que usuários não precisem adicionar manualmente.

**Critérios de Aceitação:**
- [ ] Cron job diário (executa à meia-noite)
- [ ] Buscar recorrências com `next_occurrence <= hoje`
- [ ] Criar transação para cada recorrência
- [ ] Atualizar `next_occurrence` (ex: +1 mês se mensal)
- [ ] Notificação in-app: "Transação recorrente 'Aluguel' foi criada automaticamente"
- [ ] Logs de execução (quantas criadas, erros)

**Tarefas Técnicas:**
- [ ] Edge Function `process-recurring`
- [ ] Configurar cron: `0 0 * * *` (diariamente à meia-noite)
- [ ] Lógica de cálculo de próxima ocorrência:
  - Diária: +1 dia
  - Semanal: +7 dias
  - Mensal: mesmo dia do próximo mês
  - Anual: +1 ano
- [ ] Tratamento de datas inválidas (ex: 31 de fevereiro → último dia do mês)

**Testes de Aceitação:**
1. Recorrência mensal dia 5 → Transação criada todo dia 5
2. Recorrência semanal → Transação criada a cada 7 dias
3. Recorrência com data de fim → Para de criar após data final

---

### 🎫 US-9.4: Notificações de Contas a Vencer

**Prioridade:** P2  
**Story Points:** 2  
**Sprint:** 9

**História:**
> Como usuário autenticado,  
> Quero receber notificações antes de contas importantes vencerem,  
> Para que eu não esqueça de pagá-las.

**Critérios de Aceitação:**
- [ ] Notificação 3 dias antes de próxima ocorrência de recorrência tipo "expense"
- [ ] Push notification: "Aluguel vence em 3 dias (R$ 1200)"
- [ ] Email (se configurado)
- [ ] Configuração: usuário escolhe quantos dias antes (3, 5, 7)

**Tarefas Técnicas:**
- [ ] Edge Function `notify-upcoming-bills` (cron diário)
- [ ] Query: `SELECT * FROM recurring_transactions WHERE next_occurrence = TODAY() + 3 days`
- [ ] Integração push: Firebase Cloud Messaging (mobile), Web Push (web)
- [ ] Tabela `user_preferences` para configuração de notificações

**Testes de Aceitação:**
1. Recorrência vence em 3 dias → Push enviado
2. Usuário desativa notificações → Push não enviado

---

## Epic 10: Notificações e Alertas

**Descrição:** Sistema de notificações inteligentes (push, email, in-app) para alertas de orçamento, metas, insights.  
**Valor de Negócio:** Engajamento, retenção, valor percebido.  
**Dependências:** Épicos 6, 7, 9  
**Total:** 8 story points

---

### 🎫 US-10.1: Notificações In-App (Toast/Banner)

**Prioridade:** P1  
**Story Points:** 2  
**Sprint:** 9

**História:**
> Como usuário autenticado,  
> Quero receber notificações dentro do app,  
> Para que eu seja alertado de eventos importantes sem sair da tela.

**Critérios de Aceitação:**
- [ ] Toast notifications com variantes:
  - Success (verde): "Transação adicionada"
  - Error (vermelho): "Erro ao salvar"
  - Warning (âmbar): "Orçamento de Lazer atingiu 80%"
  - Info (azul): "Dica: Você pode importar via CSV"
- [ ] Toast auto-dismiss após 5 segundos (ou manual)
- [ ] Máximo 3 toasts simultâneos (stack)
- [ ] Som opcional (configurável)

**Tarefas Técnicas:**
- [ ] Biblioteca: `react-hot-toast` ou `sonner`
- [ ] Context `NotificationContext` para gerenciar toasts
- [ ] Hook `useNotification()`

**Testes de Aceitação:**
1. Adicionar transação → Toast "Transação adicionada"
2. Atingir 80% de orçamento → Toast âmbar com alerta

---

### 🎫 US-10.2: Push Notifications (Mobile)

**Prioridade:** P1  
**Story Points:** 3  
**Sprint:** 10

**História:**
> Como usuário mobile,  
> Quero receber push notifications,  
> Para que eu seja alertado mesmo quando o app está fechado.

**Critérios de Aceitação:**
- [ ] Solicitar permissão de notificações no primeiro uso
- [ ] Push enviado para eventos:
  - Orçamento atingiu 80%, 100%
  - Meta atingiu milestone (25%, 50%, 75%, 100%)
  - Conta vence em 3 dias
  - Resumo semanal (segunda-feira, 9h)
- [ ] Tap em notificação abre tela relevante (deep link)
- [ ] Configuração: usuário pode desabilitar por tipo

**Tarefas Técnicas:**
- [ ] Integração: Firebase Cloud Messaging (FCM)
- [ ] Registrar device token no Supabase
- [ ] Edge Function `send-push` (chamada por triggers)
- [ ] Deep linking (React Navigation/Expo Router)
- [ ] Tabela `device_tokens` (user_id, token, platform)

**Testes de Aceitação:**
1. Atingir 100% de meta → Push "Parabéns, você atingiu sua meta!"
2. Tap em push → App abre na tela de meta específica

---

### 🎫 US-10.3: Notificações por Email

**Prioridade:** P2  
**Story Points:** 3  
**Sprint:** 10

**História:**
> Como usuário autenticado,  
> Quero receber emails com resumos e alertas,  
> Para que eu me mantenha informado sem abrir o app.

**Critérios de Aceitação:**
- [ ] Email transacional (via Resend ou SendGrid):
  - Orçamento ultrapassado
  - Meta atingida
  - Resumo mensal (primeiro dia do mês)
- [ ] Template HTML responsivo
- [ ] Botão CTA: "Ver detalhes no app"
- [ ] Link de unsubscribe (configuração de preferências)

**Tarefas Técnicas:**
- [ ] Integração: Resend API (recomendado para Supabase)
- [ ] Templates: React Email ou MJML
- [ ] Edge Function `send-email`
- [ ] Tabela `email_preferences` (tipos de email, frequência)

**Testes de Aceitação:**
1. Orçamento ultrapassado → Email enviado com detalhes e CTA
2. Clicar em unsubscribe → Preferência atualizada, emails param

---

### 🎫 US-10.4: Alertas de Gastos Incomuns

**Prioridade:** P2  
**Story Points:** 3  
**Sprint:** 10

**História:**
> Como usuário autenticado,  
> Quero receber alertas quando meus gastos em uma categoria estiverem acima do normal,  
> Para que eu possa identificar e corrigir padrões de consumo excessivo.

**Critérios de Aceitação:**
- [ ] Sistema compara gasto atual da categoria com média histórica (últimos 3 meses)
- [ ] Alerta disparado quando gasto > 120% da média histórica
- [ ] Notificação in-app: "Você gastou 30% a mais em [Categoria] este mês"
- [ ] Detalhes do alerta mostram:
  - Gasto atual vs. média histórica
  - Top 3 transações da categoria
  - Tendência (aumentando/diminuindo)
- [ ] Configuração: usuário pode desativar alertas por categoria
- [ ] Frequência: máximo 1 alerta por categoria por semana

**Tarefas Técnicas:**
- [ ] Query: calcular média histórica por categoria (últimos 3 meses)
- [ ] Edge Function `check-unusual-spending` (cron semanal)
- [ ] Tabela `spending_alerts` para evitar alertas duplicados
- [ ] Componente `UnusualSpendingAlert`
- [ ] Integração com sistema de notificações (US-10.1, US-10.2)

**Testes de Aceitação:**
1. Gastar R$ 800 em Lazer (média R$ 400) → Alerta "100% acima da média"
2. Gastar R$ 450 em Lazer (média R$ 400) → Sem alerta (< 20%)
3. Desativar alertas de Lazer → Não recebe mais alertas dessa categoria

---

### 🎫 US-10.5: Sugestões de Economia

**Prioridade:** P2  
**Story Points:** 3  
**Sprint:** 10

**História:**
> Como usuário autenticado,  
> Quero receber sugestões personalizadas de economia,  
> Para que eu possa tomar decisões financeiras mais inteligentes.

**Critérios de Aceitação:**
- [ ] Sistema analisa padrões de gasto e identifica oportunidades:
  - Categorias com crescimento constante
  - Gastos recorrentes que podem ser cortados
  - Saldo parado que poderia ir para metas
- [ ] Sugestões exibidas no dashboard (card dedicado)
- [ ] Tipos de sugestões:
  - "Você pode economizar R$ X reduzindo gastos com [Categoria]"
  - "Você tem R$ X parado na conta. Considere alocar para [Meta]"
  - "Seus gastos com [Categoria] aumentaram 15% nos últimos 3 meses"
- [ ] Máximo 3 sugestões ativas por vez
- [ ] Usuário pode dispensar sugestão ("Não mostrar novamente")
- [ ] Sugestões atualizadas semanalmente

**Tarefas Técnicas:**
- [ ] Edge Function `generate-insights` (cron semanal, segunda-feira)
- [ ] Algoritmo de análise:
  - Calcular tendências por categoria
  - Identificar saldo ocioso (> R$ 500 por 30 dias)
  - Comparar gastos com orçamentos
- [ ] Tabela `user_insights` para armazenar sugestões
- [ ] Componente `InsightCard` no dashboard
- [ ] Hook `useInsights`

**Testes de Aceitação:**
1. Saldo parado R$ 1000 por 30 dias → Sugestão "Alocar para meta"
2. Gastos com Delivery aumentando 3 meses seguidos → Sugestão de redução
3. Dispensar sugestão → Não aparece novamente

---

## Epic 11: Relatórios e Exportação

**Descrição:** Exportação de dados (CSV, PDF), relatórios mensais, conformidade LGPD.  
**Valor de Negócio:** Transparência, conformidade, confiança do usuário.  
**Dependências:** Epic 3 (Transações)  
**Total:** 5 story points

---

### 🎫 US-11.1: Exportar Transações (CSV)

**Prioridade:** P2  
**Story Points:** 2  
**Sprint:** 10

**História:**
> Como usuário autenticado,  
> Quero exportar minhas transações em CSV,  
> Para que eu possa usar em outras ferramentas (Excel, contabilidade).

**Critérios de Aceitação:**
- [ ] Botão "Exportar" na página de transações
- [ ] Modal com opções:
  - Período (dropdown: Este mês, Últimos 3 meses, Ano completo, Customizado)
  - Filtros: Contas, Categorias, Tags
- [ ] Gerar CSV com colunas:
  - Data, Descrição, Categoria, Conta, Tipo, Valor, Tags
- [ ] Download automático do arquivo
- [ ] Nome do arquivo: `transacoes_2025-12.csv`

**Tarefas Técnicas:**
- [ ] Edge Function `export-transactions`:
  - Query com filtros
  - Gerar CSV (library: `papaparse`)
  - Upload para Supabase Storage
  - Retornar signed URL
- [ ] Componente `ExportModal`

**Testes de Aceitação:**
1. Exportar transações de dezembro → CSV com todas as transações do mês
2. Exportar com filtro "Categoria: Alimentação" → Apenas transações de alimentação

---

### 🎫 US-11.2: Relatório Mensal (PDF)

**Prioridade:** P2  
**Story Points:** 2  
**Sprint:** 11

**História:**
> Como usuário autenticado,  
> Quero gerar relatório mensal em PDF,  
> Para que eu possa ter um resumo visual das minhas finanças.

**Critérios de Aceitação:**
- [ ] Botão "Relatório Mensal" no dashboard
- [ ] PDF gerado com:
  - Capa: Mês/Ano, Nome do usuário
  - Resumo: Receitas, Despesas, Saldo
  - Gráfico de pizza: Top categorias
  - Gráfico de linha: Fluxo de caixa diário
  - Status de orçamentos
  - Progresso de metas
- [ ] Download automático
- [ ] Nome: `relatorio_2025-12.pdf`

**Tarefas Técnicas:**
- [ ] Biblioteca: Puppeteer (headless Chrome) ou jsPDF
- [ ] Edge Function `generate-report`
- [ ] Template HTML para renderização

**Testes de Aceitação:**
1. Gerar relatório de dezembro → PDF com todos os dados do mês
2. Verificar gráficos renderizados corretamente

---

### 🎫 US-11.3: Exportação Completa de Dados (LGPD)

**Prioridade:** P1  
**Story Points:** 1  
**Sprint:** 11

**História:**
> Como usuário autenticado,  
> Quero exportar todos os meus dados,  
> Para que eu possa exercer meu direito à portabilidade (LGPD/GDPR).

**Critérios de Aceitação:**
- [ ] Opção "Exportar Todos os Dados" em Configurações
- [ ] Gerar ZIP com:
  - `perfil.json`
  - `contas.csv`
  - `transacoes.csv`
  - `orcamentos.csv`
  - `metas.csv`
  - `recorrencias.csv`
- [ ] Email enviado com link de download (expira em 7 dias)
- [ ] Mensagem: "Seu export estará pronto em alguns minutos"

**Tarefas Técnicas:**
- [ ] Edge Function `export-all-data` (async)
- [ ] Queries para todas as tabelas
- [ ] Gerar ZIP (library: `jszip`)
- [ ] Upload para Supabase Storage (pasta temporária)
- [ ] Enviar email com signed URL

**Testes de Aceitação:**
1. Solicitar export completo → Email recebido com link
2. Download ZIP → Contém todos os arquivos esperados
3. Link expira após 7 dias → Erro 404

---

## Backlog Priorizado

### Sprint 1 (Semanas 1-2)
- [ ] US-1.1: Registro de Novo Usuário (2 pts)
- [ ] US-1.2: Login de Usuário (2 pts)
- [ ] US-1.3: Gerenciamento de Perfil (1 pt)
- [ ] US-2.1: Criar Conta Financeira (2 pts)
- [ ] US-2.2: Listar Contas do Usuário (2 pts)

**Total:** 9 story points

---

### Sprint 2 (Semanas 3-4)
- [ ] US-2.3: Editar Conta (2 pts)
- [ ] US-2.4: Arquivar Conta (2 pts)
- [ ] US-3.1: Adicionar Despesa Manual (3 pts)
- [ ] US-3.2: Adicionar Receita Manual (2 pts)

**Total:** 9 story points

---

### Sprint 3 (Semanas 5-6)
- [ ] US-3.3: Transferência Entre Contas (3 pts)
- [ ] US-3.4: Visualizar Histórico de Transações (3 pts)
- [ ] US-3.5: Editar e Deletar Transação (2 pts)
- [ ] US-4.1: Categorização Baseada em Regras (3 pts)

**Total:** 11 story points

---

### Sprint 4 (Semanas 7-8)
- [ ] US-4.2: Correção de Categorização (2 pts)
- [ ] US-4.3: Gerenciamento de Regras (2 pts)
- [ ] US-5.1: Upload de Arquivo CSV (3 pts)
- [ ] US-5.2: Mapeamento de Colunas (5 pts)

**Total:** 12 story points

---

### Sprint 5 (Semanas 9-10)
- [ ] US-5.3: Preview e Detecção de Duplicatas (3 pts)
- [ ] US-5.4: Processamento Assíncrono (2 pts)
- [ ] US-6.1: Criar Orçamento (3 pts)
- [ ] US-6.2: Visualizar Status de Orçamentos (3 pts)

**Total:** 11 story points

---

### Sprint 6 (Semanas 11-12)
- [ ] US-6.3: Alertas de Orçamento (3 pts)
- [ ] US-6.4: Editar e Deletar Orçamento (2 pts)
- [ ] US-7.1: Criar Meta de Poupança (3 pts)
- [ ] US-7.2: Visualizar Progresso de Metas (3 pts)

**Total:** 11 story points

---

### Sprint 7 (Semanas 13-14)
- [ ] US-7.3: Alocar Valor para Meta (2 pts)
- [ ] US-7.4: Notificações de Milestone (2 pts)
- [ ] US-8.1: Dashboard - Patrimônio Líquido (2 pts)
- [ ] US-8.2: Dashboard - Resumo Mensal (3 pts)
- [ ] US-8.3: Dashboard - Top Categorias (3 pts)

**Total:** 12 story points

---

### Sprint 8 (Semanas 15-16)
- [ ] US-8.4: Dashboard - Orçamentos em Destaque (2 pts)
- [ ] US-8.5: Dashboard - Metas em Destaque (2 pts)
- [ ] US-8.6: Dashboard - Transações Recentes (1 pt)
- [ ] US-9.1: Criar Transação Recorrente (3 pts)
- [ ] US-9.2: Visualizar Transações Recorrentes (2 pts)

**Total:** 10 story points

---

### Sprint 9 (Semanas 17-18)
- [ ] US-9.3: Processamento Automático (3 pts)
- [ ] US-9.4: Notificações de Contas a Vencer (2 pts)
- [ ] US-10.1: Notificações In-App (2 pts)
- [ ] US-10.2: Push Notifications (3 pts)

**Total:** 10 story points

---

### Sprint 10 (Semanas 19-20)
- [ ] US-10.3: Notificações por Email (3 pts)
- [ ] US-10.4: Alertas de Gastos Incomuns (3 pts)
- [ ] US-10.5: Sugestões de Economia (3 pts)
- [ ] US-11.1: Exportar Transações (CSV) (2 pts)
- [ ] US-11.2: Relatório Mensal (PDF) (2 pts)
- [ ] US-11.3: Exportação Completa (LGPD) (1 pt)

**Total:** 14 story points

> **Nota:** Sprint 10 está acima da velocity típica (9-12 pts). Considerar mover US-10.4 ou US-10.5 para Sprint 11 se necessário.

---

### Sprint 11 (Semanas 21-22) - Polimento e Testes
- [ ] Testes E2E completos (5 pts)
- [ ] Correção de bugs críticos (3 pts)
- [ ] Otimizações de performance (2 pts)
- [ ] Documentação de usuário (2 pts)

**Total:** 12 story points

---

## Resumo Executivo

### Total do MVP
- **11 Épicos**
- **47 User Stories**
- **110 Story Points**
- **11 Sprints** (22 semanas, ~5,5 meses)

### Velocity Esperado
- **Sprint Velocity:** 9-12 story points (time de 3 devs)
- **Duração do Sprint:** 2 semanas

### Entregas por Fase

**Fase 1 (Sprints 1-3): Fundação** - 6 semanas
- Auth, Contas, Transações Manuais

**Fase 2 (Sprints 4-5): Automação** - 4 semanas
- Categorização, Importação CSV

**Fase 3 (Sprints 6-7): Controle** - 4 semanas
- Orçamentos, Metas

**Fase 4 (Sprints 8-9): Inteligência** - 4 semanas
- Dashboard, Recorrências, Notificações

**Fase 5 (Sprints 10-11): Relatórios e Polimento** - 4 semanas
- Exportação, Testes, Otimização

---

**Versão:** 1.0  
**Última Atualização:** 2025-12-02  
**Status:** ✅ Pronto para Sprint Planning  

**Próximo Passo:** Iniciar Sprint 0 (setup de projeto e infraestrutura).


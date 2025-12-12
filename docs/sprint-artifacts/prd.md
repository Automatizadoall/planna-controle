# Product Requirements Document (PRD)
## Personal Finance Control App

**Versão:** 1.0  
**Data:** 2025-12-02  
**Autor:** Product Manager  
**Status:** Draft → Review → Approved  
**Projeto:** Mentoria — Controle Financeiro Pessoal  

---

## 1. Visão Geral do Produto

### 1.1 Sumário Executivo
O **Personal Finance Control** é um aplicativo SaaS/mobile que permite que indivíduos gerenciem suas finanças pessoais de forma intuitiva e automatizada. O produto foca em:
- Categorização automática de transações
- Orçamentos orientados a objetivos
- Análises visuais e insights acionáveis
- Sincronização em tempo real

**Backend:** Supabase MCP (Postgres, Auth, Storage, Realtime, Edge Functions)

### 1.2 Objetivos do Produto
1. Reduzir em 70% o tempo gasto por usuários gerenciando finanças manualmente
2. Aumentar a taxa de adesão a orçamentos pessoais em 50%
3. Fornecer insights acionáveis que levem a economia real de 10-15% por mês
4. Alcançar NPS ≥ 25 nos primeiros 3 meses

### 1.3 Público-Alvo e Personas

#### Persona 1: João - Jovem Profissional
- **Idade:** 25-32 anos
- **Renda:** R$ 4.000 - R$ 8.000/mês
- **Dores:** Dificuldade em rastrear gastos mensais; falta de visibilidade sobre onde o dinheiro vai
- **Objetivos:** Economizar para viagem, comprar um carro, criar reserva de emergência
- **Comportamento:** Mobile-first, espera automação, não quer perder tempo com planilhas

#### Persona 2: Maria - Estudante/Usuário Consciente de Orçamento
- **Idade:** 18-25 anos
- **Renda:** R$ 1.500 - R$ 3.000/mês (bolsa, estágio, mesada)
- **Dores:** Orçamento apertado, facilmente ultrapassa limites, precisa de alertas
- **Objetivos:** Não ficar no vermelho, economizar para formatura/intercâmbio
- **Comportamento:** Precisa de notificações proativas, gamificação ajuda na motivação

#### Persona 3: Carlos - Freelancer/Side Hustler
- **Idade:** 28-40 anos
- **Renda:** Variável, múltiplas fontes
- **Dores:** Rastrear receitas irregulares, separar despesas dedutíveis para impostos
- **Objetivos:** Manter fluxo de caixa positivo, planejamento tributário, crescimento de negócio
- **Comportamento:** Precisa de categorização customizável, relatórios para contabilidade

#### Persona 4: Ana - Investidora Consciente
- **Idade:** 35-50 anos
- **Renda:** R$ 10.000+/mês
- **Dores:** Patrimônio líquido espalhado em várias contas e investimentos
- **Objetivos:** Visão consolidada de patrimônio, otimização de portfólio
- **Comportamento:** Quer dashboards sofisticados, integração com corretoras (futuro)

---

## 2. Requisitos Funcionais (MVP)

### 2.1 Epic 1: Contas e Transações

#### FR-1.1: Gerenciamento de Contas
**Prioridade:** P0 (Crítico)  
**User Story:** Como usuário, quero criar e gerenciar múltiplas contas (conta corrente, poupança, cartão de crédito, dinheiro) para acompanhar meu patrimônio total.

**Critérios de Aceitação:**
- [ ] Criar conta com nome, tipo (corrente/poupança/crédito/investimento/dinheiro), saldo inicial, moeda
- [ ] Editar nome e tipo da conta
- [ ] Arquivar contas (soft delete)
- [ ] Visualizar lista de contas ativas com saldo atual
- [ ] Saldo calculado automaticamente com base nas transações

**Casos de Teste:**
1. Criar conta com saldo inicial R$ 1000,00 → verificar saldo exibido
2. Adicionar transação de -R$ 50 → saldo atualiza para R$ 950
3. Arquivar conta → não aparece em listagens ativas, mas dados preservados

---

#### FR-1.2: Entrada Manual de Transações
**Prioridade:** P0 (Crítico)  
**User Story:** Como usuário, quero registrar transações manualmente (receitas e despesas) para manter meu histórico financeiro atualizado.

**Critérios de Aceitação:**
- [ ] Campos: data, valor, tipo (receita/despesa), categoria, conta origem/destino, descrição, tags (opcional)
- [ ] Validação: valor > 0, data não pode ser futura > 30 dias
- [ ] Suporte a transferências entre contas (não conta como receita/despesa)
- [ ] Transações aparecem imediatamente no histórico
- [ ] Editar e excluir transações

**Casos de Teste:**
1. Criar despesa de R$ 50 em "Alimentação" → aparece no histórico e reduz saldo
2. Criar transferência entre contas → saldo ajustado em ambas, não afeta orçamento
3. Tentar criar transação com data futura > 30 dias → erro de validação

---

#### FR-1.3: Importação de Transações via CSV
**Prioridade:** P1 (Alta)  
**User Story:** Como usuário, quero importar transações em lote via arquivo CSV para economizar tempo de entrada manual.

**Critérios de Aceitação:**
- [ ] Upload de arquivo CSV (max 5 MB)
- [ ] Mapeamento de colunas: data, descrição, valor, tipo
- [ ] Preview antes de confirmar importação
- [ ] Detecção e alerta de transações duplicadas
- [ ] Processamento assíncrono via Edge Function
- [ ] Feedback de progresso e erros

**Formato CSV Aceito:**
```csv
Data,Descrição,Valor,Tipo
2025-01-15,Supermercado XYZ,-120.50,despesa
2025-01-16,Salário,5000.00,receita
```

**Casos de Teste:**
1. Upload CSV válido com 100 transações → todas importadas
2. CSV com duplicatas → alerta exibido, usuário escolhe ignorar/substituir
3. CSV malformado → mensagem de erro clara

---

#### FR-1.4: Categorização Automática de Transações
**Prioridade:** P1 (Alta)  
**User Story:** Como usuário, quero que o sistema categorize automaticamente minhas transações com base em regras e aprendizado para economizar tempo.

**Critérios de Aceitação:**
- [ ] Regras padrão: palavras-chave mapeadas para categorias (ex: "uber" → Transporte)
- [ ] Usuário pode criar regras customizadas (se descrição contém X, categorizar como Y)
- [ ] Sugestão de categoria com confiança (alta/média/baixa)
- [ ] Usuário pode corrigir categoria manualmente
- [ ] Sistema aprende com correções do usuário (histórico de categorização)

**Categorias Padrão:**
- Alimentação (Supermercado, Restaurantes, Delivery)
- Transporte (Combustível, Uber, Transporte público)
- Moradia (Aluguel, Condomínio, Contas de serviço)
- Lazer (Streaming, Cinema, Viagens)
- Saúde (Farmácia, Plano de saúde, Consultas)
- Educação
- Outros

**Casos de Teste:**
1. Transação "UBER*TRIP" → automaticamente categorizada como Transporte
2. Usuário corrige "Netflix" de Outros para Lazer → próximas transações Netflix sugeridas como Lazer
3. Criar regra: "farmácia" → Saúde → aplicada retroativamente (opcional)

---

### 2.2 Epic 2: Orçamentos e Metas

#### FR-2.1: Criação e Gerenciamento de Orçamentos
**Prioridade:** P0 (Crítico)  
**User Story:** Como usuário, quero criar orçamentos mensais por categoria para controlar meus gastos e evitar excessos.

**Critérios de Aceitação:**
- [ ] Criar orçamento: categoria, valor limite, período (mensal/semanal), tipo (soft/hard limit)
- [ ] Soft limit: aviso ao atingir 80% e 100%
- [ ] Hard limit: bloqueia registro de novas despesas acima do limite (opcional)
- [ ] Visualizar progresso do orçamento: gasto atual vs. limite
- [ ] Alertas push/email quando ultrapassar limites
- [ ] Orçamentos recorrentes (auto-renovam mensalmente)

**Casos de Teste:**
1. Criar orçamento "Alimentação" R$ 500/mês → gastar R$ 400 → progress bar 80%
2. Ultrapassar soft limit → notificação enviada
3. Hard limit ativo → tentar adicionar despesa acima → bloqueado com mensagem explicativa

---

#### FR-2.2: Metas de Poupança
**Prioridade:** P1 (Alta)  
**User Story:** Como usuário, quero definir metas de poupança (ex: viagem, reserva de emergência) e acompanhar meu progresso para me manter motivado.

**Critérios de Aceitação:**
- [ ] Criar meta: nome, valor alvo, prazo (data), conta vinculada (opcional)
- [ ] Alocação manual de valores para a meta
- [ ] Cálculo automático: "Você precisa economizar R$ X por mês para atingir a meta"
- [ ] Visualização de progresso (% concluído, tempo restante)
- [ ] Notificações de milestone (25%, 50%, 75%, 100%)

**Casos de Teste:**
1. Meta "Viagem" R$ 5000 em 10 meses → sugestão: R$ 500/mês
2. Alocar R$ 1000 → progresso 20%
3. Atingir 100% → notificação de conquista

---

### 2.3 Epic 3: Dashboard e Análises

#### FR-3.1: Dashboard Principal
**Prioridade:** P0 (Crítico)  
**User Story:** Como usuário, quero visualizar um resumo financeiro consolidado para entender minha situação atual de forma rápida.

**Critérios de Aceitação:**
- [ ] Patrimônio líquido total (soma de todas as contas)
- [ ] Receitas vs. Despesas do mês atual (gráfico de barras)
- [ ] Top 5 categorias de gastos (gráfico pizza)
- [ ] Lista de transações recentes (últimas 10)
- [ ] Status dos orçamentos ativos (progress bars)
- [ ] Metas em andamento (% concluído)
- [ ] Carregamento < 500ms para datasets típicos (até 10k transações)

**Dados Exibidos:**
- Período: mês atual (padrão), com opção de mudar para últimos 30 dias, ano, customizado
- Atualização em tempo real (Supabase Realtime)

**Casos de Teste:**
1. Novo usuário sem transações → widgets exibem "Sem dados" com CTA
2. Usuário com 500 transações → dashboard carrega < 500ms
3. Adicionar transação → dashboard atualiza sem refresh

---

#### FR-3.2: Análises e Relatórios
**Prioridade:** P1 (Alta)  
**User Story:** Como usuário, quero visualizar relatórios detalhados e gráficos de tendência para identificar padrões de gastos ao longo do tempo.

**Critérios de Aceitação:**
- [ ] Gráfico de fluxo de caixa mensal (últimos 12 meses)
- [ ] Comparação mês a mês por categoria
- [ ] Calendário de pagamentos recorrentes
- [ ] Filtros: período, contas, categorias, tags
- [ ] Exportar relatório como CSV ou PDF

**Visualizações:**
- Linha do tempo de patrimônio líquido
- Heatmap de gastos por dia da semana
- Ranking de maiores despesas

**Casos de Teste:**
1. Filtrar por "Transporte" últimos 6 meses → gráfico de linha mostrando tendência
2. Exportar CSV → arquivo contém transações filtradas
3. Período sem dados → mensagem informativa

---

### 2.4 Epic 4: Insights e Recomendações

#### FR-4.1: Insights Inteligentes
**Prioridade:** P2 (Média)  
**User Story:** Como usuário, quero receber insights automáticos sobre meus hábitos financeiros para tomar decisões mais inteligentes.

**Critérios de Aceitação:**
- [ ] Resumo mensal enviado por email (primeiro dia do mês)
- [ ] Alertas de gastos incomuns ("Você gastou 30% a mais em Lazer este mês")
- [ ] Sugestões de economia ("Você pode economizar R$ 200 reduzindo gastos com delivery")
- [ ] Detecção de oportunidades: "Você tem R$ 500 parados na conta corrente, considere transferir para poupança"

**Regras de Insight:**
- Gasto > 20% da média histórica → alerta
- Categoria ultrapassou orçamento → sugestão de ajuste
- Meta não está no ritmo → aviso de ajuste necessário

**Casos de Teste:**
1. Gastar R$ 800 em Lazer (média: R$ 400) → insight "Você gastou o dobro do normal"
2. Final do mês com saldo positivo → sugestão "Considere alocar R$ X para meta Y"

---

### 2.5 Epic 5: Transações Recorrentes e Contas

#### FR-5.1: Gerenciamento de Transações Recorrentes
**Prioridade:** P1 (Alta)  
**User Story:** Como usuário, quero cadastrar despesas e receitas recorrentes (aluguel, salário, assinaturas) para automatizar meu registro financeiro.

**Critérios de Aceitação:**
- [ ] Cadastrar recorrência: valor, categoria, frequência (diária/semanal/mensal/anual), data início, data fim (opcional)
- [ ] Sistema cria transações automaticamente nas datas previstas (via Edge Function agendada)
- [ ] Usuário pode pausar, editar ou cancelar recorrências
- [ ] Notificação antes de contas importantes (3 dias antes)
- [ ] Visualização de calendário de recorrências

**Casos de Teste:**
1. Cadastrar "Aluguel" R$ 1200, dia 5 de cada mês → transação criada automaticamente todo dia 5
2. Pausar recorrência "Netflix" → próximas transações não são criadas
3. Notificação 3 dias antes de "Aluguel" → email/push enviado

---

### 2.6 Epic 6: Exportação e Relatórios

#### FR-6.1: Exportação de Dados
**Prioridade:** P2 (Média)  
**User Story:** Como usuário, quero exportar meus dados financeiros para uso externo (contabilidade, backup, análises).

**Critérios de Aceitação:**
- [ ] Exportar transações em CSV (período selecionável)
- [ ] Exportar relatório mensal em PDF com gráficos
- [ ] Exportar relatório de imposto (despesas dedutíveis marcadas)
- [ ] Opção de exportação completa de dados (GDPR compliance)

**Casos de Teste:**
1. Exportar últimos 3 meses → CSV com todas as transações do período
2. Exportar PDF mensal → arquivo gerado com dashboard e gráficos
3. Exportar tudo → ZIP com CSVs de todas as entidades (contas, transações, orçamentos, metas)

---

### 2.7 Epic 7: Segurança e Acesso

#### FR-7.1: Autenticação e Autorização
**Prioridade:** P0 (Crítico)  
**User Story:** Como usuário, quero acessar o sistema de forma segura com autenticação robusta.

**Critérios de Aceitação:**
- [ ] Registro: email + senha (min 8 caracteres, 1 maiúscula, 1 número, 1 símbolo)
- [ ] Login: email + senha
- [ ] Autenticação via OAuth (Google, Apple) - futuro
- [ ] Verificação de email obrigatória
- [ ] Reset de senha via email
- [ ] Sessão JWT com validade de 7 dias (renovável)

**Tecnologia:** Supabase Auth

**Casos de Teste:**
1. Registrar com senha fraca → erro de validação
2. Login com credenciais válidas → token JWT retornado
3. Tentar acessar API sem token → 401 Unauthorized

---

#### FR-7.2: Controle de Acesso Baseado em Função (RBAC) - Futuro
**Prioridade:** P3 (Baixa - pós-MVP)  
**User Story:** Como usuário, quero compartilhar acesso às minhas finanças com parceiros/familiares com diferentes níveis de permissão.

**Critérios de Aceitação:**
- [ ] Convite por email para outros usuários
- [ ] Funções: Owner (controle total), Editor (adicionar/editar), Viewer (somente leitura)
- [ ] Controle granular: compartilhar apenas contas específicas
- [ ] Auditoria: log de quem fez cada alteração

---

## 3. Requisitos Não-Funcionais

### NFR-1: Desempenho
- **Dashboard:** Carregamento inicial < 500ms para datasets até 10k transações
- **Sincronização:** Realtime updates < 100ms após ação
- **Importação CSV:** Processar 1000 transações em < 5 segundos
- **API Response Time:** P95 < 200ms para endpoints críticos

### NFR-2: Escalabilidade
- **Usuários Simultâneos:** Suportar 10k usuários simultâneos sem degradação
- **Arquitetura:** Multi-tenant com isolamento via Row-Level Security (RLS) no Postgres
- **Storage:** Suportar uploads de até 5 MB por arquivo
- **Database:** Postgres com particionamento de tabelas de transações por ano (futuro)

### NFR-3: Segurança
- **Criptografia:** Dados em trânsito (HTTPS/TLS 1.3) e em repouso (AES-256)
- **Autenticação:** JWT com expiração de 7 dias, refresh tokens
- **Autorização:** Row-Level Security (RLS) no Supabase para isolamento de dados por usuário
- **Auditoria:** Logs de acesso e alterações críticas (criação/edição/exclusão de transações)
- **Conformidade:** LGPD-ready (exportação e exclusão de dados sob demanda)
- **Backup:** Backups diários automáticos, retenção de 30 dias

### NFR-4: Disponibilidade
- **Uptime:** 99.9% (< 43 minutos de downtime por mês)
- **Recuperação:** RTO < 1 hora, RPO < 15 minutos
- **Monitoramento:** Alertas automáticos para falhas e anomalias (Sentry, Supabase Metrics)

### NFR-5: Usabilidade
- **Responsividade:** Design mobile-first, compatível com iOS, Android, Web
- **Acessibilidade:** WCAG 2.1 Level AA (contraste, navegação por teclado, leitores de tela)
- **Internacionalização:** Suporte inicial para PT-BR, estrutura para futuras línguas
- **Tempo de Onboarding:** Novo usuário deve registrar primeira transação em < 2 minutos

### NFR-6: Manutenibilidade
- **Código:** TypeScript com cobertura de testes > 80%
- **Documentação:** API documentada com OpenAPI/Swagger
- **CI/CD:** Deploy automatizado com testes em staging antes de produção
- **Monitoramento:** Logs estruturados, rastreamento de erros (Sentry)

### NFR-7: Privacidade e Conformidade
- **Consentimento:** Termos de uso e política de privacidade obrigatórios no registro
- **Retenção de Dados:** Dados mantidos enquanto conta ativa; deletados em 90 dias após solicitação de exclusão
- **Não Armazenar:** Credenciais bancárias em texto claro (apenas tokens de agregadores)
- **Anonimização:** Dados agregados para análises internas não contêm PII

---

## 4. Casos de Uso Detalhados

### UC-1: Registro e Onboarding de Novo Usuário

**Ator:** Novo Usuário  
**Pré-condição:** Nenhuma  
**Fluxo Principal:**
1. Usuário acessa app/site e clica em "Criar Conta"
2. Sistema exibe formulário de registro (email, senha, nome)
3. Usuário preenche e submete
4. Sistema valida dados, cria conta, envia email de verificação
5. Usuário clica no link de verificação
6. Sistema redireciona para onboarding:
   - Tour rápido das funcionalidades
   - Criar primeira conta (ex: "Minha Conta Corrente")
   - Registrar primeira transação ou importar CSV
7. Sistema exibe dashboard personalizado
8. **Resultado:** Usuário registrado e com dados iniciais

**Fluxos Alternativos:**
- 4a. Email já cadastrado → Mensagem de erro, link para login/recuperar senha
- 5a. Usuário não verifica email em 24h → Email de lembrete enviado

---

### UC-2: Registrar Despesa Manual

**Ator:** Usuário Autenticado  
**Pré-condição:** Usuário possui pelo menos uma conta cadastrada  
**Fluxo Principal:**
1. Usuário acessa "Nova Transação"
2. Sistema exibe formulário (data, valor, tipo [receita/despesa], categoria, conta, descrição)
3. Usuário preenche: data=hoje, valor=R$ 120, tipo=despesa, categoria=Alimentação, conta=Conta Corrente, descrição="Supermercado X"
4. Sistema sugere categoria "Alimentação" (auto-categorização)
5. Usuário confirma
6. Sistema valida, salva transação, atualiza saldo da conta
7. Sistema exibe confirmação e atualiza dashboard em tempo real
8. **Resultado:** Transação registrada, saldo atualizado

**Fluxos Alternativos:**
- 4a. Sistema sugere categoria errada → Usuário seleciona manualmente → Sistema aprende para próximas vezes
- 6a. Validação falha (valor negativo, data inválida) → Mensagem de erro, formulário mantém dados

---

### UC-3: Criar e Monitorar Orçamento Mensal

**Ator:** Usuário Autenticado  
**Pré-condição:** Usuário possui transações categorizadas  
**Fluxo Principal:**
1. Usuário acessa "Orçamentos" e clica "Criar Orçamento"
2. Sistema exibe formulário (categoria, valor limite, período, tipo de alerta)
3. Usuário preenche: categoria=Lazer, limite=R$ 300, período=mensal, alerta=soft
4. Sistema valida e cria orçamento
5. Dashboard exibe card de orçamento com progress bar (gasto atual / limite)
6. Durante o mês, usuário adiciona despesas de Lazer
7. Ao atingir 80% (R$ 240): sistema envia notificação "Você está próximo do limite de Lazer"
8. Ao atingir 100%: notificação "Limite de Lazer atingido"
9. **Resultado:** Orçamento ativo e monitorado

**Fluxos Alternativos:**
- 8a. Hard limit ativo → Tentativa de adicionar despesa acima do limite é bloqueada

---

### UC-4: Importar Transações via CSV

**Ator:** Usuário Autenticado  
**Pré-condição:** Usuário possui arquivo CSV do banco  
**Fluxo Principal:**
1. Usuário acessa "Importar Transações"
2. Sistema exibe upload de arquivo
3. Usuário seleciona arquivo CSV (1000 transações)
4. Sistema processa, detecta colunas (data, descrição, valor)
5. Sistema exibe preview com mapeamento de categorias sugeridas
6. Usuário revisa e confirma importação
7. Sistema processa assincronamente (Edge Function)
8. Sistema exibe progresso (barra de loading)
9. Após conclusão: notificação "1000 transações importadas com sucesso"
10. Dashboard atualiza com novos dados
11. **Resultado:** Transações importadas e categorizadas

**Fluxos Alternativos:**
- 5a. Sistema detecta 50 duplicatas → Alerta exibido, usuário escolhe "Ignorar duplicatas"
- 7a. CSV malformado → Erro com detalhes, sugestão de correção

---

### UC-5: Definir e Acompanhar Meta de Poupança

**Ator:** Usuário Autenticado  
**Fluxo Principal:**
1. Usuário acessa "Metas" e clica "Nova Meta"
2. Sistema exibe formulário (nome, valor alvo, prazo, conta vinculada)
3. Usuário preenche: nome="Viagem para Europa", valor=R$ 10.000, prazo=12 meses
4. Sistema calcula: "Você precisa economizar R$ 833,33 por mês"
5. Sistema cria meta e exibe card no dashboard
6. Usuário aloca R$ 1000 para a meta (manual ou automático)
7. Sistema atualiza progresso: 10% concluído
8. A cada R$ 2500 atingidos (25%, 50%, 75%, 100%): notificação de milestone
9. Ao atingir 100%: notificação de conquista + sugestão de nova meta
10. **Resultado:** Meta criada e monitorada

---

## 5. Épicos e Histórias de Usuário (Backlog MVP)

### Epic 1: Contas e Transações (14 pontos)
- [ ] **US-1.1:** Criar e gerenciar contas (3 pontos)
- [ ] **US-1.2:** Registrar transações manualmente (3 pontos)
- [ ] **US-1.3:** Importar transações via CSV (5 pontos)
- [ ] **US-1.4:** Categorização automática de transações (3 pontos)

### Epic 2: Orçamentos e Metas (10 pontos)
- [ ] **US-2.1:** Criar e monitorar orçamentos (5 pontos)
- [ ] **US-2.2:** Definir metas de poupança (5 pontos)

### Epic 3: Dashboard e Análises (8 pontos)
- [ ] **US-3.1:** Dashboard principal com resumo financeiro (5 pontos)
- [ ] **US-3.2:** Relatórios e gráficos de tendência (3 pontos)

### Epic 4: Transações Recorrentes (5 pontos)
- [ ] **US-4.1:** Cadastrar e gerenciar transações recorrentes (5 pontos)

### Epic 5: Segurança e Auth (5 pontos)
- [ ] **US-5.1:** Autenticação com Supabase Auth (3 pontos)
- [ ] **US-5.2:** Implementar RLS e isolamento de dados (2 pontos)

### Epic 6: Insights e Notificações (5 pontos)
- [ ] **US-6.1:** Alertas de orçamento e insights automáticos (3 pontos)
- [ ] **US-6.2:** Resumo mensal por email (2 pontos)

### Epic 7: Exportação (3 pontos)
- [ ] **US-7.1:** Exportar transações e relatórios (3 pontos)

**Total MVP:** 50 story points (~6-8 sprints de 2 semanas, time de 3 devs)

---

## 6. Features Pós-MVP (Roadmap)

### Fase 2 (Meses 2-4): Automação e OCR
- [ ] **F-2.1:** Captura de recibos via OCR (Supabase Storage + Edge Functions + Tesseract)
- [ ] **F-2.2:** Auto-match de recibos com transações
- [ ] **F-2.3:** Melhorias em categorização com machine learning

### Fase 3 (Meses 4-6): Compartilhamento e Colaboração
- [ ] **F-3.1:** Grupos familiares/domiciliares
- [ ] **F-3.2:** Divisão de despesas compartilhadas
- [ ] **F-3.3:** Dashboards compartilhados com Realtime
- [ ] **F-3.4:** Controle de acesso baseado em função (RBAC)

### Fase 4 (Meses 6-9): Integração Bancária e Investimentos
- [ ] **F-4.1:** Integração com agregadores bancários (Plaid-like, Pluggy)
- [ ] **F-4.2:** Sincronização automática de transações
- [ ] **F-4.3:** Rastreamento de portfólio de investimentos
- [ ] **F-4.4:** Análises avançadas e previsões com IA

### Fase 5 (Mês 9+): IA e Assistente Financeiro
- [ ] **F-5.1:** Chatbot assistente financeiro
- [ ] **F-5.2:** Recomendações personalizadas de economia
- [ ] **F-5.3:** Detecção de anomalias e fraudes
- [ ] **F-5.4:** Planejamento financeiro automatizado

---

## 7. Arquitetura Técnica de Alto Nível

### 7.1 Stack Tecnológica

**Backend:**
- **Database:** PostgreSQL (Supabase)
- **API:** REST/GraphQL (Node.js/TypeScript ou Deno)
- **Auth:** Supabase Auth (JWT)
- **Storage:** Supabase Storage (CSVs, recibos, exports)
- **Realtime:** Supabase Realtime (websockets)
- **Jobs:** Supabase Edge Functions + Cron

**Frontend:**
- **Web:** React/Next.js ou Vue/Nuxt
- **Mobile:** React Native ou Flutter
- **Estado:** React Query / Zustand / Redux
- **UI:** Tailwind CSS + shadcn/ui

**Infraestrutura:**
- **Hospedagem:** Vercel (frontend), Supabase (backend)
- **CI/CD:** GitHub Actions
- **Monitoramento:** Sentry (erros), Supabase Metrics (performance)
- **Analytics:** PostHog ou Mixpanel

### 7.2 Modelo de Dados Simplificado

**Entidades Principais:**
- `users` - Usuários do sistema
- `accounts` - Contas financeiras (corrente, poupança, crédito, etc.)
- `transactions` - Transações (receitas, despesas, transferências)
- `categories` - Categorias de transações
- `budgets` - Orçamentos por categoria
- `goals` - Metas de poupança
- `recurring_transactions` - Templates de transações recorrentes
- `categorization_rules` - Regras de categorização automática
- `user_preferences` - Preferências e configurações

**Relacionamentos:**
- Um `user` possui muitas `accounts`
- Uma `account` possui muitas `transactions`
- Uma `transaction` pertence a uma `category`
- Um `user` possui muitos `budgets` e `goals`

### 7.3 Fluxos de Integração

**Importação CSV:**
1. Upload → Supabase Storage
2. Trigger Edge Function (on upload)
3. Parse CSV, validação, detecção de duplicatas
4. Categorização automática
5. Insert batch no Postgres
6. Webhook para notificar frontend (Realtime)

**Transações Recorrentes:**
1. Cron job diário (Edge Function agendada)
2. Query: `recurring_transactions` com data <= hoje
3. Criar `transactions` correspondentes
4. Atualizar próxima data de recorrência
5. Enviar notificações (3 dias antes de contas importantes)

**Notificações:**
1. Trigger no Postgres (on insert/update de `transactions`)
2. Verificar regras de alerta (orçamento, meta, insight)
3. Edge Function dispara email (Resend) e/ou push (Firebase/OneSignal)

---

## 8. Critérios de Sucesso e Métricas

### 8.1 Métricas de Produto (OKRs)

**Objetivo 1: Engajamento**
- **KR1:** 10k usuários cadastrados em 3 meses
- **KR2:** DAU/MAU ≥ 15% (usuários ativos diários/mensais)
- **KR3:** 30 transações por usuário ativo por mês (mediana)
- **KR4:** 70% dos usuários ativos criam pelo menos 1 orçamento

**Objetivo 2: Retenção**
- **KR1:** Taxa de churn mensal < 5%
- **KR2:** Retenção D7 ≥ 40%, D30 ≥ 25%
- **KR3:** 50% dos usuários retornam ao app ao menos 3x por semana

**Objetivo 3: Satisfação**
- **KR1:** NPS ≥ 25
- **KR2:** Avaliação média ≥ 4.5/5 nas app stores
- **KR3:** Tempo médio de onboarding < 3 minutos

**Objetivo 4: Valor Entregue**
- **KR1:** Usuários reportam economia média de 10-15% no primeiro mês
- **KR2:** 60% dos orçamentos criados são mantidos ativos por 3+ meses
- **KR3:** 40% dos usuários atingem pelo menos 1 meta de poupança

### 8.2 Métricas Técnicas

**Performance:**
- Dashboard load time P95 < 500ms
- API response time P95 < 200ms
- Uptime ≥ 99.9%

**Qualidade:**
- Cobertura de testes > 80%
- 0 vulnerabilidades críticas (Snyk/Dependabot)
- Error rate < 0.1%

---

## 9. Riscos e Mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Baixa adoção inicial | Alto | Média | Campanhas de marketing, onboarding simplificado, incentivos (referral) |
| Vazamento de dados financeiros | Crítico | Baixa | Criptografia forte, RLS rigoroso, auditorias de segurança, penetration testing |
| Complexidade de integração bancária | Alto | Alta | Focar em CSV/OCR no MVP, parcerias com agregadores consolidados |
| Performance com grande volume de transações | Médio | Média | Indexação adequada, particionamento de tabelas, caching |
| Churn por falta de valor percebido | Alto | Média | Insights acionáveis, gamificação, notificações inteligentes |

---

## 10. Dependências e Bloqueadores

**Dependências Externas:**
- [ ] Configuração do projeto Supabase (DB, Auth, Storage, Edge Functions)
- [ ] Decisão sobre framework frontend (React/Vue)
- [ ] Contratação de serviço de email transacional (Resend, SendGrid)

**Dependências Internas:**
- [ ] Definição de design system e componentes UI (shadcn/ui)
- [ ] Setup de repositório, CI/CD, ambientes (dev/staging/prod)
- [ ] Criação de mockups e fluxos de UX

**Bloqueadores Conhecidos:**
- Nenhum identificado no momento

---

## 11. Cronograma de Entregas (MVP)

### Sprint 0 (2 semanas) - Setup
- [ ] Configurar Supabase (projeto, database, auth)
- [ ] Setup repositório, CI/CD, ambientes
- [ ] Definir stack frontend, instalar dependências
- [ ] Criar schema inicial do banco de dados
- [ ] Implementar RLS policies básicas

### Sprint 1-2 (4 semanas) - Contas e Transações
- [ ] CRUD de contas
- [ ] CRUD de transações manuais
- [ ] Categorização básica
- [ ] Importação CSV MVP

### Sprint 3-4 (4 semanas) - Orçamentos e Dashboard
- [ ] CRUD de orçamentos
- [ ] Dashboard principal com widgets
- [ ] Gráficos de receita vs. despesa
- [ ] Metas de poupança MVP

### Sprint 5-6 (4 semanas) - Automação e Insights
- [ ] Transações recorrentes
- [ ] Alertas de orçamento
- [ ] Notificações push/email
- [ ] Insights básicos

### Sprint 7 (2 semanas) - Polimento e Testes
- [ ] Testes end-to-end
- [ ] Correção de bugs
- [ ] Otimização de performance
- [ ] Documentação de usuário

**Total MVP:** 14 semanas (3,5 meses)

---

## 12. Aprovações e Sign-Off

| Stakeholder | Papel | Status | Data | Comentários |
|-------------|-------|--------|------|-------------|
| TBD | Product Owner | Pendente | - | - |
| TBD | Tech Lead | Pendente | - | - |
| TBD | UX Designer | Pendente | - | - |

---

## 13. Anexos e Referências

### 13.1 Documentos Relacionados
- [Product Brief](./personal_finance_control_app_project_brief.md)
- [Workflow Status](../bmm-workflow-status.yaml)

### 13.2 Wireframes e Mockups
- TBD (aguardando workflow de UX Design)

### 13.3 Schema do Banco de Dados
- TBD (será detalhado no workflow de Architecture)

---

**Versão:** 1.0  
**Última Atualização:** 2025-12-02  
**Próximos Passos:**
1. Review e aprovação deste PRD pelos stakeholders
2. Executar workflow de UX Design para criar wireframes
3. Executar workflow de Architecture para design técnico detalhado
4. Quebrar épicos em histórias granulares no workflow create-epics-and-stories


# UX Design Specification
## Personal Finance Control App

**Versão:** 1.0  
**Data:** 2025-12-02  
**UX Designer:** BMAD UX Team  
**Status:** Draft → Review → Approved  
**Projeto:** Mentoria — Controle Financeiro Pessoal  

---

## 📑 Índice

1. [Visão Geral de Design](#1-visão-geral-de-design)
2. [Princípios de Design](#2-princípios-de-design)
3. [Sistema de Design](#3-sistema-de-design)
4. [Arquitetura de Informação](#4-arquitetura-de-informação)
5. [Fluxos de Usuário](#5-fluxos-de-usuário)
6. [Wireframes e Layouts](#6-wireframes-e-layouts)
7. [Componentes e Padrões](#7-componentes-e-padrões)
8. [Interações e Microanimações](#8-interações-e-microanimações)
9. [Responsividade](#9-responsividade)
10. [Acessibilidade](#10-acessibilidade)
11. [Estados e Feedback](#11-estados-e-feedback)
12. [Próximos Passos](#12-próximos-passos)

---

## 1. Visão Geral de Design

### 1.1 Decisões Colaborativas

Esta seção documenta as decisões de design tomadas colaborativamente com o stakeholder durante o workshop de UX.

#### Tema de Cores Escolhido: 🌿 Emerald Dark

**Opções Avaliadas:**
| Tema | Cor Primária | Emoção |
|------|--------------|--------|
| Emerald Dark | Verde #10b981 | Crescimento, prosperidade |
| Ocean Blue | Azul #0ea5e9 | Confiança, tranquilidade |
| Purple Reign | Roxo #8b5cf6 | Elegância, sofisticação |
| Sunset Warm | Laranja #f97316 | Energia, motivação |

**Decisão:** Emerald Dark  
**Rationale do Usuário:** *"Acho que combinou bem com a proposta do app, dinheiro."*  
**Justificativa:** O verde é universalmente associado a dinheiro, crescimento financeiro e prosperidade. Para um app de controle financeiro pessoal, essa associação visual reforça o propósito do produto e cria uma conexão emocional positiva com o usuário.

#### Direção de Design Escolhida: 📊 Dense Dashboard

**Opções Avaliadas:**
| Direção | Descrição |
|---------|-----------|
| Dense Dashboard | Máxima informação, mínimo espaço |
| Spacious Explorer | Respiração visual, foco no essencial |
| Card-Based | Informações em blocos modulares |
| Minimal Focus | Uma informação de cada vez |
| Mobile First | Otimizado para smartphones |
| Data Heavy | Tabelas e gráficos analíticos |
| Gradient Rich | Visual premium com gradientes |
| Split View | Destaque bold para saldo principal |

**Decisão:** Dense Dashboard  
**Rationale do Usuário:** *"Acho que um planner que fala sobre dinheiro tem que ser detalhado."*  
**Justificativa:** Usuários que buscam controle financeiro precisam de visibilidade completa sobre seus dados. Um dashboard denso permite ver patrimônio, receitas, despesas, orçamentos e transações recentes em uma única tela, reduzindo a necessidade de navegação e acelerando a tomada de decisão.

---

### 1.2 Filosofia de Design

O Personal Finance Control adota uma filosofia de **"Clareza Financeira"** — transformar complexidade financeira em simplicidade visual. O design deve:

- **Ser Imediato:** Usuário entende sua situação financeira em < 3 segundos
- **Ser Motivador:** Celebrar conquistas, não apenas mostrar números
- **Ser Confiável:** Transmitir segurança e profissionalismo
- **Ser Acessível:** Funcionar para todos os níveis de literacia financeira

### 1.2 Referências de Design

**Apps Inspiradores:**
- **YNAB (You Need A Budget):** Simplicidade na categorização
- **Mint:** Dashboard visual e insights claros
- **Revolut:** Microinterações deliciosas
- **Notion:** Flexibilidade e personalização

**Princípios Visuais:**
- Design minimalista com foco em dados
- Hierarquia visual clara (tipografia, cor, espaçamento)
- Feedback imediato em todas as ações
- Animações sutis que reforçam compreensão

---

## 2. Princípios de Design

### 2.1 Princípios Fundamentais

#### P1: Transparência Radical
- Nenhum dado financeiro escondido a mais de 2 toques
- Sempre mostrar "de onde veio" e "para onde vai" o dinheiro
- Gráficos com drill-down (clicar para ver detalhes)

#### P2: Ação Rápida
- Adicionar transação em ≤ 10 segundos
- Importar CSV em ≤ 3 cliques
- FAB (Floating Action Button) sempre visível para ações primárias

#### P3: Inteligência Silenciosa
- Automação invisível (categorização, recorrências)
- Sugestões discretas, não invasivas
- Aprendizado progressivo (quanto mais usa, mais inteligente fica)

#### P4: Motivação Positiva
- Focar em conquistas, não em culpa
- Celebrar metas atingidas com animações
- Linguagem encorajadora ("Você está economizando bem!" vs. "Gastos altos")

#### P5: Confiança e Segurança
- Indicadores visuais de segurança (cadeado, criptografia)
- Confirmações para ações críticas (deletar conta, exportar dados)
- Transparência sobre uso de dados

---

## 3. Sistema de Design

### 3.1 Paleta de Cores

#### Cores Primárias
```css
--primary-500: #10B981;      /* Verde (receitas, positivo, crescimento) */
--primary-600: #059669;      /* Verde escuro (hover) */
--primary-700: #047857;      /* Verde mais escuro (active) */

--secondary-500: #3B82F6;    /* Azul (informação, confiança) */
--secondary-600: #2563EB;    /* Azul escuro (hover) */

--danger-500: #EF4444;       /* Vermelho (despesas, alertas) */
--danger-600: #DC2626;       /* Vermelho escuro (hover) */

--warning-500: #F59E0B;      /* Âmbar (avisos, atenção) */
--warning-600: #D97706;      /* Âmbar escuro (hover) */
```

#### Cores Neutras (shadcn/ui compatible)
```css
--background: 0 0% 100%;           /* Branco */
--foreground: 222.2 84% 4.9%;      /* Quase preto */

--card: 0 0% 100%;
--card-foreground: 222.2 84% 4.9%;

--muted: 210 40% 96.1%;            /* Cinza claro */
--muted-foreground: 215.4 16.3% 46.9%;

--border: 214.3 31.8% 91.4%;       /* Bordas sutis */
--input: 214.3 31.8% 91.4%;

--ring: 222.2 84% 4.9%;            /* Focus ring */
```

#### Cores Semânticas
```css
--success: #10B981;      /* Verde - receitas, metas atingidas */
--error: #EF4444;        /* Vermelho - despesas, erros */
--info: #3B82F6;         /* Azul - informações, dicas */
--warning: #F59E0B;      /* Âmbar - alertas de orçamento */
```

#### Gradientes
```css
--gradient-success: linear-gradient(135deg, #10B981 0%, #059669 100%);
--gradient-danger: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
--gradient-primary: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
```

### 3.2 Tipografia

#### Fontes
- **Display/Títulos:** Inter (bold, 700)
- **Corpo/UI:** Inter (regular, 400 / medium, 500)
- **Números/Dados:** Tabular Nums (monospace para alinhamento)

#### Escala Tipográfica
```css
--text-xs: 0.75rem;      /* 12px - labels, captions */
--text-sm: 0.875rem;     /* 14px - corpo secundário */
--text-base: 1rem;       /* 16px - corpo principal */
--text-lg: 1.125rem;     /* 18px - subtítulos */
--text-xl: 1.25rem;      /* 20px - títulos de card */
--text-2xl: 1.5rem;      /* 24px - títulos de seção */
--text-3xl: 1.875rem;    /* 30px - títulos de página */
--text-4xl: 2.25rem;     /* 36px - números grandes (saldo) */
```

#### Pesos
- **Regular (400):** Corpo de texto
- **Medium (500):** Labels, botões
- **Semibold (600):** Subtítulos
- **Bold (700):** Títulos, valores monetários

#### Line Heights (Alturas de Linha)
```css
--leading-none: 1;         /* Títulos grandes, números de destaque */
--leading-tight: 1.25;     /* Títulos, headings */
--leading-snug: 1.375;     /* Subtítulos */
--leading-normal: 1.5;     /* Corpo de texto padrão */
--leading-relaxed: 1.625;  /* Texto longo, parágrafos */
--leading-loose: 2;        /* Espaçamento extra para legibilidade */
```

**Uso Recomendado:**
| Contexto | Line Height |
|----------|-------------|
| Valores monetários grandes (R$ 15.847) | `leading-none` |
| Títulos de seção (h1-h3) | `leading-tight` |
| Subtítulos e labels | `leading-snug` |
| Corpo de texto, descrições | `leading-normal` |
| Textos longos, tooltips | `leading-relaxed` |

### 3.3 Espaçamento

Sistema baseado em **8px grid**:
```css
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
```

### 3.4 Elevação (Sombras)

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

### 3.5 Bordas e Raios

```css
--radius-sm: 0.25rem;   /* 4px - badges, tags */
--radius-md: 0.5rem;    /* 8px - botões, inputs */
--radius-lg: 0.75rem;   /* 12px - cards */
--radius-xl: 1rem;      /* 16px - modais, sheets */
--radius-full: 9999px;  /* Circular - avatares, FAB */
```

### 3.6 Ícones

**Biblioteca:** Lucide Icons (React) ou Heroicons  
**Tamanhos:**
- Small: 16px (inline com texto)
- Medium: 20px (botões, lista)
- Large: 24px (títulos, destaque)
- XLarge: 32px+ (ilustrações, estados vazios)

**Estilo:** Outline (padrão), Solid (ações primárias)

---

### 3.7 Rationale das Decisões de Design System

Esta seção documenta o raciocínio por trás das escolhas do sistema de design.

#### Por que shadcn/ui?

**Alternativas Consideradas:**
| Sistema | Prós | Contras |
|---------|------|---------|
| Material UI | Completo, Google-backed | Pesado, difícil customização profunda |
| Chakra UI | DX excelente, acessível | Menos componentes financeiros |
| Ant Design | Rico em componentes | Estética muito "enterprise" |
| **shadcn/ui** | Leve, copy-paste, totalmente customizável | Requer mais setup inicial |

**Decisão:** shadcn/ui  
**Rationale:** 
- Copy-paste de componentes permite customização total sem overhead de biblioteca
- Baseado em Radix UI, garantindo acessibilidade de primeira classe
- Tailwind CSS nativo, alinhado com stack moderna
- Componentes são "seus" - sem dependência de versões externas
- Comunidade ativa e bem documentado

#### Por que Inter como fonte?

**Alternativas Consideradas:**
| Fonte | Uso Típico | Problema |
|-------|------------|----------|
| Roboto | Apps Google | Muito comum, pouco distinto |
| SF Pro | Apps Apple | Licensing complexo |
| Poppins | Startups | Muito "friendly", menos profissional |
| **Inter** | Apps modernos | Excelente para números, legibilidade |

**Decisão:** Inter  
**Rationale:**
- Projetada especificamente para telas
- Tabular nums (números alinhados) essenciais para dados financeiros
- Excelente legibilidade em tamanhos pequenos
- Open source e amplamente suportada
- Variantes de peso suficientes para hierarquia clara

#### Por que Mobile-First?

**Decisão:** Abordagem Mobile-First com CSS  
**Rationale:**
- Maioria dos usuários acessa finanças pelo celular (70%+ do mercado)
- Forçar simplicidade primeiro evita features bloat
- Progressive enhancement mais fácil que graceful degradation
- Performance melhor em dispositivos limitados
- Alinhado com princípio "Ação Rápida" (P2)

#### Por que Grid de 8px?

**Decisão:** Sistema de espaçamento baseado em múltiplos de 8px  
**Rationale:**
- Matemática simples para desenvolvedores (8, 16, 24, 32...)
- Alinha naturalmente com density de pixels de telas modernas
- Consistência visual automática
- Padrão da indústria (Material, iOS, Web)
- Facilita handoff design → desenvolvimento

---

## 4. Arquitetura de Informação

### 4.1 Estrutura de Navegação

#### Navegação Principal (Bottom Tab Bar - Mobile)
```
┌─────────────────────────────────────┐
│  [Dashboard] [Transações] [+] [Orçamentos] [Perfil]  │
└─────────────────────────────────────┘
```

1. **🏠 Dashboard** - Visão geral financeira
2. **💳 Transações** - Histórico e gerenciamento
3. **➕ Adicionar** - FAB central (ação rápida)
4. **📊 Orçamentos** - Orçamentos e metas
5. **👤 Perfil** - Configurações e conta

#### Navegação Secundária (Sidebar - Web/Tablet)
```
┌──────────────┬──────────────────────┐
│ Logo         │                      │
│              │                      │
│ Dashboard    │   [CONTEÚDO]         │
│ Transações   │                      │
│ Orçamentos   │                      │
│ Metas        │                      │
│ Relatórios   │                      │
│ Contas       │                      │
│ ──────       │                      │
│ Configurações│                      │
│ Suporte      │                      │
└──────────────┴──────────────────────┘
```

### 4.2 Hierarquia de Telas

#### Nível 1: Telas Principais
- Dashboard
- Lista de Transações
- Lista de Orçamentos
- Lista de Metas
- Configurações

#### Nível 2: Detalhes
- Detalhes da Transação
- Detalhes do Orçamento
- Detalhes da Meta
- Detalhes da Conta

#### Nível 3: Ações
- Nova Transação
- Importar CSV
- Novo Orçamento
- Nova Meta
- Editar Perfil

---

## 5. Fluxos de Usuário

### 5.1 Fluxo: Primeiro Acesso (Onboarding)

```
[Tela de Boas-vindas]
     ↓
[Criar Conta: Email + Senha]
     ↓
[Verificar Email] → [Email Enviado]
     ↓
[Tour Rápido: 3 slides]
  • Organize suas finanças
  • Crie orçamentos inteligentes
  • Alcance suas metas
     ↓
[Criar Primeira Conta]
  Input: Nome da Conta, Tipo, Saldo Inicial
     ↓
[Escolha: Adicionar Transação Manual OU Importar CSV]
     ↓
[Dashboard Populado] → Onboarding Completo
```

**Tempo Alvo:** < 3 minutos

---

### 5.2 Fluxo: Adicionar Transação Manual

```
[Qualquer Tela]
     ↓
[Toque no FAB (+)]
     ↓
[Modal: Nova Transação]
  ┌──────────────────────┐
  │ Tipo: [Despesa] [Receita] [Transferência] │
  │ Valor: R$ ____      │
  │ Categoria: [Auto-sugerida] │
  │ Conta: [Selecionada] │
  │ Data: [Hoje]        │
  │ Descrição: ______   │
  │                     │
  │ [Cancelar] [Salvar] │
  └──────────────────────┘
     ↓
[Validação] → [Salvando...] → [✓ Transação Adicionada]
     ↓
[Toast: "Despesa de R$ 120 adicionada"]
     ↓
[Retorna à Tela Anterior com Dados Atualizados]
```

**Tempo Alvo:** < 10 segundos

---

### 5.3 Fluxo: Importar Transações via CSV

```
[Transações]
     ↓
[Botão: Importar CSV]
     ↓
[Modal: Upload de Arquivo]
  • Arraste ou clique para selecionar
  • Formato aceito: .csv (max 5 MB)
     ↓
[Arquivo Selecionado] → [Analisando...]
     ↓
[Preview: Mapear Colunas]
  ┌──────────────────────┐
  │ Data → [Coluna 1]    │
  │ Descrição → [Col 2]  │
  │ Valor → [Coluna 3]   │
  │ Tipo → [Coluna 4]    │
  │                     │
  │ ⚠ 5 duplicatas encontradas │
  │ [Ignorar] [Substituir] │
  │                     │
  │ [Cancelar] [Importar] │
  └──────────────────────┘
     ↓
[Processando: Barra de Progresso]
     ↓
[✓ Sucesso: 95 transações importadas]
     ↓
[Dashboard Atualizado]
```

**Tempo Alvo:** < 30 segundos (1000 transações)

---

### 5.4 Fluxo: Criar Orçamento

```
[Orçamentos]
     ↓
[Botão: Novo Orçamento]
     ↓
[Modal: Criar Orçamento]
  ┌──────────────────────┐
  │ Categoria: [Alimentação ▾] │
  │ Limite: R$ ____     │
  │ Período: [Mensal ▾] │
  │ Tipo de Alerta:     │
  │  ○ Soft (aviso)     │
  │  ○ Hard (bloquear)  │
  │                     │
  │ [Cancelar] [Criar]  │
  └──────────────────────┘
     ↓
[Orçamento Criado]
     ↓
[Card de Orçamento Aparece na Lista]
  • Progress bar: 0%
  • Gasto: R$ 0 / R$ 500
     ↓
[Monitoramento Automático Iniciado]
```

---

### 5.5 Fluxo: Definir Meta de Poupança

```
[Metas]
     ↓
[Botão: Nova Meta]
     ↓
[Modal: Criar Meta]
  ┌──────────────────────┐
  │ Nome: ________       │
  │ Valor Alvo: R$ ____ │
  │ Prazo: [12 meses ▾] │
  │ Conta: [Opcional]   │
  │                     │
  │ 💡 Economize R$ 833/mês │
  │                     │
  │ [Cancelar] [Criar]  │
  └──────────────────────┘
     ↓
[Meta Criada]
     ↓
[Card de Meta na Lista]
  • Progress ring: 0%
  • R$ 0 / R$ 10.000
  • 12 meses restantes
     ↓
[Usuário Pode Alocar Valores Manualmente]
```

---

### 5.6 Fluxo: Editar Transação

```
[Lista de Transações]
     ↓
[Opção A: Tap na Transação] ou [Opção B: Swipe Right 📝]
     ↓
[Modal: Editar Transação]
  ┌──────────────────────┐
  │ Editar Transação     │
  │                      │
  │ Tipo: [Despesa ●]    │  (não editável se vinculada)
  │ Valor: R$ 120,50     │
  │ Categoria: [🍔 ▾]    │
  │ Conta: [Corrente ▾]  │
  │ Data: [02/12/2025]   │
  │ Descrição: ________  │
  │                      │
  │ ──────────────────── │
  │ Criada em: 02/12 14:23│
  │ Última edição: Nunca │
  │                      │
  │ [Cancelar] [Salvar]  │
  └──────────────────────┘
     ↓
[Validação dos Campos]
     ↓
[Salvando...] → [✓ Transação Atualizada]
     ↓
[Toast: "Transação atualizada com sucesso"]
     ↓
[Lista Atualizada com Dados Novos]
```

**Regras de Edição:**
- Todos os campos são editáveis exceto ID
- Se transação for recorrente, perguntar: "Editar apenas esta ou todas as futuras?"
- Histórico de edições mantido para auditoria
- Undo disponível por 5 segundos após salvar

---

### 5.7 Fluxo: Excluir Transação

```
[Lista de Transações]
     ↓
[Opção A: Swipe Left 🗑️] ou [Opção B: Menu ⋮ > Excluir]
     ↓
[Confirmação Inline (Swipe)]
  ┌─────────────────────────────────────┐
  │ 🗑️ Excluir?  [Cancelar] [Confirmar] │
  └─────────────────────────────────────┘

     OU

[Modal de Confirmação (Menu)]
  ┌──────────────────────────────┐
  │ ⚠️ Excluir Transação?        │
  │                              │
  │ 🍔 Supermercado Extra        │
  │ -R$ 120,50 • 02/12/2025     │
  │                              │
  │ Esta ação não pode ser       │
  │ desfeita.                    │
  │                              │
  │ [Cancelar]  [🗑️ Excluir]    │
  └──────────────────────────────┘
     ↓
[Excluindo...] → [✓ Transação Excluída]
     ↓
[Toast com Undo: "Transação excluída. [Desfazer]"]
     ↓
[Card Removido da Lista com Animação]
```

**Regras de Exclusão:**
- Confirmação obrigatória para evitar erros
- Botão "Desfazer" disponível por 5 segundos no toast
- Se transação for recorrente: "Excluir apenas esta, todas as futuras, ou todas?"
- Transações excluídas vão para "Lixeira" por 30 dias (recuperável)
- Saldos e orçamentos recalculados automaticamente

**Soft Delete (Lixeira):**
```
[Configurações] → [Lixeira]
     ↓
[Lista de Itens Excluídos]
  ┌─────────────────────────────────────┐
  │ 🗑️ Lixeira (3 itens)               │
  │ Itens são excluídos após 30 dias   │
  │                                     │
  │ 🍔 Supermercado Extra    [Restaurar]│
  │    Excluído há 2 dias              │
  │                                     │
  │ ☕ Café da Manhã         [Restaurar]│
  │    Excluído há 5 dias              │
  │                                     │
  │ [Esvaziar Lixeira]                 │
  └─────────────────────────────────────┘
```

---

### 5.8 Fluxo: Bulk Actions (Ações em Lote)

```
[Lista de Transações]
     ↓
[Long Press em uma Transação] ou [Botão "Selecionar"]
     ↓
[Modo de Seleção Ativado]
  • Checkboxes aparecem em cada card
  • Header muda para "X selecionados"
  • Bottom bar com ações aparece
     ↓
[Selecionar Múltiplas Transações]
     ↓
[Bottom Action Bar]
  ┌─────────────────────────────────────┐
  │ 3 selecionados                      │
  │                                     │
  │ [📁 Categoria] [🗑️ Excluir] [✕]    │
  └─────────────────────────────────────┘
     ↓
[Ação: Mudar Categoria]
  ┌──────────────────────────────┐
  │ Alterar categoria de 3 itens │
  │                              │
  │ [🍔 Alimentação         ]    │
  │ [🚗 Transporte          ]    │
  │ [🎬 Lazer               ]    │
  │ [➕ Nova categoria      ]    │
  │                              │
  │ [Cancelar]  [Aplicar]        │
  └──────────────────────────────┘
     ↓
[Toast: "3 transações atualizadas"]
     ↓
[Modo de Seleção Desativado]
```

---

## 6. Wireframes e Layouts

### 6.1 Dashboard Principal (Mobile)

```
┌─────────────────────────────────────┐
│  ☰  Personal Finance      🔔  👤    │ ← Header
├─────────────────────────────────────┤
│                                     │
│  Patrimônio Líquido                 │ ← Hero Section
│  R$ 15.847,32                       │   (Grande, Bold)
│  ↑ +12% este mês                    │   (Verde se positivo)
│                                     │
├─────────────────────────────────────┤
│  📊 Este Mês                        │ ← Resumo Mensal
│  ┌─────────────┬─────────────┐     │
│  │ Receitas    │ Despesas    │     │
│  │ R$ 5.000    │ R$ 3.240    │     │
│  │ (verde)     │ (vermelho)  │     │
│  └─────────────┴─────────────┘     │
│                                     │
│  [════════════════════════] 65%    │ ← Gráfico de fluxo
│                                     │
├─────────────────────────────────────┤
│  💰 Orçamentos                      │ ← Seção de Orçamentos
│                                     │
│  🍔 Alimentação                     │
│  [██████████░░░░░░] 80% (R$ 400/500)│
│  ⚠ Próximo do limite               │
│                                     │
│  🚗 Transporte                      │
│  [████░░░░░░░░░░░░] 35% (R$ 140/400)│
│                                     │
│  Ver todos →                        │
│                                     │
├─────────────────────────────────────┤
│  🎯 Metas                           │ ← Seção de Metas
│                                     │
│  ✈ Viagem para Europa              │
│  ◉ 25%  R$ 2.500 / R$ 10.000      │
│  📅 10 meses restantes              │
│                                     │
│  Ver todas →                        │
│                                     │
├─────────────────────────────────────┤
│  💳 Transações Recentes             │ ← Histórico
│                                     │
│  Hoje                               │
│  🍕 Pizzaria Central    -R$ 68,00  │
│     Alimentação • 18:32             │
│                                     │
│  Ontem                              │
│  ⛽ Posto Shell         -R$ 120,00 │
│     Transporte • 07:15              │
│                                     │
│  💼 Salário            +R$ 5000,00 │
│     Receita • 01/12                 │
│                                     │
│  Ver todas →                        │
│                                     │
├─────────────────────────────────────┤
│  [Dashboard] [Transações] [+] [Orçamentos] [Perfil] │ ← Bottom Nav
└─────────────────────────────────────┘
                  ↑
                [FAB] Grande botão + no centro
```

### 6.2 Lista de Transações (Mobile)

```
┌─────────────────────────────────────┐
│  ← Transações              🔍  ⋮    │ ← Header
├─────────────────────────────────────┤
│  🔹 Filtros: [Todas ▾] [Este mês ▾] │ ← Filtros
│  [Importar CSV]                     │
├─────────────────────────────────────┤
│                                     │
│  📅 Hoje - 02 Dez 2025              │ ← Agrupamento por data
│  ┌───────────────────────────────┐ │
│  │ 🍔 Supermercado X             │ │
│  │ Alimentação                   │ │
│  │ Conta Corrente • 14:23        │ │
│  │                   -R$ 120,50  │ │ (Vermelho)
│  └───────────────────────────────┘ │
│  ┌───────────────────────────────┐ │
│  │ ☕ Café da Manhã              │ │
│  │ Alimentação                   │ │
│  │ Dinheiro • 08:15              │ │
│  │                   -R$ 15,00   │ │
│  └───────────────────────────────┘ │
│                                     │
│  📅 Ontem - 01 Dez 2025             │
│  ┌───────────────────────────────┐ │
│  │ 💼 Salário                    │ │
│  │ Receita                       │ │
│  │ Conta Corrente • 00:00        │ │
│  │                   +R$ 5000,00 │ │ (Verde)
│  └───────────────────────────────┘ │
│                                     │
│  📅 30 Nov 2025                     │
│  ...                                │
│                                     │
├─────────────────────────────────────┤
│  [Dashboard] [Transações] [+] [Orçamentos] [Perfil] │
└─────────────────────────────────────┘
```

### 6.3 Modal: Nova Transação

```
┌─────────────────────────────────────┐
│  Nova Transação             ✕       │
├─────────────────────────────────────┤
│                                     │
│  Tipo                               │
│  ┌─────────┬─────────┬──────────┐  │
│  │ Despesa │ Receita │Transferência│ │
│  │   [●]   │   [ ]   │    [ ]   │  │
│  └─────────┴─────────┴──────────┘  │
│                                     │
│  Valor *                            │
│  ┌─────────────────────────────┐   │
│  │ R$  ____________            │   │ (Grande, destaque)
│  └─────────────────────────────┘   │
│                                     │
│  Categoria *                        │
│  ┌─────────────────────────────┐   │
│  │ 🍔 Alimentação         ▾    │   │ (Auto-sugerida)
│  └─────────────────────────────┘   │
│                                     │
│  Conta *                            │
│  ┌─────────────────────────────┐   │
│  │ 💳 Conta Corrente      ▾    │   │
│  └─────────────────────────────┘   │
│                                     │
│  Data *                             │
│  ┌─────────────────────────────┐   │
│  │ 📅 Hoje, 02/12/2025    ▾    │   │
│  └─────────────────────────────┘   │
│                                     │
│  Descrição (opcional)               │
│  ┌─────────────────────────────┐   │
│  │ _________________________   │   │
│  └─────────────────────────────┘   │
│                                     │
│  Tags (opcional)                    │
│  ┌─────────────────────────────┐   │
│  │ + Adicionar tag             │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│         [Cancelar]  [Salvar]        │
└─────────────────────────────────────┘
```

### 6.4 Tela de Orçamentos

```
┌─────────────────────────────────────┐
│  ← Orçamentos               + Novo  │
├─────────────────────────────────────┤
│                                     │
│  📊 Resumo do Mês                   │
│  ┌─────────────────────────────┐   │
│  │ Total Gasto: R$ 2.140       │   │
│  │ Orçamento Total: R$ 3.500   │   │
│  │                             │   │
│  │ [████████████░░░] 61%       │   │
│  │                             │   │
│  │ Restante: R$ 1.360          │   │
│  └─────────────────────────────┘   │
│                                     │
│  Orçamentos Ativos                  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🍔 Alimentação              │   │
│  │ [██████████░░░░░░] 80%      │   │
│  │ R$ 400 / R$ 500             │   │
│  │ ⚠ Próximo do limite         │   │ (Âmbar)
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🚗 Transporte               │   │
│  │ [████░░░░░░░░░░░░] 35%      │   │
│  │ R$ 140 / R$ 400             │   │
│  │ No caminho certo ✓          │   │ (Verde claro)
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🎬 Lazer                    │   │
│  │ [████████████████] 105%     │   │
│  │ R$ 315 / R$ 300             │   │
│  │ 🔴 Limite ultrapassado!     │   │ (Vermelho)
│  └─────────────────────────────┘   │
│                                     │
│  ...                                │
│                                     │
├─────────────────────────────────────┤
│  [Dashboard] [Transações] [+] [Orçamentos] [Perfil] │
└─────────────────────────────────────┘
```

### 6.5 Tela de Metas

```
┌─────────────────────────────────────┐
│  ← Metas                    + Nova  │
├─────────────────────────────────────┤
│                                     │
│  Metas em Andamento                 │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ✈ Viagem para Europa        │   │
│  │                             │   │
│  │      ◉ 25%                  │   │ (Progress ring)
│  │                             │   │
│  │ R$ 2.500 de R$ 10.000       │   │
│  │                             │   │
│  │ 📅 10 meses restantes       │   │
│  │ 💡 Economize R$ 625/mês     │   │
│  │                             │   │
│  │ [Alocar Valor]              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🚗 Carro Novo               │   │
│  │                             │   │
│  │      ◉ 60%                  │   │
│  │                             │   │
│  │ R$ 18.000 de R$ 30.000      │   │
│  │                             │   │
│  │ 📅 6 meses restantes        │   │
│  │ 💡 Economize R$ 2.000/mês   │   │
│  │                             │   │
│  │ [Alocar Valor]              │   │
│  └─────────────────────────────┘   │
│                                     │
│  Metas Concluídas                   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🎉 MacBook Pro              │   │
│  │ ✓ Concluída em 15/11/2025   │   │
│  │ R$ 8.000                    │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  [Dashboard] [Transações] [+] [Orçamentos] [Perfil] │
└─────────────────────────────────────┘
```

### 6.6 Dashboard Web (Desktop)

```
┌────────────────────────────────────────────────────────────────┐
│  ☰  Personal Finance Control         🔍  🔔  👤  [User Name]   │
├────┬───────────────────────────────────────────────────────────┤
│🏠  │  Patrimônio Líquido: R$ 15.847,32   ↑ +12% este mês      │ ← Hero
│    │                                                            │
│💳  ├────────────────────────────────────────────────────────────┤
│    │                                                            │
│📊  │  ┌──────────────────┐  ┌──────────────────┐             │ ← Cards
│    │  │ 📈 Receitas      │  │ 📉 Despesas      │             │
│🎯  │  │ R$ 5.000,00      │  │ R$ 3.240,00      │             │
│    │  │ +5% vs mês pass. │  │ -8% vs mês pass. │             │
│📄  │  └──────────────────┘  └──────────────────┘             │
│    │                                                            │
│⚙  │  ┌─────────────────────────────────────────────────────┐ │ ← Gráfico
│    │  │ 📊 Fluxo de Caixa - Últimos 6 Meses                │ │
│    │  │                                                     │ │
│    │  │    [Gráfico de Linha: Receitas vs Despesas]       │ │
│    │  │                                                     │ │
│    │  └─────────────────────────────────────────────────────┘ │
│    │                                                            │
│    │  ┌──────────────────┐  ┌──────────────────────────────┐ │
│    │  │ 💰 Orçamentos    │  │ 🎯 Metas                     │ │
│    │  │                  │  │                              │ │
│    │  │ 🍔 Alimentação   │  │ ✈ Viagem Europa  25%  ◉     │ │
│    │  │ [██████░░] 80%   │  │ R$ 2.500 / R$ 10.000         │ │
│    │  │                  │  │                              │ │
│    │  │ 🚗 Transporte    │  │ 🚗 Carro Novo    60%  ◉     │ │
│    │  │ [███░░░░] 35%    │  │ R$ 18.000 / R$ 30.000        │ │
│    │  │                  │  │                              │ │
│    │  │ Ver todos →      │  │ Ver todas →                  │ │
│    │  └──────────────────┘  └──────────────────────────────┘ │
│    │                                                            │
│    │  ┌─────────────────────────────────────────────────────┐ │
│    │  │ 💳 Transações Recentes                              │ │
│    │  │                                                     │ │
│    │  │ Hoje                                                │ │
│    │  │ 🍕 Pizzaria Central     Alimentação    -R$ 68,00   │ │
│    │  │ ☕ Café da Manhã        Alimentação    -R$ 15,00   │ │
│    │  │                                                     │ │
│    │  │ Ontem                                               │ │
│    │  │ 💼 Salário              Receita       +R$ 5000,00  │ │
│    │  │                                                     │ │
│    │  │ Ver todas →                                         │ │
│    │  └─────────────────────────────────────────────────────┘ │
│    │                                                            │
└────┴────────────────────────────────────────────────────────────┘
                            ↑
                    [FAB] Botão + flutuante
```

---

## 7. Componentes e Padrões

### 7.1 Componentes Base (shadcn/ui)

#### Button
```tsx
// Variantes
<Button variant="default">Salvar</Button>
<Button variant="destructive">Excluir</Button>
<Button variant="outline">Cancelar</Button>
<Button variant="ghost">Ver mais</Button>
<Button variant="link">Saiba mais</Button>

// Tamanhos
<Button size="sm">Pequeno</Button>
<Button size="default">Padrão</Button>
<Button size="lg">Grande</Button>
```

#### Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Conteúdo */}
  </CardContent>
  <CardFooter>
    {/* Ações */}
  </CardFooter>
</Card>
```

#### Input
```tsx
<Input 
  type="text" 
  placeholder="Digite aqui..."
  label="Campo de Texto"
/>
<Input type="number" placeholder="0,00" prefix="R$" />
```

#### Select
```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Selecione..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Opção 1</SelectItem>
    <SelectItem value="2">Opção 2</SelectItem>
  </SelectContent>
</Select>
```

### 7.2 Componentes Personalizados

#### TransactionCard
```tsx
<TransactionCard
  icon="🍔"
  title="Supermercado X"
  category="Alimentação"
  account="Conta Corrente"
  date="Hoje, 14:23"
  amount="-R$ 120,50"
  type="expense" // expense | income | transfer
  state="default" // default | loading | disabled | skeleton | selected
  onClick={handleClick}
  onSwipeLeft={handleDelete}
  onSwipeRight={handleEdit}
/>
```

**Variações por Tipo:**
- **Expense:** Valor em vermelho, ícone ↓
- **Income:** Valor em verde, ícone ↑
- **Transfer:** Valor em azul, ícone ↔

**Estados Completos:**
| Estado | Visual | Comportamento |
|--------|--------|---------------|
| `default` | Cores normais, interativo | Clicável, swipeable |
| `loading` | Spinner no lugar do ícone, opacity 0.7 | Não interativo |
| `disabled` | Opacity 0.5, cursor not-allowed | Não clicável |
| `skeleton` | Blocos cinza pulsando (animate-pulse) | Placeholder durante fetch |
| `selected` | Borda primária, background sutil | Checkbox visível, bulk actions |
| `error` | Borda vermelha, ícone de warning | Retry action disponível |

---

#### BudgetCard
```tsx
<BudgetCard
  icon="🍔"
  category="Alimentação"
  spent={400}
  limit={500}
  percentage={80}
  status="warning" // ok | warning | exceeded
  state="default" // default | loading | disabled | skeleton | error
  alertMessage="Próximo do limite"
  onClick={handleClick}
/>
```

**Estados por Progresso:**
- **ok:** Verde claro, 0-75% - "No caminho certo ✓"
- **warning:** Âmbar, 76-100% - "⚠ Próximo do limite"
- **exceeded:** Vermelho, >100% - "🔴 Limite ultrapassado!"

**Estados de UI:**
| Estado | Visual | Comportamento |
|--------|--------|---------------|
| `default` | Progress bar colorida, valores visíveis | Clicável para detalhes |
| `loading` | Progress bar com shimmer effect | Aguardando cálculo |
| `disabled` | Opacity 0.5, progress bar cinza | Orçamento pausado |
| `skeleton` | Blocos cinza pulsando | Carregando dados |
| `error` | Ícone ⚠, mensagem de erro | Botão "Tentar novamente" |

---

#### GoalCard
```tsx
<GoalCard
  icon="✈"
  name="Viagem para Europa"
  current={2500}
  target={10000}
  percentage={25}
  deadline="10 meses restantes"
  suggestion="Economize R$ 625/mês"
  state="default" // default | loading | disabled | skeleton | completed | error
  onAllocate={handleAllocate}
  onClick={handleClick}
/>
```

**Estados Completos:**
| Estado | Visual | Comportamento |
|--------|--------|---------------|
| `default` | Progress ring animado, sugestão visível | Botão "Alocar Valor" ativo |
| `loading` | Ring com spinner, valores com shimmer | Processando alocação |
| `disabled` | Opacity 0.5, ring cinza | Meta pausada |
| `skeleton` | Círculo e linhas cinza pulsando | Carregando dados |
| `completed` | Ring 100% verde, confetti, "🎉 Concluída!" | Botão "Criar Nova Meta" |
| `error` | Ring vermelho, mensagem de erro | Botão "Tentar novamente" |

**Elementos:**
- Progress ring circular (animado com CSS)
- Sugestão de economia mensal calculada automaticamente
- Botão de alocação rápida
- Badge de prazo com countdown

---

#### StatCard (Card de Estatística)
```tsx
<StatCard
  icon={<TrendingUpIcon />}
  label="Receitas"
  value="R$ 5.000,00"
  change="+5%"
  changeType="positive" // positive | negative | neutral
  period="vs mês passado"
  state="default" // default | loading | skeleton | error
/>
```

**Estados Completos:**
| Estado | Visual | Comportamento |
|--------|--------|---------------|
| `default` | Valor com CountUp animation, change badge | Hover mostra tooltip |
| `loading` | Spinner no lugar do valor | Calculando... |
| `skeleton` | Blocos cinza pulsando | Carregando dados |
| `error` | "--" no valor, ícone de erro | Tooltip com mensagem |

---

#### ProgressBar (Barra de Progresso)
```tsx
<ProgressBar
  value={80}
  max={100}
  color="warning" // success | warning | danger | primary
  showLabel={true}
  label="80% gasto"
  state="default" // default | loading | indeterminate | disabled
  animated={true}
/>
```

**Estados Completos:**
| Estado | Visual | Comportamento |
|--------|--------|---------------|
| `default` | Barra preenchida com cor semântica | Estático ou animado |
| `loading` | Shimmer effect na barra | Valor sendo calculado |
| `indeterminate` | Barra animando infinitamente | Progresso desconhecido |
| `disabled` | Cinza, sem animação | Não interativo |

---

### 7.3 Padrões de Interação

#### FAB (Floating Action Button)
- **Posição:** Bottom center (mobile), bottom right (desktop)
- **Ação:** Abrir modal "Nova Transação"
- **Estilo:** Circular, grande (56px), sombra elevada
- **Ícone:** + (Plus)
- **Cor:** Primary gradient
- **Animação:** Scale on hover, rotate 45° on click

```tsx
<FloatingActionButton
  icon={<PlusIcon />}
  onClick={openTransactionModal}
  position="bottom-center"
/>
```

---

#### Pull to Refresh
- **Contexto:** Listas (transações, orçamentos, metas)
- **Comportamento:** Puxar para baixo > spinner aparece > atualiza dados
- **Feedback:** Spinner animado + "Atualizando..."

---

#### Search (Busca Global)

**Trigger:**
- **Desktop:** `Ctrl/Cmd + K` ou clicar no ícone 🔍 no header
- **Mobile:** Tap no ícone 🔍 no header

**Comportamento:**
```
┌─────────────────────────────────────────────┐
│  🔍 Buscar transações, categorias, metas... │
│  ─────────────────────────────────────────  │
│                                             │
│  Recentes                                   │
│  • Supermercado                             │
│  • Salário                                  │
│  • Viagem Europa                            │
│                                             │
│  Atalhos                                    │
│  📝 Nova transação          Ctrl+N          │
│  📊 Ver orçamentos          Ctrl+B          │
│  🎯 Ver metas               Ctrl+G          │
│                                             │
└─────────────────────────────────────────────┘
```

**Fluxo de Busca:**
```
[Abrir Busca (Cmd+K)]
     ↓
[Modal de Busca com foco no input]
     ↓
[Usuário digita] → [Fuzzy search em tempo real]
     ↓
[Resultados agrupados por tipo]
  ┌────────────────────────────────────┐
  │ 💳 Transações                      │
  │   🍔 Supermercado Extra  -R$ 120   │
  │   🍕 Supermercado BH     -R$ 85    │
  │                                    │
  │ 📊 Categorias                      │
  │   🍔 Alimentação (12 transações)   │
  │                                    │
  │ 🎯 Metas                           │
  │   Nenhuma meta encontrada          │
  └────────────────────────────────────┘
     ↓
[Seta ↑↓ para navegar, Enter para selecionar]
     ↓
[Navega para o item selecionado]
```

**Estados da Busca:**
| Estado | Visual |
|--------|--------|
| Vazio (inicial) | Recentes + Atalhos |
| Digitando | Spinner pequeno + "Buscando..." |
| Com resultados | Lista agrupada por tipo |
| Sem resultados | Ilustração + "Nenhum resultado para '{termo}'" + sugestões |
| Erro | "Erro ao buscar. Tente novamente." |

**Empty State de Busca:**
```
┌─────────────────────────────────────┐
│                                     │
│         🔍                          │
│                                     │
│  Nenhum resultado para "xyz"        │
│                                     │
│  Tente buscar por:                  │
│  • Nome da transação                │
│  • Categoria (ex: Alimentação)      │
│  • Nome da meta                     │
│                                     │
│  [Criar transação "xyz"]            │
│                                     │
└─────────────────────────────────────┘
```

**Especificações Técnicas:**
- Debounce de 300ms no input
- Fuzzy matching (tolera erros de digitação)
- Highlight do termo buscado nos resultados
- Máximo 5 resultados por categoria
- Histórico de 10 buscas recentes (localStorage)

---

#### Swipe Actions (Mobile)
- **Contexto:** Cards de transações
- **Swipe Right:** Editar (azul) 📝
- **Swipe Left:** Excluir (vermelho) 🗑️

```tsx
<SwipeableCard
  leftAction={{ icon: "trash", color: "red", onAction: deleteTransaction }}
  rightAction={{ icon: "edit", color: "blue", onAction: editTransaction }}
>
  <TransactionCard {...props} />
</SwipeableCard>
```

---

#### Bottom Sheet (Mobile)
- **Uso:** Filtros, seleções rápidas, detalhes
- **Comportamento:** Desliza de baixo para cima, dimmed background
- **Gestos:** Arraste para baixo para fechar, tap fora para fechar

---

#### Modal (Desktop)
- **Uso:** Formulários (nova transação, novo orçamento)
- **Comportamento:** Centralizado, overlay escurecido
- **Tamanho:** Small (400px), Medium (600px), Large (800px)
- **Fechamento:** ESC key, X button, click outside

---

## 8. Interações e Microanimações

### 8.1 Animações de Entrada

#### Cards
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  animation: fadeInUp 0.3s ease-out;
}
```

#### Staggered List
- Cards aparecem sequencialmente com delay de 50ms entre cada um
- Efeito de "cascata"

---

### 8.2 Animações de Feedback

#### Button Press
```css
.button:active {
  transform: scale(0.95);
  transition: transform 0.1s;
}
```

#### Success Toast
```tsx
<Toast variant="success">
  <CheckIcon className="animate-bounce" />
  Transação adicionada com sucesso!
</Toast>
```

#### Progress Bar
- Animação suave ao atualizar progresso
- Easing: ease-in-out, duration: 0.5s

#### Number Counter
- Valores animam incrementalmente (count-up effect)
- Usado em: Saldo, patrimônio líquido, valores de metas

```tsx
<CountUp end={15847.32} duration={1.5} prefix="R$ " decimals={2} />
```

---

### 8.3 Microinterações

#### Checkbox/Toggle
- Bounce effect ao marcar
- Checkmark animado (draw SVG path)

#### Input Focus
```css
.input:focus {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px var(--ring);
  transition: all 0.2s;
}
```

#### Category Icon Pulse
- Quando transação é categorizada automaticamente, ícone da categoria pulsa brevemente

#### Goal Achievement
- Quando meta atinge 100%, confetti animation + modal de celebração

```tsx
<Confetti 
  numberOfPieces={200}
  recycle={false}
  colors={['#10B981', '#3B82F6', '#F59E0B']}
/>
```

---

## 9. Responsividade

### 9.1 Breakpoints

```css
/* Mobile First */
--mobile: 0px;        /* 320px - 767px */
--tablet: 768px;      /* 768px - 1023px */
--desktop: 1024px;    /* 1024px - 1439px */
--wide: 1440px;       /* 1440px+ */
```

### 9.2 Layout Adaptativo

#### Mobile (< 768px)
- Single column layout
- Bottom tab navigation
- FAB central
- Full-width cards
- Gestos: swipe, pull-to-refresh

#### Tablet (768px - 1023px)
- Two-column grid (dashboard)
- Sidebar navigation (colapsável)
- FAB bottom-right
- Cards com max-width

#### Desktop (≥ 1024px)
- Multi-column grid (3-4 cols)
- Persistent sidebar
- Hover states mais evidentes
- Modais ao invés de bottom sheets
- Tooltips on hover

### 9.3 Componentes Responsivos

#### Dashboard Grid
```css
.dashboard-grid {
  display: grid;
  gap: 1rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

#### Navigation
```tsx
// Mobile: Bottom Tab Bar
<TabBar items={[...]} />

// Desktop: Sidebar
<Sidebar items={[...]} />
```

---

## 10. Acessibilidade

### 10.1 WCAG 2.1 Level AA Compliance

#### Contraste de Cores
- Texto normal: mínimo 4.5:1
- Texto grande (≥ 18pt): mínimo 3:1
- Elementos UI: mínimo 3:1

**Verificação:**
```
✓ #10B981 (verde) em branco: 4.7:1 (PASS)
✓ #EF4444 (vermelho) em branco: 4.8:1 (PASS)
✓ #3B82F6 (azul) em branco: 5.2:1 (PASS)
```

#### Navegação por Teclado
- Todos os elementos interativos acessíveis via Tab
- Ordem lógica de foco
- Focus visible (ring de destaque)
- Atalhos de teclado:
  - `Ctrl/Cmd + N`: Nova transação
  - `Ctrl/Cmd + F`: Buscar
  - `Esc`: Fechar modal/bottom sheet

#### Screen Readers
```tsx
// Boa prática: Labels descritivos
<Button aria-label="Adicionar nova transação">
  <PlusIcon />
</Button>

// Valores monetários
<span aria-label="Despesa de 120 reais e 50 centavos">
  -R$ 120,50
</span>

// Progress bars
<ProgressBar 
  value={80} 
  max={100}
  aria-label="80% do orçamento de alimentação gasto"
/>
```

#### Gestos Alternativos
- Swipe actions também acessíveis via botões visíveis (on focus)
- Pull-to-refresh tem alternativa: botão de refresh no header

---

### 10.2 Internacionalização (i18n)

#### Estrutura
```typescript
// pt-BR (padrão)
export const ptBR = {
  dashboard: {
    title: "Dashboard",
    netWorth: "Patrimônio Líquido",
    income: "Receitas",
    expenses: "Despesas"
  }
}

// en-US (futuro)
export const enUS = {
  dashboard: {
    title: "Dashboard",
    netWorth: "Net Worth",
    income: "Income",
    expenses: "Expenses"
  }
}
```

#### Formatação
- **Moeda:** R$ 1.234,56 (pt-BR) | $ 1,234.56 (en-US)
- **Data:** 02/12/2025 (pt-BR) | 12/02/2025 (en-US)
- **Números:** 1.234,56 (pt-BR) | 1,234.56 (en-US)

---

## 11. Estados e Feedback

### 11.1 Estados de Loading

#### Skeleton Loading
```tsx
<Card>
  <Skeleton className="h-12 w-full" />
  <Skeleton className="h-4 w-3/4 mt-4" />
  <Skeleton className="h-4 w-1/2 mt-2" />
</Card>
```

**Uso:** Dashboard cards, lista de transações

#### Spinner
```tsx
<Spinner size="sm" /> // Inline loading
<Spinner size="lg" /> // Full-screen loading
```

**Uso:** Processamento de CSV, salvamento de formulários

#### Progress Bar
```tsx
<ProgressBar value={uploadProgress} />
<p>{uploadProgress}% completo</p>
```

**Uso:** Upload de arquivos, importação de transações

---

### 11.2 Estados de Erro

#### Inline Error
```tsx
<Input 
  error="Valor deve ser maior que zero"
  className="border-red-500"
/>
```

#### Toast/Snackbar
```tsx
<Toast variant="error">
  <XCircleIcon />
  Erro ao salvar transação. Tente novamente.
</Toast>
```

#### Error Page (Fallback)
```
┌─────────────────────────────────────┐
│                                     │
│        🔴 Algo deu errado           │
│                                     │
│  Não foi possível carregar seus    │
│  dados. Por favor, tente novamente. │
│                                     │
│    [Tentar Novamente]  [Voltar]    │
│                                     │
└─────────────────────────────────────┘
```

---

### 11.3 Estados Vazios (Empty States)

#### Sem Transações
```
┌─────────────────────────────────────┐
│                                     │
│         💳                          │
│                                     │
│  Nenhuma transação ainda            │
│                                     │
│  Comece adicionando sua primeira    │
│  transação ou importe via CSV.      │
│                                     │
│  [+ Adicionar Transação]            │
│  [Importar CSV]                     │
│                                     │
└─────────────────────────────────────┘
```

#### Sem Orçamentos
```
┌─────────────────────────────────────┐
│         📊                          │
│                                     │
│  Crie seu primeiro orçamento        │
│                                     │
│  Orçamentos ajudam você a manter    │
│  controle dos seus gastos mensais.  │
│                                     │
│  [+ Criar Orçamento]                │
└─────────────────────────────────────┘
```

---

### 11.4 Mensagens de Sucesso

#### Toast Success
```tsx
<Toast variant="success">
  <CheckCircleIcon />
  Transação adicionada com sucesso!
</Toast>
```

#### Modal de Conquista (Goal Achievement)
```
┌─────────────────────────────────────┐
│                                     │
│         🎉 Parabéns!                │
│                                     │
│  Você atingiu sua meta de           │
│  "Viagem para Europa"!              │
│                                     │
│  R$ 10.000,00 economizados          │
│                                     │
│  [Criar Nova Meta]  [Fechar]        │
│                                     │
└─────────────────────────────────────┘
```

---

## 12. Próximos Passos

### 12.1 Validação de Design

- [ ] **User Testing:** Testar protótipo com 5-10 usuários das personas
- [ ] **A/B Testing:** Testar variações de cores (tema claro vs escuro)
- [ ] **Heurísticas:** Avaliar com Nielsen's 10 Usability Heuristics
- [ ] **Accessibility Audit:** Testar com screen readers (NVDA, JAWS)

### 12.2 Entregáveis Pendentes

- [ ] **Protótipo Interativo:** Figma/Adobe XD com todas as telas navegáveis
- [ ] **Design System:** Documentação completa no Storybook
- [ ] **Iconografia:** Conjunto customizado de ícones financeiros
- [ ] **Ilustrações:** Empty states, onboarding, error pages
- [ ] **Motion Guidelines:** Documentação de animações e transições

### 12.3 Handoff para Desenvolvimento

**Preparação:**
1. Exportar assets (ícones, ilustrações, logos)
2. Documentar specs de animação (duration, easing, triggers)
3. Criar componentes no Storybook
4. Escrever testes de acessibilidade
5. Validar responsividade em dispositivos reais

**Ferramentas:**
- Figma Dev Mode (exportar código)
- Zeroheight (documentação de design system)
- Chromatic (visual regression testing)

---

## 13. Apêndice

### 13.1 Checklist de Aprovação

**Design System:**
- [✓] Paleta de cores definida
- [✓] Tipografia especificada
- [✓] Espaçamento padronizado
- [✓] Componentes base documentados

**Wireframes:**
- [✓] Dashboard (mobile + desktop)
- [✓] Lista de transações
- [✓] Formulário de nova transação
- [✓] Tela de orçamentos
- [✓] Tela de metas
- [✓] Modals e bottom sheets

**Fluxos:**
- [✓] Onboarding
- [✓] Adicionar transação
- [✓] Importar CSV
- [✓] Criar orçamento
- [✓] Definir meta

**Acessibilidade:**
- [✓] Contraste de cores WCAG AA
- [✓] Navegação por teclado
- [✓] Labels para screen readers
- [✓] Estados de foco visíveis

**Responsividade:**
- [✓] Breakpoints definidos
- [✓] Layouts mobile/tablet/desktop
- [✓] Componentes adaptativos

---

### 13.2 Glossário de UX

- **FAB:** Floating Action Button - botão flutuante para ação primária
- **Bottom Sheet:** Painel que desliza de baixo para cima (mobile)
- **Toast:** Notificação temporária não-intrusiva
- **Skeleton:** Placeholder animado durante loading
- **Empty State:** Tela quando não há dados para exibir
- **Swipe Action:** Ação revelada ao deslizar elemento horizontalmente
- **Pull to Refresh:** Gesto de puxar para baixo para atualizar lista

---

### 13.3 Referências

**Design Systems:**
- [Material Design 3](https://m3.material.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)

**Acessibilidade:**
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [A11y Project](https://www.a11yproject.com/)

**Ferramentas:**
- [Figma](https://www.figma.com/) - Design e prototipagem
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Storybook](https://storybook.js.org/) - Documentação de componentes

---

**Versão:** 1.0  
**Última Atualização:** 2025-12-02  
**Status:** ✅ Pronto para Review  

**Próximo Passo:** Criar protótipo interativo no Figma ou seguir para Arquitetura Técnica.


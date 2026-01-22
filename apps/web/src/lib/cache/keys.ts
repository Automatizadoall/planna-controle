/**
 * Chaves de cache centralizadas
 * Facilita invalidação e organização
 */
export const cacheKeys = {
  // Dados do usuário
  profile: (userId: string) => ['profile', userId] as const,
  
  // Contas
  accounts: (userId: string) => ['accounts', userId] as const,
  account: (accountId: string) => ['account', accountId] as const,
  
  // Categorias (raramente mudam, cache longo)
  categories: (userId: string) => ['categories', userId] as const,
  
  // Transações (mudam frequentemente)
  transactions: (userId: string, filters?: object) => 
    ['transactions', userId, filters] as const,
  transactionsMonth: (userId: string, year: number, month: number) => 
    ['transactions', userId, 'month', year, month] as const,
  
  // Orçamentos
  budgets: (userId: string) => ['budgets', userId] as const,
  budgetStatus: (userId: string) => ['budget-status', userId] as const,
  
  // Metas
  goals: (userId: string) => ['goals', userId] as const,
  
  // Recorrentes
  recurring: (userId: string) => ['recurring', userId] as const,
  
  // Dashboard (agregado)
  dashboardSummary: (userId: string, year: number, month: number) => 
    ['dashboard', userId, year, month] as const,
} as const

/**
 * Grupos de chaves para invalidação em lote
 */
export const cacheGroups = {
  // Invalida tudo relacionado a transações
  transactions: (userId: string) => [
    { queryKey: ['transactions', userId] },
    { queryKey: ['dashboard', userId] },
    { queryKey: ['budget-status', userId] },
  ],
  
  // Invalida tudo relacionado a contas
  accounts: (userId: string) => [
    { queryKey: ['accounts', userId] },
    { queryKey: ['dashboard', userId] },
  ],
  
  // Invalida dados financeiros completos
  financial: (userId: string) => [
    { queryKey: ['transactions', userId] },
    { queryKey: ['accounts', userId] },
    { queryKey: ['budget-status', userId] },
    { queryKey: ['dashboard', userId] },
    { queryKey: ['goals', userId] },
  ],
} as const

'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

// Configuração otimizada para UX
const defaultOptions = {
  queries: {
    // Dados ficam frescos por 5 minutos
    staleTime: 5 * 60 * 1000,
    // Cache persiste por 30 minutos
    gcTime: 30 * 60 * 1000,
    // Retry apenas 1 vez em caso de erro
    retry: 1,
    // Refetch quando a janela ganha foco (bom para dados financeiros)
    refetchOnWindowFocus: true,
    // Não refetch em mount se dados ainda estão frescos
    refetchOnMount: false,
  },
}

export function QueryProvider({ children }: { children: ReactNode }) {
  // Criar QueryClient dentro do componente para evitar compartilhamento entre requests
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

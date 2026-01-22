'use client'

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { cacheGroups, cacheKeys } from './keys'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface RealtimeSyncProps {
  userId: string
}

/**
 * Componente que escuta mudanças em tempo real do Supabase
 * e invalida o cache automaticamente quando dados são alterados
 * 
 * Isso garante que transações registradas via WhatsApp, API ou
 * qualquer outro meio apareçam instantaneamente no app
 */
export function RealtimeSync({ userId }: RealtimeSyncProps) {
  const queryClient = useQueryClient()
  const supabase = createClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!userId) return

    // Criar canal único para este usuário
    const channel = supabase
      .channel(`user-${userId}-sync`)
      
      // Escutar mudanças em transações
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🔄 Transação atualizada em tempo real:', payload.eventType)
          
          // Invalida todos os caches relacionados a transações
          cacheGroups.transactions(userId).forEach(({ queryKey }) => {
            queryClient.invalidateQueries({ queryKey })
          })
          
          // Também invalida contas (saldo pode ter mudado)
          queryClient.invalidateQueries({ queryKey: cacheKeys.accounts(userId) })
        }
      )
      
      // Escutar mudanças em contas
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'accounts',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🔄 Conta atualizada em tempo real:', payload.eventType)
          
          cacheGroups.accounts(userId).forEach(({ queryKey }) => {
            queryClient.invalidateQueries({ queryKey })
          })
        }
      )
      
      // Escutar mudanças em metas
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🔄 Meta atualizada em tempo real:', payload.eventType)
          queryClient.invalidateQueries({ queryKey: cacheKeys.goals(userId) })
        }
      )
      
      // Escutar mudanças em orçamentos
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budgets',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🔄 Orçamento atualizado em tempo real:', payload.eventType)
          queryClient.invalidateQueries({ queryKey: cacheKeys.budgets(userId) })
          queryClient.invalidateQueries({ queryKey: cacheKeys.budgetStatus(userId) })
        }
      )
      
      // Escutar mudanças em recorrentes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recurring_transactions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🔄 Recorrente atualizada em tempo real:', payload.eventType)
          queryClient.invalidateQueries({ queryKey: cacheKeys.recurring(userId) })
        }
      )
      
      // Escutar mudanças em categorias
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🔄 Categoria atualizada em tempo real:', payload.eventType)
          queryClient.invalidateQueries({ queryKey: cacheKeys.categories(userId) })
        }
      )
      
      // Escutar mudanças no perfil
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          console.log('🔄 Perfil atualizado em tempo real:', payload.eventType)
          queryClient.invalidateQueries({ queryKey: cacheKeys.profile(userId) })
        }
      )

    // Iniciar a subscription
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Realtime sync ativo para usuário:', userId)
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Erro ao conectar Realtime')
      }
    })

    channelRef.current = channel

    // Cleanup: remover subscription quando componente desmonta
    return () => {
      console.log('🔌 Desconectando Realtime sync')
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [userId, queryClient, supabase])

  // Componente invisível
  return null
}

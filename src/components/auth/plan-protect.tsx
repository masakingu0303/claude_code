'use client'

import { useUser } from '@clerk/nextjs'
import { ReactNode } from 'react'

interface PlanProtectProps {
  plan: 'free' | 'premium'
  children: ReactNode
  fallback?: ReactNode
}

export function PlanProtect({ plan, children, fallback }: PlanProtectProps) {
  const { user } = useUser()
  
  // ユーザーがいない場合はfallbackを表示
  if (!user) {
    return <>{fallback}</>
  }

  // プラン情報を取得（Clerkのサブスクリプション情報から）
  const userPlan = user.publicMetadata?.plan as string || 'free'

  // アクセス権限チェック
  const hasAccess = (() => {
    if (plan === 'free') return true
    if (plan === 'premium') return userPlan === 'premium'
    return false
  })()

  return hasAccess ? <>{children}</> : <>{fallback}</>
}
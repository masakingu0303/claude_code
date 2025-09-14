'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Clerk の PricingTable を動的インポート（エラーハンドリング付き）
const PricingTable = dynamic(
  () => import('@clerk/nextjs').then(mod => mod.PricingTable),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse">
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    ),
  }
)

export function DynamicPricingTable() {
  try {
    return <PricingTable />
  } catch (error) {
    // Billing機能が無効な場合の代替UI
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">決済機能準備中</CardTitle>
          <CardDescription className="text-orange-600">
            現在、決済機能の設定を準備中です。しばらくお待ちください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-orange-700">
            無料プランは引き続きご利用いただけます。プレミアム機能は準備が整い次第ご提供いたします。
          </p>
        </CardContent>
      </Card>
    )
  }
}
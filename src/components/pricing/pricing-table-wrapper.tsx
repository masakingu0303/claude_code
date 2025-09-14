'use client'

import { Component, ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DynamicPricingTable } from './dynamic-pricing-table'

interface State {
  hasError: boolean
  error?: Error
}

interface Props {
  children: ReactNode
}

class PricingTableErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.log('PricingTable error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
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

    return this.props.children
  }
}

export function PricingTableWrapper() {
  return (
    <PricingTableErrorBoundary>
      <DynamicPricingTable />
    </PricingTableErrorBoundary>
  )
}
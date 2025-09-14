'use client'

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState, useMemo } from 'react'

interface ExpenseData {
  id: string
  amount: number
  category_name: string
  category_icon: string
  category_color: string
  date: string
}

interface ExpenseChartProps {
  expenses: ExpenseData[]
}

export function ExpenseChart({ expenses }: ExpenseChartProps) {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie')
  const [period, setPeriod] = useState<'week' | 'month'>('month')

  // データを期間でフィルタリング
  const filteredExpenses = useMemo(() => {
    const now = new Date()
    const periodStart = new Date()
    
    if (period === 'week') {
      periodStart.setDate(now.getDate() - 7)
    } else {
      periodStart.setMonth(now.getMonth() - 1)
    }

    return expenses.filter(expense => new Date(expense.date) >= periodStart)
  }, [expenses, period])

  // カテゴリ別の集計データを作成
  const chartData = useMemo(() => {
    const categoryTotals = filteredExpenses.reduce((acc, expense) => {
      const category = expense.category_name
      if (!acc[category]) {
        acc[category] = {
          name: category,
          value: 0,
          icon: expense.category_icon,
          color: expense.category_color,
        }
      }
      acc[category].value += expense.amount
      return acc
    }, {} as Record<string, { name: string; value: number; icon: string; color: string }>)

    return Object.values(categoryTotals).sort((a, b) => b.value - a.value)
  }, [filteredExpenses])

  const COLORS = chartData.map(item => item.color)

  if (chartData.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">支出分析</CardTitle>
          <CardDescription className="text-purple-700">
            選択した期間のデータがありません
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
      <CardHeader>
        <CardTitle className="text-purple-900 flex items-center gap-2">
          🎯 支出分析
          <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
            Premium
          </span>
        </CardTitle>
        <CardDescription className="text-purple-700">
          {period === 'week' ? '過去1週間' : '過去1ヶ月'}のカテゴリ別支出分析
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 期間とチャートタイプの切り替え */}
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={period === 'week' ? 'default' : 'outline'}
              onClick={() => setPeriod('week')}
              className="h-8"
            >
              週次
            </Button>
            <Button
              size="sm"
              variant={period === 'month' ? 'default' : 'outline'}
              onClick={() => setPeriod('month')}
              className="h-8"
            >
              月次
            </Button>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={chartType === 'pie' ? 'default' : 'outline'}
              onClick={() => setChartType('pie')}
              className="h-8"
            >
              円グラフ
            </Button>
            <Button
              size="sm"
              variant={chartType === 'bar' ? 'default' : 'outline'}
              onClick={() => setChartType('bar')}
              className="h-8"
            >
              棒グラフ
            </Button>
          </div>
        </div>

        {/* チャート表示 */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`¥${value.toLocaleString()}`, '金額']} />
                <Legend />
              </PieChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value: number) => `¥${value.toLocaleString()}`} />
                <Tooltip formatter={(value) => [`¥${value.toLocaleString()}`, '金額']} />
                <Bar dataKey="value" fill="#8884d8">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-purple-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-900">
              ¥{chartData.reduce((total, item) => total + item.value, 0).toLocaleString()}
            </div>
            <div className="text-sm text-purple-600">総支出</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-900">
              {chartData.length}
            </div>
            <div className="text-sm text-purple-600">カテゴリ数</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
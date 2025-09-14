'use client';

import { useState, useEffect } from 'react';
import { UserButton } from '@clerk/nextjs';
import ExpenseForm from '@/components/forms/expense-form';
import ExpenseList from '@/components/expenses/expense-list';
import ExpenseSummary from '@/components/expenses/expense-summary';
import { ExpenseChart } from '@/components/analytics/expense-chart';
import { PlanProtect } from '@/components/auth/plan-protect';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [expenses, setExpenses] = useState([]);

  const handleExpenseSuccess = () => {
    // 支出が正常に記録されたら一覧を更新
    setRefreshTrigger(prev => prev + 1);
  };

  // 支出データを取得（プレミアム分析用）
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch('/api/expenses');
        if (response.ok) {
          const data = await response.json();
          setExpenses(data);
        }
      } catch (error) {
        console.error('支出データの取得に失敗しました:', error);
      }
    };

    fetchExpenses();
  }, [refreshTrigger]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Money Tracker
              </h1>
              <p className="text-gray-600">3つの機能だけ。続けられる家計簿</p>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 支出統計サマリー */}
          <div className="mb-6">
            <ExpenseSummary refreshTrigger={refreshTrigger} />
          </div>

          <div className="space-y-6">
            {/* プレミアム分析機能 */}
            <PlanProtect
              plan="premium"
              fallback={
                <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      📊 詳細な支出分析
                      <span className="text-sm bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                        Premium
                      </span>
                    </CardTitle>
                    <CardDescription>
                      プレミアムプランで詳細なグラフと分析機能をご利用いただけます
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">🎯</div>
                      <h3 className="text-xl font-semibold mb-2">プレミアム機能でより詳しく</h3>
                      <p className="text-gray-600 mb-6">
                        カテゴリ別グラフ、期間比較、トレンド分析などの高度な機能
                      </p>
                      <Link href="/pricing">
                        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                          プレミアムにアップグレード
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              }
            >
              <ExpenseChart expenses={expenses} />
            </PlanProtect>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 支出記録フォーム */}
              <div className="lg:col-span-1">
                <ExpenseForm onSuccess={handleExpenseSuccess} />
              </div>
              
              {/* 支出一覧 */}
              <div className="lg:col-span-2">
                <ExpenseList refreshTrigger={refreshTrigger} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
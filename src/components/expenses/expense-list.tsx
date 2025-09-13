'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Receipt, Calendar, Tag } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Database } from '@/types/database.types';

type Expense = Database['public']['Tables']['expenses']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row'] | null;
};

interface ExpenseListProps {
  refreshTrigger?: number;
}

export default function ExpenseList({ refreshTrigger }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExpenses();
  }, [refreshTrigger]);

  async function fetchExpenses() {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/expenses');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '支出データの取得に失敗しました');
      }

      const data = await response.json();
      setExpenses(data);

    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      setError(error instanceof Error ? error.message : '支出データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            支出一覧
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">読み込み中...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            支出一覧
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchExpenses}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              再読み込み
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          支出一覧
        </CardTitle>
        <CardDescription>
          {expenses.length > 0 
            ? `${expenses.length}件の支出が記録されています`
            : '支出がまだ記録されていません'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">支出がまだ記録されていません</p>
            <p className="text-sm text-gray-500">
              上のフォームから支出を記録してみましょう
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {/* カテゴリアイコン */}
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-medium"
                    style={{ backgroundColor: expense.categories?.color || '#6b7280' }}
                  >
                    {expense.categories?.icon || '💰'}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        ¥{expense.amount.toLocaleString()}
                      </span>
                      {expense.categories && (
                        <span className="flex items-center gap-1 text-sm text-gray-600">
                          <Tag className="h-3 w-3" />
                          {expense.categories.name}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {format(new Date(expense.expense_date), 'yyyy年M月d日(E)', { locale: ja })}
                      </span>
                      {expense.description && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-xs">
                            {expense.description}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right text-sm text-gray-500">
                  {format(new Date(expense.created_at), 'HH:mm', { locale: ja })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
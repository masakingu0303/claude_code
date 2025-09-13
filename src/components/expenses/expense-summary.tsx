'use client';

import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ja } from 'date-fns/locale';
import { TrendingUp, Calendar, Wallet } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Database } from '@/types/database.types';

type Expense = Database['public']['Tables']['expenses']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row'] | null;
};

interface ExpenseSummaryProps {
  refreshTrigger?: number;
}

export default function ExpenseSummary({ refreshTrigger }: ExpenseSummaryProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, [refreshTrigger]);

  async function fetchExpenses() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/expenses');
      
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }

      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // 今週の期間
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // 月曜日開始
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  // 今月の期間
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // 今週の支出計算
  const weeklyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.expense_date);
    return isWithinInterval(expenseDate, { start: weekStart, end: weekEnd });
  });

  // 今月の支出計算
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.expense_date);
    return isWithinInterval(expenseDate, { start: monthStart, end: monthEnd });
  });

  const weeklyTotal = weeklyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-24 mt-2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">今週の支出</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">¥{weeklyTotal.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {format(weekStart, 'M/d', { locale: ja })} - {format(weekEnd, 'M/d', { locale: ja })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {weeklyExpenses.length}件の支出
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">今月の支出</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">¥{monthlyTotal.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {format(monthStart, 'yyyy年M月', { locale: ja })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {monthlyExpenses.length}件の支出
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">総支出</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">¥{totalExpenses.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            全期間
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {expenses.length}件の支出
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
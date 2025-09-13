'use client';

import { useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import ExpenseForm from '@/components/forms/expense-form';
import ExpenseList from '@/components/expenses/expense-list';

export default function DashboardPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleExpenseSuccess = () => {
    // 支出が正常に記録されたら一覧を更新
    setRefreshTrigger(prev => prev + 1);
  };

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
      </main>
    </div>
  );
}
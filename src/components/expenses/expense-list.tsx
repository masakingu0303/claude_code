'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Receipt, Calendar, Tag, Edit, Trash2, MoreHorizontal } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import EditExpenseDialog from './edit-expense-dialog';
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

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

  async function handleDeleteExpense() {
    if (!expenseToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/expenses/${expenseToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '支出の削除に失敗しました');
      }

      // 成功時にリストから削除
      setExpenses(prev => prev.filter(expense => expense.id !== expenseToDelete.id));
      
      toast.success('支出を削除しました', {
        description: `¥${expenseToDelete.amount.toLocaleString()} の支出を削除しました。`,
      });

    } catch (error) {
      console.error('Failed to delete expense:', error);
      toast.error('支出の削除に失敗しました', {
        description: error instanceof Error ? error.message : 'もう一度お試しください。',
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  }

  function handleDeleteClick(expense: Expense) {
    setExpenseToDelete(expense);
    setDeleteDialogOpen(true);
  }

  function handleEditClick(expense: Expense) {
    setExpenseToEdit(expense);
    setEditDialogOpen(true);
  }

  function handleEditSuccess() {
    fetchExpenses(); // 編集後にリストを更新
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            支出一覧
          </CardTitle>
          <CardDescription>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border rounded-lg animate-pulse"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-3 bg-gray-200 rounded w-8"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
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
                <div className="flex items-center gap-3 flex-1">
                  {/* カテゴリアイコン */}
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-medium"
                    style={{ backgroundColor: expense.categories?.color || '#6b7280' }}
                  >
                    {expense.categories?.icon || '💰'}
                  </div>
                  
                  <div className="flex-1">
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

                <div className="flex items-center gap-2">
                  <div className="text-right text-sm text-gray-500 mr-2">
                    {format(new Date(expense.created_at), 'HH:mm', { locale: ja })}
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">メニューを開く</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
                      <DropdownMenuItem
                        onClick={() => handleEditClick(expense)}
                        className="flex items-center gap-2 hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4" />
                        編集
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(expense)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {/* 削除確認ダイアログ */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border border-gray-200 shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>支出を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              {expenseToDelete && (
                <>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        ¥{expenseToDelete.amount.toLocaleString()}
                      </span>
                      {expenseToDelete.categories && (
                        <span className="text-sm text-gray-600">
                          ({expenseToDelete.categories.name})
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(expenseToDelete.expense_date), 'yyyy年M月d日', { locale: ja })}
                      {expenseToDelete.description && (
                        <span> - {expenseToDelete.description}</span>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-sm">
                    この操作は取り消すことができません。
                  </p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteExpense}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? '削除中...' : '削除する'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 編集ダイアログ */}
      <EditExpenseDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        expense={expenseToEdit}
        onSuccess={handleEditSuccess}
      />
    </Card>
  );
}
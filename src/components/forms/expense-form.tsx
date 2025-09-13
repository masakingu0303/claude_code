'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { expenseFormInputSchema, type ExpenseFormInputData } from '@/lib/validations/expense';
import type { Category } from '@/types/database.types';

interface ExpenseFormProps {
  onSuccess?: () => void;
}

export default function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ExpenseFormInputData>({
    resolver: zodResolver(expenseFormInputSchema),
    defaultValues: {
      amount: '',
      category_id: '',
      description: '',
      expense_date: new Date(),
    },
  });

  // カテゴリデータを取得
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    }

    fetchCategories();
  }, []);

  async function onSubmit(data: ExpenseFormInputData) {
    setIsLoading(true);
    
    try {
      // APIルートに送信
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: data.amount,
          category_id: data.category_id,
          description: data.description,
          expense_date: data.expense_date,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '支出の記録に失敗しました');
      }

      const createdExpense = await response.json();
      
      // 成功時の処理
      form.reset({
        amount: '',
        category_id: '',
        description: '',
        expense_date: new Date(),
      });
      
      toast.success('支出を記録しました', {
        description: `¥${parseFloat(data.amount).toLocaleString()} の支出を記録しました。`,
      });
      
      onSuccess?.();
      
    } catch (error) {
      console.error('Failed to create expense:', error);
      toast.error('支出の記録に失敗しました', {
        description: error instanceof Error ? error.message : 'もう一度お試しください。',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          支出を記録
        </CardTitle>
        <CardDescription>
          金額とカテゴリを選択して支出を記録します
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 金額入力 */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>金額 *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        ¥
                      </span>
                      <Input
                        {...field}
                        type="number"
                        placeholder="1000"
                        className="pl-8"
                        step="0.01"
                        min="0.01"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* カテゴリ選択 */}
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>カテゴリ *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="カテゴリを選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id} className="hover:bg-gray-50">
                          <div className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 日付選択 */}
            <FormField
              control={form.control}
              name="expense_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>日付 *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="date"
                        value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                        onChange={(e) => {
                          const date = new Date(e.target.value);
                          field.onChange(date);
                        }}
                        className="pl-10"
                      />
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 説明（オプション） */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>説明（オプション）</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="ランチ代、電車代など"
                      maxLength={500}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 送信ボタン */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? '記録中...' : '支出を記録'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
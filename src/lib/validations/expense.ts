import { z } from 'zod';

// フォーム用のスキーマ（文字列として受け取る）
export const expenseFormInputSchema = z.object({
  amount: z
    .string()
    .min(1, '金額を入力してください')
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
      },
      '有効な金額を入力してください'
    ),
  
  category_id: z
    .string()
    .min(1, 'カテゴリを選択してください'),
  
  description: z
    .string()
    .max(500, '説明は500文字以内で入力してください')
    .optional(),
  
  expense_date: z
    .date({
      message: '有効な日付を入力してください'
    })
});

// API用のスキーマ（JSON経由で受け取る場合）
export const expenseApiSchema = z.object({
  amount: z
    .string()
    .min(1, '金額を入力してください')
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
      },
      '有効な金額を入力してください'
    ),
  
  category_id: z
    .string()
    .min(1, 'カテゴリを選択してください'),
  
  description: z
    .string()
    .max(500, '説明は500文字以内で入力してください')
    .optional(),
  
  expense_date: z
    .string()
    .refine(
      (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      '有効な日付を入力してください'
    )
}).transform((data) => ({
  ...data,
  amount: parseFloat(data.amount),
  expense_date: new Date(data.expense_date),
}));

// フォーム用のスキーマ（変換後の型）
export const expenseFormSchema = expenseFormInputSchema.transform((data) => ({
  ...data,
  amount: parseFloat(data.amount),
}));

export type ExpenseFormInputData = z.infer<typeof expenseFormInputSchema>;
export type ExpenseFormData = z.infer<typeof expenseFormSchema>;
export type ExpenseApiData = z.infer<typeof expenseApiSchema>;
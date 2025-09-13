import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { expenseFormSchema } from '@/lib/validations/expense';
import type { Database } from '@/types/database.types';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'サーバー設定エラー' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const validatedData = expenseFormSchema.parse(body);

    // Supabaseに支出データを保存
    const expenseData: Database['public']['Tables']['expenses']['Insert'] = {
      user_id: userId,
      amount: validatedData.amount,
      category_id: validatedData.category_id,
      description: validatedData.description || null,
      expense_date: validatedData.expense_date.toISOString().split('T')[0], // YYYY-MM-DD形式に変換
    };

    const { data, error } = await supabaseAdmin
      .from('expenses')
      .insert(expenseData as any)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'データベースエラーが発生しました' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'バリデーションエラー', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'サーバー設定エラー' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 支出データを取得（カテゴリ情報も含める）
    const { data, error } = await supabaseAdmin
      .from('expenses')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          icon,
          color
        )
      `)
      .eq('user_id', userId)
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'データベースエラーが発生しました' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
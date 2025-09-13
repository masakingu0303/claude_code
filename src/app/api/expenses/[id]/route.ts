import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { expenseApiSchema } from '@/lib/validations/expense';
import type { Database } from '@/types/database.types';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    
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
    const validatedData = expenseApiSchema.parse(body);

    // 支出データを更新（自分の支出のみ）
    const expenseData: Database['public']['Tables']['expenses']['Update'] = {
      amount: validatedData.amount,
      category_id: validatedData.category_id,
      description: validatedData.description || null,
      expense_date: validatedData.expense_date.toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await (supabaseAdmin as any)
      .from('expenses')
      .update(expenseData)
      .eq('id', id)
      .eq('user_id', userId) // 自分の支出のみ更新可能
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'データベースエラーが発生しました' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: '支出が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    
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

    // 支出データを削除（自分の支出のみ）
    const { data, error } = await (supabaseAdmin as any)
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId) // 自分の支出のみ削除可能
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'データベースエラーが発生しました' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: '支出が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: '支出を削除しました' });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
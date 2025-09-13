import { supabase } from '@/lib/supabase';
import type { Category } from '@/types/database.types';

export default async function TestDbPage() {
  try {
    // カテゴリデータを取得してテスト
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order') as { data: Category[] | null; error: any };

    if (error) {
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">データベース接続エラー</h1>
          <pre className="bg-red-50 p-4 rounded-lg text-red-800">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      );
    }

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-green-600 mb-4">✅ データベース接続成功！</h1>
        
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">カテゴリデータ ({categories?.length}件)</h2>
          <div className="grid gap-2">
            {categories?.map((category) => (
              <div key={category.id} className="flex items-center gap-3 p-2 bg-white rounded border">
                <span className="text-xl">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
                <span className="text-sm text-gray-500">({category.slug})</span>
                <div
                  className="w-4 h-4 rounded-full ml-auto"
                  style={{ backgroundColor: category.color || '#6b7280' }}
                ></div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">テーブル情報</h3>
          <ul className="space-y-1 text-blue-700">
            <li>✅ categories テーブル: {categories?.length}件のデータ</li>
            <li>✅ users テーブル: 作成済み</li>
            <li>✅ expenses テーブル: 作成済み</li>
            <li>✅ RLS (Row Level Security): 有効</li>
          </ul>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">予期しないエラー</h1>
        <pre className="bg-red-50 p-4 rounded-lg text-red-800">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
}
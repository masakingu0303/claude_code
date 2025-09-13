import ExpenseForm from '@/components/forms/expense-form';

export default function TestFormPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            支出記録フォーム テスト
          </h1>
          <p className="text-gray-600">
            フォームの動作をテストできます
          </p>
        </div>
        
        <ExpenseForm 
          onSuccess={() => {
            console.log('Form submitted successfully!');
          }}
        />
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
          <h3 className="font-semibold mb-2">テスト内容:</h3>
          <ul className="space-y-1">
            <li>✅ 金額入力（バリデーション付き）</li>
            <li>✅ カテゴリ選択（9種類固定）</li>
            <li>✅ 日付選択（デフォルト今日）</li>
            <li>✅ フォームバリデーション（Zod）</li>
            <li>✅ 成功/エラートースト</li>
            <li>✅ リアルタイムフィードバック</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
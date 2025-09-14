import Link from 'next/link';
import MainLayout from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { PricingTableWrapper } from '@/components/pricing/pricing-table-wrapper';

export default function PricingPage() {
  return (
    <MainLayout>
      <section className="py-16 bg-gradient-to-b from-indigo-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl animate-fade-in-up">
              料金プラン
            </h1>
            <p className="mt-4 text-xl text-gray-600 animate-fade-in-up animation-delay-200">
              シンプルな料金体系。必要な機能を選んでご利用ください。
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-12 max-w-4xl mx-auto">
            {/* 無料プラン */}
            <Card className="relative transform hover:scale-105 transition-all duration-300 hover:shadow-xl animate-fade-in-up animation-delay-400">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">無料プラン</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold">¥0</span>
                  <span className="text-xl text-gray-600 ml-2">/ 月</span>
                </div>
                <CardDescription className="mt-4 text-lg">
                  基本的な家計管理機能を無料でご利用いただけます
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>支出記録（無制限）</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>9つの固定カテゴリ</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>週次・月次の支出合計表示</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>支出履歴閲覧</span>
                  </div>
                </div>
                <div className="pt-6">
                  <Link href="/sign-up">
                    <Button className="w-full transform hover:scale-105 transition-transform duration-200" size="lg">
                      無料で始める
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* プレミアムプラン */}
            <Card className="relative border-indigo-200 shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-2xl animate-fade-in-up animation-delay-600">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium animate-pulse">
                  おすすめ
                </span>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">プレミアムプラン</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold">$10</span>
                  <span className="text-xl text-gray-600 ml-2">/ 月</span>
                </div>
                <CardDescription className="mt-4 text-lg">
                  高度な分析機能で詳細な家計管理が可能
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="font-medium">無料プランの全機能</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>日次・週次・月次の期間切り替え</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>過去データとの比較分析</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>カテゴリ別詳細グラフ</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>支出トレンドの可視化</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>プレミアム感のあるUI</span>
                  </div>
                </div>
                <div className="pt-6">
                  <Link href="/sign-up">
                    <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200" size="lg">
                      プレミアムを始める
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Clerk PricingTable */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                今すぐ始める
              </h2>
              <p className="text-xl text-gray-600">
                セキュアな決済でプレミアムプランにアップグレード
              </p>
            </div>
            <PricingTableWrapper />
          </div>

          {/* よくある質問 */}
          <div className="mt-20">
            <h2 className="text-center text-3xl font-bold text-gray-900 mb-12">
              よくある質問
            </h2>
            <div className="max-w-3xl mx-auto space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  無料プランでも十分使えますか？
                </h3>
                <p className="text-gray-600">
                  はい。無料プランでも支出記録、カテゴリ分け、基本的な集計機能をご利用いただけます。
                  多くのユーザー様が無料プランで満足してご利用いただいています。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  プレミアムプランはいつでも解約できますか？
                </h3>
                <p className="text-gray-600">
                  はい。いつでも解約可能です。解約後も無料プランの機能は引き続きご利用いただけます。
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  データの安全性は大丈夫ですか？
                </h3>
                <p className="text-gray-600">
                  すべてのデータは暗号化されて安全に保存されます。お客様のプライバシーと
                  データの安全性を最優先に考えています。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
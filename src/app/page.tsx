import Link from 'next/link';
import MainLayout from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, BarChart3, PieChart, Target } from 'lucide-react';

export default function HomePage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-indigo-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl animate-fade-in-up">
              <span className="text-indigo-600">3つの機能だけ</span>
              <br />
              続けられる家計簿
            </h1>
            <p className="mt-6 text-xl leading-8 text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              支出記録、カテゴリ分け、ダッシュボード表示。
              必要最小限の機能で、誰でも簡単に継続できる家計簿アプリです。
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 animate-fade-in-up animation-delay-400">
              <Link href="/sign-up">
                <Button size="lg" className="px-8 py-3 text-lg transform hover:scale-105 transition-transform duration-200">
                  無料で始める
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="px-8 py-3 text-lg transform hover:scale-105 transition-transform duration-200">
                  料金を見る
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              シンプルな3つの機能
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              複雑な機能は一切なし。必要な機能だけを厳選しました。
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <Card className="transform hover:-translate-y-2 transition-all duration-300 hover:shadow-xl animate-fade-in-up animation-delay-600">
              <CardHeader className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 transform transition-transform duration-300 group-hover:scale-110">
                  <Wallet className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle className="mt-4">機能1: 支出記録</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  金額を入力、カテゴリを選択、記録ボタンを押すだけ。
                  たった3ステップで支出記録が完了します。
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="transform hover:-translate-y-2 transition-all duration-300 hover:shadow-xl animate-fade-in-up animation-delay-700">
              <CardHeader className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 transform transition-transform duration-300 group-hover:scale-110">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="mt-4">機能2: カテゴリ分け</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  食費、日用品、交通費など9つの固定カテゴリ。
                  迷わずに分類できます。
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="transform hover:-translate-y-2 transition-all duration-300 hover:shadow-xl animate-fade-in-up animation-delay-800">
              <CardHeader className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 transform transition-transform duration-300 group-hover:scale-110">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="mt-4">機能3: ダッシュボード</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  今週・今月の支出合計を一目で確認。
                  プレミアムプランでは詳細な分析も可能です。
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              今すぐ家計管理を始めませんか？
            </h2>
            <p className="mt-4 text-xl text-indigo-200">
              無料プランでも十分な機能をご利用いただけます
            </p>
            <div className="mt-8">
              <Link href="/sign-up">
                <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
                  無料で始める
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

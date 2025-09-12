# Clerk認証・課金システム完全ガイド - Next.js/TailwindCSS実装
 
このガイドは、Clerk を使った認証と課金システムを Next.js + TailwindCSS プロジェクトに実装するための完全なナレッジです。初心者でも理解できるように、実装例とともに詳しく解説します。
 
## 目次
1. [概要](#概要)
2. [事前準備](#事前準備)
3. [Clerk 認証の実装](#clerk-認証の実装)
4. [Clerk Billing 課金システムの実装](#clerk-billing-課金システムの実装)
5. [アクセス制御の実装](#アクセス制御の実装)
6. [料金ページの実装](#料金ページの実装)
7. [実装のベストプラクティス](#実装のベストプラクティス)
8. [トラブルシューティング](#トラブルシューティング)
 
## 概要
 
### システム構成
```
認証: Clerk
課金: Clerk Billing (Stripe ベース)
データベース: Supabase (オプション)
フレームワーク: Next.js 15 (App Router)
スタイリング: TailwindCSS
```
 
### 主な機能
- ユーザー認証（サインアップ/サインイン）
- サブスクリプション管理
- プラン別アクセス制御
- 料金表示・決済
 
## 事前準備
 
### 1. Clerk アカウントの作成
1. [Clerk](https://clerk.com) でアカウントを作成
2. 新しいアプリケーションを作成
3. Billing を有効化（Production環境で必要）
4. プラン定義（Clerk Dashboard で設定）
 
### 2. 必要なパッケージのインストール
```bash
npm install @clerk/nextjs @clerk/themes
```
 
**注意**: `@clerk/billing` というパッケージは存在しません。Clerk BillingはClerkダッシュボード上で設定し、APIを通じて利用します。
 
### 3. 環境変数の設定
`.env.local` に以下を設定：
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
CLERK_SECRET_KEY=sk_xxx
 
# カスタム認証ページURL
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
 
# 認証後のリダイレクト先
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```
 
## Clerk 認証の実装
 
### 1. Provider の設定
`app/providers.tsx` を作成：
```tsx
'use client'
 
import { ClerkProvider } from '@clerk/nextjs'
import { jaJP } from '@clerk/localizations'
 
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  )
}
```
 
`app/layout.tsx` で Provider をラップ：
```tsx
import { Providers } from './providers'
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```
 
### 2. Middleware の設定
`middleware.ts` を作成：
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
 
// 保護したいルートを定義
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/protected(.*)',
])
 
export default clerkMiddleware(async (auth, req) => {
  // 保護されたルートへのアクセス時は認証を要求
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})
 
export const config = {
  matcher: [
    '/((?!.*\\..*|_next).*)', // 静的ファイル以外
    '/',
    '/(api|trpc)(.*)', // API ルート
  ],
}
```
 
### 3. カスタム認証ページの作成
`app/sign-in/[[...sign-in]]/page.tsx`:
```tsx
import dynamic from 'next/dynamic'
import Link from 'next/link'
 
// パフォーマンス最適化のため動的インポート
const DynamicSignIn = dynamic(
  () => import('@clerk/nextjs').then(mod => mod.SignIn),
  {
    ssr: false,
    loading: () => <div>読み込み中...</div>
  }
)
 
export default function SignInPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-md">
        <h1 className="mb-8 text-center text-3xl font-bold">
          サインイン
        </h1>
 
        <DynamicSignIn />
 
        <p className="mt-4 text-center text-sm">
          アカウントをお持ちでない方は{' '}
          <Link href="/sign-up" className="text-blue-600 hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  )
}
```
 
`app/sign-up/[[...sign-up]]/page.tsx` も同様に作成。
 
### 4. ユーザー情報の表示
`components/UserMenu.tsx`:
```tsx
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
 
export function UserMenu() {
  return (
    <>
      <SignedIn>
        {/* ログイン済みユーザー向け */}
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
 
      <SignedOut>
        {/* 未ログインユーザー向け */}
        <Link href="/sign-in">
          <button className="btn btn-primary">
            サインイン
          </button>
        </Link>
      </SignedOut>
    </>
  )
}
```
 
## Clerk Billing 課金システムの実装
 
### 1. Clerk Dashboard でのプラン設定
 
#### 重要: 開発前の準備
 
**Clerkダッシュボードでサブスクリプションプランを作成する必要があります**
 
1. [Clerk Dashboard](https://dashboard.clerk.com) > Billing セクションへ移動
2. 「Create a product」または「Add subscription」をクリック
3. プラン情報を入力：
   - **Product name**: 表示名（例: Premium Plan）
   - **Product slug**: `premium`（コードで使用する識別子）
   - **Price**: 金額設定（例: $10/月 または ¥1,000/月）
   - **Billing period**: Monthly（月額）
4. 保存してプランを有効化
 
**開発チームへの共有事項**:
- プランのスラグ（slug）を開発者に伝える
- 例: `premium` というスラグで作成した場合、コード内で `user.subscription?.plan === 'premium'` として使用
 
### 2. プラン定数の定義
`lib/constants.ts`:
```typescript
export const PLAN_SLUG = {
  STARTER: 'starter',
  BASIC: 'basic',
  PREMIUM: 'premium',
} as const
 
export const PLAN_FEATURES = {
  [PLAN_SLUG.STARTER]: {
    name: 'スタータープラン',
    price: '¥980',
    features: [
      'ダッシュボード機能',
      '基本的な分析',
      'メールサポート',
    ],
  },
  [PLAN_SLUG.BASIC]: {
    name: 'ベーシックプラン',
    price: '¥1,980',
    features: [
      'スタータープランの全機能',
      '高度な分析',
      'APIアクセス',
      '優先サポート',
    ],
  },
  [PLAN_SLUG.PREMIUM]: {
    name: 'プレミアムプラン',
    price: '¥3,980',
    features: [
      'ベーシックプランの全機能',
      '無制限アクセス',
      'カスタマイズ機能',
      '専任サポート',
    ],
  },
}
```
 
### 3. PricingTable コンポーネントの実装
`components/pricing/DynamicPricingTable.tsx`:
```tsx
'use client'
 
import dynamic from 'next/dynamic'
 
// Clerk の PricingTable を動的インポート
const PricingTable = dynamic(
  () => import('@clerk/nextjs').then(mod => mod.PricingTable),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse">
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    ),
  }
)
 
export function DynamicPricingTable() {
  return <PricingTable />
}
```
 
### 4. ユーザーのプラン情報取得
 
#### 重要: Clerk Billingでのプラン確認方法
 
Clerk Billingを使用する場合、`has()`関数または`Protect`コンポーネントを使用してプラン情報を確認します。
 
**注意**: `publicMetadata`や`privateMetadata`にはプラン情報は保存されません。必ず`has()`関数を使用してください。
 
**サーバーサイドでの実装**:
```typescript
import { auth } from '@clerk/nextjs/server'
 
export async function getUserPlan() {
  const { has } = await auth()
 
  // has関数でプランをチェック
  if (has({ plan: 'premium' })) {
    return 'premium'
  }
  if (has({ plan: 'basic' })) {
    return 'basic'
  }
 
  return 'free' // サブスクリプションなし
}
 
// API Routeでの使用例
export async function GET() {
  const { has } = await auth()
 
  if (!has({ plan: 'premium' })) {
    return new Response('Premium plan required', { status: 403 })
  }
 
  // プレミアム機能の処理
}
```
 
**クライアントサイドでの実装**:
```typescript
'use client'
import { useAuth } from '@clerk/nextjs'
 
export function useUserPlan() {
  const { has, isLoaded } = useAuth()
 
  if (!isLoaded || !has) {
    return { loading: true, plan: null }
  }
 
  // プランの確認
  const plan = has({ plan: 'premium' }) ? 'premium' :
               has({ plan: 'basic' }) ? 'basic' :
               'free'
 
  return { loading: false, plan }
}
 
// コンポーネントでの使用
export function PlanBadge() {
  const { loading, plan } = useUserPlan()
 
  if (loading) return <span>Loading...</span>
 
  return (
    <span className="badge">
      {plan === 'premium' ? 'プレミアム' :
       plan === 'basic' ? 'ベーシック' :
       '無料プラン'}
    </span>
  )
}
```
 
## アクセス制御の実装
 
### 1. PlanProtect コンポーネントの作成
 
**推奨実装パターン**: Clerkの`Protect`コンポーネントを直接使用する方法
 
`components/ClerkPlanProtect.tsx`:
```tsx
"use client"
 
import { Protect } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"
import Link from "next/link"
 
interface ClerkPlanProtectProps {
  children: React.ReactNode
  requiredPlan?: string
}
 
export function ClerkPlanProtect({
  children,
  requiredPlan = 'premium'
}: ClerkPlanProtectProps) {
  return (
    <Protect
      plan={requiredPlan}
      fallback={
        <Card className="shadow-md border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-600">
              <Lock className="h-5 w-5" />
              プレミアム機能
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              この機能はプレミアムプランでご利用いただけます。
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-semibold text-blue-900 mb-2">
                プレミアムプランの特典
              </p>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• カテゴリ別の支出をグラフで表示</li>
                <li>• 週次・月次の詳細分析</li>
                <li>• 支出傾向の可視化</li>
              </ul>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 mb-2">
                月額 1,000円
              </p>
              <Button asChild size="lg" className="w-full">
                <Link href="/pricing">
                  プレミアムプランにアップグレード
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      }
    >
      {children}
    </Protect>
  )
}
```
 
**代替実装パターン**: `useAuth`フックを使用する方法（`Protect`コンポーネントが動作しない場合）
 
`components/PlanProtect.tsx`:
```tsx
"use client"
 
import { useAuth } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"
import Link from "next/link"
 
interface PlanProtectProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requiredPlan?: 'premium'
}
 
export function PlanProtect({
  children,
  fallback,
  requiredPlan = 'premium'
}: PlanProtectProps) {
  const { has, isLoaded } = useAuth()
 
  // 認証情報が読み込まれるまで待機
  if (!isLoaded || !has) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }
 
  // has()関数を使ってプランをチェック
  const hasAccess = has({ plan: requiredPlan })
 
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }
 
    return (
      <Card className="shadow-md border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-600">
            <Lock className="h-5 w-5" />
            プレミアム機能
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            この機能はプレミアムプランでご利用いただけます。
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="font-semibold text-blue-900 mb-2">
              プレミアムプランの特典
            </p>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• カテゴリ別の支出をグラフで表示</li>
              <li>• 週次・月次の詳細分析</li>
              <li>• 支出傾向の可視化</li>
            </ul>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 mb-2">
              月額 1,000円
            </p>
            <Button asChild size="lg" className="w-full">
              <Link href="/pricing">
                プレミアムプランにアップグレード
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
 
  return <>{children}</>
}
```
 
### 2. アクセス制御ロジック
`lib/access-control.ts`:
```typescript
// プラン階層の定義
const PLAN_HIERARCHY = {
  premium: 3,
  basic: 2,
  starter: 1,
  free: 0,
}
 
// プランによるアクセス可否を判定
export function canAccessContent(
  userPlan: string | null,
  requiredPlan: string
): boolean {
  const userLevel = PLAN_HIERARCHY[userPlan || 'free'] || 0
  const requiredLevel = PLAN_HIERARCHY[requiredPlan] || 0
 
  return userLevel >= requiredLevel
}
 
// 機能別のアクセス制御
export function canViewDetailedStats(plan: string | null): boolean {
  return canAccessContent(plan, 'starter')
}
 
export function canUseAPIAccess(plan: string | null): boolean {
  return canAccessContent(plan, 'basic')
}
 
export function canUseCustomFeatures(plan: string | null): boolean {
  return canAccessContent(plan, 'premium')
}
```
 
### 3. 使用例
```tsx
// Protectコンポーネントを使用（推奨）
<ClerkPlanProtect requiredPlan="premium">
  <AdvancedFeatureComponent />
</ClerkPlanProtect>
 
// useAuthフックを使用した条件付きレンダリング
const { has } = useAuth()
if (has && has({ plan: 'premium' })) {
  return <DetailedStatsComponent />
}
 
// API ルートでの保護
import { auth } from '@clerk/nextjs/server'
 
export async function GET() {
  const { has } = await auth()
 
  if (!has({ plan: 'premium' })) {
    return new Response('Premium plan required', { status: 403 })
  }
 
  // プレミアム機能の処理
}
```
 
## 料金ページの実装
 
### 1. 料金ページの作成
`app/pricing/page.tsx`:
```tsx
import { DynamicPricingTable } from '@/components/pricing/DynamicPricingTable'
import { PlanComparison } from '@/components/pricing/PlanComparison'
import { PricingFAQ } from '@/components/pricing/PricingFAQ'
 
export const metadata = {
  title: '料金プラン',
  description: 'シンプルで分かりやすい料金体系',
}
 
export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* ヒーローセクション */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          シンプルな料金プラン
        </h1>
        <p className="text-xl text-gray-600">
          あなたのニーズに合わせて選べる3つのプラン
        </p>
      </div>
 
      {/* プラン比較 */}
      <PlanComparison />
 
      {/* Clerk PricingTable */}
      <div className="my-16">
        <DynamicPricingTable />
      </div>
 
      {/* FAQ */}
      <PricingFAQ />
    </div>
  )
}
```
 
### 2. プラン比較コンポーネント
`components/pricing/PlanComparison.tsx`:
```tsx
import { PLAN_FEATURES, PLAN_SLUG } from '@/lib/constants'
import { Check } from 'lucide-react'
 
export function PlanComparison() {
  const plans = [
    { slug: PLAN_SLUG.STARTER, ...PLAN_FEATURES[PLAN_SLUG.STARTER] },
    {
      slug: PLAN_SLUG.BASIC,
      ...PLAN_FEATURES[PLAN_SLUG.BASIC],
      recommended: true
    },
    { slug: PLAN_SLUG.PREMIUM, ...PLAN_FEATURES[PLAN_SLUG.PREMIUM] },
  ]
 
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {plans.map((plan) => (
        <div
          key={plan.slug}
          className={`
            rounded-lg border p-8
            ${plan.recommended
              ? 'border-blue-500 shadow-lg scale-105'
              : 'border-gray-300'
            }
          `}
        >
          {plan.recommended && (
            <div className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full inline-block mb-4">
              おすすめ
            </div>
          )}
 
          <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
          <p className="text-3xl font-bold mb-6">
            {plan.price}
            <span className="text-sm font-normal">/月</span>
          </p>
 
          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
```
 
## ClerkのUserButtonをサイト内で表示する方法
 
### 概要
ClerkのUserButtonコンポーネントをサイト内で表示し、外部ページへのリダイレクトなしでアカウント管理機能を提供する方法です。
専用のユーザー設定ページを作り、そちらへリンクさせるようにします。
ヘッダーにユーザーボタンを配置し、サイト内のユーザー設定ページへリンクさせるのが基本です。
 
できる限り、こちらの方式を採用してください。
 
### 実装方法
 
#### 1. UserButtonの基本実装
```tsx
import { UserButton } from '@clerk/nextjs'
 
<UserButton
  afterSignOutUrl="/"
/>
```
 
**重要**: `userProfileMode`や`userProfileUrl`などのプロパティは設定しない。これらを設定すると外部ページにリダイレクトされます。
 
#### 2. z-index問題の解決
Clerkのモーダルが他の要素の下に隠れる場合は、グローバルCSSに以下を追加：
 
```css
/* Clerkコンポーネントのz-index調整 */
.cl-userButtonPopoverCard,
.cl-userButtonPopoverActionButton,
.cl-profileSectionPrimaryButton,
.cl-userProfile,
.cl-userProfilePopoverCard,
.cl-modal,
.cl-modalBackdrop,
.cl-modalContent {
  z-index: 9999 !important;
}
```
 
### UserButtonで利用できる機能
クリックすると以下のメニューがドロップダウンで表示されます。
 
- **アカウントの管理** - プロフィール編集、メール管理、パスワード変更などをモーダルで表示
- **サインアウト** - 現在のアカウントからサインアウト
- **アカウントの追加** - 別のアカウントでサインイン（マルチアカウント対応時）
 
## 実装のベストプラクティス
 
### 1. パフォーマンス最適化
- Clerk コンポーネントは動的インポートでバンドルサイズを削減
- SSR を無効化してハイドレーションエラーを防止
- ローディング状態を適切に表示
 
### 2. セキュリティ
- サーバーサイドで必ず認証チェックを実施
- 環境変数は適切に管理（NEXT_PUBLIC_ プレフィックスに注意）
- プラン情報の改ざんを防ぐため、サーバーサイドで検証
 
### 3. UX の考慮
- アップグレードへの導線を明確に
- プラン制限時は理由と解決方法を提示
- ローディング中はスケルトンUIを表示
 
### 4. エラーハンドリング
```typescript
// API ルートでのエラーハンドリング例
try {
  const user = await currentUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }
 
  const plan = user.publicMetadata?.plan
  if (!canAccessFeature(plan, requiredPlan)) {
    return new Response(
      JSON.stringify({
        error: 'Upgrade required',
        requiredPlan,
        upgradeUrl: '/pricing'
      }),
      { status: 403 }
    )
  }
 
  // 処理実行
} catch (error) {
  console.error('API Error:', error)
  return new Response('Internal Server Error', { status: 500 })
}
```
 
### 5. テスト環境での考慮
```typescript
// 開発環境でのテスト方法
import { auth } from '@clerk/nextjs/server'
 
export async function getUserPlan() {
  const { has } = await auth()
 
  // 開発環境でのテスト
  // 1. Clerk DashboardでテストユーザーにプランをアサインするQAT
  // 2. Stripeのテストモードを使用して実際にサブスクリプションを作成
 
  if (has({ plan: 'premium' })) {
    return 'premium'
  }
  if (has({ plan: 'basic' })) {
    return 'basic'
  }
 
  return 'free'
}
 
// 開発環境向けのテストコンポーネント
export function TestPlanSwitcher() {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
 
  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 p-4 rounded">
      <p className="text-sm font-bold mb-2">開発環境テスト用</p>
      <p className="text-xs">プランを変更するには:</p>
      <ol className="text-xs mt-1">
        <li>1. Clerk Dashboardにログイン</li>
        <li>2. テストユーザーを選択</li>
        <li>3. Subscriptionsタブでプランを変更</li>
      </ol>
    </div>
  )
}
```
 
## トラブルシューティング
 
### よくある問題と解決方法
 
#### プラン情報が取得できない（has()関数が正しく動作しない）
**問題**: `has({ plan: 'premium' })`が常にfalseを返す
 
**原因**:
1. Clerk Dashboardでプランが正しく設定されていない
2. プランのスラグが一致していない
3. サブスクリプションがアクティブでない
4. **重要**: `has()`関数は一部の環境で使用できない場合がある
 
**解決方法**:
 
##### 方法1: Protectコンポーネントを使用（推奨）
```typescript
import { Protect } from "@clerk/nextjs"
 
// ✅ 最も確実な方法
<Protect plan="premium">
  <PremiumContent />
</Protect>
 
// フォールバックUIを指定
<Protect
  plan="premium"
  fallback={<UpgradePrompt />}
>
  <PremiumContent />
</Protect>
```
 
##### 方法2: has()関数を使用
```typescript
// サーバーサイド
const { has } = await auth()
if (has({ plan: 'premium' })) {
  // プレミアム機能
}
 
// クライアントサイド（useAuthフックから取得）
const { has } = useAuth()
if (has && has({ plan: 'premium' })) {
  // プレミアム機能
}
```
 
**注意**: `has()`関数が使えない場合は、Protectコンポーネントを使用してください。
 
**学び**: 公式ドキュメントの例が必ずしも全ての環境で動作するわけではない。Protectコンポーネントが最も確実。
 
**デバッグ方法**:
```typescript
// クライアントサイド
const { has, isLoaded } = useAuth()
console.log('Auth loaded:', isLoaded)
console.log('Has function:', typeof has)
console.log('Has premium:', has && has({ plan: 'premium' }))
 
// サーバーサイド
const { has, userId } = await auth()
console.log('User ID:', userId)
console.log('Has premium:', has({ plan: 'premium' }))
```
 
#### npm install でのエラー
**問題**: `@clerk/billing` パッケージが見つからない
```bash
npm ERR! 404 Not Found - GET https://registry.npmjs.org/@clerk/billing - Not found
```
 
**解決**: Clerk Billingは標準のnpmパッケージではなく、Clerkダッシュボードでの設定が必要です。
1. 通常の `@clerk/nextjs` パッケージのみをインストール
2. Clerk BillingはClerkダッシュボード上で有効化
3. APIを通じてStripe連携を設定
 
#### 1. "Clerk: auth() was called but Clerk can't detect usage of clerkMiddleware()"
**原因**: Middleware が正しく設定されていない
**解決方法**:
- `middleware.ts` が root ディレクトリにあることを確認
- config.matcher が正しく設定されているか確認
 
#### 2. PricingTable が表示されない
**原因**: Billing が有効化されていない
**エラーメッセージ**:
```
The <PricingTable/> component cannot be rendered when billing is disabled.
```
 
**解決方法**:
1. [Clerk Dashboard](https://dashboard.clerk.com) にログイン
2. 該当するアプリケーションを選択
3. 左メニューから「Monetization」→「Settings」へ移動
4. 「Enable billing」をクリック
5. Stripeアカウントを接続（まだの場合）
6. Billing が有効になったことを確認
 
**注意事項**:
- Development環境でもBillingの有効化が必要
- Stripeアカウントとの連携が必須
- プランを作成済みでもBillingが無効だとPricingTableは表示されない
**解決方法**:
- Clerk Dashboard で Billing を有効化
- Production 環境の API キーを使用
- 開発環境では Test mode を有効化
 
#### 3. ハイドレーションエラー
**原因**: サーバーとクライアントで異なる内容がレンダリング
**解決方法**:
- Clerk コンポーネントは `ssr: false` で動的インポート
- 条件付きレンダリングには `SignedIn`/`SignedOut` を使用
 
#### 4. プラン情報が取得できない
**原因**: `publicMetadata`や`privateMetadata`を使用している（古い実装パターン）
**解決方法**:
- `has()`関数を使用する新しい実装パターンに移行
- `user.publicMetadata.plan`ではなく`has({ plan: 'premium' })`を使用
- Clerk Billingではメタデータにプラン情報は保存されない
 
### デバッグ方法
```typescript
// Clerk のデバッグ情報を出力
import { auth } from '@clerk/nextjs/server'
import { currentUser } from '@clerk/nextjs/server'
 
export async function debugAuth() {
  const { userId, sessionId, orgId, has } = await auth()
  console.log('Auth Debug:', { userId, sessionId, orgId })
 
  // プラン情報のデバッグ
  console.log('Has premium plan:', has({ plan: 'premium' }))
  console.log('Has basic plan:', has({ plan: 'basic' }))
 
  // ユーザー情報のデバッグ（メタデータにはプラン情報は含まれない）
  const user = await currentUser()
  console.log('User ID:', user?.id)
  console.log('User Email:', user?.primaryEmailAddress?.emailAddress)
}
 
// クライアントサイドでのデバッグコンポーネント
export function DebugPlanInfo() {
  const { has, isLoaded } = useAuth()
  const { user } = useUser()
 
  if (!isLoaded) return <div>Loading...</div>
 
  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3>Debug Info:</h3>
      <pre>
        {JSON.stringify({
          hasFunction: typeof has,
          hasPremium: has && has({ plan: 'premium' }),
          userId: user?.id,
          // メタデータは参考程度に（プラン情報は含まれない）
          publicMetadata: user?.publicMetadata,
        }, null, 2)}
      </pre>
    </div>
  )
}
```
 
## Supabaseとの統合について
 
ClerkとSupabaseを組み合わせる場合、以下の点に注意が必要です：
 
### RLS（Row Level Security）の課題
 
SupabaseのRLSは`auth.uid()`を使用しますが、これはSupabase認証前提です。Clerkを使用する場合は特別な対応が必要です。
 
### 推奨される統合方法
 
1. **カスタムヘッダー方式**（推奨）
   - Supabaseクライアントにカスタムヘッダーを追加
   - データベース側でヘッダーからユーザーIDを取得
   - RLSを有効化したままセキュアに運用可能
 
2. **API Routes経由でアクセス**
   - すべてのデータベース操作をAPI Routes経由で行う
   - Clerkでサーバーサイド認証
   - Service Roleキーまたはカスタムヘッダー方式を使用
 
詳細な実装方法は `clerk-supabase-integration-guide.md` を参照してください。
 
## まとめ
 
このガイドでは、Clerk を使った認証・課金システムの実装方法を解説しました。主なポイント：
 
1. **Clerk の設定は簡単** - 環境変数とMiddlewareの設定だけで基本的な認証が動作
2. **Billing 機能で課金も簡単** - PricingTable コンポーネントを配置するだけ（Stripe連携が必要）
3. **プラン別アクセス制御** - PlanProtect コンポーネントで直感的に実装
4. **パフォーマンス重視** - 動的インポートとSSR無効化で最適化
5. **Supabaseとの統合** - カスタムヘッダー方式でRLSに対応可能
 
この実装パターンを参考に、あなたのプロジェクトでも Clerk を活用した認証・課金システムを構築してください。
 
## 参考リンク
- [Clerk 公式ドキュメント](https://clerk.com/docs)
- [Clerk Next.js クイックスタート](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Billing ドキュメント](https://clerk.com/docs/monetization/overview)
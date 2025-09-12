# Clerk と Supabase の RLS 統合ガイド
 
## 概要
 
ClerkとSupabaseを組み合わせる際の最大の課題は、Row Level Security (RLS) の統合です。このガイドでは、開発環境と本番環境の両方で動作する実装方法を詳しく説明します。
 
## 前提条件と推奨方法
 
### 開発環境による実装方法の選択
 
**Supabase Docker CLI（ローカル環境）を使用している場合**
- ✅ **カスタムヘッダー方式（API Routes経由）を使用**
- ❌ 公式推奨のJWT方式は使用不可（サードパーティ認証の設定画面がないため）
 
**Supabase Cloud を使用している場合**
- ✅ カスタムヘッダー方式（API Routes経由）- **推奨**
- ✅ 公式推奨のJWT方式も使用可能
 
**基本的には、どちらの環境でも動作するカスタムヘッダー方式（API Routes経由）を推奨します。**
 
## 問題の本質
 
- SupabaseのRLSは`auth.uid()`を使用（Supabase認証前提）
- Clerkは独自の認証システム
- 両者のユーザーIDは互換性がない（ClerkはString型、SupabaseはUUID型）
- デフォルトではRLSが正しく動作しない
 
## 推奨実装方法（カスタムヘッダー方式）
 
この方法は**Supabase Docker CLIとSupabase Cloudの両方で動作**し、セキュリティも確保できる最も実用的な方法です。
 
### カスタムヘッダーを使用したRLS実装
 
#### 1. Supabase認証クライアントの作成
 
```typescript
// src/lib/supabase-auth.ts
import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'
 
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
 
export async function createAuthenticatedSupabaseClient() {
  const { userId } = await auth()
 
  if (!userId) {
    throw new Error('Unauthorized')
  }
 
  // カスタムヘッダーでClerkのユーザーIDを送信
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        'x-clerk-user-id': userId,
      },
    },
  })
 
  return { supabase, userId }
}
```
 
#### 2. データベースでカスタム関数を作成
 
```sql
-- ClerkのユーザーIDを取得する関数
CREATE OR REPLACE FUNCTION get_clerk_user_id()
RETURNS TEXT AS $$
BEGIN
  -- リクエストヘッダーからClerkのユーザーIDを取得
  RETURN current_setting('request.headers', true)::json->>'x-clerk-user-id';
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
 
#### 3. RLSポリシーの設定
 
```sql
-- RLSを有効化
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
 
-- 閲覧ポリシー
CREATE POLICY "Users can view their own expenses"
ON expenses FOR SELECT
USING (
  user_id = get_clerk_user_id()
  OR
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);
 
-- 作成ポリシー
CREATE POLICY "Users can insert their own expenses"
ON expenses FOR INSERT
WITH CHECK (
  user_id = get_clerk_user_id()
  OR
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);
 
-- 更新ポリシー
CREATE POLICY "Users can update their own expenses"
ON expenses FOR UPDATE
USING (
  user_id = get_clerk_user_id()
  OR
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);
 
-- 削除ポリシー
CREATE POLICY "Users can delete their own expenses"
ON expenses FOR DELETE
USING (
  user_id = get_clerk_user_id()
  OR
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);
```
 
#### 4. API Routeでの使用例
 
```typescript
// src/app/api/expenses/route.ts
import { NextResponse } from 'next/server'
import { createAuthenticatedSupabaseClient } from '@/lib/supabase-auth'
 
export async function GET() {
  try {
    // RLS対応のSupabaseクライアントを使用
    const { supabase, userId } = await createAuthenticatedSupabaseClient()
 
    // RLSによって自動的にユーザーの支出のみが返される
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false })
 
    if (error) throw error
 
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}
```
 
### メリット
 
- ✅ **環境を問わず動作**: Docker CLIでもSupabase Cloudでも同じコードで動作
- ✅ **セキュア**: すべてのデータアクセスがサーバーサイドで制御される
- ✅ **シンプル**: 追加の設定が不要
- ✅ **デバッグが容易**: ヘッダーの内容を確認しやすい
 
## 公式推奨の実装方法（Supabase Cloud限定）
 
**注意**: この方法は**Supabase Cloudでのみ動作**します。Supabase Docker CLIでは使用できません。
 
### Clerk JWTを使用したRLS実装
 
Clerkは、Supabaseのサポートされたサードパーティ認証プロバイダーとして、JWKSエンドポイントを通じてJWTの検証を行います。
 
#### 1. Clerk DashboardでSupabase統合を有効化
 
1. [Clerk Dashboard](https://dashboard.clerk.com/setup/supabase)にアクセス
2. Supabase統合を有効化
3. すべてのClerkが作成するJWTに`"role": "authenticated"`クレームが含まれるようになります
 
#### 2. SupabaseでClerkを認証プロバイダーとして追加
 
1. Supabase Dashboardで「Authentication > Sign In/Up > Third Party Auth」に移動
2. ClerkドメインをJWKSエンドポイントとして設定
 
#### 3. Supabaseクライアントの作成
 
```typescript
// src/lib/supabase-client.ts
import { createClient } from '@supabase/supabase-js'
import { useSession } from '@clerk/clerk-react'
 
export function useSupabaseClient() {
  const { session } = useSession()
 
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      accessToken: async () => await session?.getToken({ template: 'supabase' }),
    }
  )
 
  return supabase
}
```
 
#### 4. RLSポリシーの設定
 
Clerkではauth.uid()関数の代わりに、auth.jwt()関数を使用してJWT内のsubクレームにアクセスします：
 
```sql
-- 閲覧ポリシー
CREATE POLICY "Users can view their own expenses"
ON expenses FOR SELECT
USING (auth.jwt()->>'sub' = user_id);
```
 
### メリット
 
- ✅ クライアントサイドから直接Supabaseにアクセス可能
- ✅ Clerkの公式サポートあり
 
### デメリット
 
- ❌ Supabase Docker CLIでは動作しない
- ❌ JWT Templateの設定が必要
- ❌ 環境によって実装を変える必要がある
 
## Service Roleキーを使用する方法（非推奨）
 
RLSを無効化し、アプリケーション層でセキュリティを管理する方法です。セキュリティリスクがあるため、特別な理由がない限り使用を避けてください。
 
## 重要な注意点とハマりポイント
 
### 1. ClerkのユーザーIDフォーマット
 
**重要**: ClerkはString型のIDを使用し、SupabaseはUUID型を使用します。
 
```sql
-- ❌ 間違い: UUID型を使用
CREATE TABLE expenses (
  user_id UUID NOT NULL
);
 
-- ✅ 正解: TEXT型を使用
CREATE TABLE expenses (
  user_id TEXT NOT NULL
);
```
 
### 2. 環境による実装の使い分け
 
```typescript
// 環境変数で判断する例
const isLocal = process.env.SUPABASE_URL?.includes('localhost') ||
                process.env.SUPABASE_URL?.includes('127.0.0.1')
 
if (isLocal || process.env.USE_API_ROUTES === 'true') {
  // カスタムヘッダー方式（推奨）
} else {
  // Supabase Cloudで公式JWT方式を使いたい場合
}
```
 
## 実装パターンのまとめ
 
### パターン1: カスタムヘッダー方式（理論的には正しいが問題あり）
 
```typescript
// ❌ この実装は理論的には正しいが、実際には動作しないことがある
export async function createAuthenticatedSupabaseClient() {
  const { userId } = await auth()
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        'x-clerk-user-id': userId,
      },
    },
  })
  
  return { supabase, userId }
}
```
 
### パターン2: Service Roleキー使用（推奨）
 
```typescript
// ✅ 確実に動作する実装
export async function GET() {
  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const supabase = createAdminSupabaseClient() // Service Roleキー使用
  
  // ユーザーIDでフィルタ（セキュリティを保証）
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
  
  return NextResponse.json(data)
}
```
 
## トラブルシューティング
 
### よくあるエラーと解決方法
 
#### 1. "new row violates row-level security policy"
 
**原因**: RLSポリシーがClerkのユーザーIDを認識できない
 
**デバッグ方法**:
```sql
-- カスタムヘッダー方式の場合
SELECT get_clerk_user_id();
 
-- JWT方式の場合
SELECT auth.jwt()->>'sub';
```
 
#### 2. ローカル環境でJWT方式が動作しない
 
**原因**: Supabase Docker CLIにはサードパーティ認証の設定画面がない
 
**解決方法**: カスタムヘッダー方式を使用する（本ガイドの推奨方法）
 
## Clerk Billingとの統合
 
### プラン情報の管理
 
```typescript
// src/components/clerk-plan-protect.tsx
import { Protect } from "@clerk/nextjs"
 
export function ClerkPlanProtect({ children, requiredPlan = 'premium' }) {
  return (
    <Protect
      plan={requiredPlan}
      fallback={
        <Card className="shadow-lg border-2 border-gray-300">
          <CardContent>
            <p>この機能はプレミアムプランでご利用いただけます。</p>
            <Button asChild>
              <Link href="/pricing">アップグレード</Link>
            </Button>
          </CardContent>
        </Card>
      }
    >
      {children}
    </Protect>
  )
}
```
 
## 実装方法の選択フローチャート
 
```
Supabase Docker CLIを使用？
├─ Yes → カスタムヘッダー方式（API Routes経由）を使用
└─ No（Supabase Cloud）
    └─ セキュリティとシンプルさを重視？
        ├─ Yes → カスタムヘッダー方式（API Routes経由）を使用【推奨】
        └─ No（クライアント直接アクセスが必要）→ 公式JWT方式を使用
```
 
## セキュリティのベストプラクティス
 
### 1. API Routes経由でのアクセスを基本とする
 
```typescript
// 常にサーバーサイドで認証を検証
export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  // 処理続行
}
```
 
### 2. 環境変数の管理
 
```env
# 公開可能（クライアントサイド）
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
 
# 秘密（サーバーサイドのみ）
CLERK_SECRET_KEY=sk_test_xxx
SUPABASE_SERVICE_ROLE_KEY=xxx  # Service Role方式の場合のみ
```
 
## プロダクション移行時のチェックリスト
 
- [ ] 環境変数の更新（特にURL関連）
- [ ] RLSポリシーの動作確認
- [ ] API Routesが正しく設定されているか確認
- [ ] カスタムヘッダーが正しく渡されているか確認
- [ ] Clerk Billingのプラン設定確認
 
## 実装時の重要な注意事項
 
### カスタムヘッダー方式の落とし穴
 
実際の実装では、以下の問題に遭遇することがあります：
 
#### 問題1: RLSポリシーが機能しない
 
**症状**:
- カテゴリ作成時に "new row violates row-level security policy" エラー
- 作成したデータが一覧に表示されない
- `get_clerk_user_id()` 関数が正しい値を返しているのにRLSが動作しない
 
**原因**:
カスタムヘッダーがSupabaseクライアントで正しく送信されていない可能性があります。
 
**解決策**:
1. グローバルヘッダー設定が効かない場合がある
2. Service Roleキーを使用した実装に切り替える（推奨）
 
### 推奨実装パターン（Service Roleキー使用）
 
RLSの問題を回避する最も確実な方法は、サーバーサイドでService Roleキーを使用することです：
 
```typescript
// src/app/api/categories/route.ts
import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createAdminSupabaseClient } from '@/lib/supabase-auth'
 
export async function GET() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
 
    const supabase = createAdminSupabaseClient()
 
    // ユーザーIDでフィルタしてデータを取得
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
 
    if (error) throw error
 
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
```
 
**メリット**:
- ✅ RLSの複雑な設定が不要
- ✅ 確実に動作する
- ✅ デバッグが容易
- ✅ パフォーマンスが良い
 
**セキュリティ**:
- サーバーサイドでClerk認証を検証
- ユーザーIDでフィルタリング
- クライアントからService Roleキーへのアクセスなし
 
### デバッグ手法
 
RLSの問題をデバッグする際は、以下の手順を推奨：
 
1. **デバッグエンドポイントの作成**:
```typescript
// /api/test-rls
const { data: clerkUserIdTest } = await supabase.rpc('get_clerk_user_id')
console.log('Clerk User ID from RPC:', clerkUserIdTest)
```
 
2. **管理者クライアントとの比較**:
```typescript
// 管理者クライアントで取得
const { data: adminData } = await adminClient
  .from('categories')
  .select('*')
  .eq('user_id', userId)
 
// 認証クライアントで取得
const { data: authData } = await supabase
  .from('categories')
  .select('*')
 
console.log('Admin count:', adminData?.length)
console.log('Auth count:', authData?.length)
```
 
3. **ユーザー存在確認**:
```typescript
const { data: userExists } = await supabase
  .from('users')
  .select('id')
  .eq('id', userId)
  .single()
 
if (!userExists) {
  // ユーザーを作成する処理
}
```
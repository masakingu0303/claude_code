# Supabase 汎用ガイド - 初期構築とデータ操作
 
## 概要
 
このドキュメントは、Supabaseを使用したアプリケーション開発における初期構築とデータ操作に焦点を当てた汎用的なガイドです。特定のフレームワークや認証システムに依存しない内容となっています。

**【重要】Docker Desktopは使用しない前提で、方法1（クラウドベース）のアプローチを採用します。**
 
## 目次
 
1. [開発環境のセットアップ](#開発環境のセットアップ)
2. [データベース設計](#データベース設計)
3. [Supabaseクライアントの実装](#supabaseクライアントの実装)
4. [基本的なCRUD操作](#基本的なcrud操作)
5. [Row Level Security (RLS)](#row-level-security-rls)
6. [リアルタイム機能](#リアルタイム機能)
7. [ファイルストレージ](#ファイルストレージ)
8. [本番環境へのデプロイ](#本番環境へのデプロイ)
9. [トラブルシューティング](#トラブルシューティング)
 
## 開発環境のセットアップ
 
### 方法1: クラウドベース（推奨）
 
Docker Desktopが使えない場合や、より簡単にセットアップしたい場合は、Supabaseのクラウド環境を使用します。
 
#### 1. 開発用プロジェクトの作成
 
1. https://supabase.com にアクセス
2. サインアップまたはログイン
3. 「New project」をクリック
4. プロジェクト名を入力（例：`myapp-dev`）
5. データベースパスワードを設定
6. リージョンを選択（日本の場合は東京推奨）
 
#### 2. APIキーとURLの取得
 
プロジェクトダッシュボード → Settings → API から以下を取得：
 
- Project URL
- anon public key
- service_role key（秘密鍵）
 
#### 3. 環境変数の設定
 
`.env.local`ファイルを作成：
 
```bash
# 開発環境（Supabaseクラウド）
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<開発環境のanon key>
SUPABASE_SERVICE_ROLE_KEY=<開発環境のservice role key>
```
 
> **注意**: 環境変数の値（APIキーなど）は必ずユーザーが設定する必要があります。セキュリティ上の理由から、これらの値は共有できません。
 
#### 4. Supabase CLIのインストールと接続
 
```bash
# Supabase CLIのインストール
npm install -g supabase
 
# プロジェクトの初期化
npx supabase init
 
# クラウドプロジェクトにリンク
npx supabase login
npx supabase link --project-ref <プロジェクトID>
```
 
### 方法2: Docker Desktop（ローカル環境）
 
Docker Desktopが使用できる場合は、完全にローカルで開発できます。
 
**注意**: ローカル開発でポート競合が発生する場合があります。
- **問題**: ポート54322が既に使用されている
- **解決**: `supabase stop --all` で全てのコンテナを停止してから再起動
 
#### 1. 必要なツール
 
```bash
# Docker Desktop
# https://www.docker.com/products/docker-desktop からインストール
 
# Supabase CLI
npm install -g supabase
```
 
#### 2. ローカル環境の起動
 
```bash
# プロジェクトディレクトリで実行
npx supabase init
 
# Docker Desktopが起動していることを確認してから実行
npx supabase start
```
 
起動完了後、以下の情報が表示されます：
 
```
Started supabase local development setup.
 
         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
 
#### 3. 環境変数の設定
 
`.env.local`ファイルを作成：
 
```bash
# ローカル環境（Docker）
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<表示されたanon keyをコピー>
SUPABASE_SERVICE_ROLE_KEY=<表示されたservice_role keyをコピー>
```
 
> **注意**: 環境変数の値（APIキーなど）は必ずユーザーが設定する必要があります。セキュリティ上の理由から、これらの値は共有できません。
 
## データベース設計
 
### 方法1: Supabase Studio（クラウド環境）を使用
 
クラウド環境の場合、Supabase Studioから直接テーブルを作成できます。
 
1. プロジェクトダッシュボード → Table Editor
2. 「Create a new table」をクリック
3. GUIでテーブルを設計
 
または、SQL Editorから直接SQLを実行：
 
```sql
-- ユーザーテーブル
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
 
-- 投稿テーブル
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
 
-- インデックスの作成
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_published ON posts(published);
```
 
### 方法2: マイグレーションファイル（推奨）
 
バージョン管理したい場合は、マイグレーションファイルを使用します。
 
#### 1. マイグレーションファイルの作成
 
```bash
# 新しいマイグレーションファイルを作成
npx supabase migration new create_initial_tables
```
 
#### 2. マイグレーションファイルの編集
 
`supabase/migrations/[timestamp]_create_initial_tables.sql`:
 
```sql
-- ユーザーテーブル
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
 
-- 投稿テーブル
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
 
-- インデックスの作成
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_published ON posts(published);
 
-- 更新日時を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
 
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
 
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```
 
#### 3. マイグレーションの実行
 
```bash
# クラウド環境の場合
npx supabase db push
 
# ローカル環境（Docker）の場合
npx supabase db reset
 
# マイグレーションの状態確認
npx supabase migration list
```
 
## Supabaseクライアントの実装
 
### JavaScript/TypeScriptでの基本実装
 
```typescript
// supabase-client.js (または .ts)
import { createClient } from '@supabase/supabase-js'
 
// クライアントの作成
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)
 
// 管理操作用クライアント（RLSをバイパス）
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
```
 
### TypeScript型定義の生成
 
```bash
# TypeScript型定義を生成
npx supabase gen types typescript --local > types/database.types.ts
```
 
## 基本的なCRUD操作
 
### Create (作成)
 
```typescript
// 単一レコードの作成
const { data, error } = await supabase
  .from('posts')
  .insert({
    user_id: 'user-uuid',
    title: 'Hello World',
    content: 'This is my first post'
  })
  .select()
  .single()
 
// 複数レコードの作成
const { data, error } = await supabase
  .from('posts')
  .insert([
    { user_id: 'user1', title: 'Post 1', content: 'Content 1' },
    { user_id: 'user2', title: 'Post 2', content: 'Content 2' }
  ])
  .select()
```
 
### Read (読み取り)
 
```typescript
// 全件取得
const { data, error } = await supabase
  .from('posts')
  .select('*')
 
// 条件付き取得
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('published', true)
  .order('created_at', { ascending: false })
  .limit(10)
 
// JOINを使用した取得
const { data, error } = await supabase
  .from('posts')
  .select(`
    *,
    users (
      id,
      name,
      email
    )
  `)
  .eq('published', true)
 
// 単一レコードの取得
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('id', 'post-uuid')
  .single()
```
 
### Update (更新)
 
```typescript
// 単一レコードの更新
const { data, error } = await supabase
  .from('posts')
  .update({ title: 'Updated Title', published: true })
  .eq('id', 'post-uuid')
  .select()
  .single()
 
// 複数レコードの更新
const { data, error } = await supabase
  .from('posts')
  .update({ published: true })
  .eq('user_id', 'user-uuid')
  .select()
```
 
### Delete (削除)
 
```typescript
// 単一レコードの削除
const { error } = await supabase
  .from('posts')
  .delete()
  .eq('id', 'post-uuid')
 
// 条件に一致するレコードの削除
const { error } = await supabase
  .from('posts')
  .delete()
  .eq('user_id', 'user-uuid')
  .eq('published', false)
```
 
### Upsert (作成または更新)
 
```typescript
// 存在すれば更新、なければ作成
const { data, error } = await supabase
  .from('users')
  .upsert({
    id: 'user-uuid',
    email: 'user@example.com',
    name: 'John Doe'
  }, {
    onConflict: 'id'
  })
  .select()
```
 
## Row Level Security (RLS)
 
### RLSの有効化
 
```sql
-- テーブルごとにRLSを有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
```
 
**Clerk認証との連携時の注意**:
- SupabaseのRLSはデフォルトで`auth.uid()`を使用しますが、Clerk認証を使用する場合は異なるアプローチが必要です
- ClerkのユーザーIDを直接データベースのuser_idカラムに保存し、アプリケーション側で認証を行います
- RLSポリシーはClerkとの連携用に後で更新が必要になる場合があります
 
### Clerk認証との統合パターン
 
#### パターン1: カスタムヘッダー方式（推奨）
```sql
-- get_clerk_user_id()関数を作成
CREATE OR REPLACE FUNCTION get_clerk_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('request.headers', true)::json->>'x-clerk-user-id';
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
 
-- RLSポリシーでget_clerk_user_id()を使用
CREATE POLICY "Users can view own data"
ON posts FOR SELECT
USING (
  user_id = get_clerk_user_id()
  OR
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);
```
 
#### パターン2: Service Roleキーでバイパス
```typescript
// サーバーサイドのみ
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // RLSをバイパス
)
 
// 手動でユーザーIDフィルタリング
const { data } = await supabaseAdmin
  .from('posts')
  .select('*')
  .eq('user_id', clerkUserId)
```
 
詳細は「clerk-supabase-integration-guide.md」を参照してください。
 
### 基本的なRLSポリシー
 
```sql
-- 全員が読み取り可能
CREATE POLICY "Public posts are viewable by everyone"
ON posts
FOR SELECT
USING (published = true);
 
-- 作成者のみ更新可能（Supabase認証の場合）
CREATE POLICY "Users can update own posts"
ON posts
FOR UPDATE
USING (auth.uid() = user_id);
 
-- 作成者のみ削除可能（Supabase認証の場合）
CREATE POLICY "Users can delete own posts"
ON posts
FOR DELETE
USING (auth.uid() = user_id);
 
-- 認証済みユーザーのみ作成可能（Supabase認証の場合）
CREATE POLICY "Authenticated users can create posts"
ON posts
FOR INSERT
WITH CHECK (auth.uid() = user_id);
 
-- Clerk認証を使用する場合の注意:
-- user_idカラムにClerkのユーザーIDを保存し、
-- アプリケーション側でユーザーIDの検証を行う
```
 
## リアルタイム機能
 
### リアルタイム購読の設定
 
```typescript
// テーブルの変更を監視
const channel = supabase
  .channel('posts-channel')
  .on(
    'postgres_changes',
    {
      event: '*', // INSERT, UPDATE, DELETE, または '*' で全て
      schema: 'public',
      table: 'posts'
    },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
 
// 特定の条件でフィルタリング
const channel = supabase
  .channel('user-posts')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'posts',
      filter: 'user_id=eq.user-uuid'
    },
    (payload) => {
      console.log('New post created!', payload.new)
    }
  )
  .subscribe()
 
// 購読の解除
channel.unsubscribe()
```
 
## ファイルストレージ
 
### バケットの作成（SQL）
 
```sql
-- ストレージバケットの作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);
```
 
### ファイルのアップロード
 
```typescript
// ファイルのアップロード
const { data, error } = await supabase.storage
  .from('images')
  .upload('path/to/file.jpg', file, {
    cacheControl: '3600',
    upsert: false
  })
 
// 公開URLの取得
const { data } = supabase.storage
  .from('images')
  .getPublicUrl('path/to/file.jpg')
```
 
### ファイルの削除
 
```typescript
const { error } = await supabase.storage
  .from('images')
  .remove(['path/to/file.jpg'])
```
 
## 本番環境へのデプロイ
 
### クラウドベースの場合
 
開発環境と同様に、本番用の別プロジェクトを作成します。
 
#### 1. 本番用プロジェクトの作成
 
1. https://supabase.com にアクセス
2. 「New project」をクリック
3. プロジェクト名を入力（例：`myapp-prod`）
4. 強力なデータベースパスワードを設定
5. リージョンを選択
 
#### 2. 環境変数の管理
 
開発環境と本番環境で異なる環境変数を使用：
 
```bash
# .env.local（開発環境）
NEXT_PUBLIC_SUPABASE_URL=https://dev-xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<開発環境のanon key>
SUPABASE_SERVICE_ROLE_KEY=<開発環境のservice role key>
 
# .env.production（本番環境）
NEXT_PUBLIC_SUPABASE_URL=https://prod-xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<本番環境のanon key>
SUPABASE_SERVICE_ROLE_KEY=<本番環境のservice role key>
```
 
#### 3. マイグレーションの適用
 
```bash
# 本番プロジェクトにリンク
npx supabase link --project-ref <本番プロジェクトID>
 
# マイグレーションを本番環境に適用
npx supabase db push
```
 
### ローカル開発環境からの移行
 
Docker Desktopを使用していた場合：
 
```bash
# 本番プロジェクトを作成後、リンク
npx supabase link --project-ref <本番プロジェクトID>
 
# ローカルのマイグレーションを本番に適用
npx supabase db push
 
# 型定義を本番環境から生成
npx supabase gen types typescript > types/database.types.ts
```
 
## トラブルシューティング
 
### よくあるエラーと解決方法
 
#### 1. PGRST204エラー（No rows found）
 
```typescript
// ❌ エラーが発生する可能性
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('id', 'non-existent-id')
  .single() // 0件でエラー
 
// ✅ 安全な実装
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('id', 'non-existent-id')
  .maybeSingle() // 0件の場合はnull
```
 
#### 2. RLSポリシーエラー
 
```typescript
// RLSが有効な場合、適切な認証が必要
// Service Role Keyを使用してRLSをバイパス
const { data, error } = await supabaseAdmin
  .from('posts')
  .select('*')
```
 
#### 3. データ型の不一致
 
```typescript
// 型定義を生成して型安全性を確保
import { Database } from './types/database.types'
 
type Post = Database['public']['Tables']['posts']['Row']
 
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .returns<Post[]>()
```
 
### デバッグのヒント
 
1. **Supabase Studio**:
   - クラウド環境: プロジェクトダッシュボードから直接アクセス
   - ローカル環境: `http://localhost:54323` でアクセス
 
2. **Clerk統合時のデバッグSQL**:
   ```sql
   -- 現在のClerkユーザーIDを確認
   SELECT get_clerk_user_id();
 
   -- リクエストヘッダーの内容を確認
   SELECT current_setting('request.headers', true)::json;
 
   -- RLSポリシーをテスト
   SET LOCAL role TO 'authenticated';
   SELECT * FROM your_table;
   ```
 
3. **ローカル開発でのポート競合**:
   ```bash
   # Supabaseコンテナを完全に停止・再起動
   supabase stop --all
   supabase start
   ```
 
2. **ログの確認**:
   - クラウド環境: Dashboard → Logs でリアルタイムログを確認
   - ローカル環境: `npx supabase status` で各サービスの状態を確認
 
3. **SQLエディタ**: Supabase Studioから直接SQLを実行してテスト
 
## まとめ
 
このガイドでは、Supabaseの初期構築とデータ操作の基本を解説しました。重要なポイント：
 
1. **開発環境の選択**:
   - クラウドベース: Docker不要で簡単セットアップ（推奨）
   - ローカル環境: Docker Desktopで完全にオフライン開発
 
2. **環境の分離**: 開発用と本番用で別々のプロジェクトを作成
 
3. **マイグレーション**: SQLファイルでスキーマを管理
 
4. **型安全性**: TypeScript型定義の自動生成
 
5. **RLS**: Row Level Securityで安全なデータアクセス
 
6. **リアルタイム**: WebSocketを使用したリアルタイム更新
 
7. **ストレージ**: ファイルの保存と管理
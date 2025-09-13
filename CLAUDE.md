# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Money Tracker** - A simple, sustainable expense tracking app

Built with the concept "3 functions only. A household budget you can stick with", consisting of minimal essential features: expense recording, categorization, and dashboard display.
 
## 開発ロードマップと進捗管理
 
開発は`.claude/development_roadmap.md`のチェックリストに従って進めます。
 
### タスク管理方法
- 各フェーズの実装内容はチェックリスト形式で記載
- 完了したタスクは`[ ]`を`[x]`に変更して記録
- フェーズ1から順番に実装を進める
 
```markdown
# 実装前
- [ ] パッケージインストール（Supabase, Clerk, shadcn/ui）
 
# 実装後
- [x] パッケージインストール（Supabase, Clerk, shadcn/ui）
```
 
## Development Commands

- **Development server**: `npm run dev` (starts Next.js with Turbopack)
- **Build**: `npm run build` (builds with Turbopack)
- **Production server**: `npm run start`
- **Lint**: `npm run lint` (ESLint with Next.js and TypeScript configs)
- **Type check**: `npx tsc --noEmit` (mandatory before task completion)
 
## 環境設定
 
### 必要な環境変数（.env.local）
 
以下は設定済みとする。
 
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
 
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
 
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
 
# Billing Portal URL
NEXT_PUBLIC_BILLING_URL=https://accounts.your-domain.com/user
```
 
## プロジェクト構造
 
```
my-app/
├── src/
│   ├── app/                    # App Router
│   │   ├── (auth)/            # 認証関連ページ
│   │   ├── (dashboard)/       # ダッシュボード（認証必須）
│   │   ├── api/               # API Routes
│   │   └── layout.tsx         # ルートレイアウト
│   ├── components/            # 共通コンポーネント
│   ├── lib/                   # ユーティリティ、設定
│   └── types/                 # TypeScript型定義
├── .claude/                   # プロジェクトドキュメント
│   ├── requirements.md        # 要件定義書
│   ├── development_roadmap.md # 開発ロードマップ（進捗管理）
│   ├── design_system.md       # デザインシステム
│   ├── supabase_document.md   # Supabase実装ガイド
│   ├── clerk_document.md      # Clerk実装ガイド
│   └── clerk_supabase_integration_document.md
└── public/                    # 静的ファイル
```
 
## Project Architecture

This is a Next.js 15.5.3 application using the App Router pattern with:

- **Framework**: Next.js 15 with Turbopack for fast development and builds
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS v4 with PostCSS + shadcn/ui components
- **Authentication**: Clerk (email authentication, billing management)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Fonts**: Geist font family (Geist and Geist Mono) from Google Fonts
- **Structure**: App Router pattern with source files in `src/app/`
- **Path aliases**: `@/*` maps to `./src/*`

### Key Architecture Decisions

- **Database Access Pattern**: All database operations go through API Routes (`/api/*`)
  - Frontend components use fetch() to call API routes
  - API routes use `supabaseAdmin` (service role key) for database access
  - No direct Supabase client usage in frontend components
- **Authentication Flow**: Clerk → API Routes → Supabase
  - Clerk handles user authentication and session management
  - API routes validate Clerk sessions using `auth()` from `@clerk/nextjs/server`
  - User data stored in Supabase with Clerk user IDs as TEXT primary keys
- **Type Safety**: Comprehensive TypeScript types generated from Supabase schema
- **Component Architecture**: shadcn/ui components with custom styling
 
## 重要なドキュメント
 
### 要件定義
`.claude/requirements.md` - プロジェクトの詳細な要件定義
 
### 開発ロードマップ
`.claude/development_roadmap.md` - 5つのフェーズで構成される開発計画と進捗管理
 
### デザインシステム
`.claude/design_system.md` - UIコンポーネントのデザインガイドライン
 
### 実装ガイド
- `.claude/supabase_document.md` - Supabase実装方法（方法1を採用）
- `.claude/clerk_document.md` - Clerk認証・課金の実装
- `.claude/clerk_supabase_integration_document.md` - 認証連携の実装
 
## コーディング規約
 
### TypeScript
- パスエイリアス: `@/*` → `src/*`
- 型定義は`src/types/`に集約
- strictモードを維持
 
### コンポーネント
- 関数コンポーネントで統一
- shadcn/uiコンポーネントを優先使用
- デザインシステムに従ったスタイリング
 
### git管理
- 各フェーズ完了時にコミット
- 意味のある単位でコミットメッセージを記述
 
## 開発時の注意事項
 
- Clerk Billingのプランスラグは必ず「premium」に設定
- user_idフィールドはTEXT型（ClerkのID形式に対応）
- 環境変数は`.env.local`に正しく記載されている前提で進め、必要に応じ example ファイルを作成
  - `.env.local` を Claude Code が読み込むことは絶対に避ける
- デザインシステム（`.claude/design_system.md`）を厳守
 
### Database Schema

Key tables and relationships:
- **users**: Stores Clerk user data (id as TEXT for Clerk compatibility)
- **categories**: Predefined expense categories with icons and colors
- **expenses**: User expense records linked to users and categories

Row Level Security (RLS) is enabled to ensure users only see their own data.

### Current Implementation Status

Core features implemented:
- ✅ User authentication (Clerk)
- ✅ Expense recording form with validation
- ✅ Category management (9 predefined categories)
- ✅ Expense list display with category visualization
- ✅ Dashboard integration
- ✅ API routes for CRUD operations (`/api/expenses`, `/api/categories`)

### Key Files and Structure
- `src/app/layout.tsx`: Root layout with ClerkProvider and Toaster setup
- `src/app/dashboard/page.tsx`: Main dashboard with expense form and list
- `src/components/forms/expense-form.tsx`: Expense recording form
- `src/components/expenses/expense-list.tsx`: Expense list display
- `src/lib/supabase.ts`: Database client configuration
- `src/types/database.types.ts`: Generated TypeScript types
- `src/middleware.ts`: Clerk authentication middleware

## Important Notes for Development

1. **Environment Variables**: All required environment variables should be set in `.env.local` (not read by Claude Code)
2. **Type Checking**: ALWAYS run `npx tsc --noEmit` before completing tasks
3. **Database Access**: Use API routes only - never direct Supabase client in components
4. **UI Consistency**: Follow existing shadcn/ui patterns and styling
5. **Error Handling**: Include proper error handling with user-friendly messages

## Development Knowledge and Best Practices

### Common Issues and Solutions

1. **UI Component Visibility Issues**
   - **Problem**: shadcn/ui components (Select, Dialog, AlertDialog) may appear transparent
   - **Solution**: Always add explicit styling: `className="bg-white border border-gray-200 shadow-lg"`
   - **Apply to**: SelectContent, DialogContent, AlertDialogContent

2. **User Management with Clerk + Supabase**
   - **Problem**: Foreign key constraint errors when users don't exist in Supabase
   - **Solution**: Implement `ensureUserExists()` function in API routes
   - **Pattern**: Check user existence → Create if missing → Proceed with operation

3. **Form Data Validation Between Frontend/Backend**
   - **Problem**: Date objects become strings in JSON transmission
   - **Solution**: Create separate schemas for frontend (`expenseFormInputSchema`) and API (`expenseApiSchema`)
   - **Key**: Transform data types appropriately in each schema

4. **Next.js 15 API Routes**
   - **Change**: Dynamic route params are now Promise objects
   - **Pattern**: `{ params }: { params: Promise<{ id: string }> }`
   - **Usage**: `const { id } = await params;`

5. **Missing Dependencies**
   - **Common Missing Files**: `@/lib/utils.ts` for shadcn/ui components
   - **Solution**: Create utils.ts with `cn` function using `clsx` and `tailwind-merge`

### Development Patterns

1. **CRUD Implementation Pattern**
   - API Routes: `/api/resource` (GET, POST) and `/api/resource/[id]` (PUT, DELETE)
   - Form Components: Use react-hook-form + Zod validation
   - List Components: Include inline edit/delete actions with confirmation dialogs
   - State Management: Use optimistic UI updates where possible

2. **Error Handling Strategy**
   - API Level: Detailed error logging with user-friendly messages
   - Frontend Level: Toast notifications for user feedback
   - Validation: Consistent error messages across client and server

3. **Component Architecture**
   - Form Components: Self-contained with validation and submission
   - Dialog Components: Reusable with onSuccess callbacks
   - List Components: Include CRUD actions and real-time updates

### Technical Debt and Maintenance

1. **Known Simplifications**
   - User email addresses are placeholder values (`user_${userId}@example.com`)
   - Could be enhanced with real Clerk user data integration

2. **Future Improvements**
   - Implement proper user profile management
   - Add data validation at database level
   - Consider implementing caching for better performance
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Clerkのローカライゼーション設定
const clerkLocalization = {
  formFieldError__identifierExists: 'このメールアドレスは既に使用されています。別のメールアドレスをお試しください。',
  formFieldError__invalidEmailAddress: '有効なメールアドレスを入力してください。',
  formFieldError__passwordTooShort: 'パスワードは8文字以上である必要があります。',
  formFieldError__passwordIncorrect: 'パスワードが正しくありません。',
  formFieldError__notFound: 'このメールアドレスのアカウントが見つかりません。',
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Money Tracker - 3つの機能だけ。続けられる家計簿",
  description: "支出記録、カテゴリ分け、ダッシュボード表示。必要最小限の機能で、誰でも簡単に継続できる家計簿アプリ。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="ja">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}

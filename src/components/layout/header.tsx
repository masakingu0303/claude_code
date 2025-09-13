'use client';

import Link from 'next/link';
import { UserButton, useUser } from '@clerk/nextjs';
import { Wallet } from 'lucide-react';

export default function Header() {
  const { isSignedIn } = useUser();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Wallet className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">Money Tracker</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              ホーム
            </Link>
            <Link
              href="/pricing"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              料金プラン
            </Link>
            {isSignedIn && (
              <Link
                href="/dashboard"
                className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                ダッシュボード
              </Link>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8"
                  }
                }}
              />
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/sign-in"
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  ログイン
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 text-sm font-medium rounded-md"
                >
                  始める
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
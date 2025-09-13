import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Money Trackerにサインイン
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            3つの機能だけ。続けられる家計簿
          </p>
        </div>
        <SignIn 
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          redirectUrl="/dashboard"
          appearance={{
            elements: {
              formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700',
              card: 'shadow-md',
              headerTitle: 'text-gray-900',
              headerSubtitle: 'text-gray-600',
              socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
              formFieldInput: 'border border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
              footerActionLink: 'text-indigo-600 hover:text-indigo-500'
            },
            variables: {
              colorPrimary: '#4f46e5'
            }
          }}
        />
      </div>
    </div>
  );
}
import Link from 'next/link';
import { Suspense } from 'react';
import { TranslationHistory } from './_components/TranslationHistory';
import { TranslationProvider } from './_contexts/TranslationContext';

export default function NyaniLayout({ children }: { children: React.ReactNode }) {
  return (
    <TranslationProvider>
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-80 flex-shrink-0 flex flex-col border-r border-gray-200">
          {/* Logo/Icon */}
          <div className="p-4 flex-shrink-0">
            <Link
              href="/nyani"
              className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-2xl hover:bg-blue-600 transition-colors"
            >
              <span className="text-2xl">👀</span>
            </Link>
          </div>

          {/* History Section */}
          <div className="flex-1 overflow-hidden">
            <Suspense
              fallback={<div className="h-full flex items-center justify-center">Loading...</div>}
            >
              <TranslationHistory />
            </Suspense>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-blue-50">
          {children}
        </div>
      </div>
    </TranslationProvider>
  );
}

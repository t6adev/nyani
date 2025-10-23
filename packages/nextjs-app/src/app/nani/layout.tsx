import { Suspense } from 'react';
import { TranslationHistory } from './_components/TranslationHistory';
import { TranslationProvider } from './_contexts/TranslationContext';

export default function NaniLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TranslationProvider>
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-80 flex-shrink-0">
          <Suspense fallback={<div className="h-full bg-gray-50 border-r border-gray-200 flex items-center justify-center">Loading...</div>}>
            <TranslationHistory />
          </Suspense>
        </div>

        {/* Main Content */}
        {children}
      </div>
    </TranslationProvider>
  );
}

import { Suspense } from 'react';
import TranslationResult from './_components/TranslationResult';

export default function ResultPage() {
  return (
    <div className="flex-1 overflow-y-auto w-full">
      <Suspense fallback={<div>読み込み中...</div>}>
        <TranslationResult />
      </Suspense>
    </div>
  );
}

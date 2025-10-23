import Link from 'next/link';
import TranslationResult from './_components/TranslationResult';

export default function ResultPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/nani"
          className="inline-flex items-center gap-2 text-blue-600 hover:underline mb-6"
        >
          ← 翻訳フォームへ戻る
        </Link>
        <TranslationResult />
      </div>
    </div>
  );
}

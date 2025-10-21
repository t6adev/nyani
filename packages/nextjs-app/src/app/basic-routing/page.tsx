'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Translation = {
  id: string;
  text: string;
  targetLang: 'ja' | 'en';
  result?: string;
  createdAt: string;
};

export default function WithRoutingPage() {
  const [text, setText] = useState('');
  const [targetLang, setTargetLang] = useState<'ja' | 'en'>('en');
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchTranslations();
  }, []);

  const fetchTranslations = async () => {
    try {
      const response = await fetch('/api/translations');
      const data = await response.json();
      setTranslations(data.translations);
    } catch (error) {
      console.error('Failed to fetch translations:', error);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/translations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, targetLang }),
      });

      const data = await response.json();
      router.push(`/basic-routing/${data.id}`);
    } catch (error) {
      console.error('Translation error:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          ← トップページへ戻る
        </Link>
        <h1 className="text-3xl font-bold mb-8">翻訳アプリ (With Routing)</h1>

        <div className="mb-8">
          <div className="mb-4">
            <label className="flex items-center gap-4 mb-4">
              <span className="font-semibold">翻訳先:</span>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value as 'ja' | 'en')}
                className="px-4 py-2 border rounded"
              >
                <option value="ja">日本語</option>
                <option value="en">英語</option>
              </select>
            </label>
          </div>

          <div className="mb-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="翻訳したいテキストを入力してください"
              className="w-full h-32 p-4 border rounded resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !text.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '送信中...' : '翻訳開始'}
          </button>
        </div>

        {translations.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">翻訳履歴</h2>
            <ul className="space-y-2">
              {translations.map((translation) => (
                <li key={translation.id}>
                  <Link
                    href={`/basic-routing/${translation.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {translation.id}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

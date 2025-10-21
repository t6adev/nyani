'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { use } from 'react';

type Translation = {
  id: string;
  text: string;
  targetLang: 'ja' | 'en';
  result?: string;
  createdAt: string;
};

export default function TranslationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [result, setResult] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationTime, setTranslationTime] = useState<number | null>(null);
  const [translations, setTranslations] = useState<Translation[]>([]);

  useEffect(() => {
    fetchTranslations();
    startTranslation();
  }, [id]);

  const fetchTranslations = async () => {
    try {
      const response = await fetch('/api/translations');
      const data = await response.json();
      setTranslations(data.translations);
    } catch (error) {
      console.error('Failed to fetch translations:', error);
    }
  };

  const startTranslation = async () => {
    setIsTranslating(true);
    setResult('');
    setTranslationTime(null);

    const startTime = performance.now();

    try {
      const response = await fetch(`/api/translations/${id}/stream`);

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setResult((prev) => prev + chunk);
      }
    } catch (error) {
      console.error('Translation error:', error);
      setResult('翻訳エラーが発生しました');
    } finally {
      const endTime = performance.now();
      const elapsedTime = (endTime - startTime) / 1000;
      setTranslationTime(elapsedTime);
      setIsTranslating(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/basic-routing" className="text-blue-600 hover:underline mb-4 inline-block">
          ← 翻訳フォームへ戻る
        </Link>
        <h1 className="text-3xl font-bold mb-8">翻訳結果: {id}</h1>

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold">翻訳結果:</h2>
            {isTranslating && <span className="text-sm text-gray-600">翻訳中...</span>}
            {translationTime !== null && (
              <span className="text-sm text-gray-600">({translationTime.toFixed(2)}秒)</span>
            )}
          </div>
          <div className="p-4 border rounded bg-gray-50 whitespace-pre-wrap min-h-32">
            {result || '翻訳を開始しています...'}
          </div>
        </div>

        {translations.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">翻訳履歴</h2>
            <ul className="space-y-2">
              {translations.map((translation) => (
                <li key={translation.id}>
                  <Link
                    href={`/basic-routing/${translation.id}`}
                    className={`hover:underline ${
                      translation.id === id ? 'font-bold text-gray-900' : 'text-blue-600'
                    }`}
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

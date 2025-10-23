'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ResultContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [translation, setTranslation] = useState<{
    text: string;
    targetLang: 'ja' | 'en';
  } | null>(null);
  const [result, setResult] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationTime, setTranslationTime] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;

    fetchTranslation();
    startTranslation();
  }, [id]);

  const fetchTranslation = async () => {
    if (!id) return;

    try {
      const response = await fetch('/nani-api/translations');
      const data = await response.json();
      const currentTranslation = data.translations.find((t: { id: string }) => t.id === id);
      if (currentTranslation) {
        setTranslation({
          text: currentTranslation.text,
          targetLang: currentTranslation.targetLang,
        });
      }
    } catch (error) {
      console.error('Failed to fetch translation:', error);
    }
  };

  const startTranslation = async () => {
    if (!id) return;

    setIsTranslating(true);
    setResult('');
    setTranslationTime(null);

    const startTime = performance.now();

    try {
      const response = await fetch(`/nani-api/translations/${id}/stream`);

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

  if (!id) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-gray-500">翻訳IDが指定されていません</p>
      </div>
    );
  }

  return (
    <>
      {translation && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">翻訳元テキスト</h2>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="whitespace-pre-wrap text-gray-700">{translation.text}</p>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            翻訳先: {translation.targetLang === 'ja' ? '日本語' : '英語'}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold">翻訳結果</h2>
          {isTranslating && (
            <span className="text-sm text-blue-600 animate-pulse">翻訳中...</span>
          )}
          {translationTime !== null && (
            <span className="text-sm text-gray-600">({translationTime.toFixed(2)}秒)</span>
          )}
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-64">
          {result ? (
            <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{result}</p>
          ) : (
            <p className="text-gray-400">翻訳を開始しています...</p>
          )}
        </div>
      </div>
    </>
  );
}

export default function TranslationResult() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center">Loading...</div>}>
      <ResultContent />
    </Suspense>
  );
}

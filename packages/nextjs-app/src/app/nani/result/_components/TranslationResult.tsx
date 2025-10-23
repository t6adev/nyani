'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from '../../_contexts/TranslationContext';

function ResultContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { originalText, targetLang, streamPromise } = useTranslation();

  const [result, setResult] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationTime, setTranslationTime] = useState<number | null>(null);

  const processingPromiseRef = useRef<Promise<Response> | null>(null);

  useEffect(() => {
    if (!streamPromise) return;

    if (processingPromiseRef.current === streamPromise) {
      return;
    }

    processingPromiseRef.current = streamPromise;

    const processStream = async () => {
      setIsTranslating(true);
      setResult('');
      setTranslationTime(null);

      const startTime = performance.now();

      try {
        const response = await streamPromise;

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

          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          setResult((prev) => prev + chunk);
        }
      } catch (error) {
        console.error('[TranslationResult] Translation error:', error);
        setResult('翻訳エラーが発生しました');
      } finally {
        const endTime = performance.now();
        const elapsedTime = (endTime - startTime) / 1000;
        setTranslationTime(elapsedTime);
        setIsTranslating(false);
      }
    };

    processStream();
  }, [streamPromise]);

  if (!id) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-gray-500">翻訳IDが指定されていません</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="bg-gray-50 rounded-xl shadow-sm">
          <div className="bg-slate-100 rounded-xl overflow-scroll h-32 m-2">
            <p className="whitespace-pre-wrap text-gray-700 px-4 py-3">{originalText}</p>
          </div>
        </div>
        <div className="flex justify-start items-center gap-4">
          {isTranslating ? (
            <span className="text-sm text-blue-600 animate-pulse">翻訳中...</span>
          ) : (
            <span className="text-sm text-blue-600 ">翻訳しました</span>
          )}
          {translationTime !== null && (
            <span className="text-sm text-gray-600">({translationTime.toFixed(2)}秒)</span>
          )}
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-64">
          {result && <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{result}</p>}
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

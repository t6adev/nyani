'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from '../../_contexts/TranslationContext';

function ResultContent() {
  const { originalText, subscribeToStream, getLatestResult } = useTranslation();

  const [result, setResult] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationTime, setTranslationTime] = useState<number | null>(null);

  useEffect(() => {
    setResult(getLatestResult());

    const unsubscribe = subscribeToStream((err, chunk, isCompleted, elapsedTime) => {
      if (err) {
        setHasError(true);
        return;
      }
      setResult((prev) => prev + chunk);
      setIsTranslating(!isCompleted);
      if (isCompleted && elapsedTime !== undefined) {
        setTranslationTime(elapsedTime);
      }
    });

    return unsubscribe;
  }, [getLatestResult, subscribeToStream]);

  if (hasError) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-gray-500">翻訳エラーが発生しました</p>
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
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  if (!id) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-gray-500">翻訳IDが指定されていません</p>
      </div>
    );
  }

  return <ResultContent key={id} />;
}

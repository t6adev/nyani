'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAtomValue } from 'jotai';
import { useTranslation } from '../../_contexts/TranslationContext';
import { translationHistoryAtom, getTranslationById } from '@/lib/translation-history';

function Wrapper({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>;
}

function OriginalTextBox({ originalText }: { originalText: string }) {
  return (
    <div className="bg-gray-50 rounded-xl shadow-sm">
      <div className="bg-slate-100 rounded-xl overflow-scroll h-32 m-2">
        <p className="whitespace-pre-wrap text-gray-700 px-4 py-3">{originalText}</p>
      </div>
    </div>
  );
}

function TranslationStatus({
  isTranslating,
  translationTime,
}: {
  isTranslating: boolean;
  translationTime: number | null;
}) {
  return (
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
  );
}

function ResultBox({ result }: { result: string | null }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-64">
      {result && <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{result}</p>}
    </div>
  );
}

function ResultContentByLocalStorage({ id }: { id: string }) {
  const history = useAtomValue(translationHistoryAtom);
  const translation = getTranslationById(history, id);

  if (!translation) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-gray-500">翻訳が見つかりません</p>
      </div>
    );
  }

  return (
    <Wrapper>
      <OriginalTextBox originalText={translation.text} />
      <TranslationStatus isTranslating={false} translationTime={null} />
      <ResultBox result={translation.result || null} />
    </Wrapper>
  );
}

function ResultContentByStreaming() {
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
    <Wrapper>
      <OriginalTextBox originalText={originalText} />
      <TranslationStatus isTranslating={isTranslating} translationTime={translationTime} />
      <ResultBox result={result} />
    </Wrapper>
  );
}

export default function TranslationResult() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { currentTranslationId } = useTranslation();

  if (!id) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-gray-500">翻訳IDが指定されていません</p>
      </div>
    );
  }

  if (currentTranslationId !== id) {
    return <ResultContentByLocalStorage id={id} />;
  }

  return <ResultContentByStreaming key={id} />;
}

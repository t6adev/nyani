'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useRef } from 'react';
import { useSetAtom } from 'jotai';
import {
  translationHistoryAtom,
  addToHistory,
  updateHistoryResult,
} from '@/lib/translation-history';

type StreamUpdateCallback = (
  err: Error | null,
  chunk: string,
  isCompleted: boolean,
  elapsedTime?: number
) => void;

interface TranslationContextType {
  currentTranslationId: string | null;
  originalText: string;
  targetLang: 'ja' | 'en';
  startTranslation: (id: string, text: string, targetLang: 'ja' | 'en') => void;
  subscribeToStream: (callback: StreamUpdateCallback) => () => void;
  getLatestResult: () => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [currentTranslationId, setCurrentTranslationId] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState('');
  const [targetLang, setTargetLang] = useState<'ja' | 'en'>('en');
  const setHistory = useSetAtom(translationHistoryAtom);

  const dataRef = useRef('');
  const subscribersRef = useRef<Set<StreamUpdateCallback>>(new Set());

  const startTranslation = useCallback(
    async (id: string, text: string, lang: 'ja' | 'en') => {
      setCurrentTranslationId(id);
      setOriginalText(text);
      setTargetLang(lang);

      // Add to history using jotai atom
      setHistory((prev) =>
        addToHistory(prev, {
          id,
          text,
          targetLang: lang,
          createdAt: Date.now(),
        })
      );

      const startTime = performance.now();
      try {
        const response = await fetch(`/nani-api/translate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, targetLang: lang }),
        });

        if (!response.ok) {
          throw new Error('Translation failed');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No reader available');
        }

        dataRef.current = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          dataRef.current += chunk;

          subscribersRef.current.forEach((callback) => callback(null, chunk, false));
        }
        const endTime = performance.now();
        const elapsedTime = (endTime - startTime) / 1000;

        // Update history with result using jotai atom
        setHistory((prev) => updateHistoryResult(prev, id, dataRef.current));

        subscribersRef.current.forEach((callback) => callback(null, '', true, elapsedTime));
      } catch (error) {
        if (error instanceof Error) {
          console.error('[TranslationResult] Translation error:', error);
          subscribersRef.current.forEach((callback) => callback(error, '', true));
        }
      }
    },
    [setHistory]
  );

  const subscribeToStream = useCallback((callback: StreamUpdateCallback) => {
    subscribersRef.current.add(callback);
    return () => {
      subscribersRef.current.delete(callback);
    };
  }, []);

  const getLatestResult = useCallback(() => {
    return dataRef.current;
  }, []);

  return (
    <TranslationContext.Provider
      value={{
        currentTranslationId,
        originalText,
        targetLang,
        startTranslation,
        subscribeToStream,
        getLatestResult,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

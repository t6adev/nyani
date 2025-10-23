'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface TranslationContextType {
  currentTranslationId: string | null;
  originalText: string;
  targetLang: 'ja' | 'en';
  streamPromise: Promise<Response> | null;
  startTranslation: (id: string, text: string, targetLang: 'ja' | 'en') => void;
  resetTranslation: () => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [currentTranslationId, setCurrentTranslationId] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState('');
  const [targetLang, setTargetLang] = useState<'ja' | 'en'>('en');
  const [streamPromise, setStreamPromise] = useState<Promise<Response> | null>(null);

  const startTranslation = useCallback((id: string, text: string, lang: 'ja' | 'en') => {
    setCurrentTranslationId(id);
    setOriginalText(text);
    setTargetLang(lang);

    // Create fetch promise and store it
    const promise = fetch(`/nani-api/translations/${id}/stream`);
    setStreamPromise(promise);
  }, []);

  const resetTranslation = useCallback(() => {
    setCurrentTranslationId(null);
    setOriginalText('');
    setTargetLang('en');
    setStreamPromise(null);
  }, []);

  return (
    <TranslationContext.Provider
      value={{
        currentTranslationId,
        originalText,
        targetLang,
        streamPromise,
        startTranslation,
        resetTranslation,
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

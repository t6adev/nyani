'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Translation = {
  id: string;
  text: string;
  targetLang: 'ja' | 'en';
  result?: string;
  createdAt: string;
};

type Props = {
  currentId?: string;
};

export function TranslationHistory({ currentId }: Props) {
  const [translations, setTranslations] = useState<Translation[]>([]);

  useEffect(() => {
    fetchTranslations();
  }, []);

  const fetchTranslations = async () => {
    try {
      const response = await fetch('/nani-api/translations');
      const data = await response.json();
      setTranslations(data.translations);
    } catch (error) {
      console.error('Failed to fetch translations:', error);
    }
  };

  const truncateText = (text: string, maxLength: number = 40) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700">履歴 🔒</h2>
      </div>
      <div className="p-2">
        {translations.length === 0 ? (
          <p className="text-sm text-gray-500 p-4">翻訳履歴がありません</p>
        ) : (
          <ul className="space-y-1">
            {translations.map((translation) => (
              <li key={translation.id}>
                <Link
                  href={`/nani/result?id=${translation.id}`}
                  className={`block p-3 rounded-lg text-sm hover:bg-gray-100 transition-colors ${
                    currentId === translation.id ? 'bg-blue-50 border border-blue-200' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 mt-0.5">≡</span>
                    <span className="text-gray-700 flex-1">{truncateText(translation.text)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

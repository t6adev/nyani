'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';

export function TranslationForm() {
  const [text, setText] = useState('');
  const [targetLang, setTargetLang] = useState<'ja' | 'en'>('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setIsSubmitting(true);

    const id = nanoid();

    // Navigate immediately without waiting for the API response
    router.push(`/nani/result?id=${id}`);

    // Send data to server in the background
    try {
      await fetch('/nani-api/translations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, text, targetLang }),
      });
    } catch (error) {
      console.error('Translation error:', error);
    }
  };

  const toggleLanguage = () => {
    setTargetLang((prev) => (prev === 'ja' ? 'en' : 'ja'));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {/* Language Selector */}
      <div className="flex items-center justify-start gap-4 mb-6">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <span className="font-semibold">{targetLang === 'ja' ? '日本語' : '英語'}</span>
          <span className="text-gray-400">⇄</span>
          <span className="font-semibold">{targetLang === 'ja' ? '英語' : '日本語'}</span>
        </button>
      </div>

      {/* Text Area */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="好きな言語で入力..."
        className="w-full h-48 p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
      />

      {/* Action Icons and Button */}
      <div className="flex items-center justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !text.trim()}
          className="px-8 py-3 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
        >
          {isSubmitting ? '送信中...' : '翻訳する'}
          <span>↑</span>
        </button>
      </div>
    </div>
  );
}

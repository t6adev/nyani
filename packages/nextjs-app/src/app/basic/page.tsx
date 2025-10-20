'use client';

import { useState } from 'react';

export default function BasicPage() {
  const [text, setText] = useState('');
  const [targetLang, setTargetLang] = useState<'ja' | 'en'>('en');
  const [result, setResult] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!text.trim()) return;

    setIsTranslating(true);
    setResult('');

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, targetLang }),
      });

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
      setIsTranslating(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">翻訳アプリ (Basic)</h1>

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
          onClick={handleTranslate}
          disabled={isTranslating || !text.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed mb-8"
        >
          {isTranslating ? '翻訳中...' : '翻訳'}
        </button>

        {result && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">翻訳結果:</h2>
            <div className="p-4 border rounded bg-gray-50 whitespace-pre-wrap">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

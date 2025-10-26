import { atomWithStorage, createJSONStorage } from 'jotai/utils';

export type TranslationHistory = {
  id: string;
  text: string;
  targetLang: 'ja' | 'en';
  result?: string;
  createdAt: number;
};

const STORAGE_KEY = 'nani_translation_history';
const MAX_HISTORY = 50;

// Create custom storage with localStorage
const storage = createJSONStorage<TranslationHistory[]>(() => localStorage);

// Create atom with storage
export const translationHistoryAtom = atomWithStorage<TranslationHistory[]>(
  STORAGE_KEY,
  [],
  storage
);

/**
 * 履歴に新規追加（上限を超えたら古いものを削除）
 * この関数はjotaiのsetterと一緒に使用します
 */
export function addToHistory(
  history: TranslationHistory[],
  item: TranslationHistory
): TranslationHistory[] {
  const newHistory = [item, ...history];
  if (newHistory.length > MAX_HISTORY) {
    newHistory.splice(MAX_HISTORY);
  }
  return newHistory;
}

/**
 * 履歴の更新（翻訳結果を追加）
 * この関数はjotaiのsetterと一緒に使用します
 */
export function updateHistoryResult(
  history: TranslationHistory[],
  id: string,
  result: string
): TranslationHistory[] {
  return history.map((item) =>
    item.id === id ? { ...item, result } : item
  );
}

/**
 * IDで履歴アイテムを取得
 */
export function getTranslationById(
  history: TranslationHistory[],
  id: string
): TranslationHistory | undefined {
  return history.find((h) => h.id === id);
}

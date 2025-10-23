type Translation = {
  id: string;
  text: string;
  targetLang: 'ja' | 'en';
  result?: string;
  createdAt: Date;
};

class NaniTranslationStore {
  private translations: Map<string, Translation> = new Map();

  create(id: string, text: string, targetLang: 'ja' | 'en'): void {
    this.translations.set(id, {
      id,
      text,
      targetLang,
      createdAt: new Date(),
    });
  }

  get(id: string): Translation | undefined {
    return this.translations.get(id);
  }

  getAll(): Translation[] {
    return Array.from(this.translations.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  updateResult(id: string, result: string): void {
    const translation = this.translations.get(id);
    if (translation) {
      translation.result = result;
    }
  }
}

export const naniTranslationStore = new NaniTranslationStore();
export type { Translation };

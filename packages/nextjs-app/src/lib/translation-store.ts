type Translation = {
  id: string;
  text: string;
  targetLang: 'ja' | 'en';
  result?: string;
  createdAt: Date;
};

class TranslationStore {
  private translations: Map<string, Translation> = new Map();

  create(text: string, targetLang: 'ja' | 'en'): string {
    const id = this.generateId();
    this.translations.set(id, {
      id,
      text,
      targetLang,
      createdAt: new Date(),
    });
    return id;
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

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

export const translationStore = new TranslationStore();
export type { Translation };

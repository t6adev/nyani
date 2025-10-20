import { GoogleGenAI } from '@google/genai';
import { Readable } from 'node:stream';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type Language = 'ja' | 'en';

interface TranslateOptions {
  text: string;
  targetLang: Language;
  useNodeStream?: boolean;
}

export async function translate({
  text,
  targetLang,
  useNodeStream = false,
}: TranslateOptions): Promise<ReadableStream<string> | Readable> {
  const langName = targetLang === 'ja' ? '日本語' : '英語';
  const prompt = `次のテキストを${langName}に翻訳してください。翻訳結果のみを出力してください。\n\n${text}`;

  const response = await ai.models.generateContentStream({
    model: 'gemini-2.5-flash-lite',
    contents: prompt,
  });

  if (useNodeStream) {
    return Readable.from(async function* () {
      try {
        for await (const chunk of response) {
          if (chunk.text) {
            yield chunk.text;
          }
        }
      } catch (error) {
        throw error;
      }
    }());
  }

  return new ReadableStream<string>({
    async start(controller) {
      try {
        for await (const chunk of response) {
          if (chunk.text) {
            controller.enqueue(chunk.text);
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

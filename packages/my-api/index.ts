import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';

import { Readable } from 'node:stream';

const geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

type Language = 'ja' | 'en';

interface TranslateOptions {
  text: string;
  targetLang: Language;
  clientType?: 'groq' | 'gemini';
  useNodeStream?: boolean;
}

export async function translate({
  text,
  targetLang,
  clientType = 'groq',
  useNodeStream = false,
}: TranslateOptions): Promise<ReadableStream<string> | Readable> {
  const langName = targetLang === 'ja' ? '日本語' : '英語';
  const prompt = `次のテキストを${langName}に翻訳してください。翻訳結果のみを出力してください。\n\n${text}`;

  if (clientType === 'groq') {
    const response = await groqClient.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    if (useNodeStream) {
      return Readable.from(
        (async function* () {
          try {
            for await (const chunk of response) {
              const content = chunk.choices[0]?.delta?.content;
              if (content) {
                yield content;
              }
            }
          } catch (error) {
            throw error;
          }
        })()
      );
    }

    return new ReadableStream<string>({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(content);
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  } else {
    // Gemini client
    const response = await geminiClient.models.generateContentStream({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
    });

    if (useNodeStream) {
      return Readable.from(
        (async function* () {
          try {
            for await (const chunk of response) {
              if (chunk.text) {
                yield chunk.text;
              }
            }
          } catch (error) {
            throw error;
          }
        })()
      );
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
}

import { translate } from 'my-api';
import { NextRequest } from 'next/server';
import { Readable } from 'node:stream';
import { naniTranslationStore } from '@/lib/nani-translation-store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const translation = naniTranslationStore.get(id);

  if (!translation) {
    return new Response('Translation not found', { status: 404 });
  }

  const stream = await translate({
    text: translation.text,
    targetLang: translation.targetLang,
    useNodeStream: true,
  });

  let fullResult = '';

  if (stream instanceof Readable) {
    const transformedStream = new ReadableStream({
      async start(controller) {
        stream.on('data', (chunk) => {
          const text = chunk.toString();
          fullResult += text;
          controller.enqueue(new TextEncoder().encode(text));
        });

        stream.on('end', () => {
          naniTranslationStore.updateResult(id, fullResult);
          controller.close();
        });

        stream.on('error', (error) => {
          controller.error(error);
        });
      },
    });

    return new Response(transformedStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  }

  return new Response('Stream type not supported', { status: 500 });
}

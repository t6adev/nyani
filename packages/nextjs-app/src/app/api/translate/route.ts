import { translate } from 'my-api';
import { NextRequest } from 'next/server';
import { Readable } from 'node:stream';

export async function POST(request: NextRequest) {
  const { text, targetLang } = await request.json();

  if (!text || !targetLang) {
    return new Response('Missing text or targetLang', { status: 400 });
  }

  const stream = await translate({
    text,
    targetLang,
    useNodeStream: true,
  });

  if (stream instanceof Readable) {
    const transformedStream = new ReadableStream({
      async start(controller) {
        stream.on('data', (chunk) => {
          const text = chunk.toString();
          controller.enqueue(new TextEncoder().encode(text));
        });

        stream.on('end', () => {
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

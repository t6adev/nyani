import { translate } from 'my-api';
import { NextRequest } from 'next/server';
import { Readable } from 'node:stream';

export async function POST(request: NextRequest) {
  const { text, targetLang, useNodeStream } = await request.json();

  if (!text || !targetLang) {
    return new Response('Missing text or targetLang', { status: 400 });
  }

  const stream = await translate({ text, targetLang, useNodeStream });

  if (stream instanceof Readable) {
    return new Response(Readable.toWeb(stream) as ReadableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  }

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  });
}

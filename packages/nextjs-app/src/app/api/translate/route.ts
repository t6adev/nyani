import { translate } from 'my-api';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { text, targetLang } = await request.json();

  if (!text || !targetLang) {
    return new Response('Missing text or targetLang', { status: 400 });
  }

  const stream = await translate({ text, targetLang });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  });
}

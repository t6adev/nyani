import { NextRequest, NextResponse } from 'next/server';
import { naniTranslationStore } from '@/lib/nani-translation-store';

export async function POST(request: NextRequest) {
  const { id, text, targetLang } = await request.json();

  if (!id || !text || !targetLang) {
    return NextResponse.json(
      { error: 'Missing id, text, or targetLang' },
      { status: 400 }
    );
  }

  naniTranslationStore.create(id, text, targetLang);
  return NextResponse.json({ success: true });
}

export async function GET() {
  const translations = naniTranslationStore.getAll();
  return NextResponse.json({ translations });
}

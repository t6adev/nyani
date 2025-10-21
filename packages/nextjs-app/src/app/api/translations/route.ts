import { NextRequest, NextResponse } from 'next/server';
import { translationStore } from '@/lib/translation-store';

export async function POST(request: NextRequest) {
  const { text, targetLang } = await request.json();

  if (!text || !targetLang) {
    return NextResponse.json(
      { error: 'Missing text or targetLang' },
      { status: 400 }
    );
  }

  const id = translationStore.create(text, targetLang);
  return NextResponse.json({ id });
}

export async function GET() {
  const translations = translationStore.getAll();
  return NextResponse.json({ translations });
}

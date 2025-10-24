import { NextRequest, NextResponse } from 'next/server';
import { naniTranslationStore } from '@/lib/nani-translation-store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const translation = naniTranslationStore.get(id);

  if (!translation) {
    return NextResponse.json({ error: 'Translation not found' }, { status: 404 });
  }

  return NextResponse.json({ translation });
}

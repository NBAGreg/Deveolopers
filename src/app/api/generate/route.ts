import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { generateContent } from '@/lib/anthropic';
import { getSettings, saveContent } from '@/lib/storage';
import { ContentRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: ContentRequest = await request.json();

    if (!body.topic?.trim()) {
      return NextResponse.json({ error: 'Topic is required.' }, { status: 400 });
    }

    const settings = getSettings();
    const content = await generateContent(body, settings.brand, settings.apiKey);

    const item = {
      id: uuidv4(),
      ...body,
      content,
      createdAt: new Date().toISOString(),
    };

    saveContent(item);
    return NextResponse.json(item);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Content generation failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

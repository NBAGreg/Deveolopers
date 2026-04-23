import { NextRequest, NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/storage';

export async function GET() {
  const settings = getSettings();
  // Strip API key before sending to client
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { apiKey: _key, ...safe } = settings;
  return NextResponse.json(safe);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  saveSettings(body);
  return NextResponse.json({ success: true });
}

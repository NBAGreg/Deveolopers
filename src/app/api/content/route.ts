import { NextResponse } from 'next/server';
import { getContent } from '@/lib/storage';

export async function GET() {
  return NextResponse.json(getContent());
}

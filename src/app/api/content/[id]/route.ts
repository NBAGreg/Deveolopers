import { NextRequest, NextResponse } from 'next/server';
import { deleteContent } from '@/lib/storage';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  deleteContent(id);
  return NextResponse.json({ success: true });
}

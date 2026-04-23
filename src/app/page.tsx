'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GeneratedContent, CONTENT_TYPE_LABELS } from '@/lib/types';

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function typeColor(type: string): string {
  const map: Record<string, string> = {
    'blog-post': 'bg-purple-100 text-purple-700',
    'linkedin-post': 'bg-blue-100 text-blue-700',
    'twitter-thread': 'bg-sky-100 text-sky-700',
    'email-newsletter': 'bg-orange-100 text-orange-700',
    'product-description': 'bg-green-100 text-green-700',
    'press-release': 'bg-rose-100 text-rose-700',
  };
  return map[type] ?? 'bg-gray-100 text-gray-700';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function DashboardPage() {
  const [items, setItems] = useState<GeneratedContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/content')
      .then((r) => r.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const thisWeek = items.filter((i) => {
    const diff = Date.now() - new Date(i.createdAt).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const topType = items.reduce<Record<string, number>>((acc, i) => {
    acc[i.type] = (acc[i.type] ?? 0) + 1;
    return acc;
  }, {});
  const mostUsed = Object.entries(topType).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of your generated content</p>
        </div>
        <Link
          href="/generate"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Content
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Generated" value={items.length} color="text-gray-900" />
        <StatCard label="This Week" value={thisWeek} color="text-blue-600" />
        <StatCard
          label="Most Used Format"
          value={mostUsed ? mostUsed[1] : 0}
          color="text-purple-600"
        />
      </div>

      {mostUsed && (
        <div className="mb-2 text-xs text-gray-500">
          Most used:{' '}
          <span className="font-medium text-gray-700">
            {CONTENT_TYPE_LABELS[mostUsed[0] as keyof typeof CONTENT_TYPE_LABELS]}
          </span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Content</h2>
          <Link href="/library" className="text-sm text-blue-600 hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 mb-3">No content yet.</p>
            <Link href="/generate" className="text-blue-600 text-sm hover:underline">
              Generate your first piece
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.slice(0, 8).map((item) => (
              <li key={item.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor(item.type)}`}>
                      {CONTENT_TYPE_LABELS[item.type]}
                    </span>
                    <span className="text-xs text-gray-400">{timeAgo(item.createdAt)}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">{item.topic}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {item.content.slice(0, 120)}...
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

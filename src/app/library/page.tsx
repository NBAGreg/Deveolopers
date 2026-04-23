'use client';

import { useEffect, useState } from 'react';
import { GeneratedContent, ContentType, CONTENT_TYPE_LABELS } from '@/lib/types';

const TYPE_COLORS: Record<string, string> = {
  'blog-post': 'bg-purple-100 text-purple-700',
  'linkedin-post': 'bg-blue-100 text-blue-700',
  'twitter-thread': 'bg-sky-100 text-sky-700',
  'email-newsletter': 'bg-orange-100 text-orange-700',
  'product-description': 'bg-green-100 text-green-700',
  'press-release': 'bg-rose-100 text-rose-700',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

export default function LibraryPage() {
  const [items, setItems] = useState<GeneratedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ContentType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/content')
      .then((r) => r.json())
      .then((data) => { setItems(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function deleteItem(id: string) {
    await fetch(`/api/content/${id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (expanded === id) setExpanded(null);
  }

  const filtered = items.filter((i) => {
    const matchType = filter === 'all' || i.type === filter;
    const matchSearch =
      !search ||
      i.topic.toLowerCase().includes(search.toLowerCase()) ||
      i.content.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const allTypes = Array.from(new Set(items.map((i) => i.type))) as ContentType[];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Content Library</h1>
        <p className="text-gray-500 text-sm mt-1">
          {items.length} piece{items.length !== 1 ? 's' : ''} generated
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search topics or content..."
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
        />
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
              filter === 'all'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            All
          </button>
          {allTypes.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                filter === t
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {CONTENT_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-400">
            {items.length === 0 ? 'Your library is empty.' : 'No results match your filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div
                className="px-5 py-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
              >
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${TYPE_COLORS[item.type]}`}>
                  {CONTENT_TYPE_LABELS[item.type]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.topic}</p>
                  {expanded !== item.id && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {item.content.slice(0, 100)}...
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${expanded === item.id ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {expanded === item.id && (
                <div className="border-t border-gray-100">
                  <div className="flex items-center gap-2 px-5 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="text-xs text-gray-500 capitalize">Tone: {item.tone}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-500 capitalize">Length: {item.length}</span>
                    {item.keywords && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-gray-500">Keywords: {item.keywords}</span>
                      </>
                    )}
                    <div className="ml-auto flex items-center gap-1">
                      <CopyButton text={item.content} />
                      <button
                        onClick={() => downloadText(`${item.type}-${item.id}.md`, item.content)}
                        className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    <pre className="prose-content">{item.content}</pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

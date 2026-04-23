'use client';

import { useState } from 'react';
import { ContentRequest, ContentType, Tone, Length, CONTENT_TYPE_LABELS, GeneratedContent } from '@/lib/types';

const CONTENT_TYPES: { value: ContentType; emoji: string }[] = [
  { value: 'blog-post', emoji: '✍️' },
  { value: 'linkedin-post', emoji: '💼' },
  { value: 'twitter-thread', emoji: '🐦' },
  { value: 'email-newsletter', emoji: '📧' },
  { value: 'product-description', emoji: '🛍️' },
  { value: 'press-release', emoji: '📰' },
];

const TONES: Tone[] = ['professional', 'casual', 'friendly', 'authoritative', 'inspirational'];

const DEFAULT_FORM: ContentRequest = {
  type: 'blog-post',
  topic: '',
  keywords: '',
  tone: 'professional',
  length: 'medium',
  audience: '',
  additionalContext: '',
};

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
      className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
    >
      {copied ? (
        <>
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
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

export default function GeneratePage() {
  const [form, setForm] = useState<ContentRequest>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState('');

  function set<K extends keyof ContentRequest>(key: K, value: ContentRequest[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function generate() {
    if (!form.topic.trim()) {
      setError('Please enter a topic.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Generation failed');
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Generate Content</h1>
        <p className="text-gray-500 text-sm mt-1">Describe what you need and Claude will write it.</p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Form */}
        <div className="col-span-2 space-y-5">
          {/* Content Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
            <div className="grid grid-cols-2 gap-2">
              {CONTENT_TYPES.map(({ value, emoji }) => (
                <button
                  key={value}
                  onClick={() => set('type', value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors text-left ${
                    form.type === value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <span>{emoji}</span>
                  <span className="leading-tight">{CONTENT_TYPE_LABELS[value]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={form.topic}
              onChange={(e) => set('topic', e.target.value)}
              placeholder="e.g. How AI is transforming the logistics industry"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Tone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tone</label>
            <select
              value={form.tone}
              onChange={(e) => set('tone', e.target.value as Tone)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TONES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
            <div className="flex gap-2">
              {(['short', 'medium', 'long'] as Length[]).map((l) => (
                <button
                  key={l}
                  onClick={() => set('length', l)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                    form.length === l
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keywords <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={form.keywords}
              onChange={(e) => set('keywords', e.target.value)}
              placeholder="e.g. AI, supply chain, efficiency"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Audience <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={form.audience}
              onChange={(e) => set('audience', e.target.value)}
              placeholder="e.g. Logistics managers at mid-size companies"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Additional Context */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Context <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={form.additionalContext}
              onChange={(e) => set('additionalContext', e.target.value)}
              placeholder="Any specific points, stats, or angles to include"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating...
              </>
            ) : (
              'Generate Content'
            )}
          </button>
        </div>

        {/* Output */}
        <div className="col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 h-full flex flex-col min-h-96">
            {result ? (
              <>
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {CONTENT_TYPE_LABELS[result.type]}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{result.topic}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CopyButton text={result.content} />
                    <button
                      onClick={() => downloadText(`${result.type}-${Date.now()}.md`, result.content)}
                      className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                    <button
                      onClick={generate}
                      className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Regenerate
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-5">
                  <pre className="prose-content">{result.content}</pre>
                </div>
                <div className="px-5 py-3 border-t border-gray-100 bg-green-50 rounded-b-xl">
                  <p className="text-xs text-green-700">
                    Saved to your library automatically.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                {loading ? (
                  <div>
                    <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-gray-500">Claude is writing your content...</p>
                  </div>
                ) : (
                  <div>
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">
                      Fill in the form and click <strong>Generate Content</strong>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Your content will appear here
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

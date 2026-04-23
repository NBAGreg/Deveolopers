'use client';

import { useEffect, useState } from 'react';
import { BrandSettings } from '@/lib/types';

const DEFAULT_BRAND: BrandSettings = {
  companyName: '',
  industry: '',
  description: '',
  voiceGuidelines: '',
  website: '',
};

export default function SettingsPage() {
  const [brand, setBrand] = useState<BrandSettings>(DEFAULT_BRAND);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.brand) setBrand(data.brand);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function setField(key: keyof BrandSettings, value: string) {
    setBrand((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    const payload: { brand: BrandSettings; apiKey?: string } = { brand };
    if (apiKey.trim()) payload.apiKey = apiKey.trim();

    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure your brand and API key.</p>
      </div>

      {/* API Key */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-1">Anthropic API Key</h2>
        <p className="text-sm text-gray-500 mb-4">
          Required to generate content. Get your key at{' '}
          <span className="text-blue-600">console.anthropic.com</span>. You can also set it as the{' '}
          <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">ANTHROPIC_API_KEY</code>{' '}
          environment variable.
        </p>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-api03-..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-20"
          />
          <button
            onClick={() => setShowKey((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Keys are stored locally on your server and never sent to third parties.
        </p>
      </section>

      {/* Brand Info */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-1">Brand Information</h2>
        <p className="text-sm text-gray-500 mb-4">
          Used to tailor content to your company. Leave blank to generate generic content.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={brand.companyName}
                onChange={(e) => setField('companyName', e.target.value)}
                placeholder="Acme Corp"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <input
                type="text"
                value={brand.industry}
                onChange={(e) => setField('industry', e.target.value)}
                placeholder="SaaS / E-commerce / Healthcare"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="url"
              value={brand.website}
              onChange={(e) => setField('website', e.target.value)}
              placeholder="https://example.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
            <textarea
              rows={3}
              value={brand.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Brief description of what your company does and its mission..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Voice Guidelines</label>
            <textarea
              rows={4}
              value={brand.voiceGuidelines}
              onChange={(e) => setField('voiceGuidelines', e.target.value)}
              placeholder="Describe your brand voice. e.g. We are direct, human, and avoid jargon. We speak to busy professionals who value their time. We never use buzzwords like 'synergy' or 'disruptive'."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {saved && (
          <span className="text-sm text-green-600 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Saved!
          </span>
        )}
      </div>
    </div>
  );
}

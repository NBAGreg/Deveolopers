import fs from 'fs';
import path from 'path';
import { GeneratedContent, AppSettings } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function getContent(): GeneratedContent[] {
  ensureDataDir();
  if (!fs.existsSync(CONTENT_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

export function saveContent(item: GeneratedContent): void {
  ensureDataDir();
  const all = getContent();
  all.unshift(item);
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(all, null, 2));
}

export function deleteContent(id: string): void {
  ensureDataDir();
  const all = getContent().filter((c) => c.id !== id);
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(all, null, 2));
}

const DEFAULT_SETTINGS: AppSettings = {
  brand: {
    companyName: '',
    industry: '',
    description: '',
    voiceGuidelines: '',
    website: '',
  },
};

export function getSettings(): AppSettings {
  ensureDataDir();
  if (!fs.existsSync(SETTINGS_FILE)) return DEFAULT_SETTINGS;
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  ensureDataDir();
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

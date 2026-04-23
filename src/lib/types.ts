export type ContentType =
  | 'blog-post'
  | 'linkedin-post'
  | 'twitter-thread'
  | 'email-newsletter'
  | 'product-description'
  | 'press-release';

export type Tone =
  | 'professional'
  | 'casual'
  | 'friendly'
  | 'authoritative'
  | 'inspirational';

export type Length = 'short' | 'medium' | 'long';

export interface ContentRequest {
  type: ContentType;
  topic: string;
  keywords?: string;
  tone: Tone;
  length: Length;
  audience?: string;
  additionalContext?: string;
}

export interface GeneratedContent {
  id: string;
  type: ContentType;
  topic: string;
  content: string;
  tone: Tone;
  length: Length;
  createdAt: string;
  keywords?: string;
  audience?: string;
}

export interface BrandSettings {
  companyName: string;
  industry: string;
  description: string;
  voiceGuidelines: string;
  website?: string;
}

export interface AppSettings {
  brand: BrandSettings;
  apiKey?: string;
}

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  'blog-post': 'Blog Post',
  'linkedin-post': 'LinkedIn Post',
  'twitter-thread': 'Twitter / X Thread',
  'email-newsletter': 'Email Newsletter',
  'product-description': 'Product Description',
  'press-release': 'Press Release',
};

export const TONE_LABELS: Record<Tone, string> = {
  professional: 'Professional',
  casual: 'Casual',
  friendly: 'Friendly',
  authoritative: 'Authoritative',
  inspirational: 'Inspirational',
};

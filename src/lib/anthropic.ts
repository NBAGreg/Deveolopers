import Anthropic from '@anthropic-ai/sdk';
import { ContentRequest, BrandSettings, Length } from './types';

const LENGTH_WORDS: Record<string, Record<Length, string>> = {
  'blog-post':           { short: '400–600 words', medium: '900–1200 words', long: '1800–2500 words' },
  'linkedin-post':       { short: '100–200 words', medium: '300–450 words',  long: '600–900 words' },
  'twitter-thread':      { short: '3–5 tweets',    medium: '6–9 tweets',     long: '12–15 tweets' },
  'email-newsletter':    { short: '200–300 words', medium: '400–600 words',  long: '700–1000 words' },
  'product-description': { short: '80–150 words',  medium: '200–300 words',  long: '400–600 words' },
  'press-release':       { short: '300–400 words', medium: '500–700 words',  long: '900–1200 words' },
};

const FORMAT_INSTRUCTIONS: Record<string, string> = {
  'blog-post':
    'Write a blog post with a compelling H1 title, an engaging intro paragraph, 3–5 sections each with an ## subheading, and a conclusion. Use markdown formatting.',
  'linkedin-post':
    'Write a LinkedIn post. Open with a one-line hook, develop the idea with short paragraphs (1–2 sentences each), end with a question or call to action, then add 3–5 relevant hashtags on a new line.',
  'twitter-thread':
    'Write a Twitter/X thread. Number each tweet starting with "1/". Keep each tweet under 280 characters. Make tweet 1 a strong standalone hook. End with a summary or CTA tweet.',
  'email-newsletter':
    'Write an email newsletter. First line: "Subject: <subject line>". Then a blank line, then the body with a warm greeting, 2–3 content sections, and a clear CTA. Sign off professionally.',
  'product-description':
    'Write a product description with a punchy headline, 3–5 benefit-focused bullet points (use • ), and a persuasive closing sentence with a soft CTA.',
  'press-release':
    'Write a press release in AP style: "FOR IMMEDIATE RELEASE" on line 1, then headline, then city/date dateline, then inverted-pyramid body paragraphs, then a ### boilerplate section for the company, ending with ###.',
};

function buildSystemPrompt(brand: BrandSettings): string {
  if (!brand.companyName) return 'You are an expert content writer who produces high-quality, engaging content.';

  return `You are an expert content writer for ${brand.companyName}, a company in the ${brand.industry} industry.

About the company: ${brand.description}
Brand voice guidelines: ${brand.voiceGuidelines}${brand.website ? `\nWebsite: ${brand.website}` : ''}

Always write content that reflects the brand's voice and is aligned with its industry.`;
}

function buildUserPrompt(request: ContentRequest): string {
  const wordGuide = LENGTH_WORDS[request.type]?.[request.length] ?? '500 words';
  const formatInstruction = FORMAT_INSTRUCTIONS[request.type] ?? 'Write high-quality content.';

  const lines = [
    `${formatInstruction}`,
    `Target length: ${wordGuide}.`,
    `Tone: ${request.tone}.`,
    `Topic: ${request.topic}`,
  ];

  if (request.keywords) lines.push(`Keywords to naturally include: ${request.keywords}`);
  if (request.audience) lines.push(`Target audience: ${request.audience}`);
  if (request.additionalContext) lines.push(`Additional context: ${request.additionalContext}`);

  lines.push('\nOutput only the finished content — no preamble, explanation, or meta-commentary.');

  return lines.join('\n');
}

export async function generateContent(
  request: ContentRequest,
  brand: BrandSettings,
  apiKey?: string
): Promise<string> {
  const client = new Anthropic({ apiKey: apiKey || process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: buildSystemPrompt(brand),
    messages: [{ role: 'user', content: buildUserPrompt(request) }],
  });

  const block = message.content[0];
  if (block.type !== 'text') throw new Error('Unexpected response type from Claude API');
  return block.text;
}

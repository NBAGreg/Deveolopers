import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Content Automator',
  description: 'AI-powered content generation for your company',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen">
        <Navigation />
        <main className="flex-1 overflow-auto">{children}</main>
      </body>
    </html>
  );
}

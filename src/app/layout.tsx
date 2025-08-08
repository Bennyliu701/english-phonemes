import './globals.css';
import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'English Phonemes (MVP)',
  description: 'H5 platform for learning phonemes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-gray-900 hover:text-blue-700 transition-colors">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white text-sm font-bold shadow-sm">EP</span>
              <span>English Phonemes</span>
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}

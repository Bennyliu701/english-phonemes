import './globals.css';
import React from 'react';

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
            <div className="text-lg font-semibold tracking-tight">English Phonemes</div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}

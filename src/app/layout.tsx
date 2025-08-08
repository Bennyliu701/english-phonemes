import './globals.css';
import React from 'react';

export const metadata = {
  title: 'English Phonemes (MVP)',
  description: 'H5 platform for learning phonemes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <header style={{ padding: 12, borderBottom: '1px solid #eee' }}>
          <strong>English Phonemes</strong>
        </header>
        <main style={{ padding: 12 }}>{children}</main>
      </body>
    </html>
  );
}

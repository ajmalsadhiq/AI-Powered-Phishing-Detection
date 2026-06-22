import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'PhishGuard AI',
  description: 'AI-powered phishing detection dashboard',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

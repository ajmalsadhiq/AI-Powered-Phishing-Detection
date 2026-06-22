import './globals.css';
import type { ReactNode } from 'react';
import Navbar from '@/components/navbar';

export const metadata = {
  title: "AJMAL's-PHISHING-GUARD",
  description: 'AI-powered phishing detection dashboard',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}

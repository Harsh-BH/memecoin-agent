import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'MemeCoin Dashboard',
  description: 'Dashboard for MemeCoin',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100">
      <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        {children}
      </body>
    </html>
  );
}

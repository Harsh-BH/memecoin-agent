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
        {children}
      </body>
    </html>
  );
}

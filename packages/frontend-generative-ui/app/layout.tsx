import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s - RAG Agent',
    default: 'RAG Agent'
  },
  description: 'create by next'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className='h-full antialiased'>
      <body className='h-screen w-screen overflow-hidden'>{children}</body>
    </html>
  );
}

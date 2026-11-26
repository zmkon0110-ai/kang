import type { Metadata } from 'next';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI 产品灵感墙 | Supabase + Next.js Demo',
  description: 'Next.js + Supabase + GA4 全流程演示 Demo',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="zh-CN">
      <body>
        <GoogleAnalytics gaId={gaId} />
        {children}
      </body>
    </html>
  );
}

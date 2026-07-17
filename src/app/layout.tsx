import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'AG-UC-0010 | Sprint Intelligence & KPI Agent',
  description: 'Enterprise AI Dashboard & Copilot for Engineering Sprint Optimization & KPI Tracking.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#030712] text-slate-100 selection:bg-purple-500/30 selection:text-purple-200">
        <Providers>
          {/* Ambient Background Glowing Nodes */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px] animate-float animate-pulse-slow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[120px] animate-float animate-pulse-slow" style={{ animationDelay: '-4s' }} />
            <div className="absolute top-[40%] left-[60%] w-[35%] h-[35%] rounded-full bg-pink-600/5 blur-[100px] animate-float" style={{ animationDelay: '-2s' }} />
          </div>
          
          <div className="relative z-10 flex flex-col flex-1">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}

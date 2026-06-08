import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/lib/components/Navbar';

export const metadata: Metadata = {
  title: 'ATS Scanner — Beat the Algorithms',
  description: 'Score your resume against 6 real enterprise ATS platforms. Powered by documented ATS behavior, not generic algorithms.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#07070f] text-white antialiased">
        <div className="aurora-a" />
        <div className="aurora-b" />
        <div className="aurora-c" />
        <div className="bg-grid-overlay" />
        <div className="relative z-10">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}

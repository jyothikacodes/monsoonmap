import type { Metadata } from 'next';
import { Instrument_Serif, Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MonsoonMap — Walk Your Streets. Expose the Problems. Make the Evidence Count.',
  description:
    'Turn outdoor walks into actionable community environmental evidence. Document waterlogging, choked drains, broken footpaths, and litter using open-weight vision AI. Built for Hacktoberfest x DEV Week 1 Touch Grass Challenge.',
  keywords: [
    'civic tech',
    'open-source AI',
    'waterlogging',
    'drainage',
    'Gemma 3',
    'Hacktoberfest',
    'Touch Grass',
    'community mapping',
    'pedestrian safety',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${plusJakartaSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-[#fbf9f6] text-[#191f1b] antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

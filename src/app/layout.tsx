import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import '../../public/assets/css/style.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AUVARE — Curated Vintage & 1-of-1 Preloved Clothing Drops',
  description: 'Shop curated vintage streetwear, graphic tees, retro outerwear, and washed denim drops in sizes S to XXL with nationwide delivery across Bangladesh.',
  icons: {
    icon: '/assets/images/logo.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${playfair.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-[#faf8f5] text-[#18181b] flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}

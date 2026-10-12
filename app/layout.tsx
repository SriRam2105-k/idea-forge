import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'NPR Hackathon 2025 — Build Today, Solve Tomorrow',
    template: '%s | NPR Hackathon 2025',
  },
  description: 'The official hackathon portal for NPR College of Engineering. Explore problem statements, form your team, and build innovative solutions.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    siteName: 'NPR Hackathon 2025',
    title: 'NPR Hackathon 2025 — Build Today, Solve Tomorrow',
    description: 'Explore 50+ problem statements and build solutions at NPR College of Engineering\'s annual hackathon.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NPR Hackathon 2025',
    description: 'Explore problem statements and compete at NPR College of Engineering.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white antialiased">
        {children}
      </body>
    </html>
  );
}

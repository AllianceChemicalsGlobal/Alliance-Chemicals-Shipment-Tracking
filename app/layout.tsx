import './globals.css';
import type { Metadata } from 'next';

/* Use system font stack to avoid Google Fonts fetch at build time */

export const metadata: Metadata = {
  title: 'Shipment Tracker',
  description: 'Track international and domestic shipments',
  openGraph: {
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased overflow-x-hidden min-h-screen">{children}</body>
    </html>
  );
}

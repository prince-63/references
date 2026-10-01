import type { Metadata } from 'next';
import { Figtree } from 'next/font/google';
import './globals.css';
import { EnvironmentProvider } from '@/lib/EnvironmentContext';
import { AuthProvider } from '@/lib/AuthContext';
import { ToastProvider } from '@/lib/toast';

const figtreeFont = Figtree({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-figtree',
});

export const metadata: Metadata = {
  title: 'Dental Stack - Admin Dashboard',
  description: 'Internal admin dashboard for support, QA, and marketing teams',
  icons: {
    icon: '/DentalStackFavIcon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${figtreeFont.variable} antialiased`}>
        <ToastProvider>
          <AuthProvider>
            <EnvironmentProvider>{children}</EnvironmentProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

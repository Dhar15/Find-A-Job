import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './providers';
import ConditionalNavbar from '@components/ConditionalNavbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Just Apply Mate',
  description: 'Track, manage, and conquer your job applications',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConditionalNavbar>
          <AuthProvider>{children}</AuthProvider>
        </ConditionalNavbar>
      </body>
    </html>
  );
}
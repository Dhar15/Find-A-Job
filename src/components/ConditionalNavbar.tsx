'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@components/NavBar';

export default function ConditionalNavbar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNavbar = pathname.startsWith('/jobs') || pathname === '/profile';

  return (
    <>
      {showNavbar && <Navbar />}
      <main className={showNavbar ? 'pt-8' : ''}>{children}</main>
    </>
  );
}
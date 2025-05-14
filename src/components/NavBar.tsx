'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path ? 'text-blue-600 font-semibold' : 'text-gray-600';

  return (
    <nav className="w-full bg-white shadow-sm fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/jobs" className="text-lg font-bold text-gray-800 hover:text-blue-600">
          Home.
        </Link>
        <div className="flex space-x-6">
          <Link href="/profile" className={`${isActive('/profile')} hover:text-blue-500`}>
            Profile
          </Link>
          <Link href="/jobs/stats" className={`${isActive('/jobs/stats')} hover:text-blue-500`}>
            Stats
          </Link>
        </div>
      </div>
    </nav>
  );
}

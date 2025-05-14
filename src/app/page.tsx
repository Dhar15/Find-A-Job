'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();
  const { status } = useSession();

  // Redirect to profile if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/profile');
    }
  }, [status, router]);

  const handleLinkedInSignIn = async () => {
    await signIn('linkedin', { callbackUrl: '/profile' });
  };

  const handleGuestLogin = () => {
  localStorage.setItem(
    'guestSession',
    JSON.stringify({
      user: {
        name: 'Guest',
        email: 'guest@example.com',
        image: '/default-avatar.png',
      },
    })
  );
  router.push('/jobs');
};

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-blue-100 flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg text-gray-700">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-blue-100 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Your personal job tracker CRM.</h1>
        <p className="text-lg text-gray-700 mb-8">Track, manage, and conquer your job applications.</p>

        <div className="flex flex-col items-center space-y-2">

          <button
            onClick={handleLinkedInSignIn}
            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-800 transition mb-4 max-w-xs"
          >
            Sign in with LinkedIn
          </button>

          <button
            onClick={handleGuestLogin}
            className="text-sm text-blue-600 cursor-pointer underline hover:text-blue-800"
          >
            Sign in as a guest
          </button>
        
        </div>

      </div>
    </main>
  );
}
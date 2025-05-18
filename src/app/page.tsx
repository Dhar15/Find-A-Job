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
      router.push('/jobs');
    }
  }, [status, router]);

  const handleLinkedInSignIn = async () => {
    sessionStorage.setItem('justLoggedIn', 'true');
    await signIn('linkedin', { callbackUrl: '/jobs', prompt: 'login' });
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
    <main className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center px-4" style={{ backgroundImage: "url('/images/background.jpg')", backgroundPosition: "center", }}>
      <div className="text-center">

        <div className="fixed bottom-15 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-2">

          <div className="relative group w-max mx-auto">
          <button
            onClick={handleLinkedInSignIn}
            className="bg-blue-600 text-white font-semibold px-6 py-3 mb-4 rounded-md opacity-60 cursor-pointer hover:bg-blue-800"
          >
            Sign in with LinkedIn
          </button>
          {/* <span className="absolute -bottom-4 left -translate-x-1/2 bg-black text-red text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Currently unavailable
          </span> */}
          </div>

          <button
            onClick={handleGuestLogin}
            className="text-m text-blue-600 cursor-pointer underline hover:text-blue-800"
          >
            Sign in as a guest
          </button>
        
        </div>

      </div>
    </main>
  );
}



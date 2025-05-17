// app/auth/error.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ErrorPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the home page after a short delay
    setTimeout(() => {
      router.push('/'); // or wherever you want to redirect after an error
    }, 5000); // Redirects after 5 seconds
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold text-red-600">Authentication Failed</h1>
      <p className="mt-4 text-lg text-gray-600">Sorry, something went wrong during authentication.</p>
      <p className="mt-4 text-md text-gray-500">Redirecting you to the homepage...</p>
    </div>
  );
}


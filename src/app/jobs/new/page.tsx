'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';
import { createBrowserClient } from '@supabase/ssr';

export default function AddJobPage() {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState('Wishlist');
  const [deadline, setDeadline] = useState('');

  const { data: session } = useSession();
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newJob = {
      id: uuidv4(),
      title,
      company,
      status,
      deadline: deadline || null,
      created_at: new Date().toISOString(),
    };

    const guestSession = JSON.parse(localStorage.getItem('guestSession') || 'null');
    const isGuest = session?.user?.email === 'guest@example.com' || guestSession?.user?.email === 'guest@example.com';

    if (isGuest) {
      const guestJobs = JSON.parse(sessionStorage.getItem('guestJobs') || '[]');
      guestJobs.unshift(newJob);
      sessionStorage.setItem('guestJobs', JSON.stringify(guestJobs));
    } else {
      const userId = session?.user?.id;

       console.log('Session data:', session); // Debug: Log session data

      if (!userId) {
        console.error('Authenticated user not found.');
        return;
      }

     const { data, error: supabaseError } = await supabase
          .from('jobs')
          .insert([{
            ...newJob,
            user_id: userId,
          }])
          .select();

      if (supabaseError) {
        console.error('Error inserting job to Supabase:', supabaseError.message);
        alert('Failed to save job. Please try again.');
        return;
      }
    }

    router.push('/jobs');
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="w-full max-w-xl bg-white p-6 rounded-xl shadow-md text-gray-900">
        <h1 className="text-2xl font-bold mb-4 text-center">Add New Job</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded-md"
              placeholder="e.g. Product Manager"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">
              Company <span className="text-red-500">*</span>
            </label>
            <input
              name="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded-md"
              placeholder="e.g. Google"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Status</label>
            <select
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border px-3 py-2 rounded-md"
            >
              <option>Wishlist</option>
              <option>Applied</option>
              <option>Interview</option>
              <option>Offer</option>
              <option>Rejected</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Deadline</label>
            <input
              type="date"
              name="deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md w-full cursor-pointer"
          >
            Save Job
          </button>

          <button
            type="button"
            onClick={() => router.push('/jobs')}
            className="mb-4 bg-gray-200 text-gray-800 px-4 py-2 rounded-md w-full hover:bg-gray-300 cursor-pointer"
          >
            Cancel
          </button>
        </form>
      </div>
    </main>
  );
}

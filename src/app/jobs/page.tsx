'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { supabase  } from '@lib/supabase';
import JobCard from '@components/JobCard';
import { Job } from '@/types/job';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showBanner, setShowBanner] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Fetch jobs based on user type
  useEffect(() => {

    const guestSession = JSON.parse(localStorage.getItem('guestSession') || 'null');
    const isGuestUser = session?.user?.email === 'guest@example.com' || guestSession?.user?.email === 'guest@example.com';

    if (status !== 'authenticated' && status !== 'unauthenticated' && !isGuestUser) return;

    const fetchJobs = async () => {
      if (isGuestUser) {
        const guestJobs = JSON.parse(sessionStorage.getItem('guestJobs') || '[]');
        console.log(guestJobs);
        setJobs(guestJobs);
      } else if (session?.user?.id) {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching jobs:', error.message);
        } else {
          setJobs(data || []);
        }
      }
    };

    fetchJobs();

    // Show login banner for authenticated users
    const justLoggedIn = sessionStorage.getItem('justLoggedIn');
    if (justLoggedIn === 'true' && !isGuestUser) {
      setShowBanner(true);
      setTimeout(() => {
        setShowBanner(false);
        sessionStorage.removeItem('justLoggedIn');
      }, 4000);
    }
  }, [session, status]);

  // Add a new job
  const handleAddJob = () => {
    router.push('/jobs/new');
  };

  const handleEdit = (id: string) => {
    router.push(`/jobs/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    const updatedJobs = jobs.filter((job) => job.id !== id);
    setJobs(updatedJobs);

    const guestSession = JSON.parse(localStorage.getItem('guestSession') || 'null');
    const isGuest = session?.user?.email === 'guest@example.com' || guestSession?.user?.email === 'guest@example.com';

    console.log(isGuest);

    if (isGuest) {
      sessionStorage.setItem('guestJobs', JSON.stringify(updatedJobs));
    } else {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id)
        .eq('user_id', session?.user?.id || '');

      if (error) {
        console.error('Failed to delete job:', error.message);
      }
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-md text-gray-900">
        {showBanner && (
          <div className="bg-green-400 text-white text-center py-2 text-sm font-semibold rounded-md mb-4">
            Successfully logged in ✅
          </div>
        )}

        <h1 className="text-2xl font-bold mb-4 text-center">Job Dashboard</h1>

        <button
          onClick={handleAddJob}
          className="mb-6 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md"
        >
          + Add Job
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {jobs.length === 0 ? (
            <p>No jobs found. Add a job to get started.</p>
          ) : (
            jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}

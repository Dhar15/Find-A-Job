'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import JobCard from '@components/JobCard';
import { Job } from '@/types/job';

export default function JobsPage() {
  //const [jobs, setJobs] = useState<any[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showBanner, setShowBanner] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedJobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    setJobs(storedJobs);

    const justLoggedIn = sessionStorage.getItem('justLoggedIn');
    if (justLoggedIn === 'true') {
      setShowBanner(true);
      setTimeout(() => {
        setShowBanner(false);
        sessionStorage.removeItem('justLoggedIn');
      }, 4000);
    }
  }, []);

  const handleAddJob = () => {
    router.push('/jobs/new');
  };

  const handleEdit = (id: string) => {
    router.push(`/jobs/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    const updatedJobs = jobs.filter((job) => job.id !== id);
    setJobs(updatedJobs);
    localStorage.setItem('jobs', JSON.stringify(updatedJobs));
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
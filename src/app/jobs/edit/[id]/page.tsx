'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Job } from '@/types/job';
import { useSession } from 'next-auth/react';
import { supabase } from '@lib/supabase';

export default function EditJobPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: session } = useSession();

  const [job, setJob] = useState<Job>({
    id: '',
    title: '',
    company: '',
    status: 'Wishlist',
    deadline: '',
  });

  const guestSession = JSON.parse(localStorage.getItem('guestSession') || 'null');
  const isGuest = session?.user?.email === 'guest@example.com' || guestSession?.user?.email === 'guest@example.com';

  // Load the job
  useEffect(() => {
    const loadJob = async () => {
      if (!id || typeof id !== 'string') {
        console.error('Job ID missing or invalid');
        return;
      }

      if (isGuest) {
        const guestJobs: Job[] = JSON.parse(sessionStorage.getItem('guestJobs') || '[]');
        const found = guestJobs.find((j) => j.id === id);
        if (found) setJob(found);
        else console.error('Job not found for guest');
      } else {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching job:', error.message);
        } else {
          setJob(data);
        }
      }
    };

    loadJob();
  }, [id, isGuest]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isGuest) {
      const guestJobs: Job[] = JSON.parse(sessionStorage.getItem('guestJobs') || '[]');
      const updatedJobs = guestJobs.map((j) => (j.id === job.id ? job : j));
      sessionStorage.setItem('guestJobs', JSON.stringify(updatedJobs));
    } else {
      const { error } = await supabase
        .from('jobs')
        .update({
          title: job.title,
          company: job.company,
          status: job.status,
          deadline: job.deadline,
        })
        .eq('id', job.id);

      if (error) {
        console.error('Error updating job:', error.message);
        return;
      }
    }

    router.push('/jobs');
  };

  if (!job.id) return <p>Loading...</p>;

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow-md text-gray-900">
        <h1 className="text-2xl font-bold mb-4 text-center">Edit Job</h1>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={job.title}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter job title"
              required
            />
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={job.company}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter company name"
              required
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={job.status}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="Wishlist">Wishlist</option>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
              Deadline
            </label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={job.deadline}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md w-full cursor-pointer"
          >
            Save Changes
          </button>

          <button
            onClick={() => router.push('/jobs')}
            type="button"
            className="mb-4 bg-gray-200 text-gray-800 px-4 py-2 rounded-md w-full hover:bg-gray-300 cursor-pointer"
          >
            Cancel
          </button>
        </form>
      </div>
    </main>
  );
}

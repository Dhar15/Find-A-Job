'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Use `useParams()` for dynamic routes

export default function EditJobPage() {
  const router = useRouter();
  const { id } = useParams(); // Extract `id` from the URL using `useParams()`

  const [job, setJob] = useState({
    id: '',
    title: '',
    company: '',
    status: '',
    deadline: '',
  });

  useEffect(() => {
    // Debugging: Log the jobId to check if it's being passed correctly
    console.log('Job ID from URL:', id);

    if (id) {
      const storedJobs = JSON.parse(localStorage.getItem('jobs') || '[]');
      // Debugging: Log the stored jobs to see the structure
      console.log('Stored Jobs:', storedJobs);
      
      const jobToEdit = storedJobs.find((job: any) => job.id === id);
      if (jobToEdit) {
        console.log('Job to Edit:', jobToEdit); // Debugging: Check the job to be edited
        setJob(jobToEdit);
      } else {
        console.error('Job not found');
      }
    } else {
      console.error('Job ID is null or undefined');
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const storedJobs = JSON.parse(localStorage.getItem('jobs') || '[]');
    const updatedJobs = storedJobs.map((storedJob: any) =>
      storedJob.id === job.id ? job : storedJob
    );
    localStorage.setItem('jobs', JSON.stringify(updatedJobs));
    router.push('/jobs'); // Redirect to the Job Dashboard page
  };

  // If job.id is still empty, show the loading state
  if (!job.id) return <p>Loading...</p>;

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow-md text-gray-900">
        <h1 className="text-2xl font-bold mb-4 text-center">Edit Job</h1>

        <form onSubmit={handleSave} className="space-y-4">
        {/* <div className="space-y-4"> */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Job Title
              <span className="text-red-500">*</span>
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
              Company Name
              <span className="text-red-500">*</span>
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
              // onClick={handleSave}
              type="submit"
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md w-full cursor-pointer"
            >
              Save Changes
          </button>

          <button
            onClick={() => router.push('/jobs')}
            className="mb-4 bg-gray-200 text-gray-800 px-4 py-2 rounded-md w-full hover:bg-gray-300 cursor-pointer"
            >
            Cancel
          </button>
        {/* </div> */}
        </form>
      </div>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { supabase  } from '@lib/supabase';
import JobCard from '@components/JobCard';
import { Job } from '@/types/job';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [portalFilter, setPortalFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
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

  // Apply filters whenever jobs, search, or filters change
  useEffect(() => {
    let filtered = [...jobs];

    // Search filter (searches in title and company)
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter((job) => job.status === statusFilter);
    }

    // Portal filter
    if (portalFilter !== 'All') {
      filtered = filtered.filter((job) => job.portal === portalFilter);
    }

    // Date filter (based on applied_on date)
    if (dateFilter !== 'All') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter((job) => {
        if (!job.applied_on) return false;
        
        const appliedDate = new Date(job.applied_on);
        const daysDiff = Math.floor((now.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case 'Today':
            return appliedDate >= today;
          case 'Last2Days':
            return daysDiff <= 2;
          case 'Last1Week':
            return daysDiff <= 7;
          case 'Last1Month':
            return daysDiff <= 30;
          default:
            return true;
        }
      });
    }

    setFilteredJobs(filtered);
  }, [jobs, searchQuery, statusFilter, portalFilter, dateFilter]);

  // Add a new job
  const handleAddJob = () => {
    router.push('/jobs/new');
  };

  const handleEdit = (id: string) => {
    router.push(`/jobs/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    // Confirm before deleting
    const jobToDelete = jobs.find(job => job.id === id);
    if (!jobToDelete) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${jobToDelete.title}" at "${jobToDelete.company}"?`
    );

    if (!confirmDelete) return;

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
        alert('Failed to delete job. Please try again.');
        setJobs(jobs);
      }
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPortalFilter('All');
    setDateFilter('All');
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="w-full max-w-6xl bg-white p-6 rounded-xl shadow-md text-gray-900">
        {showBanner && (
          <div className="bg-green-400 text-white text-center py-2 text-sm font-semibold rounded-md mb-4">
            Successfully logged in ✅
          </div>
        )}

        <h1 className="text-2xl font-bold mb-4 text-center">Job Dashboard</h1>

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleAddJob}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md"
          >
            + Add Job
          </button>

          <div className="text-sm text-gray-600">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3 items-end">
            {/* Search Bar */}
            <div className="flex-1 min-w-[250px]">
              <input
                type="text"
                placeholder="Search by job title or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Status Filter */}
            <div className="w-36">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="All">All Status</option>
                <option value="Wishlist">Wishlist</option>
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Portal Filter */}
            <div className="w-36">
              <select
                value={portalFilter}
                onChange={(e) => setPortalFilter(e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="All">All Portals</option>
                <option value="Internshala">Internshala</option>
                <option value="Naukri">Naukri</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Glassdoor">Glassdoor</option>
                <option value="Instahyre">Instahyre</option>
                <option value="Indeed">Indeed</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="w-40">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="All">All Time</option>
                <option value="Today">Today</option>
                <option value="Last2Days">Last 2 Days</option>
                <option value="Last1Week">Last Week</option>
                <option value="Last1Month">Last Month</option>
              </select>
            </div>

            {(searchQuery || statusFilter !== 'All' || portalFilter !== 'All' || dateFilter !== 'All') && (
              <button
                onClick={handleClearFilters}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-red-700 rounded-md text-sm font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              {jobs.length === 0 ? (
                <p>No jobs found. Add a job to get started.</p>
              ) : (
                <p>No jobs match your search criteria. Try adjusting your filters.</p>
              )}
            </div>
          ) : (
            filteredJobs.map((job) => (
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
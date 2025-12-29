'use client';

import { useEffect, useState } from 'react';
import { Job } from '@/types/job';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useSession } from 'next-auth/react';
import {supabase} from '@lib/supabase';

const STATUS_COLORS: Record<string, string> = {
  Wishlist: '#60a5fa',
  Applied: '#fb923c',
  Interview: '#facc15',
  Offer: '#4ade80',
  Rejected: '#f87171',
};

export default function JobStatsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const { data: session, status } = useSession();

  useEffect(() => {
    async function fetchJobs() {
      const guestSession = JSON.parse(localStorage.getItem('guestSession') || 'null');
      const isGuest = session?.user?.email === 'guest@example.com' || guestSession?.user?.email === 'guest@example.com';

      console.log(isGuest);

      if (isGuest) {
          // Guest user: read from storage (local/session)
          const stored = sessionStorage.getItem('guestJobs');
          const parsed = stored ? JSON.parse(stored) : [];
          setJobs(parsed);
        } else if (session?.user?.id) {
          console.log(session?.user?.email);
          // Authenticated user: fetch from Supabase
          const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('user_id', session.user.id);

          if (error) {
            console.error('Error fetching jobs from Supabase:', error);
            setJobs([]);
          } else {
            setJobs(data || []);
          }
        } else {
          // No session info yet
          setJobs([]);
        }
      }

      if (status === 'authenticated' || status === 'unauthenticated') {
        fetchJobs();
      }
  }, [status, session]);

  const statusCounts = jobs.reduce((acc: Record<string, number>, job: Job) => {
    const status = job.status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  const totalJobs = jobs.length;
  const appliedStatuses = ['Applied', 'Interview', 'Offer', 'Rejected'];
  const applied = jobs.filter((job) => appliedStatuses.includes(job.status)).length;
  const offers = statusCounts['Offer'] || 0;
  const rejected = statusCounts['Rejected'] || 0;
  const interviews = statusCounts['Interview'] || 0;

  const responseRate = applied ? (((interviews + offers) / applied) * 100).toFixed(1) : '0';
  const conversionRate = applied ? ((offers / applied) * 100).toFixed(1) : '0';
  const rejectionRate = applied ? ((rejected / applied) * 100).toFixed(1) : '0';

  const upcoming = jobs
    .filter((job) => job.status === 'Interview' && job.deadline && !isNaN(new Date(job.deadline).getTime()) && new Date(job.deadline) > new Date())
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())[0];

  return (
    <div className="min-h-screen bg-gray-100 pt-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-4">
          📊 Job Statistics
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-bold text-gray-800 text-center mb-2">Jobs by Status</h2>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={90}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={true}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.name] || '#a3a3a3'}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} jobs`, name]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 mt-8">No job data available.</p>
            )}
          </div>

          {/* Core Metrics */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-bold text-gray-800 text-center mb-2">Quick Metrics</h2>
            <div className="grid grid-cols-1 gap-4 text-center">
              <div>
                <p className="text-gray-600">Total Jobs Tracked</p>
                <p className="text-2xl font-bold text-gray-900">{totalJobs}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-600">{applied}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-green-600">{conversionRate}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Rejection Rate</p>
                  <p className="text-2xl font-bold text-red-500">{rejectionRate}%</p>
                </div>
              </div>
              <div>
                <p className="text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold text-blue-600">{responseRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadline */}
        <div className="mt-10 bg-red-100 border border-gray-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">📅 Upcoming Interview</h2>
          {upcoming ? (
            <p className="text-gray-700">
              <strong>{upcoming.title}</strong> at <strong>{upcoming.company}</strong> is due on{' '}
              <strong>{new Date(upcoming.deadline!).toLocaleDateString()}</strong>
            </p>
          ) : (
            <p className="text-gray-500">No upcoming deadlines found.</p>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div
              key={status}
              className="bg-white rounded-xl shadow p-4 text-center border"
            >
              <h3 className="text-lg font-semibold text-gray-800">{status}</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{count}</p>
            </div>
          ))}
        </div>

        {/* Pro Insight */}
        <div className="mt-10 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-semibold text-blue-700 mb-2">📈 Pro Insight</h2>
          <p className="text-gray-700">
            You&apos;ve applied to <strong>{applied}</strong> job(s), scored <strong>{interviews}</strong> interview(s), and landed <strong>{offers}</strong> offer(s). Keep tracking your progress!
          </p>
        </div>
      </div>
    </div>
  );
}
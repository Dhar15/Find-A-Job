import React from 'react';
import { Job } from '@/types/job';

// interface Job {
//   id: string;
//   title: string;
//   company: string;
//   status: string;
//   deadline: string;
// }

interface Props {
  job: Job;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const JobCard: React.FC<Props> = ({ job, onDelete, onEdit }) => {
  const statusColors: Record<Job['status'], string> = {
    Wishlist: 'bg-blue-400',
    Applied: 'bg-orange-400',
    Interview: 'bg-yellow-400',
    Offer: 'bg-green-400',
    Rejected: 'bg-red-400',
  };

  return (
    <div className="border p-4 rounded-md shadow-md bg-white text-gray-900 relative">
      <h3 className="text-xl font-semibold">{job.title}</h3>
      <p className="font-medium text-gray-600">{job.company}</p>
      <p className="text-sm text-gray-500">Deadline: {job.deadline}</p>

      <div
        className={`inline-block mt-2 px-4 py-1 text-sm rounded-full text-white ${statusColors[job.status] || 'bg-gray-600'}`}
      >
        {job.status}
      </div>

      <div className="flex gap-2 mt-4">
        {/* Edit Button */}
        <button
          onClick={() => onEdit(job.id)} // Call the onEdit function passed down from the parent
          className="text-blue-600 border border-blue-600 px-2 py-1 rounded hover:bg-blue-50 text-sm"
        >
          Edit
        </button>
        
        {/* Delete Button */}
        <button
          onClick={() => onDelete(job.id)} // Call the onDelete function passed down from the parent
          className="text-red-600 border border-red-600 px-2 py-1 rounded hover:bg-red-50 text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default JobCard;
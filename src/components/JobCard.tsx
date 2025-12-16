import React from 'react';
import { Job } from '@/types/job';
import Image from 'next/image';

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

  const portalLogos: Record<string, string> = {
    Internshala: '/logos/internshala.png',
    Naukri: '/logos/naukri.png',
    LinkedIn: '/logos/linkedin.png',
    Glassdoor: '/logos/glassdoor.png',
    Instahyre: '/logos/instahyre.png',
    Indeed: '/logos/indeed.png',
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="border p-4 rounded-md shadow-md bg-white text-gray-900 relative">
      <h3 className="text-xl font-semibold">{job.title}</h3>
      <p className="font-medium text-gray-600">{job.company}</p>
      
      {job.applied_on && (
        <p className="text-sm text-gray-500">Applied: {formatDate(job.applied_on)}</p>
      )}
      {job.deadline && (
        <p className="text-sm text-gray-500">Deadline: {formatDate(job.deadline)}</p>
      )}

      <div className="flex items-center gap-2 mt-2">
        <div
          className={`inline-block px-4 py-1 text-sm rounded-full text-white ${statusColors[job.status] || 'bg-gray-600'}`}
        >
          {job.status}
        </div>

        {job.status_link && (
          <a
            href={job.status_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-3 py-1 text-sm rounded-full text-white bg-indigo-500 hover:bg-indigo-600 transition-colors"
          >
            View Status
          </a>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        {/* Edit Button */}
        <button
          onClick={() => onEdit(job.id)}
          className="text-blue-600 border border-blue-600 px-2 py-1 rounded hover:bg-blue-50 text-sm"
        >
          Edit
        </button>
        
        {/* Delete Button */}
        <button
          onClick={() => onDelete(job.id)}
          className="text-red-600 border border-red-600 px-2 py-1 rounded hover:bg-red-50 text-sm"
        >
          Delete
        </button>
      </div>

      {job.portal && portalLogos[job.portal] && (
        <div className="absolute bottom-3 right-3">
          <Image
            src={portalLogos[job.portal]}
            alt={`${job.portal} logo`}
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default JobCard;
export interface Job {
  id: string;
  title: string;
  company: string;
  status: 'Wishlist' | 'Applied' | 'Interview' | 'Offer' | 'Rejected';
  status_link?: string;
  deadline?: string;
}
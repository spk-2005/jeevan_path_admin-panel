'use client';

import { useEffect, useState } from 'react';
import { Search, Trash2, Star } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';

interface Feedback {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  resourceId: {
    _id: string;
    name: string;
    type: string;
  };
  rating: number;
  comment?: string;
  createdAt: string;
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchFeedback();
  }, [sortBy, sortOrder]);

  useEffect(() => {
    const filtered = feedback.filter(
      (item) =>
        item.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.resourceId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFeedback(filtered);
  }, [searchTerm, feedback]);

  const fetchFeedback = async () => {
    try {
      const res = await fetch(`/api/feedback?sortBy=${sortBy}&sortOrder=${sortOrder}`);
      const data = await res.json();
      if (data.success) {
        setFeedback(data.data);
        setFilteredFeedback(data.data);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;

    try {
      const res = await fetch(`/api/feedback/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchFeedback();
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  const columns = [
    {
      key: 'userId',
      label: 'User',
      render: (value: any) => value?.name || 'Anonymous',
    },
    {
      key: 'resourceId',
      label: 'Resource',
      render: (value: any) => (
        <div>
          <div className="font-medium">{value?.name}</div>
          <div className="text-xs text-slate-500 capitalize">{value?.type}</div>
        </div>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (value: number) => (
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < value ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'
              }`}
            />
          ))}
        </div>
      ),
    },
    {
      key: 'comment',
      label: 'Comment',
      render: (value: string) => (
        <div className="max-w-xs truncate">{value || '-'}</div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Feedback) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(row._id);
          }}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-slate-900">Feedback</h1>
        <p className="text-slate-600 mt-2">User feedback and ratings</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
      >
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="createdAt">Date</option>
            <option value="rating">Rating</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        <DataTable columns={columns} data={filteredFeedback} />
      </motion.div>
    </div>
  );
}

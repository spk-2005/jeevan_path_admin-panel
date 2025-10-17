'use client';

import { useEffect, useState } from 'react';
import { Users, MapPin, MessageSquare, Star } from 'lucide-react';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import { motion } from 'framer-motion';

interface Stats {
  totalUsers: number;
  totalResources: number;
  totalFeedback: number;
  avgRating: number;
  resourcesByType: { _id: string; count: number }[];
  recentActivity: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Overview of your health resource platform</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="bg-blue-500"
          delay={0.1}
        />
        <StatCard
          title="Total Resources"
          value={stats?.totalResources || 0}
          icon={MapPin}
          color="bg-green-500"
          delay={0.2}
        />
        <StatCard
          title="Total Feedback"
          value={stats?.totalFeedback || 0}
          icon={MessageSquare}
          color="bg-orange-500"
          delay={0.3}
        />
        <StatCard
          title="Avg Rating"
          value={stats?.avgRating.toFixed(1) || '0.0'}
          icon={Star}
          color="bg-yellow-500"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">Resources by Type</h2>
          <div className="space-y-4">
            {stats?.resourcesByType.map((type) => (
              <div key={type._id} className="flex items-center justify-between">
                <span className="text-slate-700 capitalize font-medium">{type._id}</span>
                <div className="flex items-center gap-3">
                  <div className="w-48 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(type.count / (stats?.totalResources || 1)) * 100}%`,
                      }}
                      transition={{ duration: 1, delay: 0.6 }}
                      className="h-full bg-blue-500"
                    />
                  </div>
                  <span className="text-slate-600 font-semibold w-12 text-right">
                    {type.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {stats?.recentActivity.map((activity: any, idx: number) => (
              <motion.div
                key={activity._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-900 font-medium">
                    {activity.userId?.name || 'Anonymous'} rated{' '}
                    {activity.resourceId?.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < activity.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

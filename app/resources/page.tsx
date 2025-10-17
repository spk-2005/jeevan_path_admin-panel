'use client';

import { useEffect, useState } from 'react';
import { Search, Plus, Edit2, Trash2, Star, User } from 'lucide-react';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface User {
  _id: string;
  name?: string;
  phone?: string;
  firebaseUid: string;
}

interface Resource {
  _id: string;
  userId?: {
    _id: string;
    name?: string;
    phone?: string;
  };
  name: string;
  type: 'clinic' | 'pharmacy' | 'blood';
  address?: string;
  contact?: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  openTime?: string;
  closeTime?: string;
  rating?: number;
  services?: string[];
  languages?: string[];
  insuranceAccepted?: string[];
  transportation?: string[];
  wheelchairAccessible?: boolean;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    type: 'clinic' as 'clinic' | 'pharmacy' | 'blood',
    address: '',
    contact: '',
    lng: '',
    lat: '',
    openTime: '',
    closeTime: '',
    services: '',
    languages: '',
    wheelchairAccessible: false,
  });

  useEffect(() => {
    fetchResources();
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = resources.filter(
      (resource) =>
        resource.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (typeFilter) {
      filtered = filtered.filter((r) => r.type === typeFilter);
    }

    if (userFilter) {
      filtered = filtered.filter((r) => r.userId?._id === userFilter);
    }

    setFilteredResources(filtered);
  }, [searchTerm, typeFilter, userFilter, resources]);

  const fetchResources = async () => {
    try {
      const res = await fetch('/api/resources');
      const data = await res.json();
      if (data.success) {
        setResources(data.data);
        setFilteredResources(data.data);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: formData.name,
        type: formData.type,
        address: formData.address,
        contact: formData.contact,
        location: {
          type: 'Point',
          coordinates: [parseFloat(formData.lng), parseFloat(formData.lat)],
        },
        openTime: formData.openTime,
        closeTime: formData.closeTime,
        services: formData.services.split(',').map((s) => s.trim()).filter(Boolean),
        languages: formData.languages.split(',').map((s) => s.trim()).filter(Boolean),
        wheelchairAccessible: formData.wheelchairAccessible,
      };

      if (formData.userId) {
        payload.userId = formData.userId;
      }

      const url = editingResource ? `/api/resources/${editingResource._id}` : '/api/resources';
      const method = editingResource ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        fetchResources();
        setIsModalOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving resource:', error);
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      userId: resource.userId?._id || '',
      name: resource.name,
      type: resource.type,
      address: resource.address || '',
      contact: resource.contact || '',
      lng: resource.location.coordinates[0].toString(),
      lat: resource.location.coordinates[1].toString(),
      openTime: resource.openTime || '',
      closeTime: resource.closeTime || '',
      services: resource.services?.join(', ') || '',
      languages: resource.languages?.join(', ') || '',
      wheelchairAccessible: resource.wheelchairAccessible || false,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const res = await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchResources();
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      name: '',
      type: 'clinic',
      address: '',
      contact: '',
      lng: '',
      lat: '',
      openTime: '',
      closeTime: '',
      services: '',
      languages: '',
      wheelchairAccessible: false,
    });
    setEditingResource(null);
  };

  const columns = [
    {
      key: 'userId',
      label: 'Assigned User',
      render: (value: any) => (
        <div className="flex items-center gap-2">
          {value ? (
            <>
              <User className="w-4 h-4 text-slate-500" />
              <span className="text-sm">{value.name || value.firebaseUid}</span>
            </>
          ) : (
            <span className="text-slate-400 text-sm">Unassigned</span>
          )}
        </div>
      ),
    },
    { key: 'name', label: 'Name' },
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => (
        <span className="capitalize px-2 py-1 bg-slate-100 rounded-md text-xs font-medium">
          {value}
        </span>
      ),
    },
    {
      key: 'address',
      label: 'Address',
      render: (value: string) => (
        <span className="max-w-xs truncate block">{value || '-'}</span>
      ),
    },
    { key: 'contact', label: 'Contact' },
    {
      key: 'rating',
      label: 'Rating',
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span>{value?.toFixed(1) || '0.0'}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Resource) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row._id);
            }}
            className="text-red-600 hover:text-red-800 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
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
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Resources</h1>
          <p className="text-slate-600 mt-2">Manage health resources and assign to users</p>
        </motion.div>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Resource
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Types</option>
            <option value="clinic">Clinic</option>
            <option value="pharmacy">Pharmacy</option>
            <option value="blood">Blood Bank</option>
          </select>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Users</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name || user.firebaseUid}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <DataTable columns={columns} data={filteredResources} />
        </div>
      </motion.div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingResource ? 'Edit Resource' : 'Add Resource'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Assign to User (Optional)
            </label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">-- No User (Unassigned) --</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name || user.firebaseUid} {user.phone ? `(${user.phone})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
              <Input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Type *</label>
              <select
                required
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="clinic">Clinic</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="blood">Blood Bank</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
            <Input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Contact</label>
            <Input
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Longitude *
              </label>
              <Input
                type="number"
                step="any"
                required
                value={formData.lng}
                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Latitude *
              </label>
              <Input
                type="number"
                step="any"
                required
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Open Time</label>
              <Input
                type="time"
                value={formData.openTime}
                onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Close Time</label>
              <Input
                type="time"
                value={formData.closeTime}
                onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Services (comma-separated)
            </label>
            <Input
              type="text"
              placeholder="Surgery, Emergency, etc."
              value={formData.services}
              onChange={(e) => setFormData({ ...formData, services: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Languages (comma-separated)
            </label>
            <Input
              type="text"
              placeholder="English, Hindi, etc."
              value={formData.languages}
              onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="wheelchair"
              checked={formData.wheelchairAccessible}
              onChange={(e) =>
                setFormData({ ...formData, wheelchairAccessible: e.target.checked })
              }
              className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
            />
            <label htmlFor="wheelchair" className="text-sm font-medium text-slate-700">
              Wheelchair Accessible
            </label>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
              {editingResource ? 'Update' : 'Create'}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

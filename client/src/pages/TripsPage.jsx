import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Filter, Calendar, MapPin, DollarSign, Trash2, Edit3, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { TripCard } from '../components/common/TripCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import { apiService } from '../services/apiService';
import { useToast } from '../hooks/useToast';
import { validateTripDates } from '../utils/dateValidation';
import { DEFAULT_COVER_IMAGES } from '../services/mockData';

export const TripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Edit Modal State
  const [editingTrip, setEditingTrip] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    budgetTotal: '',
    coverImage: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete Modal State
  const [deletingTrip, setDeletingTrip] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await apiService.getTrips();
      setTrips(res);
    } catch (err) {
      addToast({ type: 'error', title: 'Error Loading Trips', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleOpenEdit = (trip) => {
    setEditingTrip(trip);
    setEditForm({
      title: trip.title || '',
      description: trip.description || '',
      startDate: trip.startDate || '',
      endDate: trip.endDate || '',
      budgetTotal: trip.budgetTotal || '',
      coverImage: trip.coverImage || '',
    });
    setEditError('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) {
      setEditError('Trip name is required.');
      return;
    }

    const dateVal = validateTripDates(editForm.startDate, editForm.endDate);
    if (!dateVal.isValid) {
      setEditError(dateVal.message);
      return;
    }

    setIsUpdating(true);
    try {
      const updated = await apiService.updateTrip(editingTrip.id, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        budgetTotal: Number(editForm.budgetTotal) || 0,
        coverImage: editForm.coverImage,
      });

      setTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      addToast({
        type: 'success',
        title: 'Trip Updated',
        message: `"${updated.title}" parameters saved successfully.`,
      });
      setEditingTrip(null);
    } catch (err) {
      addToast({ type: 'error', title: 'Update Failed', message: err.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTrip) return;
    setIsDeleting(true);
    try {
      await apiService.deleteTrip(deletingTrip.id);
      setTrips((prev) => prev.filter((t) => t.id !== deletingTrip.id));
      addToast({
        type: 'success',
        title: 'Trip Deleted',
        message: `"${deletingTrip.title}" has been deleted.`,
      });
      setDeletingTrip(null);
    } catch (err) {
      addToast({ type: 'error', title: 'Delete Failed', message: err.message });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTrips = trips.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.subtitle && t.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.destinations && t.destinations.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesStatus =
      filterStatus === 'all' || t.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Top Header & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              My Multi-City Trips
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage your upcoming, active, and past personalized itineraries.
            </p>
          </div>

          <Button
            variant="accent"
            size="md"
            leftIcon={<PlusCircle className="w-4 h-4" />}
            onClick={() => navigate('/trips/new')}
          >
            Plan New Trip
          </Button>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-subtle flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="w-full md:w-80">
            <Input
              type="search"
              placeholder="Search trips or cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-48">
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { label: 'All Statuses', value: 'all' },
                  { label: 'Upcoming', value: 'upcoming' },
                  { label: 'Planning', value: 'planning' },
                  { label: 'Completed', value: 'completed' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Trips Grid View / States */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredTrips.length === 0 ? (
          <EmptyState
            title="No trips matched your search"
            description="Try clearing your filters or create a brand new itinerary to get started."
            actionLabel="Plan New Trip"
            onAction={() => navigate('/trips/new')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onEdit={handleOpenEdit}
                onDelete={(t) => setDeletingTrip(t)}
              />
            ))}
          </div>
        )}
      </div>

      {/* EDIT TRIP MODAL */}
      <Modal
        isOpen={Boolean(editingTrip)}
        onClose={() => setEditingTrip(null)}
        title="Edit Trip Parameters"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setEditingTrip(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={isUpdating}
              onClick={handleSaveEdit}
            >
              Save Changes
            </Button>
          </div>
        }
      >
        {editingTrip && (
          <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
            {editError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {editError}
              </div>
            )}

            <Input
              label="Trip Name *"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              required
            />

            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Description
              </label>
              <textarea
                rows={2}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 resize-none"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Start Date *"
                type="date"
                value={editForm.startDate}
                onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                leftIcon={<Calendar className="w-4 h-4 text-brand-600" />}
                required
              />
              <Input
                label="End Date *"
                type="date"
                value={editForm.endDate}
                onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                leftIcon={<Calendar className="w-4 h-4 text-brand-600" />}
                required
              />
            </div>

            <Input
              label="Target Budget ($ USD)"
              type="number"
              value={editForm.budgetTotal}
              onChange={(e) => setEditForm({ ...editForm, budgetTotal: e.target.value })}
              leftIcon={<DollarSign className="w-4 h-4 text-emerald-600" />}
            />
          </form>
        )}
      </Modal>

      {/* DELETE TRIP MODAL */}
      <Modal
        isOpen={Boolean(deletingTrip)}
        onClose={() => setDeletingTrip(null)}
        title="Delete Trip"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setDeletingTrip(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={isDeleting}
              onClick={handleConfirmDelete}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete Permanently
            </Button>
          </div>
        }
      >
        {deletingTrip && (
          <div className="py-2 space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
              <p className="text-xs font-semibold">
                This action cannot be undone. All city stops, activities, and budget entries associated with this trip will be permanently removed.
              </p>
            </div>
            <p>
              Are you sure you want to delete <strong className="text-slate-900">"{deletingTrip.title}"</strong>?
            </p>
          </div>
        )}
      </Modal>
    </AppShell>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Filter, Grid, List as ListIcon } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { TripCard } from '../components/common/TripCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import { apiService } from '../services/apiService';

export const TripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const res = await apiService.getTrips();
        setTrips(res);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const filteredTrips = trips.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || t.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* Top Header & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              My Multi-City Trips
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
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
          <div className="w-full md:w-72">
            <Input
              type="search"
              placeholder="Search by city or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-44">
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

        {/* Trips Grid View */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredTrips.length === 0 ? (
          <EmptyState
            title="No trips matched your search"
            description="Try clearing your filters or create a new multi-city itinerary."
            actionLabel="Plan New Trip"
            onAction={() => navigate('/trips/new')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

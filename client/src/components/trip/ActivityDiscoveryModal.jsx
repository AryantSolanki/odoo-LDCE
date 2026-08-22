import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Star,
  Clock,
  DollarSign,
  Plus,
  Check,
  Compass,
  X,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { apiService } from '../../services/apiService';
import { useToast } from '../../hooks/useToast';

export const ActivityDiscoveryModal = ({
  isOpen,
  onClose,
  tripId,
  stopId,
  cityName,
  onActivityAdded,
}) => {
  const [activities, setActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [costFilter, setCostFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [addedActivityIds, setAddedActivityIds] = useState(new Set());

  const { addToast } = useToast();

  const loadActivities = async () => {
    setLoading(true);
    try {
      let maxCost = null;
      if (costFilter === 'free') maxCost = 0;
      else if (costFilter === 'under25') maxCost = 25;
      else if (costFilter === 'under50') maxCost = 50;

      let maxDuration = null;
      if (durationFilter === 'short') maxDuration = 2;
      else if (durationFilter === 'halfDay') maxDuration = 4;

      const data = await apiService.searchActivities({
        q: searchQuery,
        category: categoryFilter,
        maxCost,
        maxDuration,
      });

      // If a specific city is selected, prioritize that city's activities first
      if (cityName) {
        data.sort((a, b) => {
          const aMatch = a.cityName.toLowerCase() === cityName.toLowerCase();
          const bMatch = b.cityName.toLowerCase() === cityName.toLowerCase();
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
          return b.rating - a.rating;
        });
      }

      setActivities(data);
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to search activities.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadActivities();
    }
  }, [isOpen, searchQuery, categoryFilter, costFilter, durationFilter]);

  const handleAddActivityToStop = async (activity) => {
    if (!tripId || !stopId) {
      addToast({ type: 'warning', title: 'Select Stop', message: 'Please select a trip stop first.' });
      return;
    }

    try {
      const added = await apiService.addActivity(tripId, stopId, {
        title: activity.title,
        cost: activity.cost,
        category: activity.category,
        description: activity.description,
        time: '10:00 AM',
      });

      setAddedActivityIds((prev) => new Set(prev).add(activity.id));

      if (onActivityAdded) {
        onActivityAdded(added);
      }

      addToast({
        type: 'success',
        title: 'Activity Added!',
        message: `"${activity.title}" added to your stop.`,
      });
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to Add Activity', message: err.message });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={cityName ? `Discover Activities in ${cityName}` : 'Explore Master Activities Catalog'}
      description="Find sightseeing tours, cultural workshops, culinary experiences, and hidden gems."
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4 pt-1">
        {/* Compact Filtering Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
          <div>
            <Input
              type="search"
              placeholder="Search activity or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { label: 'All Categories', value: 'all' },
                { label: 'Sightseeing', value: 'Sightseeing' },
                { label: 'Culture & Heritage', value: 'Culture' },
                { label: 'Food & Culinary', value: 'Food' },
                { label: 'Adventure & Outdoors', value: 'Adventure' },
                { label: 'Architecture', value: 'Architecture' },
                { label: 'Entertainment', value: 'Entertainment' },
                { label: 'Experience', value: 'Experience' },
              ]}
            />
          </div>

          <div>
            <Select
              value={costFilter}
              onChange={(e) => setCostFilter(e.target.value)}
              options={[
                { label: 'Any Price', value: 'all' },
                { label: 'Free Activities', value: 'free' },
                { label: 'Under $25', value: 'under25' },
                { label: 'Under $50', value: 'under50' },
              ]}
            />
          </div>

          <div>
            <Select
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)}
              options={[
                { label: 'Any Duration', value: 'all' },
                { label: 'Quick (≤ 2 hours)', value: 'short' },
                { label: 'Half Day (≤ 4 hours)', value: 'halfDay' },
              ]}
            />
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[55vh] overflow-y-auto pr-1 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Searching activities...</div>
          ) : activities.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm space-y-2">
              <Compass className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
              <p>No activities matched your search criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setCostFilter('all');
                  setDurationFilter('all');
                }}
                className="text-xs text-brand-600 font-bold hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activities.map((activity) => {
                const isAdded = addedActivityIds.has(activity.id);
                return (
                  <div
                    key={activity.id}
                    className="p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-subtle transition-all flex gap-3.5 items-start justify-between group"
                  >
                    <img
                      src={activity.image_url}
                      alt={activity.title}
                      className="w-20 h-20 rounded-xl object-cover shrink-0 bg-slate-100"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <Badge variant="primary" size="sm">
                          {activity.category}
                        </Badge>
                        <span className="text-[11px] font-bold text-slate-500">
                          {activity.cityName}
                        </span>
                        <span className="text-[11px] text-amber-500 font-bold flex items-center gap-0.5 ml-auto">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {activity.rating}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 group-hover:text-brand-600 transition-colors">
                        {activity.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {activity.description}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                        <div className="flex items-center gap-2.5 text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {activity.duration_hours}h
                          </span>
                          <span className="font-bold text-slate-900">
                            {activity.cost === 0 ? 'Free' : `$${activity.cost}`}
                          </span>
                        </div>

                        <Button
                          type="button"
                          variant={isAdded ? 'secondary' : 'primary'}
                          size="sm"
                          className="h-7 text-[11px] px-2.5"
                          disabled={isAdded}
                          onClick={() => handleAddActivityToStop(activity)}
                          leftIcon={isAdded ? <Check className="w-3 h-3 text-emerald-600" /> : <Plus className="w-3 h-3" />}
                        >
                          {isAdded ? 'Added' : 'Add to Stop'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Done Browsing
          </Button>
        </div>
      </div>
    </Modal>
  );
};

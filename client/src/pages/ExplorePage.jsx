import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Search,
  Filter,
  MapPin,
  DollarSign,
  Star,
  Plus,
  Bookmark,
  Sparkles,
  Calendar,
  Layers,
  Clock,
  Ticket,
  SlidersHorizontal,
  Check,
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { AddCityToTripModal } from '../components/trip/AddCityToTripModal';
import { apiService } from '../services/apiService';
import { useToast } from '../hooks/useToast';

export const ExplorePage = () => {
  const [activeTab, setActiveTab] = useState('cities'); // 'cities' | 'activities'
  const [cities, setCities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');
  const [costIndexFilter, setCostIndexFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activityCategoryFilter, setActivityCategoryFilter] = useState('all');
  const [activityCostFilter, setActivityCostFilter] = useState('all');
  const [activityDurationFilter, setActivityDurationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [savedCityIds, setSavedCityIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Selected city for "Add to Trip" modal
  const [selectedCityForTrip, setSelectedCityForTrip] = useState(null);
  const [isAddCityOpen, setIsAddCityOpen] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchCities = async () => {
    setLoading(true);
    try {
      const data = await apiService.searchCities({
        q: searchQuery,
        region: regionFilter,
        costIndex: costIndexFilter,
        category: categoryFilter,
        sortBy,
      });
      setCities(data);

      const saved = await apiService.getSavedDestinations();
      setSavedCityIds(new Set(saved.map((s) => Number(s.cityId))));
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to load destinations.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      let maxCost = null;
      if (activityCostFilter === 'free') maxCost = 0;
      else if (activityCostFilter === 'under25') maxCost = 25;
      else if (activityCostFilter === 'under50') maxCost = 50;

      let maxDuration = null;
      if (activityDurationFilter === 'short') maxDuration = 2;
      else if (activityDurationFilter === 'halfDay') maxDuration = 4;

      const data = await apiService.searchActivities({
        q: searchQuery,
        category: activityCategoryFilter,
        maxCost,
        maxDuration,
      });
      setActivities(data);
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to search activities.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'cities') {
      fetchCities();
    } else {
      fetchActivities();
    }
  }, [
    activeTab,
    searchQuery,
    regionFilter,
    costIndexFilter,
    categoryFilter,
    activityCategoryFilter,
    activityCostFilter,
    activityDurationFilter,
    sortBy,
  ]);

  const handleToggleBookmark = async (city, e) => {
    e.stopPropagation();
    try {
      const { saved } = await apiService.toggleSaveDestination(city);
      setSavedCityIds((prev) => {
        const next = new Set(prev);
        if (saved) next.add(Number(city.id));
        else next.delete(Number(city.id));
        return next;
      });

      addToast({
        type: saved ? 'success' : 'info',
        title: saved ? 'City Saved' : 'Removed from Saved',
        message: saved
          ? `${city.name} added to your bookmarked destinations.`
          : `${city.name} removed from your saved list.`,
      });
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Could not update saved destinations.' });
    }
  };

  const handleOpenAddCityModal = (city) => {
    setSelectedCityForTrip(city);
    setIsAddCityOpen(true);
  };

  const handleActivityAddToTrip = (activity) => {
    setSelectedCityForTrip({
      id: activity.city_id,
      name: activity.cityName,
      country: activity.country || '',
      image_url: activity.image_url,
      avg_daily_cost: 150,
      avg_meal_cost: 25,
    });
    setIsAddCityOpen(true);
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Compass className="w-6 h-6 text-travel-500" />
              <span>Explore Destinations & Activities</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Discover ideal cities, cost benchmarks, and curated local activities for your next journey.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-slate-200/70 rounded-2xl shrink-0 w-fit">
            <button
              onClick={() => setActiveTab('cities')}
              className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'cities'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cities ({cities.length})
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'activities'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Activities & Tours
            </button>
          </div>
        </div>

        {/* Compact Search & Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-subtle space-y-3">
          {activeTab === 'cities' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {/* Search input */}
              <div className="md:col-span-2">
                <Input
                  type="search"
                  placeholder="Search city, country, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                />
              </div>

              {/* Region Filter */}
              <div>
                <Select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  options={[
                    { label: 'All Regions', value: 'all' },
                    { label: 'Europe', value: 'Europe' },
                    { label: 'Asia', value: 'Asia' },
                    { label: 'North America', value: 'North America' },
                    { label: 'Oceania', value: 'Oceania' },
                  ]}
                />
              </div>

              {/* Cost Index Filter */}
              <div>
                <Select
                  value={costIndexFilter}
                  onChange={(e) => setCostIndexFilter(e.target.value)}
                  options={[
                    { label: 'All Budgets', value: 'all' },
                    { label: 'Budget ($)', value: 'Budget' },
                    { label: 'Moderate ($$)', value: 'Moderate' },
                    { label: 'Luxury ($$$)', value: 'Luxury' },
                  ]}
                />
              </div>

              {/* Sort Filter */}
              <div>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  options={[
                    { label: 'Most Popular', value: 'popular' },
                    { label: 'Rating (High-Low)', value: 'rating' },
                    { label: 'Cost (Low to High)', value: 'cost_asc' },
                    { label: 'Cost (High to Low)', value: 'cost_desc' },
                    { label: 'Alphabetical', value: 'name' },
                  ]}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Activity Search */}
              <div>
                <Input
                  type="search"
                  placeholder="Search activity or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                />
              </div>

              {/* Activity Type Filter */}
              <div>
                <Select
                  value={activityCategoryFilter}
                  onChange={(e) => setActivityCategoryFilter(e.target.value)}
                  options={[
                    { label: 'All Activity Types', value: 'all' },
                    { label: 'Sightseeing', value: 'Sightseeing' },
                    { label: 'Culture & Museum', value: 'Culture' },
                    { label: 'Food & Culinary', value: 'Food' },
                    { label: 'Adventure & Outdoors', value: 'Adventure' },
                    { label: 'Architecture', value: 'Architecture' },
                    { label: 'Entertainment', value: 'Entertainment' },
                    { label: 'Experience', value: 'Experience' },
                  ]}
                />
              </div>

              {/* Activity Cost Filter */}
              <div>
                <Select
                  value={activityCostFilter}
                  onChange={(e) => setActivityCostFilter(e.target.value)}
                  options={[
                    { label: 'Any Cost', value: 'all' },
                    { label: 'Free Activities', value: 'free' },
                    { label: 'Under $25', value: 'under25' },
                    { label: 'Under $50', value: 'under50' },
                  ]}
                />
              </div>

              {/* Activity Duration Filter */}
              <div>
                <Select
                  value={activityDurationFilter}
                  onChange={(e) => setActivityDurationFilter(e.target.value)}
                  options={[
                    { label: 'Any Duration', value: 'all' },
                    { label: 'Quick (≤ 2 hours)', value: 'short' },
                    { label: 'Half Day (≤ 4 hours)', value: 'halfDay' },
                  ]}
                />
              </div>
            </div>
          )}
        </div>

        {/* Results Grid: Cities */}
        {activeTab === 'cities' && (
          <div>
            {loading ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p>Finding destinations...</p>
              </div>
            ) : cities.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                <Compass className="w-10 h-10 text-slate-400 mx-auto opacity-60" />
                <h3 className="text-base font-bold text-slate-900">No destinations found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your search keywords or resetting your budget filters.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setRegionFilter('all');
                    setCostIndexFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {cities.map((city) => {
                  const isSaved = savedCityIds.has(Number(city.id));
                  return (
                    <div
                      key={city.id}
                      className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-subtle hover:border-slate-300 hover:shadow-lg transition-all flex flex-col justify-between"
                    >
                      {/* Image Header */}
                      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                        <img
                          src={city.image_url}
                          alt={city.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          <Badge
                            variant={
                              city.cost_index === 'Budget'
                                ? 'success'
                                : city.cost_index === 'Luxury'
                                ? 'primary'
                                : 'secondary'
                            }
                            size="sm"
                            className="bg-white/95 backdrop-blur-md"
                          >
                            {city.cost_index} Cost Index
                          </Badge>

                          <button
                            type="button"
                            onClick={(e) => handleToggleBookmark(city, e)}
                            className={`p-2 rounded-full backdrop-blur-md transition-all ${
                              isSaved
                                ? 'bg-travel-500 text-white shadow-md'
                                : 'bg-slate-900/60 text-white hover:bg-slate-900/90'
                            }`}
                            title={isSaved ? 'Remove from Saved' : 'Bookmark Destination'}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
                          </button>
                        </div>

                        {/* Bottom Overlay Title */}
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black tracking-tight drop-shadow-sm truncate">
                              {city.name}
                            </h3>
                            <span className="text-xs font-bold text-amber-300 flex items-center gap-0.5 shrink-0">
                              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                              {city.rating}
                            </span>
                          </div>
                          <p className="text-xs text-slate-200 flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-travel-400 shrink-0" />
                            <span>{city.country} • {city.region}</span>
                          </p>
                        </div>
                      </div>

                      {/* City Metadata Body */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {city.description}
                        </p>

                        {/* Cost & Travel Info Grid */}
                        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                              Avg Daily Cost
                            </span>
                            <span className="font-extrabold text-slate-900">
                              ${city.avg_daily_cost} / day
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                              Avg Meal Cost
                            </span>
                            <span className="font-extrabold text-slate-900">
                              ${city.avg_meal_cost} / meal
                            </span>
                          </div>
                        </div>

                        {/* Best Months info */}
                        {city.best_months && (
                          <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Best Time: {city.best_months}</span>
                          </p>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full text-xs font-bold"
                            onClick={() => handleOpenAddCityModal(city)}
                            leftIcon={<Plus className="w-3.5 h-3.5" />}
                          >
                            Add to Trip
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Results Grid: Activities */}
        {activeTab === 'activities' && (
          <div>
            {loading ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p>Searching master activities catalog...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                <Ticket className="w-10 h-10 text-slate-400 mx-auto opacity-60" />
                <h3 className="text-base font-bold text-slate-900">No activities found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try broadening your category or duration filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-subtle hover:border-slate-300 hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                      <img
                        src={act.image_url}
                        alt={act.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                      <div className="absolute top-3 left-3">
                        <Badge variant="primary" size="sm" className="bg-white/95 backdrop-blur-md">
                          {act.category}
                        </Badge>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between">
                        <span className="text-xs font-bold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-travel-400" />
                          {act.cityName}
                        </span>
                        <span className="text-xs font-bold text-amber-300 flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                          {act.rating}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm line-clamp-1">
                          {act.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {act.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3 font-semibold text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {act.duration_hours}h
                          </span>
                          <span>•</span>
                          <span className="font-black text-slate-900">
                            {act.cost === 0 ? 'Free' : `$${act.cost}`}
                          </span>
                        </div>

                        <Button
                          variant="primary"
                          size="sm"
                          className="h-8 text-xs px-3"
                          onClick={() => handleActivityAddToTrip(act)}
                          leftIcon={<Plus className="w-3.5 h-3.5" />}
                        >
                          Add to Trip
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add City to Trip Modal */}
        <AddCityToTripModal
          isOpen={isAddCityOpen}
          onClose={() => {
            setIsAddCityOpen(false);
            setSelectedCityForTrip(null);
          }}
          city={selectedCityForTrip}
        />
      </div>
    </AppShell>
  );
};


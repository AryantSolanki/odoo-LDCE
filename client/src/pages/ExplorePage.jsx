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
  const [activeTab, setActiveTab] = useState('cities');
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
    if (activeTab === 'cities') fetchCities();
    else fetchActivities();
  }, [
    activeTab, searchQuery, regionFilter, costIndexFilter,
    categoryFilter, activityCategoryFilter, activityCostFilter,
    activityDurationFilter, sortBy,
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
      <div className="space-y-12 pb-24 -mt-6 sm:-mt-8">
        
        {/* Massive Immersive Hero Section */}
        <div className="relative w-full h-[60vh] min-h-[500px] rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden shadow-card isolate">
          <img 
            src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1920&q=80" 
            alt="Paris Architecture"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-950/20 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <span className="inline-block px-4 py-1.5 mb-4 rounded-full bg-surface-card/20 backdrop-blur-md text-brand-50 text-xs font-bold tracking-widest uppercase border border-white/20">
                Inspiration
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-editorial font-bold text-white leading-[1.1] tracking-tight mb-4 text-balance">
                JOURNEYS WORTH REMEMBERING.
              </h1>
              <p className="text-brand-100 text-lg md:text-xl font-medium max-w-lg">
                Discover curated destinations, budget intelligently, and plan the perfect multi-city escape.
              </p>
            </div>
            
            <div className="flex gap-4 shrink-0">
              <button 
                onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
                className="px-8 py-4 rounded-full bg-brand-50 text-brand-900 font-bold hover:bg-white transition-colors"
              >
                Explore Destinations
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filter Floating Bar */}
        <div className="relative max-w-5xl mx-auto -mt-20 z-10">
          <div className="bg-surface-card rounded-[2rem] p-6 shadow-modal border border-surface-border">
            
            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-surface-border pb-4 mb-6">
              <button
                onClick={() => setActiveTab('cities')}
                className={`text-lg font-editorial font-bold transition-all relative ${
                  activeTab === 'cities' ? 'text-brand-900' : 'text-brand-400 hover:text-brand-600'
                }`}
              >
                Discover Cities
                {activeTab === 'cities' && <span className="absolute -bottom-4 left-0 right-0 h-0.5 bg-brand-900" />}
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={`text-lg font-editorial font-bold transition-all relative ${
                  activeTab === 'activities' ? 'text-brand-900' : 'text-brand-400 hover:text-brand-600'
                }`}
              >
                Find Experiences
                {activeTab === 'activities' && <span className="absolute -bottom-4 left-0 right-0 h-0.5 bg-brand-900" />}
              </button>
            </div>

            {/* Filters */}
            {activeTab === 'cities' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <Input
                    type="search"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="w-4 h-4 text-brand-400" />}
                  />
                </div>
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
                <div>
                  <Select
                    value={costIndexFilter}
                    onChange={(e) => setCostIndexFilter(e.target.value)}
                    options={[
                      { label: 'Any Budget', value: 'all' },
                      { label: 'Budget ($)', value: 'Budget' },
                      { label: 'Moderate ($$)', value: 'Moderate' },
                      { label: 'Luxury ($$$)', value: 'Luxury' },
                    ]}
                  />
                </div>
                <div>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    options={[
                      { label: 'Most Popular', value: 'popular' },
                      { label: 'Rating (High-Low)', value: 'rating' },
                      { label: 'Cost (Low to High)', value: 'cost_asc' },
                      { label: 'Cost (High to Low)', value: 'cost_desc' },
                    ]}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Input
                    type="search"
                    placeholder="Search activity..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="w-4 h-4 text-brand-400" />}
                  />
                </div>
                <div>
                  <Select
                    value={activityCategoryFilter}
                    onChange={(e) => setActivityCategoryFilter(e.target.value)}
                    options={[
                      { label: 'All Types', value: 'all' },
                      { label: 'Sightseeing', value: 'Sightseeing' },
                      { label: 'Culture & Museum', value: 'Culture' },
                      { label: 'Food & Culinary', value: 'Food' },
                    ]}
                  />
                </div>
                <div>
                  <Select
                    value={activityCostFilter}
                    onChange={(e) => setActivityCostFilter(e.target.value)}
                    options={[
                      { label: 'Any Cost', value: 'all' },
                      { label: 'Free', value: 'free' },
                      { label: 'Under $50', value: 'under50' },
                    ]}
                  />
                </div>
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
        </div>

        {/* Results Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-editorial font-bold text-brand-900 tracking-tight">
              {activeTab === 'cities' ? 'Featured Destinations' : 'Curated Experiences'}
            </h2>
            <span className="text-sm font-semibold text-brand-500 bg-brand-100 px-3 py-1 rounded-full">
              {activeTab === 'cities' ? cities.length : activities.length} found
            </span>
          </div>

          {activeTab === 'cities' && (
            <div>
              {loading ? (
                <div className="py-24 text-center">
                  <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-900 rounded-full animate-spin mx-auto mb-4" />
                </div>
              ) : cities.length === 0 ? (
                <div className="py-24 text-center bg-surface-card rounded-[2rem] border border-surface-border">
                  <Compass className="w-12 h-12 text-brand-300 mx-auto mb-4" />
                  <h3 className="text-xl font-editorial font-bold text-brand-900">No destinations found</h3>
                  <p className="text-brand-500 mt-2">Adjust your filters to discover more.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {cities.map((city) => {
                    const isSaved = savedCityIds.has(Number(city.id));
                    return (
                      <div
                        key={city.id}
                        className="group flex flex-col bg-surface-card rounded-[2rem] overflow-hidden border border-surface-border hover:shadow-card-hover transition-all duration-500 cursor-pointer"
                      >
                        <div className="relative h-64 w-full overflow-hidden">
                          <img
                            src={city.image_url}
                            alt={city.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-transparent to-transparent" />
                          
                          <button
                            type="button"
                            onClick={(e) => handleToggleBookmark(city, e)}
                            className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-xl transition-all ${
                              isSaved ? 'bg-brand-900 text-white' : 'bg-surface-card/50 text-white hover:bg-surface-card/80'
                            }`}
                          >
                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
                          </button>

                          <div className="absolute bottom-4 left-5 right-5 text-white">
                            <h3 className="text-2xl font-editorial font-bold tracking-tight mb-1">
                              {city.name}
                            </h3>
                            <p className="text-sm font-medium text-white/80 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              {city.country}
                            </p>
                          </div>
                        </div>

                        <div className="p-6 flex flex-col flex-1">
                          <p className="text-sm text-brand-600 line-clamp-3 mb-6">
                            {city.description}
                          </p>
                          
                          <div className="mt-auto space-y-4">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1.5 text-brand-900 font-semibold">
                                <DollarSign className="w-4 h-4 text-brand-400" />
                                {city.avg_daily_cost}/day
                              </div>
                              <div className="flex items-center gap-1.5 text-amber-500 font-semibold">
                                <Star className="w-4 h-4 fill-amber-500" />
                                {city.rating}
                              </div>
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenAddCityModal(city);
                              }}
                              className="w-full py-3 rounded-xl border border-brand-200 text-brand-900 font-bold hover:bg-brand-50 hover:border-brand-300 transition-colors"
                            >
                              Add to Itinerary
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'activities' && (
            <div>
              {loading ? (
                <div className="py-24 text-center">
                  <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-900 rounded-full animate-spin mx-auto mb-4" />
                </div>
              ) : activities.length === 0 ? (
                <div className="py-24 text-center bg-surface-card rounded-[2rem] border border-surface-border">
                  <Ticket className="w-12 h-12 text-brand-300 mx-auto mb-4" />
                  <h3 className="text-xl font-editorial font-bold text-brand-900">No experiences found</h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      className="group flex flex-col bg-surface-card rounded-[2rem] overflow-hidden border border-surface-border hover:shadow-card-hover transition-all duration-500"
                    >
                      <div className="relative h-56 w-full overflow-hidden">
                        <img
                          src={act.image_url}
                          alt={act.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-surface-card/90 backdrop-blur-md rounded-full text-brand-900">
                            {act.category}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-brand-400 mb-2 uppercase tracking-wide">
                          <MapPin className="w-3.5 h-3.5" />
                          {act.cityName}
                        </div>
                        <h4 className="font-editorial font-bold text-xl text-brand-900 line-clamp-2 mb-2">
                          {act.title}
                        </h4>
                        <p className="text-sm text-brand-600 line-clamp-2 mb-6">
                          {act.description}
                        </p>

                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-xs text-brand-500 mb-0.5">Duration & Cost</span>
                            <span className="font-semibold text-brand-900">
                              {act.duration_hours}h • {act.cost === 0 ? 'Free' : `$${act.cost}`}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => handleActivityAddToTrip(act)}
                            className="w-12 h-12 rounded-full bg-brand-50 text-brand-900 flex items-center justify-center hover:bg-brand-900 hover:text-white transition-colors"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

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


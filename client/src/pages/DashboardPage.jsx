import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Sparkles,
  TrendingUp,
  MapPin,
  DollarSign,
  Compass,
  ArrowRight,
  Clock,
  Layers,
  Calendar,
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { MetricCard } from '../components/common/MetricCard';
import { TripCard } from '../components/common/TripCard';
import { DestinationCard } from '../components/common/DestinationCard';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonMetrics, SkeletonCard, PageSpinner } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { apiService } from '../services/apiService';
import { useToast } from '../hooks/useToast';

export const DashboardPage = () => {
  const [stateMode, setStateMode] = useState('loaded');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getDashboardData();
      setData(res);
    } catch (err) {
      setError('Could not fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handlePlanDestination = (dest) => {
    addToast({
      type: 'info',
      title: 'Destination Selected',
      message: `Starting itinerary setup for ${dest.city}, ${dest.country}.`,
    });
    navigate('/trips/new');
  };

  return (
    <AppShell stateMode={stateMode} onStateModeChange={setStateMode}>
      {stateMode === 'loading' || loading ? (
        <div className="space-y-12 animate-fade-in max-w-6xl mx-auto">
          <div className="space-y-4">
            <div className="h-10 w-64 bg-surface-border animate-pulse rounded-2xl" />
            <div className="h-6 w-96 bg-surface-border animate-pulse rounded-xl" />
          </div>

          <SkeletonMetrics />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      ) : stateMode === 'error' || error ? (
        <div className="py-24">
          <ErrorState
            title="Unable to load GlobeTrotter Dashboard"
            description="We experienced a temporary network issue retrieving your trip itineraries. Please try refreshing."
            onRetry={loadDashboard}
          />
        </div>
      ) : stateMode === 'empty' ? (
        <div className="space-y-12 animate-fade-in max-w-5xl mx-auto">
          {/* Welcome Banner */}
          <div className="bg-brand-900 rounded-[3rem] p-10 sm:p-16 text-brand-50 shadow-card relative overflow-hidden isolate">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522814725068-154df67fb438?auto=format&fit=crop&w=1920&q=80')] opacity-20 mix-blend-overlay object-cover" />
            <div className="relative z-10 space-y-6 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-brand-50 text-xs font-bold tracking-widest uppercase border border-white/20">
                <Sparkles className="w-4 h-4" />
                <span>Welcome to GlobeTrotter</span>
              </div>
              <h2 className="text-4xl sm:text-6xl font-editorial font-bold tracking-tight text-balance">
                Where to next, {data?.user?.name || 'Explorer'}?
              </h2>
              <p className="text-brand-200 text-lg sm:text-xl font-medium max-w-lg">
                You haven't planned any multi-city journeys yet. Create your first custom itinerary to start tracking flights, hotels, and budgets.
              </p>

              <div className="pt-4">
                <button
                  onClick={() => navigate('/trips/new')}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-brand-50 text-brand-900 font-bold hover:bg-white transition-colors"
                >
                  <PlusCircle className="w-5 h-5" />
                  Plan Your First Trip
                </button>
              </div>
            </div>
          </div>

          <EmptyState
            icon={Compass}
            title="No Active Itineraries"
            description="Start building your multi-city route by adding destinations, daily budgets, and transport links."
            actionLabel="Plan New Trip"
            onAction={() => navigate('/trips/new')}
          />
        </div>
      ) : (
        <div className="space-y-12 animate-fade-in max-w-7xl mx-auto">
          {/* Personalized Welcome Banner */}
          <div className="bg-surface-card rounded-[3rem] border border-surface-border p-8 sm:p-12 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative overflow-hidden isolate">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-100 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3" />
            
            <div className="space-y-4 z-10 max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 border border-green-200 text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Active Traveler
                </span>
                <span className="text-brand-400 font-medium text-sm">3 Multi-City Routes</span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-editorial font-bold text-brand-900 tracking-tight">
                Good morning, {data?.user?.name || 'Alex'}.
              </h2>

              <p className="text-lg text-brand-600 font-medium leading-relaxed max-w-2xl">
                Your upcoming <span className="font-bold text-brand-900">Japanese Heritage Odyssey</span> starts in <span className="font-bold text-brand-900 underline decoration-brand-300 decoration-2 underline-offset-4">54 days</span>. Flights and 2 of 3 hotels are confirmed.
              </p>
            </div>

            <div className="shrink-0 z-10">
              <button
                onClick={() => navigate('/trips/new')}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-brand-900 text-brand-50 font-bold hover:bg-brand-800 transition-colors shadow-card hover:shadow-card-hover w-full sm:w-auto"
              >
                <PlusCircle className="w-5 h-5" />
                Plan New Trip
              </button>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Trips Planned"
              value={data?.trips?.length || 3}
              subtitle="2 upcoming, 1 completed"
              icon={MapPin}
              iconBg="bg-brand-100 text-brand-700"
            />
            <MetricCard
              title="Allocated Budget"
              value={`$${(data?.budgetSummary?.totalAllocated || 0).toLocaleString()}`}
              subtitle="Across all active itineraries"
              icon={DollarSign}
              trend="98% On Track"
              trendPositive={true}
              iconBg="bg-green-100 text-green-700"
            />
            <MetricCard
              title="Total Cities Saved"
              value="9 Cities"
              subtitle="Tokyo, Kyoto, Osaka & more"
              icon={Layers}
              iconBg="bg-amber-100 text-amber-700"
            />
            <MetricCard
              title="Travel Days Scheduled"
              value="35 Days"
              subtitle="Next trip: Oct 15 - Oct 27"
              icon={Calendar}
              iconBg="bg-blue-100 text-blue-700"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Upcoming Trips Section */}
            <div className="xl:col-span-2 space-y-6">
              <div className="flex items-end justify-between border-b border-surface-border pb-4">
                <div>
                  <h3 className="text-3xl font-editorial font-bold text-brand-900 tracking-tight">
                    Upcoming Journeys
                  </h3>
                </div>
                <Link
                  to="/trips"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-900 transition-colors uppercase tracking-wider"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data?.trips?.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            </div>

            {/* Budget Breakdown Widget */}
            <div className="xl:col-span-1">
              <div className="bg-surface-card rounded-[2rem] border border-surface-border p-8 shadow-subtle space-y-8 flex flex-col sticky top-8">
                <div>
                  <h3 className="text-2xl font-editorial font-bold text-brand-900 tracking-tight flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-brand-500" />
                    Global Budget
                  </h3>
                  <p className="text-brand-500 mt-2 font-medium">
                    Aggregate financial breakdown for current multi-city routes
                  </p>
                </div>

                <div className="flex items-center gap-6 pb-6 border-b border-surface-border">
                  <div>
                    <span className="text-brand-400 text-sm font-semibold uppercase tracking-wider block mb-1">Total Spent</span>
                    <span className="text-2xl font-bold text-brand-900">${(data?.budgetSummary?.totalSpent || 0).toLocaleString()}</span>
                  </div>
                  <div className="w-px h-12 bg-surface-border" />
                  <div>
                    <span className="text-brand-400 text-sm font-semibold uppercase tracking-wider block mb-1">Buffer</span>
                    <span className="text-2xl font-bold text-green-600">${Math.max(0, (data?.budgetSummary?.totalAllocated || 0) - (data?.budgetSummary?.totalSpent || 0)).toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-6 flex-1">
                  {data?.budgetSummary?.categories?.map((cat) => (
                    <div key={cat.name} className="space-y-2">
                      <div className="flex justify-between items-center text-sm font-semibold">
                        <span className="text-brand-700">{cat.name}</span>
                        <span className="text-brand-900">${cat.amount.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-3 bg-brand-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Destinations Section */}
          <div className="space-y-8 pt-8">
            <div className="flex items-end justify-between border-b border-surface-border pb-4">
              <div>
                <h3 className="text-3xl font-editorial font-bold text-brand-900 tracking-tight flex items-center gap-3">
                  <Compass className="w-6 h-6 text-brand-400" />
                  Inspiration
                </h3>
              </div>
              <Link
                to="/explore"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-900 transition-colors uppercase tracking-wider"
              >
                Discover More
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
              {data?.recommendedDestinations?.map((dest) => (
                <DestinationCard
                  key={dest.id}
                  destination={dest}
                  onPlan={handlePlanDestination}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

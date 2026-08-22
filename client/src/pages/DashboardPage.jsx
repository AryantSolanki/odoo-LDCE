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
  // Demo State Mode: 'loaded' | 'empty' | 'loading' | 'error'
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
      {/* 1. Loading State Preview */}
      {stateMode === 'loading' || loading ? (
        <div className="space-y-8 animate-fade-in">
          <div className="space-y-2">
            <div className="h-7 w-64 bg-slate-200 animate-pulse rounded-lg" />
            <div className="h-4 w-96 bg-slate-200 animate-pulse rounded-lg" />
          </div>

          <SkeletonMetrics />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      ) : stateMode === 'error' || error ? (
        /* 2. Error State Preview */
        <div className="py-12">
          <ErrorState
            title="Unable to load GlobeTrotter Dashboard"
            description="We experienced a temporary network issue retrieving your trip itineraries. Please try refreshing."
            onRetry={loadDashboard}
          />
        </div>
      ) : stateMode === 'empty' ? (
        /* 3. Empty State Preview (New User Experience) */
        <div className="space-y-8 animate-fade-in">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-travel-300 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Welcome to GlobeTrotter</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Where to next, {data?.user?.name || 'Explorer'}?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                You haven't planned any multi-city journeys yet. Create your first custom itinerary to start tracking flights, hotels, and budgets.
              </p>

              <div className="pt-2">
                <Button
                  variant="accent"
                  size="lg"
                  leftIcon={<PlusCircle className="w-5 h-5" />}
                  onClick={() => navigate('/trips/new')}
                >
                  Plan Your First Trip
                </Button>
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
        /* 4. Loaded State (Default Rich Dashboard) */
        <div className="space-y-8 animate-fade-in">
          {/* Personalized Welcome Banner */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-1.5 z-10 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Traveler Status
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">3 Multi-City Routes</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Good morning, {data?.user?.name || 'Alex'} 👋
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Your upcoming <span className="font-semibold text-slate-900">Japanese Heritage Odyssey</span> starts in <span className="font-bold text-brand-600">54 days</span>. Flights and 2 of 3 hotels are confirmed.
              </p>
            </div>

            {/* Primary Action CTA */}
            <div className="shrink-0 z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                variant="accent"
                size="lg"
                className="shadow-lg shadow-travel-500/25"
                leftIcon={<PlusCircle className="w-5 h-5" />}
                onClick={() => navigate('/trips/new')}
              >
                Plan New Trip
              </Button>
            </div>

            {/* Ambient Background Accent */}
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl -z-0 pointer-events-none" />
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Trips Planned"
              value={data?.trips?.length || 3}
              subtitle="2 upcoming, 1 completed"
              icon={MapPin}
              iconBg="bg-brand-50 text-brand-600 border-brand-100"
            />

            <MetricCard
              title="Allocated Budget"
              value={`$${(data?.budgetSummary?.totalAllocated || 11000).toLocaleString()}`}
              subtitle="Across all active itineraries"
              icon={DollarSign}
              trend="98% On Track"
              trendPositive={true}
              iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
            />

            <MetricCard
              title="Total Cities Saved"
              value="9 Cities"
              subtitle="Tokyo, Kyoto, Osaka & more"
              icon={Layers}
              iconBg="bg-indigo-50 text-indigo-600 border-indigo-100"
            />

            <MetricCard
              title="Travel Days Scheduled"
              value="35 Days"
              subtitle="Next trip: Oct 15 - Oct 27"
              icon={Calendar}
              iconBg="bg-travel-50 text-travel-600 border-travel-100"
            />
          </div>

          {/* Upcoming Trips Section Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Upcoming & Active Trips
                </h3>
                <p className="text-xs text-slate-500">
                  Manage your multi-city timelines and financial tracking
                </p>
              </div>

              <Link
                to="/trips"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                <span>View All Trips</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Trips Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.trips?.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          </div>

          {/* Budget Breakdown & Highlights Widget */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-brand-600" />
                  <span>Global Budget Summary</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aggregate financial breakdown for current multi-city routes
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Total Spent: </span>
                  <span className="font-bold text-slate-900">${(data?.budgetSummary?.totalSpent || 8850).toLocaleString()}</span>
                </div>
                <div className="h-4 w-px bg-slate-200" />
                <div>
                  <span className="text-slate-400">Remaining Buffer: </span>
                  <span className="font-bold text-emerald-600">${((data?.budgetSummary?.totalAllocated || 11000) - (data?.budgetSummary?.totalSpent || 8850)).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Progress Category Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data?.budgetSummary?.categories?.map((cat) => (
                <div key={cat.name} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{cat.name}</span>
                    <span className="font-bold text-slate-900">${cat.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 text-right">{cat.percentage}% of overall spend</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Destinations Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Compass className="w-5 h-5 text-travel-500" />
                  <span>Recommended Multi-City Highlights</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Popular destinations ideal for multi-stop itineraries
                </p>
              </div>

              <Link
                to="/explore"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

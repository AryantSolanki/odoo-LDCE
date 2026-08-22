import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Share2,
  Edit,
  Sparkles,
  Layers,
  Eye,
  CheckCircle,
  Plus,
  PieChart,
  Clock,
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/Skeleton';
import { ItineraryBuilder } from '../components/trip/ItineraryBuilder';
import { ItineraryView } from '../components/trip/ItineraryView';
import { TripSummarySidebar } from '../components/trip/TripSummarySidebar';
import { BudgetDashboard } from '../components/trip/BudgetDashboard';
import { TripTimelineView } from '../components/trip/TripTimelineView';
import { ShareTripModal } from '../components/trip/ShareTripModal';
import { apiService } from '../services/apiService';
import { useToast } from '../hooks/useToast';
import { formatDate } from '../utils/dateValidation';

export const TripDetailsPage = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('builder');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const fetchTripDetails = async () => {
    setLoading(true);
    try {
      const res = await apiService.getTripById(id);
      setTrip(res);
    } catch (err) {
      addToast({ type: 'error', title: 'Error Loading Trip', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const handleAddStop = async (stopData) => {
    try {
      const { trip: updatedTrip, stop: newStop } = await apiService.addStop(trip.id, stopData);
      setTrip(updatedTrip);
      addToast({ type: 'success', title: 'Stop Added!', message: `"${newStop.cityName}" has been added to your route.` });
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to Add Stop', message: err.message });
    }
  };

  const handleUpdateStop = async (stopId, stopData) => {
    try {
      const { trip: updatedTrip } = await apiService.updateStop(trip.id, stopId, stopData);
      setTrip(updatedTrip);
      addToast({ type: 'success', title: 'Stop Updated', message: `Stop details updated successfully.` });
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to Update Stop', message: err.message });
    }
  };

  const handleDeleteStop = async (stopId) => {
    try {
      const updatedTrip = await apiService.deleteStop(trip.id, stopId);
      setTrip(updatedTrip);
      addToast({ type: 'success', title: 'Stop Removed', message: `City stop removed from trip.` });
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to Remove Stop', message: err.message });
    }
  };

  const handleReorderStops = async (reorderedStops) => {
    try {
      const updatedTrip = await apiService.reorderStops(trip.id, reorderedStops);
      setTrip(updatedTrip);
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to Reorder Stops', message: err.message });
    }
  };

  const handleAddActivity = async (stopId, activityData) => {
    try {
      const { trip: updatedTrip, activity } = await apiService.addActivity(trip.id, stopId, activityData);
      setTrip(updatedTrip);
      addToast({ type: 'success', title: 'Activity Added', message: `"${activity.title}" added to itinerary.` });
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to Add Activity', message: err.message });
    }
  };

  const handleUpdateActivity = async (stopId, activityId, activityData) => {
    try {
      const { trip: updatedTrip } = await apiService.updateActivity(trip.id, stopId, activityId, activityData);
      setTrip(updatedTrip);
      addToast({ type: 'success', title: 'Activity Updated', message: `Activity changes saved.` });
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to Update Activity', message: err.message });
    }
  };

  const handleDeleteActivity = async (stopId, activityId) => {
    try {
      const updatedTrip = await apiService.deleteActivity(trip.id, stopId, activityId);
      setTrip(updatedTrip);
      addToast({ type: 'success', title: 'Activity Removed', message: `Activity deleted from stop.` });
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to Remove Activity', message: err.message });
    }
  };

  const handleToggleActivity = async (stopId, activityId) => {
    try {
      const updatedTrip = await apiService.toggleActivityComplete(trip.id, stopId, activityId);
      setTrip(updatedTrip);
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to Toggle Activity', message: err.message });
    }
  };

  if (loading || !trip) {
    return (
      <AppShell>
        <div className="space-y-6 max-w-7xl mx-auto">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-10 animate-fade-in pb-24 max-w-7xl mx-auto">
        {/* Top Back Navigation & Shared Actions */}
        <div className="flex items-center justify-between">
          <Link
            to="/trips"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-500 hover:text-brand-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Trips</span>
          </Link>
        </div>

        {/* Hero Header */}
        <div className="relative rounded-[3rem] overflow-hidden bg-brand-950 text-white min-h-[400px] flex flex-col justify-end p-8 sm:p-12 shadow-card isolate">
          <img
            src={trip.coverImage}
            alt={trip.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
            }}
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/40 to-transparent" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand-900/50 backdrop-blur-md border border-brand-500/30 text-brand-100 text-xs font-bold uppercase tracking-wider">
                  {trip.status}
                </span>
                <span className="text-xs text-brand-200 font-semibold tracking-wide uppercase">
                  {trip.citiesCount || (trip.destinations ? trip.destinations.length : 0)} Destinations
                </span>
                {trip.isPublic && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                    Public Link
                  </span>
                )}
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-editorial font-bold tracking-tight text-white leading-none">
                {trip.title}
              </h1>

              {trip.description && (
                <p className="text-sm sm:text-base text-brand-200 max-w-2xl font-medium leading-relaxed">
                  {trip.description}
                </p>
              )}

              <p className="text-sm text-brand-300 flex items-center gap-2 font-semibold tracking-wide uppercase mt-4">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
                <span>{trip.subtitle}</span>
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <button
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-md text-white font-bold border border-white/20 hover:bg-white/20 transition-colors"
                onClick={() => setIsShareModalOpen(true)}
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Tab Selector & Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-surface-border pb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setActiveTab('builder')}
              className={`pb-2 text-sm font-bold transition-all border-b-2 relative ${
                activeTab === 'builder'
                  ? 'border-brand-900 text-brand-900'
                  : 'border-transparent text-brand-400 hover:text-brand-600'
              } flex items-center gap-2`}
            >
              <Layers className="w-4 h-4" />
              Builder
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className={`pb-2 text-sm font-bold transition-all border-b-2 relative ${
                activeTab === 'timeline'
                  ? 'border-brand-900 text-brand-900'
                  : 'border-transparent text-brand-400 hover:text-brand-600'
              } flex items-center gap-2`}
            >
              <Clock className="w-4 h-4" />
              Timeline
            </button>

            <button
              onClick={() => setActiveTab('budget')}
              className={`pb-2 text-sm font-bold transition-all border-b-2 relative ${
                activeTab === 'budget'
                  ? 'border-brand-900 text-brand-900'
                  : 'border-transparent text-brand-400 hover:text-brand-600'
              } flex items-center gap-2`}
            >
              <PieChart className="w-4 h-4" />
              Budget
            </button>

            <button
              onClick={() => setActiveTab('view')}
              className={`pb-2 text-sm font-bold transition-all border-b-2 relative ${
                activeTab === 'view'
                  ? 'border-brand-900 text-brand-900'
                  : 'border-transparent text-brand-400 hover:text-brand-600'
              } flex items-center gap-2`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>

          <p className="text-xs font-bold text-brand-500 uppercase tracking-widest bg-brand-100 px-4 py-2 rounded-full hidden sm:block">
            {formatDate(trip.startDate, 'monthDay')} – {formatDate(trip.endDate, 'monthDayYear')}
          </p>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'builder' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            <div className="xl:col-span-8 space-y-6">
              <ItineraryBuilder
                trip={trip}
                onAddStop={handleAddStop}
                onUpdateStop={handleUpdateStop}
                onDeleteStop={handleDeleteStop}
                onReorderStops={handleReorderStops}
                onAddActivity={handleAddActivity}
                onUpdateActivity={handleUpdateActivity}
                onDeleteActivity={handleDeleteActivity}
                onToggleActivity={handleToggleActivity}
              />
            </div>
            <div className="xl:col-span-4 space-y-6">
              <TripSummarySidebar trip={trip} />
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <TripTimelineView trip={trip} onTimelineUpdated={fetchTripDetails} />
        )}

        {activeTab === 'budget' && (
          <BudgetDashboard trip={trip} onBudgetUpdated={fetchTripDetails} />
        )}

        {activeTab === 'view' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            <div className="xl:col-span-8 space-y-6">
              <ItineraryView
                trip={trip}
                onToggleActivity={handleToggleActivity}
              />
            </div>
            <div className="xl:col-span-4 space-y-6">
              <TripSummarySidebar trip={trip} />
            </div>
          </div>
        )}

        <ShareTripModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          trip={trip}
          onTripUpdated={(updated) => setTrip(updated)}
        />
      </div>
    </AppShell>
  );
};


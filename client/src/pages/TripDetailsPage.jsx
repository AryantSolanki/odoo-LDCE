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
  const [activeTab, setActiveTab] = useState('builder'); // 'builder' | 'view' | 'budget' | 'timeline'
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

  // --- Stop Operations ---
  const handleAddStop = async (stopData) => {
    try {
      const { trip: updatedTrip, stop: newStop } = await apiService.addStop(trip.id, stopData);
      setTrip(updatedTrip);
      addToast({
        type: 'success',
        title: 'Stop Added!',
        message: `"${newStop.cityName}" has been added to your route.`,
      });
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to Add Stop', message: err.message });
    }
  };

  const handleUpdateStop = async (stopId, stopData) => {
    try {
      const { trip: updatedTrip } = await apiService.updateStop(trip.id, stopId, stopData);
      setTrip(updatedTrip);
      addToast({
        type: 'success',
        title: 'Stop Updated',
        message: `Stop details updated successfully.`,
      });
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to Update Stop', message: err.message });
    }
  };

  const handleDeleteStop = async (stopId) => {
    try {
      const updatedTrip = await apiService.deleteStop(trip.id, stopId);
      setTrip(updatedTrip);
      addToast({
        type: 'success',
        title: 'Stop Removed',
        message: `City stop removed from trip.`,
      });
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

  // --- Activity Operations ---
  const handleAddActivity = async (stopId, activityData) => {
    try {
      const { trip: updatedTrip, activity } = await apiService.addActivity(
        trip.id,
        stopId,
        activityData
      );
      setTrip(updatedTrip);
      addToast({
        type: 'success',
        title: 'Activity Added',
        message: `"${activity.title}" added to itinerary.`,
      });
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to Add Activity', message: err.message });
    }
  };

  const handleUpdateActivity = async (stopId, activityId, activityData) => {
    try {
      const { trip: updatedTrip } = await apiService.updateActivity(
        trip.id,
        stopId,
        activityId,
        activityData
      );
      setTrip(updatedTrip);
      addToast({
        type: 'success',
        title: 'Activity Updated',
        message: `Activity changes saved.`,
      });
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to Update Activity', message: err.message });
    }
  };

  const handleDeleteActivity = async (stopId, activityId) => {
    try {
      const updatedTrip = await apiService.deleteActivity(trip.id, stopId, activityId);
      setTrip(updatedTrip);
      addToast({
        type: 'success',
        title: 'Activity Removed',
        message: `Activity deleted from stop.`,
      });
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
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in pb-16">
        {/* Top Back Navigation & Shared Actions */}
        <div className="flex items-center justify-between">
          <Link
            to="/trips"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Trips</span>
          </Link>
        </div>

        {/* Hero Header */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white min-h-[260px] flex flex-col justify-end p-6 sm:p-8 shadow-xl">
          <img
            src={trip.coverImage}
            alt={trip.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
            }}
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={trip.statusVariant || 'primary'} showDot className="bg-white/95 backdrop-blur-md">
                  {trip.status}
                </Badge>
                <span className="text-xs text-slate-300 font-medium">
                  • {trip.citiesCount || (trip.destinations ? trip.destinations.length : 0)} Cities Included
                </span>
                {trip.isPublic && (
                  <Badge variant="success" size="sm" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    Public Link Active
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                {trip.title}
              </h1>

              {trip.description && (
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                  {trip.description}
                </p>
              )}

              <p className="text-xs sm:text-sm text-travel-300 flex items-center gap-2 font-medium">
                <MapPin className="w-4 h-4 text-travel-400 shrink-0" />
                <span>{trip.subtitle}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                leftIcon={<Share2 className="w-4 h-4" />}
                onClick={() => setIsShareModalOpen(true)}
              >
                Share Itinerary
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Selector & Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'builder'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4" />
              Itinerary Builder
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'timeline'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-4 h-4" />
              Timeline Schedule
            </button>

            <button
              onClick={() => setActiveTab('budget')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'budget'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <PieChart className="w-4 h-4" />
              Budget & Insights
            </button>

            <button
              onClick={() => setActiveTab('view')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'view'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <Eye className="w-4 h-4" />
              Itinerary View
            </button>
          </div>

          <p className="text-xs text-slate-500 hidden sm:block">
            {formatDate(trip.startDate, 'monthDay')} – {formatDate(trip.endDate, 'monthDayYear')}
          </p>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
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
            <div className="lg:col-span-4 space-y-6">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              <ItineraryView
                trip={trip}
                onToggleActivity={handleToggleActivity}
              />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <TripSummarySidebar trip={trip} />
            </div>
          </div>
        )}

        {/* Share Modal */}
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


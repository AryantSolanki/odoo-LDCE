import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Calendar,
  DollarSign,
  Copy,
  Share2,
  Check,
  Building2,
  Plane,
  Clock,
  Globe,
  ArrowRight,
  Sparkles,
  Layers,
  Users,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { apiService } from '../services/apiService';
import { useToast } from '../hooks/useToast';
import { formatDate } from '../utils/dateValidation';

export const SharedTripPage = () => {
  const { publicId } = useParams();
  const [trip, setTrip] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCloning, setIsCloning] = useState(false);
  const [copied, setCopied] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSharedData = async () => {
      setLoading(true);
      try {
        const tripData = await apiService.getSharedTrip(publicId);
        setTrip(tripData);

        const timelineData = await apiService.getTripTimeline(tripData.id);
        setTimeline(timelineData);
      } catch (err) {
        addToast({
          type: 'error',
          title: 'Guide Not Found',
          message: 'This shared travel guide is unavailable or private.',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSharedData();
  }, [publicId]);

  const handleCopyTrip = async () => {
    setIsCloning(true);
    try {
      const cloned = await apiService.copySharedTrip(publicId);
      addToast({
        type: 'success',
        title: 'Trip Cloned Successfully!',
        message: `"${cloned.title}" has been added to your trips workspace.`,
      });
      navigate(`/trips/${cloned.id}`);
    } catch (err) {
      addToast({ type: 'error', title: 'Error Cloning Trip', message: err.message });
    } finally {
      setIsCloning(false);
    }
  };

  const handleShareLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    addToast({
      type: 'success',
      title: 'Link Copied',
      message: 'Shareable travel guide URL copied to clipboard.',
    });
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-500">Loading travel guide...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4">
          <Compass className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-xl font-black text-slate-900">Travel Guide Not Found</h2>
          <p className="text-xs text-slate-500">
            This shared itinerary link may have been revoked or does not exist.
          </p>
          <Button variant="primary" size="md" onClick={() => navigate('/dashboard')}>
            Explore GlobeTrotter
          </Button>
        </div>
      </div>
    );
  }

  const allActivities = trip.stops ? trip.stops.flatMap((s) => s.activities || []) : [];
  const totalCost = (trip.stops || []).reduce(
    (sum, s) => sum + Number(s.transportCost || 0) + Number(s.stayCostPerNight || 0) * 3,
    0
  ) + allActivities.reduce((sum, a) => sum + Number(a.cost || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Public Travel Guide Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-travel-500 flex items-center justify-center text-white font-black text-sm shadow-sm">
            GT
          </div>
          <span className="font-extrabold text-slate-900 tracking-tight text-base hidden sm:inline">
            GlobeTrotter
          </span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 hidden md:inline">
            Public Travel Guide
          </span>
        </Link>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareLink}
            leftIcon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          >
            {copied ? 'Copied' : 'Share'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            isLoading={isCloning}
            onClick={handleCopyTrip}
            leftIcon={<Copy className="w-4 h-4" />}
          >
            Copy Trip to My Account
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Luxury Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white min-h-[340px] flex flex-col justify-end p-6 sm:p-10 shadow-2xl">
          <img
            src={trip.coverImage}
            alt={trip.title}
            className="absolute inset-0 w-full h-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary" size="sm" className="bg-white text-slate-950 font-bold backdrop-blur-md">
                Curated Travel Itinerary
              </Badge>
              <span className="text-xs text-slate-300 font-medium">
                • {trip.durationDays || 7} Days • {trip.citiesCount || (trip.destinations ? trip.destinations.length : 0)} Cities
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {trip.title}
            </h1>

            {trip.description && (
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {trip.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs sm:text-sm text-travel-300 font-semibold pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-travel-400" />
                {trip.subtitle}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Calendar className="w-4 h-4 text-slate-400" />
                {formatDate(trip.startDate, 'monthDay')} – {formatDate(trip.endDate, 'monthDayYear')}
              </span>
            </div>
          </div>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle text-center space-y-0.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Duration</p>
            <p className="text-xl font-black text-slate-900">{trip.durationDays || 10} Days</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle text-center space-y-0.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Destinations</p>
            <p className="text-xl font-black text-slate-900">{trip.citiesCount || 3} Cities</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle text-center space-y-0.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Activities</p>
            <p className="text-xl font-black text-slate-900">{allActivities.length} Experiences</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle text-center space-y-0.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Est. Cost</p>
            <p className="text-xl font-black text-brand-600">${(trip.budgetTotal || 2500).toLocaleString()}</p>
          </div>
        </div>

        {/* City Stops Overview Carousel/Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Route & Stops</h3>
            <span className="text-xs font-bold text-slate-400">Sequential Order</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(trip.stops || []).map((stop, idx) => (
              <div
                key={stop.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {formatDate(stop.startDate, 'monthDay')} - {formatDate(stop.endDate, 'monthDay')}
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-slate-900">{stop.cityName}</h4>
                  <p className="text-xs text-slate-500">{stop.country}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                  <p className="flex items-center gap-1.5">
                    <Plane className="w-3.5 h-3.5 text-sky-600" />
                    <span>{stop.transportMode || 'Flight'} (${stop.transportCost || 0})</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-brand-600" />
                    <span>${stop.stayCostPerNight || 0} / night</span>
                  </p>
                </div>

                {stop.notes && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-50 p-2 rounded-xl">
                    "{stop.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Day-by-Day Storybook Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Day-by-Day Schedule</h3>
            <Badge variant="primary">Read-Only Guide</Badge>
          </div>

          <div className="space-y-4">
            {timeline?.days?.map((day) => {
              const acts = day.events.filter((e) => e.eventType === 'activity');
              return (
                <div
                  key={day.dayNumber}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-subtle space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-brand-50 text-brand-700 font-extrabold text-xs flex items-center justify-center">
                        D{day.dayNumber}
                      </span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        Day {day.dayNumber} • {formatDate(day.date, 'monthDay')}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-travel-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-travel-500" />
                      {day.cityName}
                    </span>
                  </div>

                  {acts.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      Free exploration & transit day in {day.cityName}.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {acts.map((act) => (
                        <div
                          key={act.id}
                          className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{act.title}</span>
                            <Badge variant="primary" size="sm">{act.category}</Badge>
                          </div>
                          {act.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-2">{act.description}</p>
                          )}
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 pt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {act.time}
                            </span>
                            <span className="text-slate-900 font-bold">
                              {act.cost === 0 ? 'Free' : `$${act.cost}`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Call to Action for Visitors */}
        <div className="bg-gradient-to-r from-brand-600 to-indigo-700 rounded-3xl p-8 text-white text-center space-y-4 shadow-xl">
          <Sparkles className="w-10 h-10 mx-auto text-amber-300" />
          <div className="space-y-1">
            <h3 className="text-2xl font-black tracking-tight">Love this itinerary?</h3>
            <p className="text-xs sm:text-sm text-brand-100 max-w-lg mx-auto">
              Clone this complete route into your GlobeTrotter account to customize dates, add your own tours, and track your travel budget.
            </p>
          </div>

          <Button
            variant="accent"
            size="lg"
            isLoading={isCloning}
            onClick={handleCopyTrip}
            leftIcon={<Copy className="w-4 h-4" />}
            className="shadow-lg"
          >
            Copy Trip & Start Planning
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        Published via GlobeTrotter • Personalized Multi-City Travel Planner
      </footer>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  List,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plane,
  Building2,
  Ticket,
} from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { TripTimelineView } from '../components/trip/TripTimelineView';
import { apiService } from '../services/apiService';
import { formatDate } from '../utils/dateValidation';

export const CalendarPage = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'overview'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrips = async () => {
      setLoading(true);
      try {
        const data = await apiService.getTrips();
        setTrips(data);
        if (data.length > 0) {
          setSelectedTripId(data[0].id);
        }
      } finally {
        setLoading(false);
      }
    };
    loadTrips();
  }, []);

  const activeTrip = trips.find((t) => String(t.id) === String(selectedTripId)) || trips[0];

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-brand-600" />
              <span>Travel Calendar & Timeline</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Interactive chronological itinerary schedule and scheduled transit milestones.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Trip Selector Dropdown */}
            {trips.length > 0 && (
              <div className="w-64">
                <Select
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  options={trips.map((t) => ({
                    label: `${t.title} (${t.durationDays || 7}d)`,
                    value: t.id,
                  }))}
                />
              </div>
            )}

            {/* View Switcher */}
            <div className="flex items-center p-1 bg-slate-200/70 rounded-2xl shrink-0">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'timeline'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Timeline
              </button>
              <button
                onClick={() => setViewMode('overview')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'overview'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                All Trips
              </button>
            </div>
          </div>
        </div>

        {/* Active View */}
        {viewMode === 'timeline' && activeTrip && (
          <div className="space-y-6">
            {/* Active Trip Banner */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={activeTrip.coverImage}
                  alt={activeTrip.title}
                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">{activeTrip.title}</h3>
                    <Badge variant={activeTrip.statusVariant} size="sm">{activeTrip.status}</Badge>
                  </div>
                  <p className="text-xs text-travel-600 font-semibold flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-travel-500" />
                    <span>{activeTrip.subtitle}</span>
                  </p>
                </div>
              </div>

              <div className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
                  {formatDate(activeTrip.startDate, 'monthDay')} – {formatDate(activeTrip.endDate, 'monthDayYear')}
                </span>
              </div>
            </div>

            {/* Vertical Timeline View */}
            <TripTimelineView trip={activeTrip} onTimelineUpdated={() => {}} />
          </div>
        )}

        {viewMode === 'overview' && (
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Trips Directory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => {
                    setSelectedTripId(trip.id);
                    setViewMode('timeline');
                  }}
                  className="p-5 rounded-2xl border border-slate-200/80 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle hover:border-brand-300 hover:shadow-md cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={trip.coverImage}
                      alt={trip.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80';
                      }}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{trip.title}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-travel-500" />
                        <span>{trip.subtitle}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {trip.stops ? trip.stops.length : 0} Stops • {trip.stops ? trip.stops.flatMap((s) => s.activities || []).length : 0} Activities
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
                      <Clock className="w-4 h-4 text-slate-500" />
                      {formatDate(trip.startDate, 'monthDay')} to {formatDate(trip.endDate, 'monthDayYear')} ({trip.durationDays} Days)
                    </span>
                    <Badge variant={trip.statusVariant} showDot>{trip.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
};


import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle2,
  Circle,
  Tag,
  Printer,
  Share2,
  List,
  Grid,
  Sparkles,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDate, getDaysDifference } from '../../utils/dateValidation';
import { useToast } from '../../hooks/useToast';

export const ItineraryView = ({ trip, onToggleActivity }) => {
  const [viewMode, setViewMode] = useState('city'); // 'city' | 'day'
  const { addToast } = useToast();

  const totalStops = trip.stops ? trip.stops.length : 0;
  const allActivities = trip.stops
    ? trip.stops.flatMap((stop) =>
        (stop.activities || []).map((act) => ({ ...act, stopCity: stop.cityName }))
      )
    : [];

  const totalActivityCost = allActivities.reduce(
    (sum, act) => sum + Number(act.cost || 0),
    0
  );

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    addToast({
      type: 'success',
      title: 'Itinerary Link Copied',
      message: 'Full itinerary link copied to clipboard.',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Group activities by date for Day View
  const datesMap = {};
  if (trip.stops) {
    trip.stops.forEach((stop) => {
      if (stop.activities) {
        stop.activities.forEach((act) => {
          const actDate = act.date || 'Unscheduled';
          if (!datesMap[actDate]) {
            datesMap[actDate] = {
              date: actDate,
              city: stop.cityName,
              activities: [],
            };
          }
          datesMap[actDate].activities.push(act);
        });
      }
    });
  }
  const sortedDates = Object.keys(datesMap).sort();

  return (
    <div className="space-y-6">
      {/* Top Controls & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Layout View:</span>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('city')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'city'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              City Sections
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'day'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Day-by-Day View
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Share2 className="w-3.5 h-3.5" />}
            onClick={handleShare}
          >
            Share
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            onClick={handlePrint}
          >
            Print
          </Button>
        </div>
      </div>

      {/* --- CITY SECTIONS VIEW --- */}
      {viewMode === 'city' && (
        <div className="space-y-6">
          {!trip.stops || trip.stops.length === 0 ? (
            <Card className="p-8 text-center text-slate-500 text-xs">
              No itinerary stops created yet. Switch to the Builder tab to add cities.
            </Card>
          ) : (
            trip.stops.map((stop, idx) => (
              <Card key={stop.id} className="border border-slate-200/80 shadow-subtle overflow-hidden">
                {/* City Section Header */}
                <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-travel-400">
                      <span>STOP {idx + 1} OF {totalStops}</span>
                      <span>•</span>
                      <span>{formatDate(stop.startDate, 'monthDay')} - {formatDate(stop.endDate, 'monthDay')}</span>
                    </div>
                    <h3 className="text-2xl font-extrabold tracking-tight mt-0.5 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-travel-400" />
                      <span>{stop.cityName}</span>
                      {stop.country && <span className="text-slate-300 font-normal text-base">, {stop.country}</span>}
                    </h3>
                  </div>

                  <div className="text-xs text-slate-300 space-y-0.5 text-right sm:text-left">
                    <p>Transit: <span className="font-semibold text-white">{stop.transportMode}</span> (${stop.transportCost})</p>
                    <p>Stay: <span className="font-semibold text-white">${stop.stayCostPerNight}/night</span></p>
                  </div>
                </div>

                {/* Activities Body */}
                <div className="p-6 space-y-4 bg-white">
                  {!stop.activities || stop.activities.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No scheduled activities for this stop.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {stop.activities.map((act) => (
                        <div
                          key={act.id}
                          className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-subtle transition-all space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{act.title}</h4>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                              ${act.cost}
                            </span>
                          </div>

                          {act.description && (
                            <p className="text-xs text-slate-600 line-clamp-2">{act.description}</p>
                          )}

                          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                            <span className="flex items-center gap-1 font-medium text-brand-600">
                              <CalendarIcon className="w-3.5 h-3.5" />
                              {formatDate(act.date, 'monthDay')} ({act.time})
                            </span>

                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                              {act.category}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* --- DAY BY DAY CHRONOLOGICAL VIEW --- */}
      {viewMode === 'day' && (
        <div className="space-y-6">
          {sortedDates.length === 0 ? (
            <Card className="p-8 text-center text-slate-500 text-xs">
              No scheduled activities mapped to dates yet.
            </Card>
          ) : (
            sortedDates.map((dateStr, idx) => {
              const dayItem = datesMap[dateStr];
              return (
                <Card key={dateStr} className="border border-slate-200/80 shadow-subtle p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-black text-xs flex flex-col items-center justify-center">
                        <span>DAY</span>
                        <span>{idx + 1}</span>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {formatDate(dateStr, 'full')}
                        </h3>
                        <p className="text-xs font-semibold text-travel-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {dayItem.city}
                        </p>
                      </div>
                    </div>

                    <Badge variant="outline" className="text-xs">
                      {dayItem.activities.length} {dayItem.activities.length === 1 ? 'Activity' : 'Activities'}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {dayItem.activities.map((act) => (
                      <div
                        key={act.id}
                        className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-14 font-bold text-slate-500 shrink-0">
                            {act.time}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{act.title}</p>
                            {act.description && (
                              <p className="text-slate-500 line-clamp-1">{act.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-bold text-slate-900">${act.cost}</span>
                          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-semibold text-[10px]">
                            {act.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

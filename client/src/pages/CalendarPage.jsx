import React from 'react';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { MOCK_TRIPS } from '../services/mockData';

export const CalendarPage = () => {
  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-brand-600" />
            <span>Travel Calendar</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Visual schedule of your upcoming multi-city dates and booked transport segments.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>2026 Scheduled Trips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {MOCK_TRIPS.map((trip) => (
              <div
                key={trip.id}
                className="p-5 rounded-2xl border border-slate-200/80 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle hover:border-slate-300 transition-all"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={trip.coverImage}
                    alt={trip.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{trip.title}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-travel-500" />
                      <span>{trip.subtitle}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
                    <Clock className="w-4 h-4 text-slate-500" />
                    {trip.startDate} to {trip.endDate} ({trip.durationDays} Days)
                  </span>
                  <Badge variant={trip.statusVariant} showDot>{trip.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

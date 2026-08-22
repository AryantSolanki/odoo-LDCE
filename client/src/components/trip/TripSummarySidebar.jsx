import React from 'react';
import { Calendar, MapPin, DollarSign, Activity, Users, CheckCircle, PieChart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatDate, getDaysDifference } from '../../utils/dateValidation';

export const TripSummarySidebar = ({ trip }) => {
  const totalDays = getDaysDifference(trip.startDate, trip.endDate);
  const totalStops = trip.stops ? trip.stops.length : 0;

  const allActivities = trip.stops
    ? trip.stops.flatMap((s) => s.activities || [])
    : [];

  const completedActivities = allActivities.filter((a) => a.isCompleted).length;

  const totalTransportCost = trip.stops
    ? trip.stops.reduce((sum, s) => sum + Number(s.transportCost || 0), 0)
    : 0;

  const totalStayCost = trip.stops
    ? trip.stops.reduce(
        (sum, s) =>
          sum +
          Number(s.stayCostPerNight || 0) *
            Math.max(1, getDaysDifference(s.startDate, s.endDate) - 1),
        0
      )
    : 0;

  const totalActivityCost = allActivities.reduce(
    (sum, a) => sum + Number(a.cost || 0),
    0
  );

  const estimatedCalculatedTotal = totalTransportCost + totalStayCost + totalActivityCost;
  const budgetLimit = Number(trip.budgetTotal) || 1;
  const budgetPercent = Math.min(100, Math.round((estimatedCalculatedTotal / budgetLimit) * 100));

  return (
    <div className="space-y-6">
      {/* Overview Metric Card */}
      <Card className="border border-slate-200/80 shadow-subtle p-5 space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Trip Snapshot
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              Duration
            </span>
            <span className="font-bold text-slate-900">{totalDays} Days ({formatDate(trip.startDate, 'monthDay')} - {formatDate(trip.endDate, 'monthDay')})</span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-travel-500" />
              Destinations
            </span>
            <span className="font-bold text-slate-900">{totalStops} Cities</span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              Activities Planned
            </span>
            <span className="font-bold text-slate-900">{allActivities.length} total ({completedActivities} done)</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              Travelers
            </span>
            <span className="font-bold text-slate-900">{trip.collaboratorsCount || 1} Active</span>
          </div>
        </div>
      </Card>

      {/* Budget Breakdown Card */}
      <Card className="border border-slate-200/80 shadow-subtle p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Estimated Cost Breakdown
          </h3>
          <Badge variant={budgetPercent > 90 ? 'warning' : 'success'}>
            {budgetPercent}% of Target
          </Badge>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span>Transit & Intercity Rail</span>
            <span className="font-bold text-slate-900">${totalTransportCost.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span>Accommodations & Hotels</span>
            <span className="font-bold text-slate-900">${totalStayCost.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span>Tours & Activities</span>
            <span className="font-bold text-slate-900">${totalActivityCost.toLocaleString()}</span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm font-extrabold text-slate-900">
            <span>Calculated Total</span>
            <span className="text-brand-600">${estimatedCalculatedTotal.toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Target Budget: ${budgetLimit.toLocaleString()}
          </p>
        </div>

        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              budgetPercent > 90 ? 'bg-amber-500' : 'bg-brand-600'
            }`}
            style={{ width: `${budgetPercent}%` }}
          />
        </div>
      </Card>

      {/* City Route Summary */}
      <Card className="border border-slate-200/80 shadow-subtle p-5 space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Route Order
        </h3>

        {trip.stops && trip.stops.length > 0 ? (
          <div className="space-y-2">
            {trip.stops.map((s, idx) => (
              <div key={s.id} className="flex items-center gap-2.5 text-xs">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="font-bold text-slate-900 truncate">{s.cityName}</span>
                <span className="text-slate-400 ml-auto">{formatDate(s.startDate, 'monthDay')}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No city route set.</p>
        )}
      </Card>
    </div>
  );
};

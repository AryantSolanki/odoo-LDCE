import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Plus,
  CheckCircle2,
  Circle,
  Plane,
  Building2,
  Ticket,
  DollarSign,
  Edit2,
  Trash2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { apiService } from '../../services/apiService';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/dateValidation';

export const TripTimelineView = ({ trip, onTimelineUpdated }) => {
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState(new Set([1, 2, 3])); // Default first 3 days open
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [targetDay, setTargetDay] = useState(null);
  const [actTitle, setActTitle] = useState('');
  const [actCost, setActCost] = useState('25');
  const [actCategory, setActCategory] = useState('Sightseeing');
  const [actTime, setActTime] = useState('10:00 AM');
  const [actDesc, setActDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addToast } = useToast();

  const loadTimeline = async () => {
    if (!trip?.id) return;
    setLoading(true);
    try {
      const data = await apiService.getTripTimeline(trip.id);
      setTimeline(data);
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to generate timeline schedule.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeline();
  }, [trip]);

  const toggleDayExpansion = (dayNumber) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayNumber)) next.delete(dayNumber);
      else next.add(dayNumber);
      return next;
    });
  };

  const handleToggleActivityComplete = async (stopId, activityId) => {
    try {
      await apiService.toggleActivityComplete(trip.id, stopId, activityId);
      loadTimeline();
      if (onTimelineUpdated) onTimelineUpdated();
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update activity status.' });
    }
  };

  const handleOpenAddModal = (day) => {
    setTargetDay(day);
    setActTitle('');
    setActDesc('');
    setIsAddActivityOpen(true);
  };

  const handleQuickAddActivity = async (e) => {
    e.preventDefault();
    if (!actTitle.trim() || !targetDay?.stopId) {
      addToast({ type: 'warning', title: 'Missing Info', message: 'Please enter activity title.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.addActivity(trip.id, targetDay.stopId, {
        title: actTitle,
        cost: Number(actCost) || 0,
        category: actCategory,
        time: actTime,
        date: targetDay.date,
        description: actDesc,
      });

      addToast({ type: 'success', title: 'Activity Added', message: `Added to Day ${targetDay.dayNumber}.` });
      setIsAddActivityOpen(false);
      loadTimeline();
      if (onTimelineUpdated) onTimelineUpdated();
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to add activity.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !timeline) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p>Loading chronological trip timeline...</p>
      </div>
    );
  }

  const allDaysExpanded = expandedDays.size === timeline.days.length;

  const handleToggleExpandAll = () => {
    if (allDaysExpanded) {
      setExpandedDays(new Set());
    } else {
      setExpandedDays(new Set(timeline.days.map((d) => d.dayNumber)));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-brand-600" />
          <h3 className="font-extrabold text-slate-900 text-sm">
            {timeline.total_days}-Day Chronological Itinerary
          </h3>
          <Badge variant="primary" size="sm">
            {timeline.days.reduce((acc, d) => acc + d.events.filter((e) => e.eventType === 'activity').length, 0)} Activities
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToggleExpandAll}>
            {allDaysExpanded ? 'Collapse All Days' : 'Expand All Days'}
          </Button>
        </div>
      </div>

      {/* Vertical Timeline Stream */}
      <div className="relative pl-4 sm:pl-8 space-y-6 before:absolute before:left-[19px] sm:before:left-[35px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
        {timeline.days.map((day) => {
          const isExpanded = expandedDays.has(day.dayNumber);
          const activityEvents = day.events.filter((e) => e.eventType === 'activity');
          const transitEvents = day.events.filter((e) => e.eventType !== 'activity');
          const dayTotalCost = day.events.reduce((sum, e) => sum + Number(e.cost || 0), 0);

          return (
            <div key={day.dayNumber} className="relative group">
              {/* Timeline Marker Dot */}
              <div
                className={`absolute -left-[27px] sm:-left-[43px] top-4 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all ${
                  isExpanded
                    ? 'bg-brand-600 border-brand-600 text-white shadow-md'
                    : 'bg-white border-slate-300 text-slate-600 group-hover:border-brand-500'
                }`}
              >
                {day.dayNumber}
              </div>

              {/* Day Header Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle overflow-hidden transition-all hover:border-slate-300">
                <div
                  onClick={() => toggleDayExpansion(day.dayNumber)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none bg-gradient-to-r from-white to-slate-50/50 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-base">
                          Day {day.dayNumber}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          • {formatDate(day.date, 'monthDayYear')}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-travel-600 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-travel-500" />
                        <span>{day.cityName}</span>
                        {day.country && <span className="text-slate-400">({day.country})</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs font-bold text-slate-700">
                        {activityEvents.length} {activityEvents.length === 1 ? 'Activity' : 'Activities'}
                      </span>
                      {dayTotalCost > 0 && (
                        <p className="text-[11px] text-slate-400 font-semibold">${dayTotalCost} est.</p>
                      )}
                    </div>

                    <button
                      type="button"
                      className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Day Expanded Events */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 space-y-3.5 mt-2">
                    {/* Transit & Stay Markers */}
                    {transitEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-700 font-medium"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
                            {evt.eventType === 'stop_arrival' ? (
                              <Plane className="w-3.5 h-3.5" />
                            ) : (
                              <Building2 className="w-3.5 h-3.5" />
                            )}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900">{evt.title}</span>
                            {evt.description && (
                              <span className="text-slate-500 text-[11px] ml-1.5 font-normal">
                                ({evt.description})
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 font-semibold">{evt.time}</span>
                      </div>
                    ))}

                    {/* Scheduled Activities */}
                    {activityEvents.length === 0 ? (
                      <div className="py-4 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl space-y-2">
                        <p>No tours or activities scheduled for Day {day.dayNumber}.</p>
                        {day.stopId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAddModal(day);
                            }}
                            leftIcon={<Plus className="w-3.5 h-3.5" />}
                          >
                            Add Activity to Day {day.dayNumber}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {activityEvents.map((act) => (
                          <div
                            key={act.id}
                            className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                              act.isCompleted
                                ? 'bg-emerald-50/40 border-emerald-200'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <button
                                type="button"
                                onClick={() => handleToggleActivityComplete(day.stopId, act.activityId)}
                                className={`mt-0.5 shrink-0 transition-colors ${
                                  act.isCompleted ? 'text-emerald-600' : 'text-slate-300 hover:text-slate-500'
                                }`}
                              >
                                {act.isCompleted ? (
                                  <CheckCircle2 className="w-4 h-4 fill-emerald-100 text-emerald-600" />
                                ) : (
                                  <Circle className="w-4 h-4" />
                                )}
                              </button>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h5
                                    className={`text-xs sm:text-sm font-bold truncate ${
                                      act.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                                    }`}
                                  >
                                    {act.title}
                                  </h5>
                                  <Badge variant="primary" size="sm">
                                    {act.category || 'Sightseeing'}
                                  </Badge>
                                </div>

                                {act.description && (
                                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                    {act.description}
                                  </p>
                                )}

                                <div className="flex items-center gap-3 mt-1.5 text-[11px] font-semibold text-slate-500">
                                  <span className="flex items-center gap-1 text-slate-400">
                                    <Clock className="w-3 h-3" />
                                    {act.time}
                                  </span>
                                  <span>•</span>
                                  <span className="text-brand-600">
                                    {Number(act.cost) === 0 ? 'Free' : `$${act.cost}`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Quick Add Activity Button */}
                        {day.stopId && (
                          <button
                            type="button"
                            onClick={() => handleOpenAddModal(day)}
                            className="w-full py-2 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs font-semibold hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50/30 transition-all flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Quick Add Activity to Day {day.dayNumber}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Add Activity to Day Modal */}
      <Modal
        isOpen={isAddActivityOpen}
        onClose={() => setIsAddActivityOpen(false)}
        title={`Add Activity to Day ${targetDay?.dayNumber} (${targetDay?.cityName})`}
        description="Schedule a tour, dining reservation, or adventure for this day."
      >
        <form onSubmit={handleQuickAddActivity} className="space-y-4 pt-1">
          <Input
            label="Activity Title"
            placeholder="e.g. Louvre Guided Tour, Sunset Catamaran"
            value={actTitle}
            onChange={(e) => setActTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <Select
                value={actCategory}
                onChange={(e) => setActCategory(e.target.value)}
                options={[
                  { label: 'Sightseeing', value: 'Sightseeing' },
                  { label: 'Culture & Museum', value: 'Culture' },
                  { label: 'Food & Dining', value: 'Food' },
                  { label: 'Adventure', value: 'Adventure' },
                  { label: 'Architecture', value: 'Architecture' },
                  { label: 'Entertainment', value: 'Entertainment' },
                ]}
              />
            </div>

            <Input
              label="Estimated Cost ($)"
              type="number"
              value={actCost}
              onChange={(e) => setActCost(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Scheduled Time"
              value={actTime}
              onChange={(e) => setActTime(e.target.value)}
              placeholder="e.g. 10:00 AM"
            />
            <Input
              label="Target Date"
              type="date"
              value={targetDay?.date || ''}
              disabled
            />
          </div>

          <Input
            label="Notes / Description"
            placeholder="Ticket booking ID, meeting point instructions..."
            value={actDesc}
            onChange={(e) => setActDesc(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddActivityOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} leftIcon={<Plus className="w-4 h-4" />}>
              Save to Day {targetDay?.dayNumber}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

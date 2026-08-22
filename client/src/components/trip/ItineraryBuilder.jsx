import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit3,
  Trash2,
  CheckCircle2,
  Circle,
  Bus,
  Train,
  Plane,
  Car,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Tag,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { validateStopDates, validateActivityDate, formatDate } from '../../utils/dateValidation';
import { useToast } from '../../hooks/useToast';

const CATEGORY_COLORS = {
  Sightseeing: 'bg-blue-50 text-blue-700 border-blue-200',
  Cultural: 'bg-purple-50 text-purple-700 border-purple-200',
  Dining: 'bg-amber-50 text-amber-700 border-amber-200',
  Adventure: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Nature: 'bg-teal-50 text-teal-700 border-teal-200',
  Shopping: 'bg-pink-50 text-pink-700 border-pink-200',
  Relaxation: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Other: 'bg-slate-100 text-slate-700 border-slate-200',
};

const TRANSPORT_ICONS = {
  Flight: Plane,
  Train: Train,
  'Shinkansen Bullet Train': Train,
  Bus: Bus,
  Car: Car,
};

export const ItineraryBuilder = ({
  trip,
  onAddStop,
  onUpdateStop,
  onDeleteStop,
  onReorderStops,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  onToggleActivity,
}) => {
  const { addToast } = useToast();

  // Expanded sections state for collapsible stops
  const [collapsedStops, setCollapsedStops] = useState({});

  // Stop Modal State
  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState(null);
  const [stopForm, setStopForm] = useState({
    cityName: '',
    country: '',
    startDate: '',
    endDate: '',
    transportMode: 'Flight',
    transportCost: '0',
    stayCostPerNight: '150',
    notes: '',
  });
  const [stopError, setStopError] = useState('');

  // Activity Modal State
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [activeStopId, setActiveStopId] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityForm, setActivityForm] = useState({
    title: '',
    date: '',
    time: '10:00 AM',
    cost: '0',
    category: 'Sightseeing',
    description: '',
  });
  const [activityError, setActivityError] = useState('');

  // Delete Confirm Modal
  const [confirmDeleteModal, setConfirmDeleteModal] = useState({
    isOpen: false,
    type: null, // 'stop' or 'activity'
    stopId: null,
    activityId: null,
    title: '',
  });

  const toggleStopCollapse = (stopId) => {
    setCollapsedStops((prev) => ({ ...prev, [stopId]: !prev[stopId] }));
  };

  // --- Stop Operations ---
  const handleOpenAddStop = () => {
    setEditingStop(null);
    // Suggest default start date as last stop end date or trip start date
    let suggestedStart = trip.startDate || '';
    let suggestedEnd = trip.endDate || '';
    if (trip.stops && trip.stops.length > 0) {
      const lastStop = trip.stops[trip.stops.length - 1];
      suggestedStart = lastStop.endDate || trip.startDate;
    }

    setStopForm({
      cityName: '',
      country: '',
      startDate: suggestedStart,
      endDate: suggestedEnd,
      transportMode: 'Flight',
      transportCost: '0',
      stayCostPerNight: '150',
      notes: '',
    });
    setStopError('');
    setStopModalOpen(true);
  };

  const handleOpenEditStop = (stop) => {
    setEditingStop(stop);
    setStopForm({
      cityName: stop.cityName || '',
      country: stop.country || '',
      startDate: stop.startDate || '',
      endDate: stop.endDate || '',
      transportMode: stop.transportMode || 'Flight',
      transportCost: String(stop.transportCost || 0),
      stayCostPerNight: String(stop.stayCostPerNight || 0),
      notes: stop.notes || '',
    });
    setStopError('');
    setStopModalOpen(true);
  };

  const handleSaveStop = async (e) => {
    e.preventDefault();
    if (!stopForm.cityName.trim()) {
      setStopError('City name is required.');
      return;
    }

    // Validate Stop dates within overall Trip dates
    const dateVal = validateStopDates(
      stopForm.startDate,
      stopForm.endDate,
      trip.startDate,
      trip.endDate
    );
    if (!dateVal.isValid) {
      setStopError(dateVal.message);
      return;
    }

    setStopError('');
    try {
      if (editingStop) {
        await onUpdateStop(stopForm);
      } else {
        await onAddStop(stopForm);
      }
      setStopModalOpen(false);
    } catch (err) {
      setStopError(err.message || 'Failed to save stop.');
    }
  };

  const handleMoveStop = (index, direction) => {
    const stopsCopy = [...trip.stops];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= stopsCopy.length) return;

    const temp = stopsCopy[index];
    stopsCopy[index] = stopsCopy[targetIdx];
    stopsCopy[targetIdx] = temp;

    onReorderStops(stopsCopy);
    addToast({
      type: 'info',
      title: 'City Order Updated',
      message: `Reordered route stops successfully.`,
    });
  };

  // --- Activity Operations ---
  const handleOpenAddActivity = (stop) => {
    setActiveStopId(stop.id);
    setEditingActivity(null);
    setActivityForm({
      title: '',
      date: stop.startDate || trip.startDate || '',
      time: '10:00 AM',
      cost: '0',
      category: 'Sightseeing',
      description: '',
    });
    setActivityError('');
    setActivityModalOpen(true);
  };

  const handleOpenEditActivity = (stopId, act) => {
    setActiveStopId(stopId);
    setEditingActivity(act);
    setActivityForm({
      title: act.title || '',
      date: act.date || '',
      time: act.time || '10:00 AM',
      cost: String(act.cost || 0),
      category: act.category || 'Sightseeing',
      description: act.description || '',
    });
    setActivityError('');
    setActivityModalOpen(true);
  };

  const handleSaveActivity = async (e) => {
    e.preventDefault();
    if (!activityForm.title.trim()) {
      setActivityError('Activity title is required.');
      return;
    }

    const currentStop = trip.stops.find((s) => String(s.id) === String(activeStopId));
    if (currentStop) {
      const dateVal = validateActivityDate(
        activityForm.date,
        currentStop.startDate,
        currentStop.endDate
      );
      if (!dateVal.isValid) {
        setActivityError(dateVal.message);
        return;
      }
    }

    setActivityError('');
    try {
      if (editingActivity) {
        await onUpdateActivity(activeStopId, editingActivity.id, activityForm);
      } else {
        await onAddActivity(activeStopId, activityForm);
      }
      setActivityModalOpen(false);
    } catch (err) {
      setActivityError(err.message || 'Failed to save activity.');
    }
  };

  // Confirm delete handler
  const handleConfirmDelete = () => {
    const { type, stopId, activityId } = confirmDeleteModal;
    if (type === 'stop') {
      onDeleteStop(stopId);
    } else if (type === 'activity') {
      onDeleteActivity(stopId, activityId);
    }
    setConfirmDeleteModal({ isOpen: false, type: null, stopId: null, activityId: null, title: '' });
  };

  return (
    <div className="space-y-6">
      {/* Action Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            Interactive Itinerary Workspace
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add destinations, adjust dates, organize daily activities, and reorder your route.
          </p>
        </div>

        <Button
          variant="accent"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAddStop}
          className="shadow-sm"
        >
          Add City Stop
        </Button>
      </div>

      {/* Main City Stops Timeline */}
      {!trip.stops || trip.stops.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No City Stops Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            Start crafting your journey by adding your first city destination.
          </p>
          <Button variant="accent" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenAddStop}>
            Add First Destination
          </Button>
        </Card>
      ) : (
        <div className="space-y-6 relative before:absolute before:left-6 sm:before:left-7 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
          {trip.stops.map((stop, index) => {
            const isCollapsed = collapsedStops[stop.id];
            const activitiesCount = stop.activities ? stop.activities.length : 0;
            const TransportIcon = TRANSPORT_ICONS[stop.transportMode] || Bus;

            return (
              <div key={stop.id} className="relative pl-14 sm:pl-16 group/stop">
                {/* Timeline City Marker Badge */}
                <div className="absolute left-0 top-1 w-12 h-12 rounded-2xl bg-slate-900 text-white font-black text-sm flex items-center justify-center border-4 border-white shadow-md z-10">
                  {index + 1}
                </div>

                {/* City Stop Section Card */}
                <Card className="border border-slate-200/80 shadow-subtle overflow-hidden transition-all group-hover/stop:border-slate-300">
                  {/* City Section Header */}
                  <div className="p-5 bg-slate-50/80 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-travel-600 bg-travel-50 border border-travel-200/80 px-2.5 py-0.5 rounded-full">
                          Stop #{index + 1}
                        </span>
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-brand-600" />
                          {formatDate(stop.startDate, 'monthDay')} – {formatDate(stop.endDate, 'monthDay')}
                        </span>
                      </div>

                      <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                        <span>{stop.cityName}</span>
                        {stop.country && (
                          <span className="text-sm font-normal text-slate-400">, {stop.country}</span>
                        )}
                      </h3>

                      {/* Details row */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                          <TransportIcon className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                          {stop.transportMode || 'Transit'}
                        </span>
                        <span>•</span>
                        <span>Nightly Stay: <strong>${stop.stayCostPerNight}</strong></span>
                        <span>•</span>
                        <span>{activitiesCount} {activitiesCount === 1 ? 'Activity' : 'Activities'}</span>
                      </div>
                    </div>

                    {/* Controls & Actions Toolbar */}
                    <div className="flex items-center gap-2 self-start md:self-center">
                      {/* Reorder controls */}
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
                        <button
                          onClick={() => handleMoveStop(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                          title="Move Stop Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveStop(index, 'down')}
                          disabled={index === trip.stops.length - 1}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                          title="Move Stop Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                        onClick={() => handleOpenAddActivity(stop)}
                      >
                        Add Activity
                      </Button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditStop(stop)}
                          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
                          title="Edit Stop Parameters"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() =>
                            setConfirmDeleteModal({
                              isOpen: true,
                              type: 'stop',
                              stopId: stop.id,
                              activityId: null,
                              title: `Stop: ${stop.cityName}`,
                            })
                          }
                          className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          title="Remove Stop"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => toggleStopCollapse(stop.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-900 transition-colors"
                          title={isCollapsed ? 'Expand Activities' : 'Collapse Activities'}
                        >
                          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notes bar if any */}
                  {stop.notes && (
                    <div className="px-5 py-2.5 bg-amber-50/50 border-b border-amber-100/60 text-xs text-amber-800 flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                      <span>{stop.notes}</span>
                    </div>
                  )}

                  {/* Activities List Section */}
                  {!isCollapsed && (
                    <div className="p-5 space-y-3 bg-white">
                      {!stop.activities || stop.activities.length === 0 ? (
                        <div className="p-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                          <p className="text-xs text-slate-500">
                            No activities assigned to {stop.cityName} yet.
                          </p>
                          <button
                            onClick={() => handleOpenAddActivity(stop)}
                            className="mt-1 text-xs font-semibold text-brand-600 hover:underline"
                          >
                            + Add an activity
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {stop.activities.map((act) => {
                            const badgeStyle = CATEGORY_COLORS[act.category] || CATEGORY_COLORS.Other;
                            return (
                              <div
                                key={act.id}
                                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                  act.isCompleted
                                    ? 'bg-slate-50 border-slate-200/80 opacity-75'
                                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <button
                                    onClick={() => onToggleActivity(stop.id, act.id)}
                                    className="mt-0.5 text-slate-400 hover:text-brand-600 transition-colors shrink-0"
                                    title={act.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                                  >
                                    {act.isCompleted ? (
                                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    ) : (
                                      <Circle className="w-5 h-5 text-slate-300" />
                                    )}
                                  </button>

                                  <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h4
                                        className={`text-sm font-bold ${
                                          act.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                                        }`}
                                      >
                                        {act.title}
                                      </h4>
                                      <span
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeStyle}`}
                                      >
                                        {act.category}
                                      </span>
                                    </div>

                                    {act.description && (
                                      <p className="text-xs text-slate-500 line-clamp-1">{act.description}</p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                                      <span className="flex items-center gap-1 font-medium text-slate-700">
                                        <Calendar className="w-3 h-3 text-brand-500" />
                                        {formatDate(act.date, 'monthDay')}
                                      </span>
                                      <span className="flex items-center gap-1 text-slate-500">
                                        <Clock className="w-3 h-3" />
                                        {act.time}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                                  <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                                    ${Number(act.cost).toLocaleString()}
                                  </span>

                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleOpenEditActivity(stop.id, act)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                      title="Edit Activity"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      onClick={() =>
                                        setConfirmDeleteModal({
                                          isOpen: true,
                                          type: 'activity',
                                          stopId: stop.id,
                                          activityId: act.id,
                                          title: `Activity: ${act.title}`,
                                        })
                                      }
                                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                      title="Delete Activity"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* --- MODAL: Add/Edit Stop --- */}
      <Modal
        isOpen={stopModalOpen}
        onClose={() => setStopModalOpen(false)}
        title={editingStop ? 'Edit City Stop' : 'Add City Stop'}
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setStopModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveStop}>
              {editingStop ? 'Save Changes' : 'Add Stop'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveStop} className="space-y-4 py-1">
          {stopError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {stopError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="City Name *"
              placeholder="e.g. Tokyo"
              value={stopForm.cityName}
              onChange={(e) => setStopForm({ ...stopForm, cityName: e.target.value })}
              required
            />
            <Input
              label="Country"
              placeholder="e.g. Japan"
              value={stopForm.country}
              onChange={(e) => setStopForm({ ...stopForm, country: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Stop Start Date *"
              type="date"
              value={stopForm.startDate}
              onChange={(e) => setStopForm({ ...stopForm, startDate: e.target.value })}
              required
            />
            <Input
              label="Stop End Date *"
              type="date"
              value={stopForm.endDate}
              onChange={(e) => setStopForm({ ...stopForm, endDate: e.target.value })}
              required
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Note: Stop dates must be inside trip dates ({trip.startDate} to {trip.endDate}).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Transit Mode"
              value={stopForm.transportMode}
              onChange={(e) => setStopForm({ ...stopForm, transportMode: e.target.value })}
              options={[
                { label: 'Flight', value: 'Flight' },
                { label: 'Train', value: 'Train' },
                { label: 'Shinkansen Bullet Train', value: 'Shinkansen Bullet Train' },
                { label: 'Bus', value: 'Bus' },
                { label: 'Car', value: 'Car' },
              ]}
            />
            <Input
              label="Transit Cost ($)"
              type="number"
              value={stopForm.transportCost}
              onChange={(e) => setStopForm({ ...stopForm, transportCost: e.target.value })}
            />
            <Input
              label="Stay Cost / Night ($)"
              type="number"
              value={stopForm.stayCostPerNight}
              onChange={(e) => setStopForm({ ...stopForm, stayCostPerNight: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Notes & Hotel Details
            </label>
            <textarea
              rows={2}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 resize-none"
              placeholder="e.g. Hotel confirmation, neighborhood notes..."
              value={stopForm.notes}
              onChange={(e) => setStopForm({ ...stopForm, notes: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* --- MODAL: Add/Edit Activity --- */}
      <Modal
        isOpen={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
        title={editingActivity ? 'Edit Activity' : 'Add New Activity'}
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="ghost" onClick={() => setActivityModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveActivity}>
              {editingActivity ? 'Save Activity' : 'Add Activity'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveActivity} className="space-y-4 py-1">
          {activityError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {activityError}
            </div>
          )}

          <Input
            label="Activity Title *"
            placeholder="e.g. Senso-ji Temple Walking Tour"
            value={activityForm.title}
            onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Activity Date *"
              type="date"
              value={activityForm.date}
              onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
              required
            />
            <Input
              label="Time Slot"
              placeholder="e.g. 10:00 AM"
              value={activityForm.time}
              onChange={(e) => setActivityForm({ ...activityForm, time: e.target.value })}
            />
            <Input
              label="Cost ($ USD)"
              type="number"
              value={activityForm.cost}
              onChange={(e) => setActivityForm({ ...activityForm, cost: e.target.value })}
            />
          </div>

          <Select
            label="Category"
            value={activityForm.category}
            onChange={(e) => setActivityForm({ ...activityForm, category: e.target.value })}
            options={[
              { label: 'Sightseeing', value: 'Sightseeing' },
              { label: 'Cultural', value: 'Cultural' },
              { label: 'Dining', value: 'Dining' },
              { label: 'Adventure', value: 'Adventure' },
              { label: 'Nature', value: 'Nature' },
              { label: 'Shopping', value: 'Shopping' },
              { label: 'Relaxation', value: 'Relaxation' },
              { label: 'Other', value: 'Other' },
            ]}
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Description & Notes
            </label>
            <textarea
              rows={2}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 resize-none"
              placeholder="Add key highlights or booking references..."
              value={activityForm.description}
              onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* --- CONFIRM DELETE MODAL --- */}
      <Modal
        isOpen={confirmDeleteModal.isOpen}
        onClose={() => setConfirmDeleteModal({ ...confirmDeleteModal, isOpen: false })}
        title="Confirm Deletion"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="ghost"
              onClick={() => setConfirmDeleteModal({ ...confirmDeleteModal, isOpen: false })}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600 py-2">
          Are you sure you want to remove <strong className="text-slate-900">{confirmDeleteModal.title}</strong>?
        </p>
      </Modal>
    </div>
  );
};

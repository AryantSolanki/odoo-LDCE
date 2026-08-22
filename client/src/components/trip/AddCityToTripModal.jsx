import React, { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, CheckCircle, Navigation, Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { apiService } from '../../services/apiService';
import { useToast } from '../../hooks/useToast';
import { useNavigate } from 'react-router-dom';

export const AddCityToTripModal = ({ isOpen, onClose, city }) => {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transportMode, setTransportMode] = useState('Flight');
  const [transportCost, setTransportCost] = useState('150');
  const [stayCostPerNight, setStayCostPerNight] = useState(city?.avg_daily_cost ? String(Math.round(city.avg_daily_cost * 0.7)) : '120');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      apiService.getTrips().then((data) => {
        setTrips(data);
        if (data.length > 0) {
          setSelectedTripId(data[0].id);
        }
      });
      if (city?.avg_daily_cost) {
        setStayCostPerNight(String(Math.round(city.avg_daily_cost * 0.7)));
      }
    }
  }, [isOpen, city]);

  if (!city) return null;

  const handleAddToExistingTrip = async (e) => {
    e.preventDefault();
    if (!selectedTripId) {
      addToast({ type: 'warning', title: 'Select a Trip', message: 'Please select a trip to add this stop to.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.addStop(selectedTripId, {
        cityName: city.name,
        country: city.country,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        transportMode,
        transportCost: Number(transportCost) || 0,
        stayCostPerNight: Number(stayCostPerNight) || 0,
        notes: `Added from Discovery catalog. Avg daily meal: $${city.avg_meal_cost}`,
      });

      addToast({
        type: 'success',
        title: 'Stop Added to Trip!',
        message: `${city.name} has been added to your itinerary.`,
      });
      onClose();
      navigate(`/trips/${selectedTripId}`);
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to Add Stop', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNewTripWithCity = () => {
    onClose();
    navigate('/trips/new', { state: { prefillCity: city.name } });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add ${city.name} to Trip`}
      description={`Include ${city.name}, ${city.country} in your multi-city travel itinerary.`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleAddToExistingTrip} className="space-y-4 pt-1">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <img
            src={city.image_url}
            alt={city.name}
            className="w-14 h-14 rounded-lg object-cover shrink-0"
          />
          <div className="min-w-0">
            <h4 className="font-bold text-slate-900 text-sm">{city.name}, {city.country}</h4>
            <p className="text-xs text-slate-500 line-clamp-1">{city.description}</p>
            <div className="flex items-center gap-2 mt-1 text-[11px] font-semibold text-brand-600">
              <span>Avg Daily: ${city.avg_daily_cost}</span>
              <span>•</span>
              <span>Meal: ${city.avg_meal_cost}</span>
            </div>
          </div>
        </div>

        {trips.length > 0 ? (
          <>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Trip
              </label>
              <Select
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                options={trips.map((t) => ({
                  label: `${t.title} (${t.citiesCount || 0} cities)`,
                  value: t.id,
                }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Stop Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                label="Stop End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Transit Mode
                </label>
                <Select
                  value={transportMode}
                  onChange={(e) => setTransportMode(e.target.value)}
                  options={[
                    { label: 'Flight', value: 'Flight' },
                    { label: 'High-speed Train', value: 'High-speed Train' },
                    { label: 'Rental Car / Drive', value: 'Rental Car' },
                    { label: 'Bus / Transit', value: 'Bus' },
                    { label: 'Ferry / Cruise', value: 'Ferry' },
                  ]}
                />
              </div>
              <Input
                label="Transit Cost ($)"
                type="number"
                value={transportCost}
                onChange={(e) => setTransportCost(e.target.value)}
              />
            </div>

            <Input
              label="Estimated Stay Cost / Night ($)"
              type="number"
              value={stayCostPerNight}
              onChange={(e) => setStayCostPerNight(e.target.value)}
            />

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCreateNewTripWithCity}
                className="text-xs text-brand-600 hover:text-brand-700 font-semibold underline"
              >
                Or plan a brand new trip with {city.name}
              </button>

              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} leftIcon={<Plus className="w-4 h-4" />}>
                  Add Stop
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4 space-y-3">
            <p className="text-xs text-slate-500">You don't have any trips created yet.</p>
            <Button variant="primary" size="sm" onClick={handleCreateNewTripWithCity}>
              Create New Trip with {city.name}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

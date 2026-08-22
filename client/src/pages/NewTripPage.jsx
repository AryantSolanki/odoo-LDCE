import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, MapPin, Calendar, DollarSign, Plus, ArrowRight, ArrowLeft, Image as ImageIcon, CheckCircle, Info } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { apiService } from '../services/apiService';
import { useToast } from '../hooks/useToast';
import { validateTripDates } from '../utils/dateValidation';
import { DEFAULT_COVER_IMAGES } from '../services/mockData';

export const NewTripPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-11-12');
  const [budgetTotal, setBudgetTotal] = useState('4500');
  const [coverImage, setCoverImage] = useState(DEFAULT_COVER_IMAGES[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [cities, setCities] = useState(['Tokyo', 'Kyoto']);
  const [newCity, setNewCity] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState({});

  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleAddCity = (e) => {
    if (e) e.preventDefault();
    if (newCity.trim() && !cities.includes(newCity.trim())) {
      setCities([...cities, newCity.trim()]);
      setNewCity('');
    }
  };

  const handleRemoveCity = (cityName) => {
    setCities(cities.filter((c) => c !== cityName));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Trip name is required.';
    }

    const dateVal = validateTripDates(startDate, endDate);
    if (!dateVal.isValid) {
      newErrors.dates = dateVal.message;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: newErrors.title || newErrors.dates || 'Please review your inputs.',
      });
      return;
    }

    setErrors({});
    setIsCreating(true);

    try {
      const finalCover = customCoverUrl.trim() || coverImage;

      // Construct initial stops from cities provided
      const initialStops = cities.map((cityName, idx) => ({
        id: `stop_init_${idx + 1}`,
        cityName,
        country: '',
        startDate: idx === 0 ? startDate : endDate,
        endDate: idx === 0 ? startDate : endDate,
        orderIndex: idx,
        transportMode: 'Flight',
        stayCostPerNight: 150,
        notes: '',
        activities: [],
      }));

      const created = await apiService.createTrip({
        title: title.trim(),
        description: description.trim(),
        startDate,
        endDate,
        budgetTotal: Number(budgetTotal) || 0,
        coverImage: finalCover,
        destinations: cities,
        stops: initialStops,
      });

      addToast({
        type: 'success',
        title: 'Trip Created!',
        message: `"${created.title}" has been created. Redirecting to Itinerary Builder...`,
      });

      navigate(`/trips/${created.id}`);
    } catch (err) {
      addToast({ type: 'error', title: 'Error Creating Trip', message: err.message || 'Failed to create trip.' });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
        {/* Back Link */}
        <Link
          to="/trips"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Trips</span>
        </Link>

        {/* Page Header */}
        <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-subtle">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Create New Multi-City Trip
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Set up trip parameters, dates, cover photos, and initial stops to build your complete itinerary.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit}>
          <Card className="border border-slate-200/80 shadow-subtle overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg">1. Basic Trip Parameters</CardTitle>
              <CardDescription>
                Define the overarching dates, budget targets, and trip details.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Trip Name & Validation */}
              <div className="space-y-1">
                <Input
                  label="Trip Name *"
                  placeholder="e.g. Japanese Heritage Odyssey"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
                  }}
                  error={errors.title}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Trip Description
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all resize-none"
                  placeholder="Describe your travel goals, highlights, or group notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Date Ranges */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Start Date *"
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (errors.dates) setErrors((prev) => ({ ...prev, dates: null }));
                    }}
                    leftIcon={<Calendar className="w-4 h-4 text-brand-600" />}
                    required
                  />
                  <Input
                    label="End Date *"
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      if (errors.dates) setErrors((prev) => ({ ...prev, dates: null }));
                    }}
                    leftIcon={<Calendar className="w-4 h-4 text-brand-600" />}
                    required
                  />
                </div>
                {errors.dates && (
                  <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
                    <Info className="w-3.5 h-3.5" />
                    {errors.dates}
                  </p>
                )}
              </div>

              {/* Budget */}
              <Input
                label="Target Budget ($ USD)"
                type="number"
                placeholder="e.g. 4500"
                value={budgetTotal}
                onChange={(e) => setBudgetTotal(e.target.value)}
                leftIcon={<DollarSign className="w-4 h-4 text-emerald-600" />}
              />

              {/* Cover Image Selector */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span>Cover Image</span>
                  <span className="text-[11px] text-slate-400 font-normal">Choose preset or supply custom URL</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {DEFAULT_COVER_IMAGES.map((imgItem) => {
                    const isSelected = coverImage === imgItem.url && !customCoverUrl;
                    return (
                      <button
                        type="button"
                        key={imgItem.url}
                        onClick={() => {
                          setCoverImage(imgItem.url);
                          setCustomCoverUrl('');
                        }}
                        className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all group ${
                          isSelected ? 'border-brand-600 ring-2 ring-brand-500/20' : 'border-transparent hover:opacity-90'
                        }`}
                      >
                        <img
                          src={imgItem.url}
                          alt={imgItem.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80';
                          }}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-brand-900/40 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <Input
                  placeholder="Or paste custom image URL (https://...)"
                  value={customCoverUrl}
                  onChange={(e) => setCustomCoverUrl(e.target.value)}
                  leftIcon={<ImageIcon className="w-4 h-4" />}
                />
              </div>

              {/* Initial Cities Tagging */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Initial City Stops (Optional)
                </label>
                <p className="text-xs text-slate-500">
                  You can quickly seed initial cities here, and refine their dates and activities in the itinerary builder.
                </p>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add city name (e.g. Osaka)"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCity();
                      }
                    }}
                    leftIcon={<MapPin className="w-4 h-4 text-travel-500" />}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddCity}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add City
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {cities.map((city) => (
                    <span
                      key={city}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200/80 text-xs font-bold shadow-2xs"
                    >
                      <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span>{city}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCity(city)}
                        className="hover:text-rose-600 transition-colors ml-1 font-bold text-sm leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <Button type="button" variant="ghost" onClick={() => navigate('/trips')}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="accent"
                size="lg"
                isLoading={isCreating}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Trip & Open Builder
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </AppShell>
  );
};

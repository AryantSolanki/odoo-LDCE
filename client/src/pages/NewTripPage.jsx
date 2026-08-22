import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, Calendar, DollarSign, Plus, ArrowRight } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { apiService } from '../services/apiService';
import { useToast } from '../hooks/useToast';

export const NewTripPage = () => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-11-12');
  const [budgetTotal, setBudgetTotal] = useState('4500');
  const [cities, setCities] = useState(['Tokyo', 'Kyoto']);
  const [newCity, setNewCity] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleAddCity = () => {
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
    if (!title.trim()) {
      addToast({ type: 'error', title: 'Trip Title Required', message: 'Please provide a name for your journey.' });
      return;
    }

    setIsCreating(true);
    try {
      const created = await apiService.createTrip({
        title,
        subtitle: cities.join(' • '),
        citiesCount: cities.length,
        durationDays: 12,
        startDate,
        endDate,
        budgetTotal,
        destinations: cities,
      });

      addToast({
        type: 'success',
        title: 'Trip Created!',
        message: `${created.title} has been added to your dashboard.`,
      });

      navigate(`/trips/${created.id}`);
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to create trip.' });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-travel-50 border border-travel-200 text-travel-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Plan New Multi-City Trip
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Setup cities, dates, and budget targets for your customized route.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Journey Details</CardTitle>
              <CardDescription>
                Define basic trip parameters before generating daily itineraries.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <Input
                label="Trip Title"
                placeholder="e.g. Japanese Heritage Odyssey"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  leftIcon={<Calendar className="w-4 h-4" />}
                  required
                />
                <Input
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  leftIcon={<Calendar className="w-4 h-4" />}
                  required
                />
              </div>

              <Input
                label="Target Budget ($ USD)"
                type="number"
                placeholder="e.g. 5000"
                value={budgetTotal}
                onChange={(e) => setBudgetTotal(e.target.value)}
                leftIcon={<DollarSign className="w-4 h-4" />}
                required
              />

              {/* Cities Tagging */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Destinations / Cities Included
                </label>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add a city (e.g. Osaka)"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    leftIcon={<MapPin className="w-4 h-4" />}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddCity}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {cities.map((city) => (
                    <span
                      key={city}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200 text-xs font-semibold"
                    >
                      <MapPin className="w-3 h-3 text-brand-600" />
                      <span>{city}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCity(city)}
                        className="hover:text-rose-600 transition-colors ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="accent"
                isLoading={isCreating}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Trip & Start Planning
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </AppShell>
  );
};

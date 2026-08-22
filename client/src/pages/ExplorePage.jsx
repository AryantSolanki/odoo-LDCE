import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Search, Filter } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { DestinationCard } from '../components/common/DestinationCard';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { apiService } from '../services/apiService';
import { useToast } from '../hooks/useToast';

export const ExplorePage = () => {
  const [destinations, setDestinations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDest = async () => {
      const data = await apiService.getDestinations();
      setDestinations(data);
    };
    fetchDest();
  }, []);

  const handlePlan = (dest) => {
    addToast({
      type: 'info',
      title: 'City Selected',
      message: `Added ${dest.city} to your trip creation queue.`,
    });
    navigate('/trips/new');
  };

  const filtered = destinations.filter((d) => {
    const matchesSearch =
      d.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || d.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-travel-500" />
            <span>Explore Destinations</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Discover ideal cities and regions for your next multi-stop trip itinerary.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-subtle flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="w-full md:w-80">
            <Input
              type="search"
              placeholder="Search by city or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="w-full md:w-48">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { label: 'All Categories', value: 'all' },
                { label: 'Cultural', value: 'cultural' },
                { label: 'Coastal', value: 'coastal' },
                { label: 'Adventure', value: 'adventure' },
                { label: 'Romantic', value: 'romantic' },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((dest) => (
            <DestinationCard key={dest.id} destination={dest} onPlan={handlePlan} />
          ))}
        </div>
      </div>
    </AppShell>
  );
};

import React from 'react';
import { Star, Plus, Sun } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { getOptimizedImage } from '../../utils/imageResolver';

export const DestinationCard = ({ destination, onPlan }) => {
  const displayCity = destination.city || destination.name || 'Unknown';
  const displayCountry = destination.country || 'Unknown';
  const displayTagline = destination.tagline || destination.description || '';
  const displayCost = destination.estCostPerDay || destination.avg_daily_cost || 0;
  const displayCategory = destination.category || 'Destination';
  const displayRating = destination.rating || '4.8';
  const displayBestMonths = destination.bestMonths || 'Anytime';
  const displayImage = getOptimizedImage(destination, 'destination');

  return (
    <Card hoverEffect className="overflow-hidden flex flex-col h-full group">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={displayImage}
          alt={`${displayCity}, ${displayCountry}`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

        <div className="absolute top-3 left-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90 text-slate-800 backdrop-blur-md shadow-sm">
            {displayCategory}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-amber-300 backdrop-blur-md">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {displayRating}
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h4 className="text-lg font-bold leading-tight">
            {displayCity}, <span className="text-slate-300 text-sm font-normal">{displayCountry}</span>
          </h4>
          <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
            {displayTagline}
          </p>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Sun className="w-3.5 h-3.5 text-travel-500" />
            <span>Best: {displayBestMonths}</span>
          </span>
          <span className="font-semibold text-slate-900">
            ~${displayCost}<span className="text-slate-400 font-normal">/day</span>
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center group-hover:border-brand-500 group-hover:text-brand-600 transition-colors"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => onPlan && onPlan(destination)}
        >
          Add to Itinerary
        </Button>
      </div>
    </Card>
  );
};

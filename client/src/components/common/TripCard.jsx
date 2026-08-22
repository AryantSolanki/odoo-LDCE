import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const TripCard = ({ trip }) => {
  const {
    id,
    title,
    subtitle,
    coverImage,
    startDate,
    endDate,
    status,
    statusVariant = 'primary',
    citiesCount,
    budgetTotal,
    budgetSpent,
    collaboratorsCount,
  } = trip;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const spentPercent = Math.min(100, Math.round((budgetSpent / budgetTotal) * 100));

  return (
    <Card hoverEffect className="overflow-hidden flex flex-col h-full group">
      {/* Cover Image Container */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <Badge variant={statusVariant} showDot className="backdrop-blur-md bg-white/90 shadow-sm">
            {status}
          </Badge>
          
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900/70 text-white backdrop-blur-md">
            {citiesCount} {citiesCount === 1 ? 'City' : 'Cities'}
          </span>
        </div>

        {/* Bottom Image Overlay Title */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <p className="text-xs font-medium text-slate-200 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-travel-400" />
            <span>{subtitle}</span>
          </p>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h4 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
            {title}
          </h4>

          <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formatDate(startDate)} - {formatDate(endDate)}
            </span>

            {collaboratorsCount > 1 && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {collaboratorsCount} travelers
              </span>
            )}
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-500">Budget Spent</span>
            <span className="text-slate-900">${budgetSpent.toLocaleString()} / ${budgetTotal.toLocaleString()}</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                spentPercent > 90 ? 'bg-amber-500' : 'bg-brand-600'
              }`}
              style={{ width: `${spentPercent}%` }}
            />
          </div>
        </div>

        {/* View Details Link CTA */}
        <div className="pt-1">
          <Link
            to={`/trips/${id}`}
            className="inline-flex items-center justify-between w-full text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors py-1 group/link"
          >
            <span>View Itinerary</span>
            <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </Card>
  );
};

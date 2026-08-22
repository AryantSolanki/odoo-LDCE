import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Edit3, Trash2, ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const TripCard = ({ trip, onEdit, onDelete }) => {
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
    collaboratorsCount = 1,
  } = trip;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const spentPercent = Math.min(100, Math.round(((budgetSpent || 0) / (budgetTotal || 1)) * 100));

  return (
    <Card hoverEffect className="overflow-hidden flex flex-col h-full group relative border border-slate-200/80 shadow-subtle hover:shadow-card transition-all duration-300">
      {/* Cover Image Container */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out opacity-90"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

        {/* Top Badges & Actions Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <Badge variant={statusVariant} showDot className="backdrop-blur-md bg-white/95 shadow-sm font-semibold">
            {status}
          </Badge>

          <div className="flex items-center gap-1.5">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(trip);
                }}
                className="w-8 h-8 rounded-full bg-slate-900/70 text-white backdrop-blur-md hover:bg-white hover:text-slate-900 flex items-center justify-center transition-colors shadow-sm"
                title="Edit Trip Parameters"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}

            {onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(trip);
                }}
                className="w-8 h-8 rounded-full bg-slate-900/70 text-rose-300 backdrop-blur-md hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors shadow-sm"
                title="Delete Trip"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Image Overlay Title & Subtitle */}
        <div className="absolute bottom-3 left-3 right-3 text-white z-10">
          <p className="text-xs font-semibold text-travel-300 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-travel-400 shrink-0" />
            <span className="truncate">{subtitle}</span>
          </p>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
              {title}
            </h3>
            <span className="shrink-0 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {citiesCount} {citiesCount === 1 ? 'City' : 'Cities'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2.5">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-brand-500 shrink-0" />
              {formatDate(startDate)} – {formatDate(endDate)}
            </span>

            {collaboratorsCount > 1 && (
              <span className="flex items-center gap-1 text-slate-400">
                <Users className="w-3.5 h-3.5" />
                {collaboratorsCount}
              </span>
            )}
          </div>
        </div>

        {/* Budget Summary & Progress Bar */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Est. Budget</span>
            <span className="font-bold text-slate-900">
              ${(budgetSpent || 0).toLocaleString()} <span className="text-slate-400 font-normal">/ ${(budgetTotal || 0).toLocaleString()}</span>
            </span>
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

        {/* Action Button Links */}
        <div className="pt-2 flex items-center gap-2">
          <Link
            to={`/trips/${id}`}
            className="flex-1"
          >
            <Button
              variant="secondary"
              size="sm"
              className="w-full justify-between hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-colors"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Open Itinerary
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

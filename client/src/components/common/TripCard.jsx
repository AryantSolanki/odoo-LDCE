import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Edit3, Trash2, ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const TripCard = ({ trip, onEdit, onDelete }) => {
  const navigate = useNavigate();

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

  const handleCardClick = () => {
    navigate(`/trips/${id}`);
  };

  return (
    <Card
      hoverEffect
      onClick={handleCardClick}
      className="overflow-hidden flex flex-col h-full group relative border border-surface-border shadow-subtle hover:shadow-card-hover transition-all duration-500 cursor-pointer rounded-[2rem] bg-surface-card"
    >
      {/* Cover Image Container */}
      <div className="relative h-56 w-full overflow-hidden bg-brand-950">
        <img
          src={coverImage}
          alt={title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-transparent to-transparent" />

        {/* Top Badges & Actions Overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <Badge variant={statusVariant} showDot className="backdrop-blur-md bg-white/95 shadow-sm font-bold uppercase tracking-wider text-[10px]">
            {status}
          </Badge>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {onEdit && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(trip);
                }}
                className="w-9 h-9 rounded-full bg-brand-900/50 text-white backdrop-blur-md hover:bg-white hover:text-brand-900 flex items-center justify-center transition-colors shadow-sm"
                title="Edit Trip Parameters"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            {onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(trip);
                }}
                className="w-9 h-9 rounded-full bg-brand-900/50 text-rose-300 backdrop-blur-md hover:bg-rose-600 hover:text-white flex items-center justify-center transition-colors shadow-sm"
                title="Delete Trip"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Image Overlay Title & Subtitle */}
        <div className="absolute bottom-4 left-5 right-5 text-white z-10">
          <p className="text-xs font-bold text-brand-300 flex items-center gap-1.5 uppercase tracking-wide">
            <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
            <span className="truncate">{subtitle}</span>
          </p>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
        <div>
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-2xl font-editorial font-bold text-brand-900 group-hover:text-brand-600 transition-colors line-clamp-1">
              {title}
            </h3>
            <span className="shrink-0 text-xs font-bold px-3 py-1 rounded-full bg-brand-50 text-brand-700">
              {citiesCount} {citiesCount === 1 ? 'City' : 'Cities'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-brand-600 font-medium">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-400 shrink-0" />
              {formatDate(startDate)} – {formatDate(endDate)}
            </span>

            {collaboratorsCount > 1 && (
              <span className="flex items-center gap-1.5 text-brand-400">
                <Users className="w-4 h-4" />
                {collaboratorsCount}
              </span>
            )}
          </div>
        </div>

        {/* Budget Summary & Progress Bar */}
        <div className="pt-5 border-t border-surface-border space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-brand-500 font-semibold uppercase tracking-wider text-xs">Est. Budget</span>
            <span className="font-bold text-brand-900">
              ${(budgetSpent || 0).toLocaleString()} <span className="text-brand-400 font-medium">/ ${(budgetTotal || 0).toLocaleString()}</span>
            </span>
          </div>
          <div className="w-full h-2.5 bg-brand-100 rounded-full overflow-hidden">
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
          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-between h-12 rounded-xl text-sm font-bold border-brand-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-900 transition-colors"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            Open Itinerary
          </Button>
        </div>
      </div>
    </Card>
  );
};

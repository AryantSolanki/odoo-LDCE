import React, { useState } from 'react';
import { Copy, Check, Globe, Eye, Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { apiService } from '../../services/apiService';
import { useToast } from '../../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { getOptimizedImage } from '../../utils/imageResolver';

export const ShareTripModal = ({ isOpen, onClose, trip, onTripUpdated }) => {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();

  if (!trip) return null;

  const publicId = trip.publicId || trip.id;
  const publicUrl = `${window.location.origin}/shared/${publicId}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(publicUrl);
    setCopied(true);
    addToast({
      type: 'success',
      title: 'Public Link Copied!',
      message: 'Shareable itinerary link is now in your clipboard.',
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenTravelGuide = () => {
    onClose();
    navigate(`/shared/${publicId}`);
  };

  const displayImage = getOptimizedImage(trip, 'trip');
  const duration = trip.durationDays || 8;
  const citiesCount = trip.citiesCount || (trip.destinations ? trip.destinations.length : 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-xl"
      noPadding
    >
      <div className="flex flex-col h-full bg-white">
        <div className="p-8 pb-4">
          <div className="mb-6">
            <h3 className="text-2xl font-editorial font-bold text-brand-900 tracking-tight">Public Travel Guide</h3>
            <p className="text-sm text-brand-600 mt-1 font-medium">Publish a clean, read-only travel guide that anyone can view and clone into their own trips.</p>
          </div>

          {/* Cover Preview Card */}
          <div className="relative rounded-2xl overflow-hidden bg-brand-950 text-white p-6 h-48 flex flex-col justify-end shadow-subtle group isolate mb-6">
            <img
              src={displayImage}
              alt={trip.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80';
              }}
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/30 to-transparent" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="primary" size="sm" className="bg-white/95 text-brand-900 font-bold uppercase tracking-wider text-[10px]">
                  {trip.status || 'Planning'}
                </Badge>
                <span className="text-xs text-brand-100 font-semibold tracking-wide">
                  {duration} Days • {citiesCount} {citiesCount === 1 ? 'City' : 'Cities'}
                </span>
              </div>
              <h4 className="text-2xl font-editorial font-bold truncate leading-tight">{trip.title}</h4>
            </div>
          </div>

          {/* Sharing URL box */}
          <div className="space-y-2 mb-6">
            <label className="block text-xs font-bold text-brand-900 uppercase tracking-wider ml-1">
              Public Travel Guide URL
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-surface-hover border border-surface-border rounded-xl px-4 py-3 text-sm text-brand-700 truncate font-mono select-all">
                {publicUrl}
              </div>
              <Button
                type="button"
                variant={copied ? 'secondary' : 'primary'}
                className="shrink-0 h-[46px] rounded-xl px-5 shadow-sm"
                onClick={handleCopyLink}
                leftIcon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="bg-surface-card border border-surface-border rounded-2xl p-4 space-y-3 text-sm text-brand-800 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1.5 bg-brand-50 rounded-lg shrink-0 text-brand-600">
                <Globe className="w-4 h-4" />
              </div>
              <div className="pt-0.5">
                <span className="font-bold text-brand-900">Editorial Guide Presentation:</span> Friends or travelers viewing this link get an interactive storybook timeline without any admin or edit buttons.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1.5 bg-brand-50 rounded-lg shrink-0 text-travel-500">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="pt-0.5">
                <span className="font-bold text-brand-900">1-Click "Copy Trip":</span> Other travelers can clone this route and adapt it directly into their GlobeTrotter workspace.
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-8 pt-4 border-t border-surface-border bg-surface-card/50">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto justify-center h-12 rounded-xl text-brand-700 border-brand-200 hover:bg-white hover:border-brand-300 font-bold shadow-sm transition-all"
            onClick={handleOpenTravelGuide}
            leftIcon={<Eye className="w-4 h-4" />}
          >
            Preview Guide View
          </Button>

          <Button 
            type="button" 
            variant="primary" 
            className="w-full sm:w-auto justify-center h-12 rounded-xl px-8 shadow-card font-bold transition-transform hover:scale-[1.02]"
            onClick={handleCopyLink}
          >
            Done & Copy Link
          </Button>
        </div>
      </div>
    </Modal>
  );
};

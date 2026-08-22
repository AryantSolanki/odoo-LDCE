import React, { useState } from 'react';
import { Share2, Copy, Check, Globe, Eye, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { apiService } from '../../services/apiService';
import { useToast } from '../../hooks/useToast';
import { useNavigate } from 'react-router-dom';

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

  const handleTogglePublish = async () => {
    setIsSharing(true);
    try {
      const res = await apiService.shareTrip(trip.id);
      if (onTripUpdated) {
        onTripUpdated({ ...trip, isPublic: true, publicId: res.public_id });
      }
      addToast({
        type: 'success',
        title: 'Public Sharing Enabled',
        message: 'Your itinerary is now accessible to anyone with the link.',
      });
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update sharing settings.' });
    } finally {
      setIsSharing(false);
    }
  };

  const handleOpenTravelGuide = () => {
    onClose();
    navigate(`/shared/${publicId}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Trip Itinerary"
      description="Publish a clean, read-only travel guide that anyone can view and clone into their own trips."
      maxWidth="max-w-lg"
    >
      <div className="space-y-4 pt-1">
        {/* Cover Preview Card */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-white p-4 h-32 flex flex-col justify-end">
          <img
            src={trip.coverImage}
            alt={trip.title}
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary" size="sm" className="bg-white/95 text-slate-900">
                {trip.status || 'Itinerary'}
              </Badge>
              <span className="text-[11px] text-slate-300 font-medium">
                {trip.durationDays} Days • {trip.citiesCount || (trip.destinations ? trip.destinations.length : 0)} Cities
              </span>
            </div>
            <h4 className="text-base font-extrabold truncate">{trip.title}</h4>
          </div>
        </div>

        {/* Sharing URL box */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Public Travel Guide URL
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 truncate font-mono select-all">
              {publicUrl}
            </div>
            <Button
              type="button"
              variant={copied ? 'secondary' : 'primary'}
              size="sm"
              onClick={handleCopyLink}
              leftIcon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-brand-50/60 border border-brand-100 rounded-2xl p-3.5 space-y-2 text-xs text-brand-900">
          <div className="flex items-start gap-2">
            <Globe className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Editorial Guide Presentation:</span> Friends or travelers viewing this link get an interactive storybook timeline without any admin or edit buttons.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-travel-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">1-Click "Copy Trip":</span> Other travelers can clone this route and adapt it directly into their GlobeTrotter workspace.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenTravelGuide}
            leftIcon={<Eye className="w-4 h-4 text-slate-600" />}
          >
            Preview Guide View
          </Button>

          <Button type="button" variant="primary" size="sm" onClick={handleCopyLink}>
            Done & Copy Link
          </Button>
        </div>
      </div>
    </Modal>
  );
};

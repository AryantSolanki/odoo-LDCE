import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, DollarSign, Users, Share2, Edit, CheckCircle } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/Skeleton';
import { apiService } from '../services/apiService';
import { useToast } from '../hooks/useToast';

export const TripDetailsPage = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await apiService.getTripById(id);
        setTrip(res);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* Back Link */}
        <Link
          to="/trips"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Trips</span>
        </Link>

        {/* Hero Header */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white min-h-[260px] flex flex-col justify-end p-6 sm:p-8 shadow-xl">
          <img
            src={trip.coverImage}
            alt={trip.title}
            className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={trip.statusVariant} showDot className="bg-white/90 backdrop-blur-md">
                  {trip.status}
                </Badge>
                <span className="text-xs text-slate-300">• {trip.citiesCount} Cities</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                {trip.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-travel-400" />
                <span>{trip.subtitle}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                leftIcon={<Share2 className="w-4 h-4" />}
                onClick={() => addToast({ type: 'success', title: 'Link Copied', message: 'Itinerary link copied to clipboard.' })}
              >
                Share
              </Button>

              <Button
                variant="primary"
                size="sm"
                leftIcon={<Edit className="w-4 h-4" />}
                onClick={() => addToast({ type: 'info', title: 'Edit Mode', message: 'Itinerary editor ready for next phase.' })}
              >
                Edit Itinerary
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Travel Dates</span>
            <p className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-600" />
              <span>{trip.startDate} - {trip.endDate}</span>
            </p>
          </Card>

          <Card className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Budget Status</span>
            <p className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>${trip.budgetSpent} spent / ${trip.budgetTotal} total</span>
            </p>
          </Card>

          <Card className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Collaborators</span>
            <p className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
              <Users className="w-5 h-5 text-travel-500" />
              <span>{trip.collaboratorsCount} Travelers Active</span>
            </p>
          </Card>
        </div>

        {/* Multi-City Destinations Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Multi-City Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trip.destinations.map((city, idx) => (
                <div key={city} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900">{city}</h4>
                    <p className="text-xs text-slate-500">4 Days • Hotel & Transport Confirmed</p>
                  </div>
                  <Badge variant="success" showDot>Ready</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
};

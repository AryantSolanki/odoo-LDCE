import React, { useState, useEffect } from 'react';
import {
  User,
  Bell,
  Lock,
  Shield,
  Save,
  Globe,
  DollarSign,
  Bookmark,
  Trash2,
  AlertTriangle,
  MapPin,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { apiService } from '../services/apiService';

export const SettingsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || 'Alex Morgan');
  const [email, setEmail] = useState(user?.email || 'alex.morgan@example.com');
  const [location, setLocation] = useState(user?.location || 'San Francisco, CA');
  const [preferredCurrency, setPreferredCurrency] = useState(user?.preferredCurrency || 'USD');
  const [language, setLanguage] = useState(user?.language || 'English');
  const [avatar, setAvatar] = useState(
    user?.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
  );
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const loadSavedDestinations = async () => {
    try {
      const data = await apiService.getSavedDestinations();
      setSavedDestinations(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSavedDestinations();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiService.updateUserProfile({
        name,
        email,
        location,
        preferredCurrency,
        language,
        avatar,
      });

      addToast({
        type: 'success',
        title: 'Settings Saved',
        message: 'Your profile and travel preferences have been updated.',
      });
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to update preferences.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSaved = async (cityId) => {
    try {
      await apiService.toggleSaveDestination({ id: cityId });
      loadSavedDestinations();
      addToast({ type: 'success', title: 'Destination Removed', message: 'Removed from bookmarks.' });
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Could not remove destination.' });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      addToast({ type: 'warning', title: 'Confirmation Required', message: 'Type DELETE to confirm.' });
      return;
    }

    setIsDeleting(true);
    try {
      await apiService.deleteAccount();
      addToast({
        type: 'info',
        title: 'Account Deleted',
        message: 'Your account and data have been cleared.',
      });
      navigate('/login');
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to delete account.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  ];

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Account & Travel Preferences
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your personal traveler profile, currency benchmarks, saved cities, and account controls.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>
                Public traveler persona, name, and profile photograph.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b border-slate-100">
                <img
                  src={avatar}
                  alt={name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-brand-500 shadow-sm shrink-0"
                />
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Choose Profile Preset</span>
                  <div className="flex items-center gap-2">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <img
                        key={idx}
                        src={preset}
                        alt="preset"
                        onClick={() => setAvatar(preset)}
                        className={`w-9 h-9 rounded-full object-cover cursor-pointer border-2 transition-all ${
                          avatar === preset ? 'border-brand-600 scale-110 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  leftIcon={<User className="w-4 h-4 text-slate-400" />}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Primary Base City / Region"
                value={location}
                placeholder="e.g. San Francisco, CA"
                onChange={(e) => setLocation(e.target.value)}
                leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
              />
            </CardContent>
          </Card>

          {/* Localization & Currency Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Travel & Currency Settings</CardTitle>
              <CardDescription>
                Customize your preferred default currency calculations and display language.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Preferred Currency
                </label>
                <Select
                  value={preferredCurrency}
                  onChange={(e) => setPreferredCurrency(e.target.value)}
                  options={[
                    { label: 'USD ($) - US Dollar', value: 'USD' },
                    { label: 'EUR (€) - Euro', value: 'EUR' },
                    { label: 'GBP (£) - British Pound', value: 'GBP' },
                    { label: 'JPY (¥) - Japanese Yen', value: 'JPY' },
                    { label: 'CAD ($) - Canadian Dollar', value: 'CAD' },
                    { label: 'AUD ($) - Australian Dollar', value: 'AUD' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Language Preference
                </label>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  options={[
                    { label: 'English (US)', value: 'English' },
                    { label: 'Français (French)', value: 'French' },
                    { label: 'Español (Spanish)', value: 'Spanish' },
                    { label: '日本語 (Japanese)', value: 'Japanese' },
                    { label: 'Deutsch (German)', value: 'German' },
                  ]}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSaving}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </form>

        {/* Saved Destinations Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Saved Destinations ({savedDestinations.length})</CardTitle>
                <CardDescription>
                  Cities and regions you have bookmarked for upcoming itineraries.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/explore')}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Explore More
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {savedDestinations.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs space-y-1">
                <Bookmark className="w-6 h-6 mx-auto opacity-50 text-slate-400" />
                <p>No saved destinations yet. Discover new cities on the Explore page.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {savedDestinations.map((sd) => (
                  <div
                    key={sd.id}
                    className="py-3 flex items-center justify-between gap-4 flex-wrap"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={sd.image_url}
                        alt={sd.cityName}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">
                          {sd.cityName}, {sd.country}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Avg ${sd.avgDailyCost}/day • Saved {sd.savedAt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => navigate('/trips/new', { state: { prefillCity: sd.cityName } })}
                      >
                        Plan Trip
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSaved(sd.cityId)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone: Account Deletion */}
        <Card className="border-rose-200/80 bg-rose-50/20">
          <CardHeader>
            <div className="flex items-center gap-2 text-rose-700">
              <AlertTriangle className="w-5 h-5" />
              <CardTitle className="text-rose-900">Danger Zone</CardTitle>
            </div>
            <CardDescription className="text-rose-800/80">
              Permanently delete your user profile, itineraries, saved destinations, and personal logs.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex items-center justify-between pt-2">
            <p className="text-xs text-slate-600">
              Once deleted, all trips and expenses cannot be recovered.
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setDeleteConfirmText('');
                setIsDeleteModalOpen(true);
              }}
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>

        {/* Delete Account Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Permanently Delete Account"
          description="This action is irreversible. All your multi-city trips and saved records will be wiped."
        >
          <div className="space-y-4 pt-1">
            <p className="text-xs text-slate-600">
              Please type <strong className="text-slate-900 font-mono">DELETE</strong> below to confirm.
            </p>

            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isDeleting}
                disabled={deleteConfirmText !== 'DELETE'}
                onClick={handleDeleteAccount}
              >
                Permanently Delete Everything
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
};


import React from 'react';
import { Globe, Sparkles, MapPin, Compass } from 'lucide-react';
import { ToastContainer } from '../ui/Toast';

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900 antialiased">
      {/* Left Branding Showcase Panel (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 text-white relative flex-col justify-between p-12 overflow-hidden border-r border-slate-800">
        {/* Background Ambient Glow & Patterns */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-slate-950 to-slate-900 opacity-90" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-travel-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Decorative Background Image Overlay */}
        <img
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80"
          alt="Travel background"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-25"
        />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-brand-600/40">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-1">
              GlobeTrotter
              <span className="w-2 h-2 rounded-full bg-travel-500" />
            </h1>
            <p className="text-xs text-slate-400 font-medium">Personalized Multi-City Travel SaaS</p>
          </div>
        </div>

        {/* Hero Copy & Testimonial */}
        <div className="relative z-10 max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-travel-300 backdrop-blur-md text-xs font-semibold border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Assisted Multi-City Route Optimization</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Craft your ultimate multi-destination journey with precision.
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Effortlessly sync flights, hotel stays, budgets, and city itineraries into one beautifully cohesive travel dashboard.
          </p>

          {/* Stat Badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
            <div>
              <p className="text-xl font-bold text-white">120+</p>
              <p className="text-[11px] text-slate-400">Curated Cities</p>
            </div>
            <div>
              <p className="text-xl font-bold text-travel-400">98%</p>
              <p className="text-[11px] text-slate-400">Budget Accuracy</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">4.9/5</p>
              <p className="text-[11px] text-slate-400">User Rating</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-4">
          <p>© 2026 GlobeTrotter Inc.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms</span>
            <span className="hover:text-white transition-colors cursor-pointer">Security</span>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 overflow-y-auto">
        {/* Mobile Header Logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">GlobeTrotter</span>
        </div>

        <div className="max-w-md w-full mx-auto my-auto space-y-6">
          <div className="text-left space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500">
                {subtitle}
              </p>
            )}
          </div>

          {/* Auth Card Content */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-card">
            {children}
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="lg:hidden mt-8 text-center text-xs text-slate-400">
          <p>© 2026 GlobeTrotter Inc. All rights reserved.</p>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

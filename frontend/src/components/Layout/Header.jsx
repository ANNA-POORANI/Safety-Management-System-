import React, { useState, useEffect } from 'react';
import { Menu, Siren, RotateCcw, Clock, ShieldAlert, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dashboardAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export const Header = ({ setIsSidebarOpen, activeEmergency, onDataReset }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleResetData = async () => {
    if (window.confirm('Reset plant records to factory baseline seed data?')) {
      setResetting(true);
      try {
        await dashboardAPI.resetSeed();
        if (onDataReset) onDataReset();
        window.location.reload();
      } catch (err) {
        alert('Failed to reset: ' + err.message);
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      {/* Active Emergency Banner */}
      {activeEmergency && (
        <div className="bg-rose-600 text-white px-4 py-2 flex items-center justify-between text-xs font-bold tracking-wide animate-pulse">
          <div className="flex items-center gap-2">
            <Siren className="w-4 h-4 animate-spin" />
            <span>ACTIVE EMERGENCY PROTOCOL IN EFFECT: {activeEmergency.title}</span>
          </div>
          <button
            onClick={() => navigate('/emergency')}
            className="underline underline-offset-2 hover:text-rose-100 uppercase"
          >
            Open Emergency Command Center &rarr;
          </button>
        </div>
      )}

      {/* Main Top Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        {/* Left: Mobile hamburger & plant status badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>PLANT OPERATIONAL: ZONE A-E ONLINE</span>
            </div>
          </div>
        </div>

        {/* Right: Clock, Shift, Reset Seed & Logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Shift badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{user?.shift || 'Morning Shift (A)'}</span>
          </div>

          {/* Time display */}
          <div className="hidden lg:block text-xs font-mono font-bold text-slate-300 bg-slate-950/60 px-3 py-1 rounded-lg border border-slate-800">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>

          {/* Reset Demo Data */}
          <button
            onClick={handleResetData}
            disabled={resetting}
            title="Reload factory seed demo data"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset Seed</span>
          </button>

          {/* User profile dropdown button */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white leading-tight">{user?.name || 'Operator'}</p>
              <p className="text-[10px] text-amber-400 font-medium leading-tight">{user?.role || 'Plant Staff'}</p>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

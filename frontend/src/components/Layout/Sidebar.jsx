import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FlaskConical,
  ClipboardCheck,
  AlertTriangle,
  Siren,
  ShieldCheck,
  LogOut,
  ChevronRight,
  PhoneCall,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
      badge: null
    },
    {
      name: 'Chemical Inventory',
      path: '/chemicals',
      icon: FlaskConical,
      badge: 'GHS'
    },
    {
      name: 'Safety Inspections',
      path: '/inspections',
      icon: ClipboardCheck,
      badge: null
    },
    {
      name: 'Incident Reporting',
      path: '/incidents',
      icon: AlertTriangle,
      badge: null
    },
    {
      name: 'Emergency Response',
      path: '/emergency',
      icon: Siren,
      badge: 'SOPs'
    },
    {
      name: 'Compliance & Audits',
      path: '/compliance',
      icon: ShieldCheck,
      badge: 'OSHA/EPA'
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900/95 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Brand Header */}
        <div>
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950">
                <FlaskConical className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-base font-black tracking-wide text-white flex items-center gap-1.5">
                  CHEM-SAFETY
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    PSM
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 font-medium tracking-tight">Plant Safety Portal</p>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1.5">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Operations Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-300 border border-amber-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Emergency Callout & User Profile Card */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          {/* Emergency Hotline Box */}
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 animate-pulse">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-rose-300">Hazmat Control Desk</p>
                <p className="text-xs font-mono font-bold text-white">+1 (800) 424-9300</p>
              </div>
            </div>
          </div>

          {/* User Profile Card */}
          {user && (
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-slate-700 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                  {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-amber-400/90 font-medium truncate">{user.role}</p>
                </div>
              </div>

              <button
                onClick={logout}
                title="Log Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'amber', // amber, rose, blue, emerald
  onClick,
  badge
}) => {
  const schemeStyles = {
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      bgGlow: 'bg-gradient-to-br from-amber-500/10 via-slate-900/60 to-slate-900/90',
      iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
      bar: 'bg-amber-500'
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      bgGlow: 'bg-gradient-to-br from-rose-500/10 via-slate-900/60 to-slate-900/90',
      iconBg: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
      bar: 'bg-rose-500'
    },
    blue: {
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      bgGlow: 'bg-gradient-to-br from-cyan-500/10 via-slate-900/60 to-slate-900/90',
      iconBg: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
      bar: 'bg-cyan-500'
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      bgGlow: 'bg-gradient-to-br from-emerald-500/10 via-slate-900/60 to-slate-900/90',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      bar: 'bg-emerald-500'
    }
  };

  const currentScheme = schemeStyles[colorScheme] || schemeStyles.amber;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl p-5 border backdrop-blur-sm transition-all duration-200 ${
        currentScheme.border
      } ${currentScheme.bgGlow} ${onClick ? 'cursor-pointer hover:scale-[1.01]' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">{title}</span>
            {badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {badge}
              </span>
            )}
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white tracking-tight">{value}</div>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`p-3 rounded-lg ${currentScheme.iconBg}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Industrial indicator bottom accent line */}
      <div className={`absolute bottom-0 left-0 h-1 w-full opacity-60 ${currentScheme.bar}`} />
    </div>
  );
};

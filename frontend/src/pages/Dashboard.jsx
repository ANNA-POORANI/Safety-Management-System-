import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  ShieldAlert,
  ClipboardCheck,
  AlertTriangle,
  Siren,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Calendar,
  PlusCircle,
  Database
} from 'lucide-react';
import { dashboardAPI } from '../services/api';
import { StatCard } from '../components/Common/StatCard';
import { RiskBadge, StatusBadge } from '../components/Common/Badge';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await dashboardAPI.getStats();
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Loading Plant Safety Telemetry...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
        <p className="font-bold">Failed to load dashboard:</p>
        <p className="text-xs mt-1">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-3 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { summary, hazardCounts, recentIncidents, upcomingInspections } = data.data;
  const isEmergency = summary.activeEmergencies > 0;

  return (
    <div className="space-y-6">
      {/* Top Banner: Plant Status & DB Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
            Plant Safety Operations Center
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                isEmergency
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              STATUS: {summary.plantSafetyStatus}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time chemical hazard monitoring, pressure equipment audits & OSHA PSM metrics.
          </p>
        </div>

        {/* Database indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs shrink-0">
          <Database className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400">Database Engine:</span>
          <span className="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {data.dbStatus?.connected ? `${data.dbStatus.engine || 'MongoDB Active'}` : 'Integrated JSON Store'}
          </span>
        </div>
      </div>

      {/* 4 Core Requirement KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Chemicals */}
        <StatCard
          title="Total Chemicals"
          value={summary.totalChemicals}
          subtitle="Managed in storage inventory"
          icon={FlaskConical}
          colorScheme="blue"
          badge="Inventory"
          onClick={() => navigate('/chemicals')}
        />

        {/* 2. High-Risk Chemicals */}
        <StatCard
          title="High-Risk Chemicals"
          value={summary.highRiskChemicals}
          subtitle={`${summary.criticalChemicals} Critical Tier (GHS Class 1)`}
          icon={ShieldAlert}
          colorScheme="rose"
          badge="Critical & High"
          onClick={() => navigate('/chemicals')}
        />

        {/* 3. Pending Inspections */}
        <StatCard
          title="Pending Inspections"
          value={summary.pendingInspections}
          subtitle="Awaiting signoff or overdue"
          icon={ClipboardCheck}
          colorScheme="amber"
          badge="Audits"
          onClick={() => navigate('/inspections')}
        />

        {/* 4. Open Incidents */}
        <StatCard
          title="Open Incidents"
          value={summary.openIncidents}
          subtitle="Active investigation & containment"
          icon={AlertTriangle}
          colorScheme="amber"
          badge="Active"
          onClick={() => navigate('/incidents')}
        />
      </div>

      {/* Quick Action Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Activity className="w-4 h-4 text-amber-400" />
          <span>Quick Safety Dispatch:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/chemicals')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Add Chemical</span>
          </button>

          <button
            onClick={() => navigate('/inspections')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-all"
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Schedule Inspection</span>
          </button>

          <button
            onClick={() => navigate('/incidents')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-300 border border-rose-500/30 transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Report Leak / Spill</span>
          </button>

          <button
            onClick={() => navigate('/emergency')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 transition-all"
          >
            <Siren className="w-3.5 h-3.5" />
            <span>Emergency SOPs</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Hazard Breakdown & Compliance Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Hazard Classification Breakdown */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Chemical Hazard Distribution</h3>
              <p className="text-xs text-slate-400">Classified by OSHA Globally Harmonized System (GHS)</p>
            </div>
            <button
              onClick={() => navigate('/chemicals')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>View Inventory</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(hazardCounts || {}).map(([hazard, count]) => (
              <div
                key={hazard}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs text-slate-400 font-medium">{hazard}</p>
                  <p className="text-lg font-bold text-white mt-0.5">{count} Substances</p>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
              </div>
            ))}
          </div>

          {/* Plant Storage Zones Info */}
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Designated Plant Hazard Zones
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>Zone C: High Hazard Gas Vault (Chlorine & NH₃)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Zone B: Flammable Solvent Yard (Benzene & Toluene)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800">
                <MapPin className="w-3.5 h-3.5 text-yellow-400" />
                <span>Zone A: Acid Bund & Tank Farm (H₂SO₄ & HCl)</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zone D: Wastewater & Neutralization Lagoon</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Compliance & Audit Summary */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Regulatory Health</h3>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="text-center py-4 px-2 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="text-4xl font-black text-emerald-400 font-mono">
                {summary.complianceScoreAvg}%
              </div>
              <p className="text-xs text-slate-300 font-semibold mt-1">Average Audit Compliance Score</p>
              <p className="text-[11px] text-slate-500 mt-0.5">OSHA PSM &bull; EPA RMP &bull; ISO 45001</p>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-slate-950/50 border border-slate-800/80">
                <span className="text-slate-400">Expiring Certifications:</span>
                <span className="font-bold text-amber-300">{summary.expiringCompliances} Records</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-950/50 border border-slate-800/80">
                <span className="text-slate-400">Total Registered Certificates:</span>
                <span className="font-bold text-slate-200">{data.data.totalCertificates} Active</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/compliance')}
            className="w-full mt-4 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Manage Regulatory Compliance</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Grid: Recent Incidents & Upcoming Inspections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incidents Feed */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <h3 className="text-base font-bold text-white">Recent Incident Log</h3>
            </div>
            <button
              onClick={() => navigate('/incidents')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>View All ({data.data.totalIncidents})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentIncidents && recentIncidents.length > 0 ? (
              recentIncidents.map((inc) => (
                <div
                  key={inc._id || inc.incidentCode}
                  onClick={() => navigate('/incidents')}
                  className="p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400">{inc.incidentCode}</span>
                        <RiskBadge level={inc.severity} />
                        <StatusBadge status={inc.status} />
                      </div>
                      <h4 className="text-sm font-semibold text-white mt-1.5 line-clamp-1">{inc.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                        <span>Zone: {inc.zone}</span>
                        <span>&bull;</span>
                        <span>Chemical: {inc.chemicalInvolved}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">No recent incidents recorded.</p>
            )}
          </div>
        </div>

        {/* Upcoming Inspections Feed */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Upcoming Safety Audits</h3>
            </div>
            <button
              onClick={() => navigate('/inspections')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>View All ({data.data.totalInspections})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingInspections && upcomingInspections.length > 0 ? (
              upcomingInspections.map((insp) => (
                <div
                  key={insp._id || insp.inspectionCode}
                  onClick={() => navigate('/inspections')}
                  className="p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-400">{insp.inspectionCode}</span>
                        <StatusBadge status={insp.status} />
                      </div>
                      <h4 className="text-sm font-semibold text-white mt-1.5 line-clamp-1">{insp.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {new Date(insp.scheduledDate).toLocaleDateString()}
                        </span>
                        <span>&bull;</span>
                        <span>Inspector: {insp.inspectorName}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">No upcoming inspections scheduled.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

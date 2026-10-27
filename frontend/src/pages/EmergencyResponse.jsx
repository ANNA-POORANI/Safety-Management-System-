import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Siren,
  ShieldAlert,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Radio,
  Wind,
  Compass,
  Users,
  ShieldCheck,
  PowerOff,
  BellRing
} from 'lucide-react';
import { emergencyAPI } from '../services/api';
import { Modal } from '../components/Common/Modal';

export const EmergencyResponse = () => {
  const { triggerToast, checkEmergencies } = useOutletContext();

  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [isConfirmTriggerModalOpen, setIsConfirmTriggerModalOpen] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  const fetchProtocols = async () => {
    setLoading(true);
    try {
      const res = await emergencyAPI.getProtocols();
      if (res.data.success) {
        setProtocols(res.data.data);
      }
    } catch (err) {
      triggerToast('error', 'Emergency API Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProtocols();
  }, []);

  const handleTriggerClick = (protocol) => {
    setSelectedProtocol(protocol);
    setIsConfirmTriggerModalOpen(true);
  };

  const handleExecuteTrigger = async () => {
    if (!selectedProtocol) return;
    setActionInProgress(true);
    try {
      const id = selectedProtocol._id || selectedProtocol.id;
      const res = await emergencyAPI.trigger(id);
      if (res.data.success) {
        triggerToast('warning', 'EMERGENCY ACTIVATED', `Triggered: ${selectedProtocol.title}`);
        setIsConfirmTriggerModalOpen(false);
        fetchProtocols();
        if (checkEmergencies) checkEmergencies();
      }
    } catch (err) {
      triggerToast('error', 'Trigger Failed', err.message);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleStandDown = async (protocol) => {
    const id = protocol._id || protocol.id;
    if (window.confirm(`Issue STAND DOWN order for '${protocol.title}' and restore normal plant status?`)) {
      try {
        const res = await emergencyAPI.standDown(id);
        if (res.data.success) {
          triggerToast('success', 'Emergency Cleared', 'Plant returned to Standby condition.');
          fetchProtocols();
          if (checkEmergencies) checkEmergencies();
        }
      } catch (err) {
        triggerToast('error', 'Stand Down Failed', err.message);
      }
    }
  };

  const activeCount = protocols.filter((p) => p.isActive).length;

  return (
    <div className="space-y-6">
      {/* Top Banner: Emergency Status */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          activeCount > 0
            ? 'bg-rose-950/40 border-rose-500 shadow-2xl shadow-rose-950/80 animate-pulse'
            : 'bg-slate-900 border-slate-800'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`p-4 rounded-2xl ${
                activeCount > 0
                  ? 'bg-rose-600 text-white animate-bounce'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}
            >
              <Siren className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-wide">
                  Emergency Action & SOP Command Center
                </h2>
                {activeCount > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white animate-pulse">
                    ACTIVE SIREN IN PROGRESS ({activeCount})
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    ALL PROTOCOLS ON STANDBY
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Authorized operators can trigger plant-wide sirens, activate deluge systems, and coordinate muster points.
              </p>
            </div>
          </div>

          {/* Quick Wind Info */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs shrink-0">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-cyan-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Surface Wind</p>
                <p className="font-bold text-white">NNW &bull; 8.4 knots</p>
              </div>
            </div>
            <div className="border-l border-slate-800 pl-3">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Evac Direction</p>
              <p className="font-bold text-emerald-400">Upwind to North Gate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Protocols List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Standard Emergency Operating Procedures (SOPs)
        </h3>

        {loading ? (
          <div className="py-12 text-center text-slate-500">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading emergency response protocols...
          </div>
        ) : (
          protocols.map((protocol) => {
            const isActive = protocol.isActive;

            return (
              <div
                key={protocol._id || protocol.code}
                className={`p-6 rounded-2xl bg-slate-900 border transition-all ${
                  isActive
                    ? 'border-rose-500 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 shadow-xl'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                        {protocol.code}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700">
                        Category: {protocol.category}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded font-bold ${
                          isActive
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {protocol.alertLevel}
                      </span>
                      {isActive && (
                        <span className="text-xs px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                          Activated by: {protocol.activatedBy || 'Control Room'}
                        </span>
                      )}
                    </div>

                    <h4 className="text-lg font-bold text-white">{protocol.title}</h4>

                    {/* Trigger Condition */}
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                      <span className="font-bold text-amber-400">Trigger Conditions: </span>
                      <span className="text-slate-300">{protocol.triggerConditions}</span>
                    </div>

                    {/* Protocol Action Checklist */}
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Immediate Response Action Sequence:
                      </h5>
                      <div className="space-y-2">
                        {(protocol.steps || []).map((step) => (
                          <div
                            key={step.stepNumber}
                            className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-xs"
                          >
                            <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {step.stepNumber}
                            </span>
                            <div className="flex-1">
                              <p className="text-slate-200 font-medium">{step.action}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-slate-400">Assigned Role: </span>
                                <span className="text-[10px] font-semibold text-amber-300 bg-slate-800 px-1.5 py-0.5 rounded">
                                  {step.assignedRole}
                                </span>
                                {step.isCrucial && (
                                  <span className="text-[9px] font-bold uppercase px-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                    Crucial
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Evacuation Muster Points */}
                    {protocol.musterPoints && protocol.musterPoints.length > 0 && (
                      <div className="pt-1">
                        <span className="text-xs font-bold text-slate-400 mr-2">Designated Muster Points:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {protocol.musterPoints.map((pt, i) => (
                            <span
                              key={i}
                              className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              {pt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Trigger / Stand down controls */}
                  <div className="shrink-0 flex flex-col gap-2 pt-2 lg:pt-0">
                    {isActive ? (
                      <button
                        onClick={() => handleStandDown(protocol)}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Stand Down / All Clear</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleTriggerClick(protocol)}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs tracking-wider uppercase shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Siren className="w-4 h-4 animate-pulse" />
                        <span>Trigger Emergency Siren</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Emergency Response Directory & Equipment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Directory */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <PhoneCall className="w-5 h-5 text-amber-400" />
            <h4 className="text-base font-bold text-white">Emergency Response Team Directory</h4>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Incident Commander</p>
                <p className="text-[11px] text-slate-400">Dr. Marcus Vance (Plant Safety Lead)</p>
              </div>
              <a
                href="tel:5559110101"
                className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30"
              >
                +1 (555) 911-0101
              </a>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Hazmat Response Unit</p>
                <p className="text-[11px] text-slate-400">Commander Travis Cole</p>
              </div>
              <a
                href="tel:5559110102"
                className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30"
              >
                +1 (555) 911-0102
              </a>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Municipal Fire & Rescue</p>
                <p className="text-[11px] text-slate-400">Metro Hazardous Materials Station 12</p>
              </div>
              <a
                href="tel:911"
                className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-mono text-xs font-bold border border-rose-500/30"
              >
                911 / Direct Fire
              </a>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">CHEMTREC 24/7 Hotline</p>
                <p className="text-[11px] text-slate-400">Chemical Emergency Center</p>
              </div>
              <a
                href="tel:8004249300"
                className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30"
              >
                +1 (800) 424-9300
              </a>
            </div>
          </div>
        </div>

        {/* Life Safety & Emergency Equipment Status */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h4 className="text-base font-bold text-white">Emergency Hardware Status</h4>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">SCBA Positive Pressure Packs</p>
                <p className="text-slate-400 text-[11px]">16 / 16 Cylinders Charged (4500 PSI)</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                READY
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Zone C Vapor Water Curtains</p>
                <p className="text-slate-400 text-[11px]">Pneumatic auto-valves primed at 120 PSI</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Emergency Eyewash & Showers</p>
                <p className="text-slate-400 text-[11px]">Zones A, B, C, D verified tepid flow</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                VERIFIED
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Level A Encapsulated Hazmat Suits</p>
                <p className="text-slate-400 text-[11px]">8 Sets stored in Hazmat Response Bunker</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                DEPLOYABLE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal to Trigger Siren */}
      <Modal
        isOpen={isConfirmTriggerModalOpen}
        onClose={() => setIsConfirmTriggerModalOpen(false)}
        title="CONFIRM EMERGENCY PROTOCOL TRIGGER"
        subtitle={`Action code: ${selectedProtocol?.code}`}
        icon={AlertTriangle}
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300">
            <p className="font-bold text-sm">ATTENTION: LIVE PLANT SAFETY ACTION</p>
            <p className="mt-1">
              You are about to initiate standard operating procedure{' '}
              <strong className="text-white">{selectedProtocol?.title}</strong>. This will broadcast an alert across all
              control panels and switch plant status to emergency monitoring.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <p className="text-slate-400">Trigger Conditions Met:</p>
            <p className="font-semibold text-white mt-0.5">{selectedProtocol?.triggerConditions}</p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsConfirmTriggerModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionInProgress}
              onClick={handleExecuteTrigger}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
            >
              {actionInProgress ? 'Initiating...' : 'BROADCAST EMERGENCY'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

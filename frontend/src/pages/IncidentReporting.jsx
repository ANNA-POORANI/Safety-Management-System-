import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  AlertTriangle,
  Flame,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Edit2,
  Trash2,
  Eye,
  FileWarning,
  Activity,
  MapPin,
  HeartPulse
} from 'lucide-react';
import { incidentAPI } from '../services/api';
import { RiskBadge, StatusBadge } from '../components/Common/Badge';
import { Modal } from '../components/Common/Modal';

export const IncidentReporting = () => {
  const { triggerToast } = useOutletContext();

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Form
  const initialForm = {
    title: '',
    incidentType: 'Chemical Leak',
    severity: 'High',
    chemicalInvolved: 'Sulfuric Acid 98%',
    zone: 'Zone A - Acid Bund & Tank Farm',
    reportedBy: '',
    reportDate: new Date().toISOString().split('T')[0],
    status: 'Reported',
    casualties: 0,
    immediateAction: '',
    rootCause: '',
    containmentDuration: 'Immediate response in progress'
  };

  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (severityFilter) params.severity = severityFilter;
      if (typeFilter) params.incidentType = typeFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await incidentAPI.getAll(params);
      if (res.data.success) {
        setIncidents(res.data.data);
      }
    } catch (err) {
      triggerToast('error', 'Incident Data Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [search, severityFilter, typeFilter, statusFilter]);

  const handleOpenReport = () => {
    setFormData(initialForm);
    setIsReportModalOpen(true);
  };

  const handleOpenUpdate = (inc) => {
    setSelectedIncident(inc);
    setFormData({
      title: inc.title || '',
      incidentType: inc.incidentType || 'Chemical Leak',
      severity: inc.severity || 'Medium',
      chemicalInvolved: inc.chemicalInvolved || '',
      zone: inc.zone || '',
      reportedBy: inc.reportedBy || '',
      reportDate: inc.reportDate ? new Date(inc.reportDate).toISOString().split('T')[0] : '',
      status: inc.status || 'Reported',
      casualties: inc.casualties || 0,
      immediateAction: inc.immediateAction || '',
      rootCause: inc.rootCause || '',
      containmentDuration: inc.containmentDuration || ''
    });
    setIsUpdateModalOpen(true);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await incidentAPI.create(formData);
      if (res.data.success) {
        triggerToast('success', 'Incident Logged', `Reported: ${formData.title}`);
        setIsReportModalOpen(false);
        fetchIncidents();
      }
    } catch (err) {
      triggerToast('error', 'Submission Failed', err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIncident) return;
    setSubmitting(true);
    try {
      const id = selectedIncident._id || selectedIncident.id;
      const res = await incidentAPI.update(id, formData);
      if (res.data.success) {
        triggerToast('success', 'Incident Updated', `Updated report ${selectedIncident.incidentCode}`);
        setIsUpdateModalOpen(false);
        fetchIncidents();
      }
    } catch (err) {
      triggerToast('error', 'Update Failed', err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (inc) => {
    const id = inc._id || inc.id;
    if (window.confirm(`Permanently remove incident report '${inc.title}' (${inc.incidentCode})?`)) {
      try {
        await incidentAPI.delete(id);
        triggerToast('info', 'Incident Deleted', `Removed ${inc.incidentCode}`);
        fetchIncidents();
      } catch (err) {
        triggerToast('error', 'Delete Failed', err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
            Incident Reporting & Emergency Logs
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immediate notification and logging of chemical leaks, fires, vapors, and containment breaches
          </p>
        </div>

        <button
          onClick={handleOpenReport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-rose-600/30 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Report Safety Incident</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search code, chemical, or zone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">All Incident Types</option>
            <option value="Chemical Leak">Chemical Leak</option>
            <option value="Fire Outbreak">Fire Outbreak</option>
            <option value="Toxic Vapor Release">Toxic Vapor Release</option>
            <option value="Equipment Failure">Equipment Failure</option>
            <option value="Spill">Spill</option>
          </select>
        </div>

        <div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">All Severity Levels</option>
            <option value="Catastrophic">Catastrophic</option>
            <option value="High">High Severity</option>
            <option value="Medium">Medium Severity</option>
            <option value="Low">Low Severity</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">All Statuses</option>
            <option value="Reported">Reported</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Contained">Contained</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Incident Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-500">
            <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading incident logs...
          </div>
        ) : incidents.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
            No incident reports found matching the filters.
          </div>
        ) : (
          incidents.map((inc) => {
            const isCatastrophic = inc.severity === 'Catastrophic' || inc.severity === 'High';

            return (
              <div
                key={inc._id || inc.incidentCode}
                className={`p-5 rounded-2xl bg-slate-900 border transition-all ${
                  isCatastrophic ? 'border-rose-500/40' : 'border-slate-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                        {inc.incidentCode}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700">
                        {inc.incidentType}
                      </span>
                      <RiskBadge level={inc.severity} />
                      <StatusBadge status={inc.status} />

                      {inc.casualties > 0 ? (
                        <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                          Casualties: {inc.casualties}
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-medium border border-emerald-500/30">
                          0 Casualties
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white">{inc.title}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        Zone: {inc.zone}
                      </span>
                      <span className="text-amber-400 font-semibold">Substance: {inc.chemicalInvolved}</span>
                      <span>Reported By: {inc.reportedBy}</span>
                      <span>
                        Date: {new Date(inc.reportDate || inc.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Immediate Actions Taken */}
                    {inc.immediateAction && (
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
                        <span className="font-bold text-amber-400">Immediate Action Taken: </span>
                        <span className="text-slate-300">{inc.immediateAction}</span>
                      </div>
                    )}

                    {/* Root Cause & Containment Time */}
                    {(inc.rootCause || inc.containmentDuration) && (
                      <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-1">
                        {inc.containmentDuration && (
                          <div className="flex items-center gap-1 text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>Containment Duration: {inc.containmentDuration}</span>
                          </div>
                        )}
                        {inc.rootCause && (
                          <div>
                            <span className="font-semibold text-slate-300">Root Cause: </span>
                            <span>{inc.rootCause}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenUpdate(inc)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Update Investigation</span>
                      </button>

                      <button
                        onClick={() => handleDelete(inc)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete Incident"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Report Incident Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report Hazardous Substance Incident"
        subtitle="Log immediate event, affected zone, containment measures, and chemical involvement"
        icon={AlertTriangle}
      >
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Incident Headline / Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Pump P-102 Discharge Gasket Failure & Vapor Plume"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Incident Classification *</label>
              <select
                value={formData.incidentType}
                onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="Chemical Leak">Chemical Leak</option>
                <option value="Fire Outbreak">Fire Outbreak</option>
                <option value="Toxic Vapor Release">Toxic Vapor Release</option>
                <option value="Equipment Failure">Equipment Failure</option>
                <option value="Spill">Spill</option>
                <option value="Personnel Exposure">Personnel Exposure</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Severity Rating *</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="Low">Low (Minor puddle / contained immediately)</option>
                <option value="Medium">Medium (Secondary bund involvement)</option>
                <option value="High">High (Perimeter vapor or active flame)</option>
                <option value="Catastrophic">Catastrophic (Off-site impact / evacuation)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Chemical Substance Involved *</label>
              <input
                type="text"
                required
                value={formData.chemicalInvolved}
                onChange={(e) => setFormData({ ...formData, chemicalInvolved: e.target.value })}
                placeholder="e.g. Chlorine Gas / Nitric Acid"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Plant Location / Zone *</label>
              <select
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="Zone A - Acid Bund & Tank Farm">Zone A - Acid Bund & Tank Farm</option>
                <option value="Zone B - Flammable Solvent Yard">Zone B - Flammable Solvent Yard</option>
                <option value="Zone C - High Hazard Gas Vault">Zone C - High Hazard Gas Vault</option>
                <option value="Zone D - Wastewater & Neutralization">Zone D - Wastewater & Neutralization</option>
                <option value="Zone E - High Pressure Reactor Bay">Zone E - High Pressure Reactor Bay</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Reported By</label>
              <input
                type="text"
                value={formData.reportedBy}
                onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                placeholder="Leave blank to use current logged-in user"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Casualties / Injuries</label>
              <input
                type="number"
                min="0"
                value={formData.casualties}
                onChange={(e) => setFormData({ ...formData, casualties: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Immediate Containment Action Executed *
              </label>
              <textarea
                rows="2"
                required
                value={formData.immediateAction}
                onChange={(e) => setFormData({ ...formData, immediateAction: e.target.value })}
                placeholder="e.g. Scrubber started, emergency shut-off valve V-12 closed, personnel evacuated upwind."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'File Incident Report'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Incident Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title={`Update Incident File: ${selectedIncident?.incidentCode || ''}`}
        subtitle="Record root cause findings, status advancement, and containment metrics"
        icon={Edit2}
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Incident Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Reported">Reported</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Contained">Contained</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Containment Duration</label>
              <input
                type="text"
                value={formData.containmentDuration}
                onChange={(e) => setFormData({ ...formData, containmentDuration: e.target.value })}
                placeholder="e.g. 18 minutes / 2 hours"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Root Cause Analysis</label>
              <textarea
                rows="3"
                value={formData.rootCause}
                onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
                placeholder="Explain engineering root cause (e.g. thermal fatigue, seal wear, operator error)..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Updated Containment Summary</label>
              <textarea
                rows="2"
                value={formData.immediateAction}
                onChange={(e) => setFormData({ ...formData, immediateAction: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsUpdateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Updates'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

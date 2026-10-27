import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ClipboardCheck,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  FileEdit,
  Trash2,
  ShieldCheck,
  Building2,
  UserCheck
} from 'lucide-react';
import { inspectionAPI } from '../services/api';
import { StatusBadge } from '../components/Common/Badge';
import { Modal } from '../components/Common/Modal';

export const SafetyInspections = () => {
  const { triggerToast } = useOutletContext();

  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);

  // Form states
  const initialForm = {
    title: '',
    inspectionType: 'Routine Safety',
    zone: 'Zone A - Acid Bund & Tank Farm',
    inspectorName: '',
    inspectorRole: 'Lead Process Safety Engineer',
    scheduledDate: new Date().toISOString().split('T')[0],
    riskScore: 40,
    findings: '',
    actionItemsText: '',
    status: 'Pending',
    passed: null
  };

  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.inspectionType = typeFilter;

      const res = await inspectionAPI.getAll(params);
      if (res.data.success) {
        setInspections(res.data.data);
      }
    } catch (err) {
      triggerToast('error', 'Inspection Error', 'Failed to fetch inspections: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, [search, statusFilter, typeFilter]);

  const handleOpenSchedule = () => {
    setFormData(initialForm);
    setIsScheduleModalOpen(true);
  };

  const handleOpenUpdate = (insp) => {
    setSelectedInspection(insp);
    setFormData({
      title: insp.title || '',
      inspectionType: insp.inspectionType || 'Routine Safety',
      zone: insp.zone || '',
      inspectorName: insp.inspectorName || '',
      inspectorRole: insp.inspectorRole || '',
      scheduledDate: insp.scheduledDate ? new Date(insp.scheduledDate).toISOString().split('T')[0] : '',
      riskScore: insp.riskScore !== undefined ? insp.riskScore : 50,
      findings: insp.findings || '',
      actionItemsText: (insp.actionItems || []).join('\n'),
      status: insp.status || 'Pending',
      passed: insp.passed !== undefined ? insp.passed : null
    });
    setIsUpdateModalOpen(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const actionItems = formData.actionItemsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        actionItems
      };

      const res = await inspectionAPI.create(payload);
      if (res.data.success) {
        triggerToast('success', 'Inspection Scheduled', `Created ${formData.title}`);
        setIsScheduleModalOpen(false);
        fetchInspections();
      }
    } catch (err) {
      triggerToast('error', 'Scheduling Failed', err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInspection) return;
    setSubmitting(true);
    try {
      const actionItems = formData.actionItemsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const id = selectedInspection._id || selectedInspection.id;
      const payload = {
        ...formData,
        actionItems,
        passed: formData.status === 'Completed' ? formData.passed : null
      };

      const res = await inspectionAPI.update(id, payload);
      if (res.data.success) {
        triggerToast('success', 'Inspection Updated', `Updated ${formData.title}`);
        setIsUpdateModalOpen(false);
        fetchInspections();
      }
    } catch (err) {
      triggerToast('error', 'Update Failed', err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (insp) => {
    const id = insp._id || insp.id;
    if (window.confirm(`Delete inspection record '${insp.title}' (${insp.inspectionCode})?`)) {
      try {
        await inspectionAPI.delete(id);
        triggerToast('info', 'Record Removed', `Deleted ${insp.inspectionCode}`);
        fetchInspections();
      } catch (err) {
        triggerToast('error', 'Delete Failed', err.message);
      }
    }
  };

  // Quick status toggle
  const handleQuickStatusChange = async (insp, newStatus) => {
    const id = insp._id || insp.id;
    try {
      await inspectionAPI.update(id, {
        status: newStatus,
        completedDate: newStatus === 'Completed' ? new Date() : null,
        passed: newStatus === 'Completed' ? true : newStatus === 'Failed' ? false : null
      });
      triggerToast('success', 'Status Updated', `Inspection marked as ${newStatus}.`);
      fetchInspections();
    } catch (err) {
      triggerToast('error', 'Status Update Failed', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
            Plant Safety Inspections & Audits
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track equipment integrity tests, relief valve pop verifications, and compliance walkthroughs
          </p>
        </div>

        <button
          onClick={handleOpenSchedule}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-amber-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Schedule New Inspection</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by code, title, or inspector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">All Inspection Statuses</option>
            <option value="Pending">Pending / Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed (Passed)</option>
            <option value="Failed">Failed Inspection</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">All Inspection Types</option>
            <option value="High-Hazard Audit">High-Hazard Audit</option>
            <option value="Routine Safety">Routine Safety</option>
            <option value="Equipment Integrity">Equipment Integrity</option>
            <option value="Emergency Equipment">Emergency Equipment</option>
            <option value="Pre-Startup Review">Pre-Startup Review</option>
          </select>
        </div>
      </div>

      {/* Inspections Cards List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-slate-500">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading inspection records...
          </div>
        ) : inspections.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
            No inspection records match the current criteria.
          </div>
        ) : (
          inspections.map((insp) => {
            const isCompleted = insp.status === 'Completed';
            const isFailed = insp.status === 'Failed';
            const isOverdue = insp.status === 'Overdue';

            return (
              <div
                key={insp._id || insp.inspectionCode}
                className={`p-5 rounded-2xl bg-slate-900 border transition-all ${
                  isFailed
                    ? 'border-rose-500/40 bg-rose-500/5'
                    : isOverdue
                    ? 'border-amber-500/40 bg-amber-500/5'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Code, Title, Type, Zone */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                        {insp.inspectionCode}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700">
                        {insp.inspectionType}
                      </span>
                      <StatusBadge status={insp.status} />
                      {insp.passed === true && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Passed
                        </span>
                      )}
                      {insp.passed === false && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400">
                          <XCircle className="w-3.5 h-3.5" />
                          Failed Verification
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white">{insp.title}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        {insp.zone}
                      </span>
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                        {insp.inspectorName} ({insp.inspectorRole})
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Due: {new Date(insp.scheduledDate).toLocaleDateString()}
                      </span>
                    </div>

                    {insp.findings && (
                      <p className="text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                        <span className="font-bold text-slate-400">Findings: </span>
                        {insp.findings}
                      </p>
                    )}

                    {insp.actionItems && insp.actionItems.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {insp.actionItems.map((action, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/80"
                          >
                            &bull; {action}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Quick actions and update buttons */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    <div className="flex items-center gap-2">
                      {insp.status !== 'Completed' && (
                        <button
                          onClick={() => handleQuickStatusChange(insp, 'Completed')}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors"
                        >
                          Mark Completed
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenUpdate(insp)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Edit / Audit Findings"
                      >
                        <FileEdit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(insp)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete Inspection"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono">
                      Risk Impact Score: <span className="font-bold text-amber-400">{insp.riskScore}/100</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Schedule Inspection Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Plant Safety Inspection"
        subtitle="Log pre-startup, high-hazard, or emergency equipment testing"
        icon={ClipboardCheck}
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Inspection Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Scrubber Caustic Recirculation Pump Flow Audit"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Inspection Type *</label>
              <select
                value={formData.inspectionType}
                onChange={(e) => setFormData({ ...formData, inspectionType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="High-Hazard Audit">High-Hazard Audit</option>
                <option value="Routine Safety">Routine Safety</option>
                <option value="Equipment Integrity">Equipment Integrity</option>
                <option value="Emergency Equipment">Emergency Equipment</option>
                <option value="Pre-Startup Review">Pre-Startup Review</option>
                <option value="Environmental Compliance">Environmental Compliance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Plant Zone *</label>
              <select
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Zone A - Acid Bund & Tank Farm">Zone A - Acid Bund & Tank Farm</option>
                <option value="Zone B - Flammable Solvent Yard">Zone B - Flammable Solvent Yard</option>
                <option value="Zone C - High Hazard Gas Vault">Zone C - High Hazard Gas Vault</option>
                <option value="Zone D - Wastewater & Neutralization">Zone D - Wastewater & Neutralization</option>
                <option value="Zone E - High Pressure Reactor Bay">Zone E - High Pressure Reactor Bay</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Lead Inspector Name *</label>
              <input
                type="text"
                required
                value={formData.inspectorName}
                onChange={(e) => setFormData({ ...formData, inspectorName: e.target.value })}
                placeholder="e.g. Dr. Marcus Vance"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Inspector Role / Org</label>
              <input
                type="text"
                value={formData.inspectorRole}
                onChange={(e) => setFormData({ ...formData, inspectorRole: e.target.value })}
                placeholder="e.g. Certified PSM Auditor"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Scheduled Date *</label>
              <input
                type="date"
                required
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Risk Score (0 - 100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.riskScore}
                onChange={(e) => setFormData({ ...formData, riskScore: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Required Action Items / Checklist (One per line)
              </label>
              <textarea
                rows="3"
                value={formData.actionItemsText}
                onChange={(e) => setFormData({ ...formData, actionItemsText: e.target.value })}
                placeholder="1. Check flange torque&#10;2. Calibrate sensor probe&#10;3. Inspect rupture disk"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {submitting ? 'Scheduling...' : 'Confirm Schedule'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Update / Audit Findings Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title={`Inspection Findings & Review: ${selectedInspection?.inspectionCode || ''}`}
        subtitle="Log observed findings, status, and Pass/Fail certification"
        icon={FileEdit}
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Inspection Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed Inspection</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Pass / Fail Assessment</label>
              <select
                value={formData.passed === null ? 'null' : formData.passed ? 'true' : 'false'}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    passed: val === 'null' ? null : val === 'true'
                  });
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="null">Pending Assessment</option>
                <option value="true">Passed Specification</option>
                <option value="false">Failed Compliance</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Findings & Inspector Observations
              </label>
              <textarea
                rows="3"
                value={formData.findings}
                onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                placeholder="Describe observations, gauge readings, wall thickness, or valve response times..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Action Items / Corrective Tasks (One per line)
              </label>
              <textarea
                rows="3"
                value={formData.actionItemsText}
                onChange={(e) => setFormData({ ...formData, actionItemsText: e.target.value })}
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
              {submitting ? 'Saving...' : 'Update Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

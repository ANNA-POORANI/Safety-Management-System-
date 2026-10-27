import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ShieldCheck,
  Plus,
  Search,
  Calendar,
  AlertCircle,
  FileCheck2,
  Trash2,
  Edit2,
  Building,
  CheckCircle2,
  Clock,
  Award
} from 'lucide-react';
import { complianceAPI } from '../services/api';
import { StatusBadge } from '../components/Common/Badge';
import { Modal } from '../components/Common/Modal';

export const ComplianceManagement = () => {
  const { triggerToast } = useOutletContext();

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [bodyFilter, setBodyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

  // Form state
  const initialForm = {
    certCode: '',
    certificateName: '',
    regulatoryBody: 'OSHA',
    standardOrAct: '29 CFR 1910.119',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    renewalWindowDays: 60,
    inspectorOrAuditor: '',
    notes: '',
    complianceScore: 95,
    status: 'Valid'
  };

  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (bodyFilter) params.regulatoryBody = bodyFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await complianceAPI.getAll(params);
      if (res.data.success) {
        setCertificates(res.data.data);
      }
    } catch (err) {
      triggerToast('error', 'Compliance API Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [search, bodyFilter, statusFilter]);

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cert) => {
    setSelectedCert(cert);
    setFormData({
      certificateName: cert.certificateName || '',
      regulatoryBody: cert.regulatoryBody || 'OSHA',
      standardOrAct: cert.standardOrAct || '',
      issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : '',
      expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : '',
      renewalWindowDays: cert.renewalWindowDays || 60,
      inspectorOrAuditor: cert.inspectorOrAuditor || '',
      notes: cert.notes || '',
      complianceScore: cert.complianceScore !== undefined ? cert.complianceScore : 95,
      status: cert.status || 'Valid'
    });
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await complianceAPI.create(formData);
      if (res.data.success) {
        triggerToast('success', 'Certificate Logged', `Registered: ${formData.certificateName}`);
        setIsAddModalOpen(false);
        fetchCertificates();
      }
    } catch (err) {
      triggerToast('error', 'Registration Failed', err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCert) return;
    setSubmitting(true);
    try {
      const id = selectedCert._id || selectedCert.id;
      const res = await complianceAPI.update(id, formData);
      if (res.data.success) {
        triggerToast('success', 'Certificate Renewed', `Updated record: ${formData.certificateName}`);
        setIsEditModalOpen(false);
        fetchCertificates();
      }
    } catch (err) {
      triggerToast('error', 'Update Failed', err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cert) => {
    const id = cert._id || cert.id;
    if (window.confirm(`Permanently remove safety certificate '${cert.certificateName}' (${cert.certCode})?`)) {
      try {
        await complianceAPI.delete(id);
        triggerToast('info', 'Certificate Removed', `Deleted ${cert.certCode}`);
        fetchCertificates();
      } catch (err) {
        triggerToast('error', 'Delete Failed', err.message);
      }
    }
  };

  const calculateDaysRemaining = (expDate) => {
    const now = new Date();
    const exp = new Date(expDate);
    const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
            Process Safety Compliance & Statutory Certifications
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track regulatory permits, renewal windows, environmental consents & third-party audit certifications
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-amber-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Register New Certificate</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search certificate, code, or standard..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <select
            value={bodyFilter}
            onChange={(e) => setBodyFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">All Regulatory Authorities</option>
            <option value="OSHA">OSHA (Process Safety Mgmt)</option>
            <option value="EPA">EPA (Risk Management Plan)</option>
            <option value="ISO">ISO (45001 / 14001)</option>
            <option value="State Pollution Board">State Pollution Board</option>
            <option value="Fire Dept NOC">Fire Department NOC</option>
            <option value="State Boiler Inspectorate">Boiler / Pressure Vessel</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">All Statuses</option>
            <option value="Valid">Valid & Compliant</option>
            <option value="Expiring Soon">Expiring Soon (&le; 60 days)</option>
            <option value="Expired">Expired</option>
            <option value="Under Audit">Under Audit / Renewal</option>
          </select>
        </div>
      </div>

      {/* Certificates Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-500">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading regulatory certificates...
          </div>
        ) : certificates.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
            No compliance certificates match the selected filters.
          </div>
        ) : (
          certificates.map((cert) => {
            const daysLeft = calculateDaysRemaining(cert.expiryDate);
            const isExpired = daysLeft < 0;
            const isExpiringSoon = daysLeft >= 0 && daysLeft <= (cert.renewalWindowDays || 60);

            return (
              <div
                key={cert._id || cert.certCode}
                className={`p-6 rounded-2xl bg-slate-900 border transition-all ${
                  isExpired
                    ? 'border-rose-500/50 bg-rose-500/5'
                    : isExpiringSoon
                    ? 'border-amber-500/50 bg-amber-500/5'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    {/* Header tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                        {cert.certCode}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                        Authority: {cert.regulatoryBody}
                      </span>
                      <StatusBadge status={cert.status} />

                      {/* Expiry countdown tag */}
                      {isExpired ? (
                        <span className="text-xs font-bold text-rose-400 bg-rose-500/20 px-2.5 py-0.5 rounded border border-rose-500/40">
                          EXPIRED ({Math.abs(daysLeft)} days ago)
                        </span>
                      ) : isExpiringSoon ? (
                        <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded border border-amber-500/40 animate-pulse">
                          Expiring in {daysLeft} days
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded border border-emerald-500/30">
                          Valid ({daysLeft} days remaining)
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white">{cert.certificateName}</h3>

                    <p className="text-xs text-amber-400 font-mono">
                      Standard / Act: <span className="text-slate-300">{cert.standardOrAct}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Issued: {new Date(cert.issueDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                      </span>
                      {cert.inspectorOrAuditor && (
                        <span>Auditor: {cert.inspectorOrAuditor}</span>
                      )}
                    </div>

                    {cert.notes && (
                      <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                        {cert.notes}
                      </p>
                    )}
                  </div>

                  {/* Right Score & Actions */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    <div className="text-right">
                      <div className="text-2xl font-black font-mono text-emerald-400">
                        {cert.complianceScore}%
                      </div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Audit Rating</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(cert)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Renew / Edit</span>
                      </button>

                      <button
                        onClick={() => handleDelete(cert)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete Certificate"
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

      {/* Add Certificate Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Plant Safety Certificate"
        subtitle="Record compliance permit, issuing authority, and renewal parameters"
        icon={ShieldCheck}
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Certificate Title *</label>
              <input
                type="text"
                required
                value={formData.certificateName}
                onChange={(e) => setFormData({ ...formData, certificateName: e.target.value })}
                placeholder="e.g. Hazardous Chemical Storage Permit"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Certificate Code (Optional)</label>
              <input
                type="text"
                value={formData.certCode || ''}
                onChange={(e) => setFormData({ ...formData, certCode: e.target.value })}
                placeholder="Auto-generated if left blank (e.g. CERT-OSHA-2026-XXXX)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Regulatory Authority *</label>
              <select
                value={formData.regulatoryBody}
                onChange={(e) => setFormData({ ...formData, regulatoryBody: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="OSHA">OSHA (Occupational Safety)</option>
                <option value="EPA">EPA (Environmental Protection)</option>
                <option value="ISO">ISO (Safety Management)</option>
                <option value="State Pollution Board">State Pollution Board</option>
                <option value="Fire Dept NOC">Fire Department NOC</option>
                <option value="State Boiler Inspectorate">State Boiler Inspectorate</option>
                <option value="DOT Hazmat">DOT Hazmat Transport</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Standard / Statutory Code *</label>
              <input
                type="text"
                required
                value={formData.standardOrAct}
                onChange={(e) => setFormData({ ...formData, standardOrAct: e.target.value })}
                placeholder="e.g. 29 CFR 1910.119 / NFPA 30"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Issue Date *</label>
              <input
                type="date"
                required
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Expiry Date *</label>
              <input
                type="date"
                required
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Renewal Advance Window (Days)</label>
              <input
                type="number"
                min="10"
                value={formData.renewalWindowDays}
                onChange={(e) => setFormData({ ...formData, renewalWindowDays: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Compliance Audit Score (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.complianceScore}
                onChange={(e) => setFormData({ ...formData, complianceScore: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Auditing Official / Agency</label>
              <input
                type="text"
                value={formData.inspectorOrAuditor}
                onChange={(e) => setFormData({ ...formData, inspectorOrAuditor: e.target.value })}
                placeholder="e.g. National Board of Pressure Vessel Inspectors"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Audit Notes & Observations</label>
              <textarea
                rows="2"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Zero non-conformances identified in PSM element 7..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {submitting ? 'Registering...' : 'Save Certificate'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit / Renew Certificate Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Renew / Update: ${selectedCert?.certCode || ''}`}
        subtitle="Update certificate expiry, audit score, and regulatory status"
        icon={Edit2}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Certificate Title</label>
              <input
                type="text"
                required
                value={formData.certificateName}
                onChange={(e) => setFormData({ ...formData, certificateName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Expiry Date</label>
              <input
                type="date"
                required
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Compliance Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Valid">Valid</option>
                <option value="Expiring Soon">Expiring Soon</option>
                <option value="Expired">Expired</option>
                <option value="Under Audit">Under Audit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Audit Score (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.complianceScore}
                onChange={(e) => setFormData({ ...formData, complianceScore: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Auditor / Inspection Board</label>
              <input
                type="text"
                value={formData.inspectorOrAuditor}
                onChange={(e) => setFormData({ ...formData, inspectorOrAuditor: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Renewal Notes</label>
              <textarea
                rows="2"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Update Certificate'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

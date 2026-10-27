import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FlaskConical,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  ExternalLink,
  AlertTriangle,
  FileText,
  Warehouse,
  ShieldAlert,
  Gauge
} from 'lucide-react';
import { chemicalAPI } from '../services/api';
import { RiskBadge, StatusBadge } from '../components/Common/Badge';
import { Modal } from '../components/Common/Modal';

export const ChemicalManagement = () => {
  const { triggerToast } = useOutletContext();

  const [chemicals, setChemicals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [hazardFilter, setHazardFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedChemical, setSelectedChemical] = useState(null);

  // Form state
  const initialFormState = {
    name: '',
    formula: '',
    casNumber: '',
    hazardClass: 'Corrosive',
    riskLevel: 'Medium',
    physicalState: 'Liquid',
    storageZone: 'Zone A - Acid Bund & Tank Farm',
    quantity: 1000,
    unit: 'Liters',
    minThreshold: 500,
    maxCapacity: 5000,
    sdsDocumentUrl: '',
    notes: '',
    status: 'Optimal'
  };

  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  const fetchChemicals = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (hazardFilter) params.hazardClass = hazardFilter;
      if (riskFilter) params.riskLevel = riskFilter;

      const res = await chemicalAPI.getAll(params);
      if (res.data.success) {
        setChemicals(res.data.data);
      }
    } catch (err) {
      triggerToast('error', 'Inventory Error', 'Failed to fetch chemical inventory: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChemicals();
  }, [search, hazardFilter, riskFilter]);

  const handleOpenAdd = () => {
    setFormData(initialFormState);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (chem) => {
    setSelectedChemical(chem);
    setFormData({
      name: chem.name || '',
      formula: chem.formula || '',
      casNumber: chem.casNumber || '',
      hazardClass: chem.hazardClass || 'Corrosive',
      riskLevel: chem.riskLevel || 'Medium',
      physicalState: chem.physicalState || 'Liquid',
      storageZone: chem.storageZone || '',
      quantity: chem.quantity || 0,
      unit: chem.unit || 'Liters',
      minThreshold: chem.minThreshold || 100,
      maxCapacity: chem.maxCapacity || 1000,
      sdsDocumentUrl: chem.sdsDocumentUrl || '',
      notes: chem.notes || '',
      status: chem.status || 'Optimal'
    });
    setIsEditModalOpen(true);
  };

  const handleOpenView = (chem) => {
    setSelectedChemical(chem);
    setIsViewModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await chemicalAPI.create(formData);
      if (res.data.success) {
        triggerToast('success', 'Chemical Registered', `Added ${formData.name} to safety register.`);
        setIsAddModalOpen(false);
        fetchChemicals();
      }
    } catch (err) {
      triggerToast('error', 'Registration Failed', err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedChemical) return;
    setSubmitting(true);
    try {
      const id = selectedChemical._id || selectedChemical.id;
      const res = await chemicalAPI.update(id, formData);
      if (res.data.success) {
        triggerToast('success', 'Chemical Updated', `Updated specifications for ${formData.name}.`);
        setIsEditModalOpen(false);
        fetchChemicals();
      }
    } catch (err) {
      triggerToast('error', 'Update Failed', err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (chem) => {
    const id = chem._id || chem.id;
    if (window.confirm(`Permanently remove chemical '${chem.name}' (CAS: ${chem.casNumber}) from the plant registry?`)) {
      try {
        await chemicalAPI.delete(id);
        triggerToast('info', 'Record Deleted', `Deleted ${chem.name} from inventory.`);
        fetchChemicals();
      } catch (err) {
        triggerToast('error', 'Delete Failed', err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
            Chemical Inventory & Hazardous Substances
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            GHS classifications, storage bund locations, physical stock & Safety Data Sheets (SDS)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-amber-500/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Chemical</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, formula, or CAS#..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Hazard Class Filter */}
        <div className="relative">
          <select
            value={hazardFilter}
            onChange={(e) => setHazardFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">All Hazard Classes</option>
            <option value="Toxic Gas">Toxic Gas</option>
            <option value="Corrosive">Corrosive</option>
            <option value="Flammable Liquid">Flammable Liquid</option>
            <option value="Oxidizer">Oxidizer</option>
            <option value="Explosive">Explosive</option>
          </select>
        </div>

        {/* Risk Level Filter */}
        <div className="relative">
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">All Risk Tiers</option>
            <option value="Critical">Critical Risk</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Chemical & Formula</th>
                <th className="py-3.5 px-4">CAS Number</th>
                <th className="py-3.5 px-4">Hazard Classification</th>
                <th className="py-3.5 px-4">Risk Level</th>
                <th className="py-3.5 px-4">Storage Zone</th>
                <th className="py-3.5 px-4">Quantity / Capacity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Fetching inventory records...
                  </td>
                </tr>
              ) : chemicals.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    No chemicals matched the selected filters.
                  </td>
                </tr>
              ) : (
                chemicals.map((chem) => {
                  const percent = Math.min(
                    100,
                    Math.round(((chem.quantity || 0) / (chem.maxCapacity || 1000)) * 100)
                  );
                  const isLow = chem.quantity < chem.minThreshold;

                  return (
                    <tr key={chem._id || chem.casNumber} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & Formula */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{chem.name}</div>
                        <div className="text-[11px] font-mono text-amber-400 font-semibold">{chem.formula}</div>
                      </td>

                      {/* CAS Number */}
                      <td className="py-3.5 px-4 font-mono text-slate-300">{chem.casNumber}</td>

                      {/* Hazard Class */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700">
                          {chem.hazardClass}
                        </span>
                      </td>

                      {/* Risk Level */}
                      <td className="py-3.5 px-4">
                        <RiskBadge level={chem.riskLevel} />
                      </td>

                      {/* Storage Zone */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Warehouse className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate max-w-[140px]">{chem.storageZone}</span>
                        </div>
                      </td>

                      {/* Quantity & Bar */}
                      <td className="py-3.5 px-4 min-w-[160px]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-white">
                            {chem.quantity.toLocaleString()} {chem.unit}
                          </span>
                          <span className="text-slate-500 font-mono">
                            Max {chem.maxCapacity} {chem.unit}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isLow
                                ? 'bg-rose-500'
                                : percent > 85
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={chem.status || 'Optimal'} />
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenView(chem)}
                            title="View SDS / Full Details"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(chem)}
                            title="Edit Chemical"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(chem)}
                            title="Delete Chemical"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Chemical Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Chemical Substance"
        subtitle="Provide GHS classifications, storage containment specifications, and safety guidelines"
        icon={FlaskConical}
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Chemical Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Nitric Acid 68%"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Chemical Formula *</label>
              <input
                type="text"
                required
                value={formData.formula}
                onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                placeholder="e.g. HNO₃"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">CAS Registry Number *</label>
              <input
                type="text"
                required
                value={formData.casNumber}
                onChange={(e) => setFormData({ ...formData, casNumber: e.target.value })}
                placeholder="e.g. 7697-37-2"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Hazard Classification *</label>
              <select
                value={formData.hazardClass}
                onChange={(e) => setFormData({ ...formData, hazardClass: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Toxic Gas">Toxic Gas</option>
                <option value="Corrosive">Corrosive</option>
                <option value="Flammable Liquid">Flammable Liquid</option>
                <option value="Oxidizer">Oxidizer</option>
                <option value="Explosive">Explosive</option>
                <option value="Carcinogen">Carcinogen</option>
                <option value="Water-Reactive">Water-Reactive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Risk Level</label>
              <select
                value={formData.riskLevel}
                onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Physical State</label>
              <select
                value={formData.physicalState}
                onChange={(e) => setFormData({ ...formData, physicalState: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Liquid">Liquid</option>
                <option value="Gas">Gas</option>
                <option value="Solid">Solid</option>
                <option value="Slurry">Slurry</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Plant Storage Zone *</label>
              <select
                value={formData.storageZone}
                onChange={(e) => setFormData({ ...formData, storageZone: e.target.value })}
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Quantity *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Unit of Measure</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Liters">Liters</option>
                <option value="Kilograms">Kilograms</option>
                <option value="Barrels">Barrels</option>
                <option value="Tons">Tons</option>
                <option value="Cylinders">Cylinders</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Min Threshold Alert</label>
              <input
                type="number"
                min="0"
                value={formData.minThreshold}
                onChange={(e) => setFormData({ ...formData, minThreshold: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Max Storage Capacity</label>
              <input
                type="number"
                min="1"
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Safety Data Sheet (SDS) URL</label>
              <input
                type="url"
                value={formData.sdsDocumentUrl}
                onChange={(e) => setFormData({ ...formData, sdsDocumentUrl: e.target.value })}
                placeholder="https://pubchem.ncbi.nlm.nih.gov/..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Operating & Handling Notes</label>
              <textarea
                rows="2"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g. Incompatible with water; nitrogen blanket required."
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
              {submitting ? 'Saving...' : 'Add Chemical'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Chemical Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Chemical: ${selectedChemical?.name || ''}`}
        subtitle="Update inventory quantities, risk levels, or storage locations"
        icon={Edit2}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Chemical Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Chemical Formula *</label>
              <input
                type="text"
                required
                value={formData.formula}
                onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Hazard Classification *</label>
              <select
                value={formData.hazardClass}
                onChange={(e) => setFormData({ ...formData, hazardClass: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Toxic Gas">Toxic Gas</option>
                <option value="Corrosive">Corrosive</option>
                <option value="Flammable Liquid">Flammable Liquid</option>
                <option value="Oxidizer">Oxidizer</option>
                <option value="Explosive">Explosive</option>
                <option value="Carcinogen">Carcinogen</option>
                <option value="Water-Reactive">Water-Reactive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Risk Level</label>
              <select
                value={formData.riskLevel}
                onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Storage Zone</label>
              <input
                type="text"
                value={formData.storageZone}
                onChange={(e) => setFormData({ ...formData, storageZone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Liters">Liters</option>
                <option value="Kilograms">Kilograms</option>
                <option value="Barrels">Barrels</option>
                <option value="Tons">Tons</option>
                <option value="Cylinders">Cylinders</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Optimal">Optimal</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Over Capacity">Over Capacity</option>
                <option value="Needs Inspection">Needs Inspection</option>
                <option value="Quarantined">Quarantined</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Safety Threshold (Min)</label>
              <input
                type="number"
                min="0"
                value={formData.minThreshold}
                onChange={(e) => setFormData({ ...formData, minThreshold: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Special Handling Notes</label>
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
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Details / SDS Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={selectedChemical?.name || 'Chemical Details'}
        subtitle={`Formula: ${selectedChemical?.formula} | CAS: ${selectedChemical?.casNumber}`}
        icon={FileText}
      >
        {selectedChemical && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Hazard Profile</span>
                <div className="text-base font-bold text-white mt-0.5">{selectedChemical.hazardClass}</div>
              </div>
              <RiskBadge level={selectedChemical.riskLevel} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 text-[11px]">Storage Zone</span>
                <p className="font-semibold text-white mt-0.5">{selectedChemical.storageZone}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 text-[11px]">Physical State</span>
                <p className="font-semibold text-white mt-0.5">{selectedChemical.physicalState}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 text-[11px]">Current Quantity</span>
                <p className="font-semibold text-white mt-0.5">
                  {selectedChemical.quantity} {selectedChemical.unit}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 text-[11px]">Capacity Range</span>
                <p className="font-semibold text-white mt-0.5">
                  Min: {selectedChemical.minThreshold} / Max: {selectedChemical.maxCapacity} {selectedChemical.unit}
                </p>
              </div>
            </div>

            {selectedChemical.notes && (
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 text-[11px] font-bold uppercase">Safety & Handling Directives</span>
                <p className="text-slate-300 mt-1">{selectedChemical.notes}</p>
              </div>
            )}

            {selectedChemical.sdsDocumentUrl && (
              <div className="pt-2">
                <a
                  href={selectedChemical.sdsDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Access Official Safety Data Sheet (SDS / PubChem)</span>
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

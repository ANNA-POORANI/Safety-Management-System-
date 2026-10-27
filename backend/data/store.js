const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { getSeedData } = require('./seedData');

// Models
const User = require('../models/User');
const Chemical = require('../models/Chemical');
const Inspection = require('../models/Inspection');
const Incident = require('../models/Incident');
const EmergencyProtocol = require('../models/EmergencyProtocol');
const Compliance = require('../models/Compliance');

const DB_FILE = path.join(__dirname, 'db.json');

// In-memory cache when running with JSON fallback
let localStore = null;

const initStore = async () => {
  if (mongoose.connection.readyState === 1) {
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('🌱 Seeding MongoDB database with initial chemical plant safety data...');
        const seed = getSeedData();
        await User.insertMany(seed.users);
        await Chemical.insertMany(seed.chemicals);
        await Inspection.insertMany(seed.inspections);
        await Incident.insertMany(seed.incidents);
        await EmergencyProtocol.insertMany(seed.emergencyProtocols);
        await Compliance.insertMany(seed.compliance);
        console.log('✅ MongoDB database successfully seeded!');
      }
      return;
    } catch (err) {
      console.warn('MongoDB query error during seed, checking JSON store:', err.message);
    }
  }

  // Load from local JSON if available or initialize seed
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      localStore = JSON.parse(raw);
      // Re-hydrate date objects
      return;
    } catch (e) {
      console.error('Error reading db.json, generating fresh seed:', e.message);
    }
  }

  localStore = getSeedData();
  saveLocalStore();
};

const saveLocalStore = () => {
  if (!localStore) return;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(localStore, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to persist to db.json:', err.message);
  }
};

const isMongooseActive = () => mongoose.connection.readyState === 1;

// ==================== USERS ====================
const findUserByEmail = async (email) => {
  if (isMongooseActive()) {
    return await User.findOne({ email: email.toLowerCase() });
  }
  return localStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

const findUserById = async (id) => {
  if (isMongooseActive()) {
    return await User.findById(id).select('-password');
  }
  const user = localStore.users.find(u => u._id === id || u.id === id);
  if (!user) return null;
  const { password, ...userWithoutPass } = user;
  return userWithoutPass;
};

const createUser = async (userData) => {
  if (isMongooseActive()) {
    const user = new User(userData);
    return await user.save();
  }
  const newUser = {
    _id: 'usr_' + Date.now(),
    createdAt: new Date(),
    shift: 'Morning Shift (A)',
    role: 'Plant Operator',
    ...userData
  };
  localStore.users.push(newUser);
  saveLocalStore();
  return newUser;
};

// ==================== CHEMICALS ====================
const getChemicals = async (query = {}) => {
  if (isMongooseActive()) {
    let filter = {};
    if (query.hazardClass) filter.hazardClass = query.hazardClass;
    if (query.riskLevel) filter.riskLevel = query.riskLevel;
    if (query.storageZone) filter.storageZone = new RegExp(query.storageZone, 'i');
    if (query.search) {
      filter.$or = [
        { name: new RegExp(query.search, 'i') },
        { formula: new RegExp(query.search, 'i') },
        { casNumber: new RegExp(query.search, 'i') }
      ];
    }
    return await Chemical.find(filter).sort({ createdAt: -1 });
  }

  let list = [...localStore.chemicals];
  if (query.hazardClass) {
    list = list.filter(c => c.hazardClass.toLowerCase() === query.hazardClass.toLowerCase());
  }
  if (query.riskLevel) {
    list = list.filter(c => c.riskLevel.toLowerCase() === query.riskLevel.toLowerCase());
  }
  if (query.storageZone) {
    list = list.filter(c => c.storageZone.toLowerCase().includes(query.storageZone.toLowerCase()));
  }
  if (query.search) {
    const s = query.search.toLowerCase();
    list = list.filter(c => 
      c.name.toLowerCase().includes(s) || 
      c.formula.toLowerCase().includes(s) || 
      c.casNumber.toLowerCase().includes(s) ||
      (c.storageZone && c.storageZone.toLowerCase().includes(s))
    );
  }
  return list;
};

const getChemicalById = async (id) => {
  if (isMongooseActive()) {
    return await Chemical.findById(id);
  }
  return localStore.chemicals.find(c => c._id === id || c.id === id);
};

const createChemical = async (data) => {
  if (isMongooseActive()) {
    const chem = new Chemical(data);
    return await chem.save();
  }
  const newChem = {
    _id: 'chem_' + Date.now(),
    createdAt: new Date(),
    lastInspectionDate: new Date(),
    ...data
  };
  localStore.chemicals.unshift(newChem);
  saveLocalStore();
  return newChem;
};

const updateChemical = async (id, data) => {
  if (isMongooseActive()) {
    return await Chemical.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }
  const index = localStore.chemicals.findIndex(c => c._id === id || c.id === id);
  if (index === -1) return null;
  localStore.chemicals[index] = { ...localStore.chemicals[index], ...data };
  saveLocalStore();
  return localStore.chemicals[index];
};

const deleteChemical = async (id) => {
  if (isMongooseActive()) {
    return await Chemical.findByIdAndDelete(id);
  }
  const index = localStore.chemicals.findIndex(c => c._id === id || c.id === id);
  if (index === -1) return null;
  const deleted = localStore.chemicals.splice(index, 1);
  saveLocalStore();
  return deleted[0];
};

// ==================== INSPECTIONS ====================
const getInspections = async (query = {}) => {
  if (isMongooseActive()) {
    let filter = {};
    if (query.status) filter.status = query.status;
    if (query.inspectionType) filter.inspectionType = query.inspectionType;
    if (query.zone) filter.zone = new RegExp(query.zone, 'i');
    if (query.search) {
      filter.$or = [
        { title: new RegExp(query.search, 'i') },
        { inspectionCode: new RegExp(query.search, 'i') },
        { inspectorName: new RegExp(query.search, 'i') }
      ];
    }
    return await Inspection.find(filter).sort({ scheduledDate: 1 });
  }

  let list = [...localStore.inspections];
  if (query.status) {
    list = list.filter(i => i.status.toLowerCase() === query.status.toLowerCase());
  }
  if (query.inspectionType) {
    list = list.filter(i => i.inspectionType.toLowerCase() === query.inspectionType.toLowerCase());
  }
  if (query.search) {
    const s = query.search.toLowerCase();
    list = list.filter(i => 
      i.title.toLowerCase().includes(s) || 
      i.inspectionCode.toLowerCase().includes(s) ||
      i.inspectorName.toLowerCase().includes(s) ||
      (i.zone && i.zone.toLowerCase().includes(s))
    );
  }
  return list;
};

const getInspectionById = async (id) => {
  if (isMongooseActive()) {
    return await Inspection.findById(id);
  }
  return localStore.inspections.find(i => i._id === id || i.id === id);
};

const createInspection = async (data) => {
  const code = 'INSP-2026-' + Math.floor(100 + Math.random() * 900);
  const payload = {
    inspectionCode: data.inspectionCode || code,
    createdAt: new Date(),
    ...data
  };
  if (isMongooseActive()) {
    const insp = new Inspection(payload);
    return await insp.save();
  }
  const newInsp = {
    _id: 'insp_' + Date.now(),
    ...payload
  };
  localStore.inspections.unshift(newInsp);
  saveLocalStore();
  return newInsp;
};

const updateInspection = async (id, data) => {
  if (isMongooseActive()) {
    return await Inspection.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }
  const index = localStore.inspections.findIndex(i => i._id === id || i.id === id);
  if (index === -1) return null;
  localStore.inspections[index] = { ...localStore.inspections[index], ...data };
  saveLocalStore();
  return localStore.inspections[index];
};

const deleteInspection = async (id) => {
  if (isMongooseActive()) {
    return await Inspection.findByIdAndDelete(id);
  }
  const index = localStore.inspections.findIndex(i => i._id === id || i.id === id);
  if (index === -1) return null;
  const deleted = localStore.inspections.splice(index, 1);
  saveLocalStore();
  return deleted[0];
};

// ==================== INCIDENTS ====================
const getIncidents = async (query = {}) => {
  if (isMongooseActive()) {
    let filter = {};
    if (query.severity) filter.severity = query.severity;
    if (query.status) filter.status = query.status;
    if (query.incidentType) filter.incidentType = query.incidentType;
    if (query.search) {
      filter.$or = [
        { title: new RegExp(query.search, 'i') },
        { incidentCode: new RegExp(query.search, 'i') },
        { chemicalInvolved: new RegExp(query.search, 'i') },
        { zone: new RegExp(query.search, 'i') }
      ];
    }
    return await Incident.find(filter).sort({ reportDate: -1 });
  }

  let list = [...localStore.incidents];
  if (query.severity) {
    list = list.filter(i => i.severity.toLowerCase() === query.severity.toLowerCase());
  }
  if (query.status) {
    list = list.filter(i => i.status.toLowerCase() === query.status.toLowerCase());
  }
  if (query.incidentType) {
    list = list.filter(i => i.incidentType.toLowerCase() === query.incidentType.toLowerCase());
  }
  if (query.search) {
    const s = query.search.toLowerCase();
    list = list.filter(i =>
      i.title.toLowerCase().includes(s) ||
      i.incidentCode.toLowerCase().includes(s) ||
      i.chemicalInvolved.toLowerCase().includes(s) ||
      (i.zone && i.zone.toLowerCase().includes(s))
    );
  }
  return list;
};

const getIncidentById = async (id) => {
  if (isMongooseActive()) {
    return await Incident.findById(id);
  }
  return localStore.incidents.find(i => i._id === id || i.id === id);
};

const createIncident = async (data) => {
  const code = 'INC-2026-' + Math.floor(100 + Math.random() * 900);
  const payload = {
    incidentCode: data.incidentCode || code,
    reportDate: data.reportDate || new Date(),
    createdAt: new Date(),
    ...data
  };
  if (isMongooseActive()) {
    const inc = new Incident(payload);
    return await inc.save();
  }
  const newInc = {
    _id: 'inc_' + Date.now(),
    ...payload
  };
  localStore.incidents.unshift(newInc);
  saveLocalStore();
  return newInc;
};

const updateIncident = async (id, data) => {
  if (isMongooseActive()) {
    return await Incident.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }
  const index = localStore.incidents.findIndex(i => i._id === id || i.id === id);
  if (index === -1) return null;
  localStore.incidents[index] = { ...localStore.incidents[index], ...data };
  saveLocalStore();
  return localStore.incidents[index];
};

const deleteIncident = async (id) => {
  if (isMongooseActive()) {
    return await Incident.findByIdAndDelete(id);
  }
  const index = localStore.incidents.findIndex(i => i._id === id || i.id === id);
  if (index === -1) return null;
  const deleted = localStore.incidents.splice(index, 1);
  saveLocalStore();
  return deleted[0];
};

// ==================== EMERGENCY PROTOCOLS ====================
const getEmergencyProtocols = async () => {
  if (isMongooseActive()) {
    return await EmergencyProtocol.find().sort({ code: 1 });
  }
  return localStore.emergencyProtocols;
};

const getEmergencyProtocolById = async (id) => {
  if (isMongooseActive()) {
    return await EmergencyProtocol.findById(id);
  }
  return localStore.emergencyProtocols.find(p => p._id === id || p.id === id);
};

const toggleEmergencyProtocol = async (id, activeStatus, activatedBy = 'Emergency Commander') => {
  if (isMongooseActive()) {
    return await EmergencyProtocol.findByIdAndUpdate(
      id,
      {
        isActive: activeStatus,
        activatedAt: activeStatus ? new Date() : null,
        activatedBy: activeStatus ? activatedBy : null
      },
      { new: true }
    );
  }
  const p = localStore.emergencyProtocols.find(ep => ep._id === id || ep.id === id);
  if (p) {
    p.isActive = activeStatus;
    p.activatedAt = activeStatus ? new Date() : null;
    p.activatedBy = activeStatus ? activatedBy : null;
    saveLocalStore();
    return p;
  }
  return null;
};

// ==================== COMPLIANCE ====================
const getCompliances = async (query = {}) => {
  if (isMongooseActive()) {
    let filter = {};
    if (query.regulatoryBody) filter.regulatoryBody = query.regulatoryBody;
    if (query.status) filter.status = query.status;
    if (query.search) {
      filter.$or = [
        { certificateName: new RegExp(query.search, 'i') },
        { certCode: new RegExp(query.search, 'i') },
        { standardOrAct: new RegExp(query.search, 'i') }
      ];
    }
    return await Compliance.find(filter).sort({ expiryDate: 1 });
  }

  let list = [...localStore.compliance];
  if (query.regulatoryBody) {
    list = list.filter(c => c.regulatoryBody.toLowerCase() === query.regulatoryBody.toLowerCase());
  }
  if (query.status) {
    list = list.filter(c => c.status.toLowerCase() === query.status.toLowerCase());
  }
  if (query.search) {
    const s = query.search.toLowerCase();
    list = list.filter(c =>
      c.certificateName.toLowerCase().includes(s) ||
      c.certCode.toLowerCase().includes(s) ||
      c.standardOrAct.toLowerCase().includes(s)
    );
  }
  return list;
};

const getComplianceById = async (id) => {
  if (isMongooseActive()) {
    return await Compliance.findById(id);
  }
  return localStore.compliance.find(c => c._id === id || c.id === id);
};

const createCompliance = async (data) => {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const regCode = (data.regulatoryBody || 'GEN').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const generatedCode = `CERT-${regCode}-${new Date().getFullYear()}-${randomSuffix}`;
  const finalCertCode = (data.certCode && data.certCode.trim().length > 0) ? data.certCode.trim() : generatedCode;

  const payload = {
    ...data,
    certCode: finalCertCode,
    createdAt: new Date()
  };
  if (isMongooseActive()) {
    const comp = new Compliance(payload);
    return await comp.save();
  }
  const newComp = {
    _id: 'comp_' + Date.now(),
    ...payload
  };
  localStore.compliance.push(newComp);
  saveLocalStore();
  return newComp;
};

const updateCompliance = async (id, data) => {
  if (isMongooseActive()) {
    return await Compliance.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }
  const index = localStore.compliance.findIndex(c => c._id === id || c.id === id);
  if (index === -1) return null;
  localStore.compliance[index] = { ...localStore.compliance[index], ...data };
  saveLocalStore();
  return localStore.compliance[index];
};

const deleteCompliance = async (id) => {
  if (isMongooseActive()) {
    return await Compliance.findByIdAndDelete(id);
  }
  const index = localStore.compliance.findIndex(c => c._id === id || c.id === id);
  if (index === -1) return null;
  const deleted = localStore.compliance.splice(index, 1);
  saveLocalStore();
  return deleted[0];
};

// ==================== DASHBOARD STATS ====================
const getDashboardStats = async () => {
  let chemicals, inspections, incidents, compliance, protocols;

  if (isMongooseActive()) {
    [chemicals, inspections, incidents, compliance, protocols] = await Promise.all([
      Chemical.find(),
      Inspection.find(),
      Incident.find(),
      Compliance.find(),
      EmergencyProtocol.find()
    ]);
  } else {
    chemicals = localStore.chemicals;
    inspections = localStore.inspections;
    incidents = localStore.incidents;
    compliance = localStore.compliance;
    protocols = localStore.emergencyProtocols;
  }

  // 1. Total Chemicals
  const totalChemicals = chemicals.length;

  // 2. High-Risk Chemicals (Critical & High)
  const highRiskChemicals = chemicals.filter(c => c.riskLevel === 'Critical' || c.riskLevel === 'High').length;
  const criticalChemicals = chemicals.filter(c => c.riskLevel === 'Critical').length;

  // 3. Pending Inspections
  const pendingInspections = inspections.filter(i => i.status === 'Pending' || i.status === 'Overdue').length;

  // 4. Open Incidents
  const openIncidents = incidents.filter(i => i.status !== 'Closed' && i.status !== 'Resolved').length;

  // Additional Insights
  const activeEmergencies = protocols.filter(p => p.isActive).length;
  const expiringCompliances = compliance.filter(c => c.status === 'Expiring Soon' || c.status === 'Expired').length;
  const validComplianceCount = compliance.filter(c => c.status === 'Valid').length;
  const complianceScoreAvg = compliance.length > 0 
    ? Math.round(compliance.reduce((acc, curr) => acc + (curr.complianceScore || 90), 0) / compliance.length) 
    : 95;

  // Safety Plant State
  let plantSafetyStatus = 'NORMAL';
  if (activeEmergencies > 0 || openIncidents >= 3) {
    plantSafetyStatus = 'CRITICAL ALERT';
  } else if (openIncidents > 0 || pendingInspections > 2) {
    plantSafetyStatus = 'ELEVATED MONITORING';
  }

  // Hazard breakdown
  const hazardCounts = {};
  chemicals.forEach(c => {
    hazardCounts[c.hazardClass] = (hazardCounts[c.hazardClass] || 0) + 1;
  });

  // Recent items
  const recentIncidents = [...incidents]
    .sort((a, b) => new Date(b.reportDate || b.createdAt) - new Date(a.reportDate || a.createdAt))
    .slice(0, 4);

  const upcomingInspections = [...inspections]
    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
    .slice(0, 4);

  return {
    summary: {
      totalChemicals,
      highRiskChemicals,
      criticalChemicals,
      pendingInspections,
      openIncidents,
      activeEmergencies,
      expiringCompliances,
      complianceScoreAvg,
      plantSafetyStatus
    },
    hazardCounts,
    recentIncidents,
    upcomingInspections,
    totalInspections: inspections.length,
    totalIncidents: incidents.length,
    totalCertificates: compliance.length
  };
};

const resetToSeed = async () => {
  const seed = getSeedData();
  if (isMongooseActive()) {
    await Promise.all([
      User.deleteMany({}),
      Chemical.deleteMany({}),
      Inspection.deleteMany({}),
      Incident.deleteMany({}),
      EmergencyProtocol.deleteMany({}),
      Compliance.deleteMany({})
    ]);
    await Promise.all([
      User.insertMany(seed.users),
      Chemical.insertMany(seed.chemicals),
      Inspection.insertMany(seed.inspections),
      Incident.insertMany(seed.incidents),
      EmergencyProtocol.insertMany(seed.emergencyProtocols),
      Compliance.insertMany(seed.compliance)
    ]);
  } else {
    localStore = seed;
    saveLocalStore();
  }
  return { message: 'Data reset to official factory seed successfully!' };
};

module.exports = {
  initStore,
  // User
  findUserByEmail,
  findUserById,
  createUser,
  // Chemicals
  getChemicals,
  getChemicalById,
  createChemical,
  updateChemical,
  deleteChemical,
  // Inspections
  getInspections,
  getInspectionById,
  createInspection,
  updateInspection,
  deleteInspection,
  // Incidents
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident,
  // Emergency
  getEmergencyProtocols,
  getEmergencyProtocolById,
  toggleEmergencyProtocol,
  // Compliance
  getCompliances,
  getComplianceById,
  createCompliance,
  updateCompliance,
  deleteCompliance,
  // Dashboard & Reset
  getDashboardStats,
  resetToSeed
};

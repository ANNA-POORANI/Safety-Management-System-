require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { initStore } = require('./data/store');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const chemicalRoutes = require('./routes/chemicalRoutes');
const inspectionRoutes = require('./routes/inspectionRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const complianceRoutes = require('./routes/complianceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Chemical Plant Safety Management System API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chemicals', chemicalRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.'
  });
});

const PORT = process.env.PORT || 5000;

// Initialize Database & Start Server
const startServer = async () => {
  await connectDB();
  await initStore();

  app.listen(PORT, () => {
    console.log(`🚀 Safety Management API running on port ${PORT}`);
    console.log(`📡 URL: http://localhost:${PORT}/api/health`);
  });
};

startServer();

const mongoose = require('mongoose');

process.env.MONGOMS_VERSION = process.env.MONGOMS_VERSION || '4.4.29';

let isConnected = false;
let mongodInstance = null;
let activeEngine = 'none';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/chemical_plant_safety';

  // 1. Attempt connection to configured/external MongoDB first (e.g. Atlas or local service)
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    activeEngine = 'MongoDB Native / Atlas';
    console.log(`✅ MongoDB Connected successfully to URI: ${conn.connection.host}`);
    return true;
  } catch (primaryErr) {
    console.log(`ℹ️ External MongoDB not active (${primaryErr.message}).`);
    console.log(`🚀 Starting high-performance embedded MongoDB Server...`);
  }

  // 2. Launch embedded MongoMemoryServer
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create({
      instance: {
        dbName: 'chemical_plant_safety'
      }
    });

    const memoryUri = mongodInstance.getUri();
    const conn = await mongoose.connect(memoryUri);
    isConnected = true;
    activeEngine = 'Embedded MongoDB (Mongoose)';
    console.log(`✅ Standalone MongoDB Database Server running: ${memoryUri}`);
    return true;
  } catch (memErr) {
    console.warn(`⚠️ Standalone MongoDB notice: ${memErr.message}`);
  }

  // 3. Fallback to resilient JSON store if binary cannot run
  isConnected = false;
  activeEngine = 'Integrated JSON Store';
  console.log(`ℹ️ Operating with integrated JSON store.`);
  return false;
};

const getDBStatus = () => ({
  connected: isConnected,
  database: isConnected ? (mongoose.connection.name || 'chemical_plant_safety') : 'integrated-json-store',
  host: isConnected ? (mongoose.connection.host || '127.0.0.1') : 'local-memory-store',
  engine: activeEngine
});

module.exports = { connectDB, getDBStatus };

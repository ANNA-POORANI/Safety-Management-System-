# Chemical Plant Safety Management System (CPSMS)

A full-stack, enterprise-grade process safety management web application built with **React**, **Node.js**, **Express.js**, and **MongoDB**. Designed in compliance with **OSHA 29 CFR 1910.119 (Process Safety Management)** and **EPA Risk Management Plan (RMP)** standards.

---

## 🏗️ System Architecture & Technology Stack

```
   ┌──────────────────────────────────────────────────────────────┐
   │                  REACT 19 FRONTEND (Vite)                   │
   │   Tailwind CSS • Lucide Icons • React Router • Axios         │
   └──────────────────────────────┬───────────────────────────────┘
                                  │ JSON REST API
                                  ▼
   ┌──────────────────────────────────────────────────────────────┐
   │                   NODE.JS & EXPRESS BACKEND                  │
   │   JWT Auth • Bcrypt • Controllers • Models • Data Store      │
   └──────────────┬───────────────────────────────┬───────────────┘
                  │                               │
        (Connected to MongoDB)           (Offline Fallback)
                  ▼                               ▼
   ┌──────────────────────────────┐   ┌───────────────────────────┐
   │        MONGODB ATLAS         │   │   INTEGRATED PERSISTENT   │
   │       / LOCAL MONGOD         │   │      JSON STORE ENGINE    │
   └──────────────────────────────┘   └───────────────────────────┘
```

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React Icons, React Router v7, Axios.
- **Backend**: Node.js, Express.js, JSON Web Tokens (JWT), Bcrypt.js, Mongoose.
- **Database**: MongoDB (with seamless auto-fallback to an integrated JSON data store if MongoDB is not locally running, guaranteeing 100% operational readiness out of the box).

---

## ✨ Features Implemented

### 1. 🔐 Professional Login & Logout System
- Secure JWT-based authentication with bcrypt password hashing.
- Role-based profiles:
  - **Safety Manager** (`manager@plant.safe` / `password123`)
  - **Plant Operator** (`operator@plant.safe` / `password123`)
  - **Compliance Officer** (`compliance@plant.safe` / `password123`)
- One-click demo credentials cards for immediate evaluation.
- Shift assignments (Shift A Morning, Shift B Evening, Shift C Night) and departmental affiliation.
- Secure session persistence with client-side token management and protected route guards.

### 2. 📊 Modern Operations Dashboard
- **Total Chemicals** KPI tile with direct inventory shortcut.
- **High-Risk Chemicals** tile tracking Class 1 Critical & High hazard materials.
- **Pending Inspections** tile monitoring scheduled and overdue safety audits.
- **Open Incidents** tile showing active leak investigations and containment status.
- Real-time plant condition banner (`NORMAL`, `ELEVATED MONITORING`, or `CRITICAL ALERT`).
- GHS Chemical Hazard distribution analytics.
- Live Incident Watchlist & Upcoming Safety Audits feed.
- One-click Quick Safety Action Dispatch bar.

### 3. ⚗️ Chemical Inventory Management
- Full **CRUD** operations: Add, Edit, View, and Delete hazardous substances.
- Tracks: Name, Formula, CAS Registry Number, Physical State, Hazard Class (Toxic Gas, Corrosive, Flammable Liquid, Oxidizer, Explosive, Carcinogen, Water-Reactive), Risk Level (Low, Medium, High, Critical), Storage Zone, Quantity, Units, Min Threshold, Max Capacity, and Operating Notes.
- Visual **Stock Capacity Level Gauge** showing real-time utilization against safety replenishment thresholds.
- Direct Safety Data Sheet (SDS / PubChem) links.
- Real-time filtering by Hazard Class, Risk Level, and multi-field search (Name, Formula, CAS).

### 4. 📋 Safety Inspections & Audits
- Schedule and manage plant safety audits and equipment integrity reviews.
- Tracks: Title, Inspection Type (High-Hazard Audit, Equipment Integrity, Emergency Equipment, Pre-Startup Review, Routine), Plant Zone, Lead Inspector, Scheduled Date, Risk Impact Score (0–100), Findings, and Corrective Action Checklists.
- Status management: `Pending`, `In Progress`, `Completed`, `Failed`, and `Overdue`.
- Direct **Pass / Fail** compliance certification and completion logging.

### 5. ⚠️ Incident Reporting & Containment
- Rapid logging of chemical leaks, fires, toxic vapor releases, spills, and equipment failures.
- Captures: Incident Code, Classification, Severity Level (Low, Medium, High, Catastrophic), Chemical Involved, Storage Zone, Reporter, Casualties, Immediate Actions Taken, Root Cause Analysis, and Containment Duration.
- Incident lifecycle tracking: `Reported` ➔ `Under Investigation` ➔ `Contained` ➔ `Resolved` ➔ `Closed`.

### 6. 🚨 Emergency Response Command Center
- **Standard Operating Procedures (SOPs)** for major plant emergencies:
  - `SOP-EMERG-01`: Catastrophic Toxic Gas Release (Chlorine / Anhydrous Ammonia)
  - `SOP-EMERG-02`: Flammable Solvent Storage Fire & BLEVE Prevention
  - `SOP-EMERG-03`: Concentrated Acid Secondary Containment Breach
  - `SOP-EMERG-04`: Reactor Runaway Exotherm & Thermal Pressure Surge
- **1-Click Siren & Emergency Broadcast Trigger** with prominent visual pulsing banner across all control terminals.
- **Stand Down / Clear Emergency** functionality.
- Step-by-step interactive emergency sequence checklist with responsible roles.
- Surface wind speed & designated evacuation muster points (North Gate, South Gate, Bunker).
- Direct dial directory for Incident Commander, Hazmat Team, Municipal Fire Department, and CHEMTREC.

### 7. 📜 Compliance & Statutory Certifications
- Tracks statutory licenses: **OSHA 29 CFR 1910.119 (PSM)**, **EPA Risk Management Plan (RMP)**, **ISO 45001:2018**, **State Pollution Control Board**, **ASME Boiler & Pressure Vessel**, and **Municipal Fire Department NOC**.
- Real-time expiry countdowns (e.g. `Valid (847 days remaining)`, `Expiring in 22 days`, or `EXPIRED`).
- Register, renew, update audit scores (%), and attach auditor notes.

### 8. 🧭 Navigation & Industrial UX
- Sticky left sidebar with icons, active page indicators, Hazmat hotline widget, and current operator profile.
- Top header with active emergency warnings, live system clock, shift information, and sample data reset tool.
- Toast notification alerts for all create, update, and delete actions.

---

## 📂 Project Directory Structure

```
Chemical plant Safety/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & fallback detection
│   ├── controllers/
│   │   ├── authController.js       # Register, login, me, logout
│   │   ├── chemicalController.js   # Chemical CRUD
│   │   ├── inspectionController.js # Inspection CRUD & status
│   │   ├── incidentController.js   # Incident logging & containment
│   │   ├── emergencyController.js  # SOP triggers & sirens
│   │   ├── complianceController.js # Certificate tracking & renewals
│   │   └── dashboardController.js  # Telemetry KPIs & reset
│   ├── data/
│   │   ├── seedData.js             # Realistic industrial seed dataset
│   │   ├── store.js                # Dual-engine repository (Mongo + JSON)
│   │   └── db.json                 # Auto-persisted local store
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT protection & role authorization
│   ├── models/
│   │   ├── User.js                 # Mongoose User Schema
│   │   ├── Chemical.js             # Mongoose Chemical Schema
│   │   ├── Inspection.js           # Mongoose Inspection Schema
│   │   ├── Incident.js             # Mongoose Incident Schema
│   │   ├── EmergencyProtocol.js    # Mongoose Emergency Schema
│   │   └── Compliance.js           # Mongoose Compliance Schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── chemicalRoutes.js
│   │   ├── inspectionRoutes.js
│   │   ├── incidentRoutes.js
│   │   ├── emergencyRoutes.js
│   │   ├── complianceRoutes.js
│   │   └── dashboardRoutes.js
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── server.js                   # Express application entrypoint
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Common/
│   │   │   │   ├── Badge.jsx       # Risk & Status Badges
│   │   │   │   ├── Modal.jsx       # Reusable accessible dialog
│   │   │   │   ├── StatCard.jsx    # Metric KPI cards
│   │   │   │   └── Toast.jsx       # Action feedback toasts
│   │   │   └── Layout/
│   │   │       ├── Header.jsx      # Top bar with clock & alert banner
│   │   │       ├── Sidebar.jsx     # Navigation menu with icons
│   │   │       └── Layout.jsx      # Root shell
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Authentication state & fast login
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Portal login & registration
│   │   │   ├── Dashboard.jsx       # Operations center dashboard
│   │   │   ├── ChemicalManagement.jsx
│   │   │   ├── SafetyInspections.jsx
│   │   │   ├── IncidentReporting.jsx
│   │   │   ├── EmergencyResponse.jsx
│   │   │   └── ComplianceManagement.jsx
│   │   ├── services/
│   │   │   └── api.js              # Axios client with interceptors
│   │   ├── App.jsx                 # Routing configuration
│   │   ├── main.jsx
│   │   └── index.css               # Tailwind CSS v4 setup
│   ├── index.html
│   ├── package.json
│   └── vite.config.js              # Vite config with proxy to :5000
│
├── package.json                    # Root launcher scripts
└── README.md
```

---

## 🚀 Setup & How to Run the Application

### Prerequisites
- **Node.js** (v18 or higher recommended; verified with v26)
- **npm** (comes with Node.js)
- *(Optional)* **MongoDB** running locally on port 27017 or a **MongoDB Atlas URI** in `backend/.env`. (If MongoDB is not installed, the application automatically uses its integrated JSON engine so it works immediately).

---

### Step 1: Install Dependencies

From the project root folder:
```powershell
npm.cmd run install:all
```
*(Or install inside each folder individually)*:
```powershell
# In backend
cd backend
npm.cmd install

# In frontend
cd ../frontend
npm.cmd install
```

---

### Step 2: Configure Environment Variables

The backend already includes a pre-configured `.env` file at `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/chemical_plant_safety
JWT_SECRET=super_secure_chemical_plant_safety_jwt_secret_key_2026
NODE_ENV=development
```
*Note: If using MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.*

---

### Step 3: Run the Application

You can start the Backend and Frontend in two separate terminal windows:

#### Terminal 1: Start Backend API
```powershell
cd backend
npm.cmd start
```
*Backend runs at: `http://localhost:5000`*

#### Terminal 2: Start Frontend Application
```powershell
cd frontend
npm.cmd run dev
```
*Frontend runs at: `http://localhost:5173`*

---

## 🔑 Pre-Configured Demo Credentials

Click any of the **One-Click Demo Role** buttons on the login screen, or type:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Safety Manager** | `manager@plant.safe` | `password123` | Full plant administrative & emergency authority |
| **Plant Operator** | `operator@plant.safe` | `password123` | Chemical logging, inspections, incident reporting |
| **Compliance Officer**| `compliance@plant.safe` | `password123` | Regulatory audit, compliance certification tracking |

You can also use the **"Register Operator"** tab to create custom accounts.

---

## 🛠️ Testing & Verification Walkthrough

1. **Login**: Go to `http://localhost:5173`, select **Dr. Marcus Vance (Safety Manager)**, and click **Sign In**.
2. **Dashboard Overview**: Check the 4 core KPI cards:
   - *Total Chemicals (9)*
   - *High-Risk Chemicals (6)*
   - *Pending Inspections (3)*
   - *Open Incidents (2)*
3. **Chemical Inventory**:
   - Navigate to **Chemical Inventory**.
   - Search for `Chlorine` or filter by `Toxic Gas`.
   - Click **Add New Chemical**, enter chemical specs (e.g., *Phosphoric Acid*), and click **Add Chemical**.
   - Click the **Edit** icon to modify quantity or the **View** icon to inspect its SDS.
4. **Safety Inspections**:
   - Navigate to **Safety Inspections**.
   - Click **Schedule New Inspection** to log an upcoming relief valve test.
   - Click **Mark Completed** or edit an existing inspection to record findings and certify a Pass/Fail status.
5. **Incident Reporting**:
   - Navigate to **Incident Reporting**.
   - Click **Report Safety Incident** to log a simulated flange drip or vapor leak.
   - Click **Update Investigation** to add root cause analysis and mark containment.
6. **Emergency Response**:
   - Navigate to **Emergency Response**.
   - Click **TRIGGER EMERGENCY SIREN** on `SOP-EMERG-01` (Toxic Vapor Release).
   - Notice the system-wide pulsating red alert banner in the header across all pages!
   - Review the emergency action steps and muster points.
   - Click **Stand Down / All Clear** to return the plant to normal standby.
7. **Compliance & Audits**:
   - Navigate to **Compliance & Audits**.
   - Check the expiry countdown tags (`Valid`, `Expiring in 22 days`, `EXPIRED`).
   - Click **Register New Certificate** or **Renew / Edit** to update dates.
8. **Reset Seed Data**:
   - At any time, click the **Reset Seed** button in the top navigation bar to restore the factory demo dataset.

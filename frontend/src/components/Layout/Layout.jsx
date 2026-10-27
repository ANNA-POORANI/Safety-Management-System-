import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { emergencyAPI } from '../../services/api';
import { Toast } from '../Common/Toast';

export const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [toast, setToast] = useState(null);

  // Poll for active emergency protocols every 10 seconds or fetch on load
  const checkEmergencies = async () => {
    try {
      const res = await emergencyAPI.getProtocols();
      if (res.data.success && res.data.data) {
        const active = res.data.data.find((p) => p.isActive);
        setActiveEmergency(active || null);
      }
    } catch (e) {
      // Backend maybe loading
    }
  };

  useEffect(() => {
    checkEmergencies();
    const interval = setInterval(checkEmergencies, 8000);
    return () => clearInterval(interval);
  }, []);

  const triggerToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header
          setIsSidebarOpen={setIsSidebarOpen}
          activeEmergency={activeEmergency}
          onDataReset={checkEmergencies}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ triggerToast, activeEmergency, checkEmergencies }} />
        </main>

        {/* Global Toast */}
        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    </div>
  );
};

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import LiveTrackerModal from '../modals/LiveTrackerModal';
import VehicleModal from '../modals/VehicleModal';

export default function ClientLayout() {
  return (
    <div className="client-layout-root">
      <Navbar />
      <main className="client-main-content">
        <Outlet />
      </main>
      <Footer />

      {/* Skyscanner-style Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Global Modals */}
      <LiveTrackerModal />
      <VehicleModal />
    </div>
  );
}

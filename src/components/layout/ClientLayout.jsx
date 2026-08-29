import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import LiveTrackerModal from '../modals/LiveTrackerModal';
import VehicleModal from '../modals/VehicleModal';

export default function ClientLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fcfcfd' }}>
      <Navbar />
      <main style={{ flex: 1, paddingTop: '74px', width: '100%' }}>
        <Outlet />
      </main>
      <Footer />

      {/* Global Modals */}
      <LiveTrackerModal />
      <VehicleModal />
    </div>
  );
}

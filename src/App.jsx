import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BookingProvider } from './context/BookingContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RouteLoader from './components/common/RouteLoader';

// Herkese açık sayfalar — ana bundle'da kalır
import ClientLayout from './components/layout/ClientLayout';
import HomePage from './components/pages/HomePage';
import FleetPage from './components/pages/FleetPage';
import RoutesPage from './components/pages/RoutesPage';
import ServicesPage from './components/pages/ServicesPage';
import CorporatePage from './components/pages/CorporatePage';
import FaqPage from './components/pages/FaqPage';
import TrackingPage from './components/pages/TrackingPage';
import AuthPage from './components/auth/AuthPage';
import BookingWizardLayout from './components/booking/BookingWizardLayout';
import BookingWizardGuard from './components/booking/BookingWizardGuard';
import Step1Vehicles from './components/booking/Step1Vehicles';
import Step2Amenities from './components/booking/Step2Amenities';
import Step3Passenger from './components/booking/Step3Passenger';
import Step4BoardingPass from './components/booking/Step4BoardingPass';

// Korunan alanlar — sadece ilgili route açılınca indirilir (ayrı hash'li chunk)
const BookingDetailPage = lazy(() => import('./components/pages/BookingDetailPage'));
const DriverPortal = lazy(() => import('./components/driver/DriverPortal'));
const CustomerPortal = lazy(() => import('./components/customer/CustomerPortal'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const AdminBookings = lazy(() => import('./components/admin/AdminBookings'));
const AdminDrivers = lazy(() => import('./components/admin/AdminDrivers'));
const AdminFleet = lazy(() => import('./components/admin/AdminFleet'));
const AdminRoutes = lazy(() => import('./components/admin/AdminRoutes'));
const AdminAmenities = lazy(() => import('./components/admin/AdminAmenities'));
const AdminFaqs = lazy(() => import('./components/admin/AdminFaqs'));
const AdminLiveMap = lazy(() => import('./components/admin/AdminLiveMap'));
const AdminCorporate = lazy(() => import('./components/admin/AdminCorporate'));
const AdminDriverReviews = lazy(() => import('./components/admin/AdminDriverReviews'));

function withSuspense(Component, label) {
  return (
    <Suspense fallback={<RouteLoader label={label} />}>
      <Component />
    </Suspense>
  );
}

export default function App() {
  return (
    <BookingProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />

          <Route
            path="/account"
            element={
              <ProtectedRoute roles={['customer', 'admin']}>
                <ClientLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={withSuspense(CustomerPortal, 'Hesabınız yükleniyor...')} />
            <Route path="bookings" element={withSuspense(CustomerPortal, 'Hesabınız yükleniyor...')} />
            <Route
              path="rezervasyon/:code"
              element={withSuspense(BookingDetailPage, 'Rezervasyon yükleniyor...')}
            />
          </Route>

          <Route
            path="/driver"
            element={
              <ProtectedRoute roles={['driver', 'admin']}>
                {withSuspense(DriverPortal, 'Şoför paneli yükleniyor...')}
              </ProtectedRoute>
            }
          />
          <Route path="/drivers" element={<Navigate to="/driver" replace />} />
          <Route
            path="/driver/rezervasyon/:code"
            element={
              <ProtectedRoute roles={['driver', 'admin']}>
                {withSuspense(BookingDetailPage, 'Görev detayı yükleniyor...')}
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                {withSuspense(AdminLayout, 'Yönetim paneli yükleniyor...')}
              </ProtectedRoute>
            }
          >
            <Route index element={withSuspense(AdminDashboard)} />
            <Route path="reservations" element={withSuspense(AdminBookings)} />
            <Route path="bookings" element={withSuspense(AdminBookings)} />
            <Route
              path="reservations/:code"
              element={withSuspense(BookingDetailPage, 'Rezervasyon yükleniyor...')}
            />
            <Route path="drivers" element={withSuspense(AdminDrivers)} />
            <Route path="driver-reviews" element={withSuspense(AdminDriverReviews)} />
            <Route path="fleet" element={withSuspense(AdminFleet)} />
            <Route path="routes" element={withSuspense(AdminRoutes)} />
            <Route path="amenities" element={withSuspense(AdminAmenities)} />
            <Route path="faqs" element={withSuspense(AdminFaqs)} />
            <Route path="corporate" element={withSuspense(AdminCorporate)} />
            <Route path="livemap" element={withSuspense(AdminLiveMap)} />
          </Route>

          <Route path="/" element={<ClientLayout />}>
            <Route index element={<HomePage />} />
            <Route path="filo" element={<FleetPage />} />
            <Route path="fleet" element={<FleetPage />} />
            <Route path="rotalar" element={<RoutesPage />} />
            <Route path="routes" element={<RoutesPage />} />
            <Route path="hizmetler" element={<ServicesPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="kurumsal" element={<CorporatePage />} />
            <Route path="corporate" element={<CorporatePage />} />
            <Route path="sss" element={<FaqPage />} />
            <Route path="faqs" element={<FaqPage />} />
            <Route path="takip" element={<TrackingPage />} />
            <Route path="tracking" element={<TrackingPage />} />

            <Route path="rezervasyon" element={<BookingWizardLayout />}>
              <Route index element={<Navigate to="vehicle-select" replace />} />
              <Route path="vehicle-select" element={<BookingWizardGuard step="vehicle"><Step1Vehicles /></BookingWizardGuard>} />
              <Route path="arac-secimi" element={<Navigate to="/rezervasyon/vehicle-select" replace />} />
              <Route path="amenities" element={<BookingWizardGuard step="amenities"><Step2Amenities /></BookingWizardGuard>} />
              <Route path="ozellikler" element={<Navigate to="/rezervasyon/amenities" replace />} />
              <Route path="passenger-info" element={<BookingWizardGuard step="passenger"><Step3Passenger /></BookingWizardGuard>} />
              <Route path="yolcu-bilgileri" element={<Navigate to="/rezervasyon/passenger-info" replace />} />
              <Route path="confirmation" element={<BookingWizardGuard step="confirmation"><Step4BoardingPass /></BookingWizardGuard>} />
              <Route path="onay" element={<Navigate to="/rezervasyon/confirmation" replace />} />
            </Route>

            <Route
              path="rezervasyon/:code"
              element={withSuspense(BookingDetailPage, 'Rezervasyon yükleniyor...')}
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </BookingProvider>
  );
}

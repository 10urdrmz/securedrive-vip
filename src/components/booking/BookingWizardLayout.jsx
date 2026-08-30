import React, { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import RouteMapSidebar from './RouteMapSidebar';
import {
  BOOKING_WIZARD_PATHS,
  getWizardStepFromPath
} from '../../lib/bookingWizard';
import { useBooking } from '../../context/BookingContext';
import { ChevronLeft, Check, Sparkles, MapPin, Calendar, Users, Plane, Hotel } from 'lucide-react';

const STEPS = [
  { key: 'vehicle', path: BOOKING_WIZARD_PATHS.vehicle, label: 'Araç', order: 1 },
  { key: 'amenities', path: BOOKING_WIZARD_PATHS.amenities, label: 'Donanım', order: 2 },
  { key: 'passenger', path: BOOKING_WIZARD_PATHS.passenger, label: 'Yolcu & Ödeme', order: 3 },
  { key: 'confirmation', path: BOOKING_WIZARD_PATHS.confirmation, label: 'Voucher', order: 4 }
];

export default function BookingWizardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pickup, destination, datetime, pax, confirmedBooking } = useBooking();
  const currentStepKey = getWizardStepFromPath(location.pathname);
  const currentStep = STEPS.find((step) => step.key === currentStepKey) || STEPS[0];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleBack = () => {
    if (currentStep.order === 1) {
      navigate('/');
    } else if (currentStep.order === 2) {
      navigate(BOOKING_WIZARD_PATHS.vehicle);
    } else if (currentStep.order === 3) {
      navigate(BOOKING_WIZARD_PATHS.amenities);
    } else {
      navigate('/');
    }
  };

  const formattedDate = datetime ? new Date(datetime).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'Tarih Belirlendi';

  return (
    <section className="sky-wizard-section" id="booking-flow-section">
      <div className="sky-wizard-container">
        
        {/* Skyscanner Top Sticky Bar */}
        <div className="sky-wizard-topbar">
          <div className="sky-wizard-topbar__main">
            <button
              type="button"
              className="sky-wizard-back-btn"
              onClick={handleBack}
              title="Geri"
            >
              <ChevronLeft size={22} />
            </button>

            <div className="sky-wizard-route-info">
              <div className="sky-wizard-route-title">
                <span>{pickup?.name?.split('(')[0]?.trim() || 'Kalkış'}</span>
                <span className="sky-wizard-arrow">➔</span>
                <span>{destination?.name?.split('(')[0]?.trim() || 'Varış'}</span>
              </div>
              <div className="sky-wizard-route-meta">
                <span>{formattedDate}</span>
                <span>·</span>
                <span>{pax || 2} Yolcu</span>
              </div>
            </div>
          </div>

          {/* Stepper Dots / Pills */}
          <div className="sky-wizard-steps">
            {STEPS.map((step) => {
              const isActive = step.key === currentStepKey;
              const isCompleted = step.order < currentStep.order;

              return (
                <div
                  key={step.key}
                  className={`sky-wizard-step-pill ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                >
                  <span className="sky-step-num">
                    {isCompleted ? <Check size={11} strokeWidth={3} /> : step.order}
                  </span>
                  <span className="sky-step-label">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Grid: Form Steps + Dark Radar Map Sidebar */}
        <div className="sky-wizard-grid">
          <div className="sky-wizard-main-content">
            <Outlet />
          </div>
          <aside className="sky-wizard-sidebar">
            <RouteMapSidebar />
          </aside>
        </div>
      </div>
    </section>
  );
}

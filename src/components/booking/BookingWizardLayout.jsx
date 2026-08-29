import React, { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import RouteMapSidebar from './RouteMapSidebar';
import {
  BOOKING_WIZARD_PATHS,
  getWizardStepFromPath
} from '../../lib/bookingWizard';
import { useBooking } from '../../context/BookingContext';

const STEPS = [
  { key: 'vehicle', path: BOOKING_WIZARD_PATHS.vehicle, label: 'Araç Seçimi', order: 1 },
  { key: 'amenities', path: BOOKING_WIZARD_PATHS.amenities, label: 'Donanım & Özellikler', order: 2 },
  { key: 'passenger', path: BOOKING_WIZARD_PATHS.passenger, label: 'Yolcu & Ödeme', order: 3 },
  { key: 'confirmation', path: BOOKING_WIZARD_PATHS.confirmation, label: 'Tahsis Onayı', order: 4 }
];

function getStepState(stepOrder, currentOrder, currentStepKey, stepKey) {
  if (stepKey === currentStepKey) return 'active';
  if (stepOrder < currentOrder) return 'completed';
  if (stepKey === 'confirmation') return 'locked';
  return 'upcoming';
}

export default function BookingWizardLayout() {
  const location = useLocation();
  const { pickup, destination, confirmedBooking } = useBooking();
  const currentStepKey = getWizardStepFromPath(location.pathname);
  const currentStep = STEPS.find((step) => step.key === currentStepKey) || STEPS[0];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <section className="booking-flow-section active" id="booking-flow-section">
      <div className="container">
        <div className="steps-nav-card">
          <div className="steps-list">
            {STEPS.map((step, index) => {
              const state = getStepState(step.order, currentStep.order, currentStepKey, step.key);
              const canNavigate = state === 'completed' && step.key !== 'confirmation';
              const isConfirmationLocked = step.key === 'confirmation' && !confirmedBooking?.code;

              return (
                <React.Fragment key={step.key}>
                  {index > 0 && <span style={{ color: 'var(--border-strong)' }}>/</span>}
                  {canNavigate && !isConfirmationLocked ? (
                    <Link
                      to={step.path}
                      className={`step-item ${state === 'active' ? 'active' : state === 'completed' ? 'completed' : ''}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div className="step-badge">{state === 'completed' ? '✓' : step.order}</div>
                      <span>{step.label}</span>
                    </Link>
                  ) : (
                    <div className={`step-item ${state === 'active' ? 'active' : state === 'completed' ? 'completed' : ''}`}>
                      <div className="step-badge">{state === 'completed' ? '✓' : step.order}</div>
                      <span>{step.label}</span>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
            {pickup?.name?.split('(')[0]?.trim()} ➔ {destination?.name?.split('(')[0]?.trim()}
          </div>
        </div>

        <div className="flow-grid">
          <div>
            <Outlet />
          </div>
          <RouteMapSidebar />
        </div>
      </div>
    </section>
  );
}

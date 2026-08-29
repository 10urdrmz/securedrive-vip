import React from 'react';
import { useBooking } from '../../context/BookingContext';
import Step1Vehicles from './Step1Vehicles';
import Step2Amenities from './Step2Amenities';
import Step3Passenger from './Step3Passenger';
import Step4BoardingPass from './Step4BoardingPass';
import RouteMapSidebar from './RouteMapSidebar';

export default function BookingFlow() {
  const { currentStep, setCurrentStep, isFlowActive, pickup, destination } = useBooking();

  if (!isFlowActive) return null;

  return (
    <section className="booking-flow-section active" id="booking-flow-section">
      <div className="container">
        
        {/* Step Indicator Header Card */}
        <div className="steps-nav-card">
          <div className="steps-list">
            
            {/* Step 1 */}
            <div 
              className={`step-item ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}
              onClick={() => setCurrentStep(1)}
            >
              <div className="step-badge">{currentStep > 1 ? '✓' : '1'}</div>
              <span>Araç Seçimi</span>
            </div>
            <span style={{ color: 'var(--border-strong)' }}>/</span>

            {/* Step 2 */}
            <div 
              className={`step-item ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}
              onClick={() => currentStep >= 2 && setCurrentStep(2)}
            >
              <div className="step-badge">{currentStep > 2 ? '✓' : '2'}</div>
              <span>Donanım & Özellikler</span>
            </div>
            <span style={{ color: 'var(--border-strong)' }}>/</span>

            {/* Step 3 */}
            <div 
              className={`step-item ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : ''}`}
              onClick={() => currentStep >= 3 && setCurrentStep(3)}
            >
              <div className="step-badge">{currentStep > 3 ? '✓' : '3'}</div>
              <span>Yolcu & Ödeme</span>
            </div>
            <span style={{ color: 'var(--border-strong)' }}>/</span>

            {/* Step 4 */}
            <div 
              className={`step-item ${currentStep === 4 ? 'active' : ''}`}
            >
              <div className="step-badge">4</div>
              <span>Tahsis Onayı & Kupon</span>
            </div>

          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
            {pickup?.name?.split('(')[0]?.trim()} ➔ {destination?.name?.split('(')[0]?.trim()}
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="flow-grid">
          <div>
            {currentStep === 1 && <Step1Vehicles />}
            {currentStep === 2 && <Step2Amenities />}
            {currentStep === 3 && <Step3Passenger />}
            {currentStep === 4 && <Step4BoardingPass />}
          </div>

          <RouteMapSidebar />
        </div>

      </div>
    </section>
  );
}

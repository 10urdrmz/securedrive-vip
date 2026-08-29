import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import {
  BOOKING_WIZARD_PATHS,
  getConfirmationPath,
  getSubmittedBookingByCode,
  hasSelectedVehicle,
  hasValidSearchDraft,
  loadSubmittedBookingRecord
} from '../../lib/bookingWizard';

export default function BookingWizardGuard({ step, children }) {
  const location = useLocation();
  const {
    pickup,
    destination,
    datetime,
    fleet,
    selectedVehicleId,
    confirmedBooking,
    setIsFlowActive,
    setConfirmedBooking
  } = useBooking();

  const submittedRecord = loadSubmittedBookingRecord();
  const confirmationCode = new URLSearchParams(location.search).get('code');
  const submittedByCode = confirmationCode ? getSubmittedBookingByCode(confirmationCode) : null;

  useEffect(() => {
    if (submittedByCode && !confirmedBooking?.code) {
      setConfirmedBooking(submittedByCode);
    }
  }, [submittedByCode, confirmedBooking, setConfirmedBooking]);

  useEffect(() => {
    setIsFlowActive(true);
    return () => {
      if (!location.pathname.startsWith('/rezervasyon/')) {
        setIsFlowActive(false);
      }
    };
  }, [location.pathname, setIsFlowActive]);

  if (step === 'vehicle' && !hasValidSearchDraft({ pickup, destination, datetime })) {
    return <Navigate to="/?booking=search" replace />;
  }

  if ((step === 'amenities' || step === 'passenger') && !hasSelectedVehicle(selectedVehicleId, fleet)) {
    return <Navigate to={BOOKING_WIZARD_PATHS.vehicle} replace />;
  }

  if (step === 'passenger' && submittedRecord?.booking?.code) {
    return <Navigate to={getConfirmationPath(submittedRecord.booking.code)} replace />;
  }

  if (step === 'confirmation') {
    const bookingCode = confirmedBooking?.code || submittedByCode?.code || location.state?.booking?.code;
    if (!bookingCode) {
      return <Navigate to={BOOKING_WIZARD_PATHS.vehicle} replace />;
    }

    if (!confirmationCode && bookingCode) {
      return <Navigate to={getConfirmationPath(bookingCode)} replace />;
    }
  }

  return children;
}

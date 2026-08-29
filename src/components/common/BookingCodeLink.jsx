import React from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../../lib/auth';
import { getBookingDetailPath } from '../../lib/bookingAccess';

export default function BookingCodeLink({ code, className = '', style = {}, onClick }) {
  if (!code) return null;

  const user = getCurrentUser();
  const to = getBookingDetailPath(code, user);

  return (
    <Link
      to={to}
      className={`booking-code-link mono ${className}`.trim()}
      style={{
        fontWeight: 700,
        color: '#2563eb',
        textDecoration: 'none',
        ...style
      }}
      onClick={onClick}
      title="Rezervasyon detayını aç"
    >
      {code}
    </Link>
  );
}

import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import HeroBookingWidget from '../booking/HeroBookingWidget';
import FleetShowcase from '../showcase/FleetShowcase';
import PopularRoutes from '../showcase/PopularRoutes';
import ServicesSection from '../showcase/ServicesSection';
import CorporateSection from '../showcase/CorporateSection';
import FaqSection from '../showcase/FaqSection';

export default function HomePage() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('booking') !== 'search') return;

    const timer = window.setTimeout(() => {
      document.getElementById('booking-widget')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [searchParams]);

  return (
    <>
      <HeroBookingWidget />
      <FleetShowcase />
      <PopularRoutes />
      <ServicesSection />
      <CorporateSection />
      <FaqSection />
    </>
  );
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AIRPORTS as DEFAULT_AIRPORTS, DESTINATIONS as DEFAULT_DESTINATIONS, FLEET as DEFAULT_FLEET, AMENITIES as DEFAULT_AMENITIES, CURRENCIES } from '../data/mockData';
import { fetchFleetFromDb, fetchAmenitiesFromDb, fetchAirportsFromDb, fetchDestinationsFromDb, fetchRoutesFromDb } from '../lib/dbService';
import { findLocationByLabel, matchesLocation } from '../lib/routeLocation';
import {
  BOOKING_WIZARD_PATHS,
  beginSubmitLock,
  buildBookingFingerprint,
  clearBookingDraft,
  clearSubmittedBooking,
  getSubmittedBookingByFingerprint,
  hasValidSearchDraft,
  loadBookingDraft,
  markSubmittedBooking,
  releaseSubmitLock,
  saveBookingDraft
} from '../lib/bookingWizard';
import { createBookingInSupabase, getBookingByCodeFromSupabase } from '../lib/supabase';

import { getCurrentUser } from '../lib/auth';
import { getStatusLabel } from '../lib/bookingStatus';
import { notifyBookingCreated } from '../lib/notificationService';
import {
  saveBookingForUser,
  getLocalBookingsForUser,
  bookingBelongsToUser,
  mergeBookingsByCode
} from '../lib/bookingStorage';

export const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  // Dynamic datasets from Supabase
  const [airports, setAirports] = useState(DEFAULT_AIRPORTS);
  const [destinations, setDestinations] = useState(DEFAULT_DESTINATIONS);
  const [fleet, setFleet] = useState(DEFAULT_FLEET);
  const [amenitiesList, setAmenitiesList] = useState(DEFAULT_AMENITIES);
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [activeRoute, setActiveRoute] = useState(null);
  const [draftHydrated, setDraftHydrated] = useState(false);

  // Load from Supabase on mount
  useEffect(() => {
    async function loadDbData() {
      try {
        const [f, a, air, dest, routes] = await Promise.all([
          fetchFleetFromDb(),
          fetchAmenitiesFromDb(),
          fetchAirportsFromDb(),
          fetchDestinationsFromDb(),
          fetchRoutesFromDb()
        ]);
        if (f && f.length > 0) setFleet(f);
        if (a && a.length > 0) setAmenitiesList(a);
        if (air && air.length > 0) setAirports(air);
        if (dest && dest.length > 0) setDestinations(dest);
        if (routes && routes.length > 0) setPopularRoutes(routes);
      } catch (e) {
        console.warn('DB load notice:', e);
      }
    }
    loadDbData();
  }, []);

  // Navigation & Step State
  const [currentStep, setCurrentStep] = useState(1);
  const [isFlowActive, setIsFlowActive] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [selectedVehicleModal, setSelectedVehicleModal] = useState(null);

  // Localization & Currency
  const [currency, setCurrency] = useState('TRY');
  const [language, setLanguage] = useState('TR');

  // Booking Parameters
  const [serviceType, setServiceType] = useState('transfer'); // 'transfer', 'hourly', 'intercity'
  const [tripType, setTripType] = useState('oneway'); // 'oneway', 'roundtrip'

  const [pickup, setPickup] = useState(DEFAULT_AIRPORTS[0]); // Istanbul Airport IST
  const [destination, setDestination] = useState(DEFAULT_DESTINATIONS[0]); // Çırağan Palace

  useEffect(() => {
    if (!pickup || !destination || popularRoutes.length === 0) {
      setActiveRoute(null);
      return;
    }

    const matched = popularRoutes.find(
      (route) => matchesLocation(route.from, pickup) && matchesLocation(route.to, destination)
    );
    setActiveRoute(matched || null);
  }, [pickup, destination, popularRoutes]);
  
  const [datetime, setDatetime] = useState(() => {
    const now = new Date();
    now.setHours(now.getHours() + 2, 0, 0, 0);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });

  const [pax, setPax] = useState(2);
  const [luggage, setLuggage] = useState(2);
  const [flightNo, setFlightNo] = useState('TK 1984');

  // Fleet & Amenities Selection
  const [selectedVehicleId, setSelectedVehicleId] = useState('vito-vip');
  const [selectedAmenities, setSelectedAmenities] = useState({
    'baby-seat': { selected: false, count: 0 },
    'vip-meet-greet': { selected: true },
    'flight-tracking-guarantee': { selected: true },
    'wifi-multimedia': { selected: true },
    'minibar-premium': { selected: false },
    'starlight-ceiling': { selected: false },
    'multilingual-chauffeur': { selected: false, lang: 'İngilizce (English)' },
    'privacy-partition': { selected: false }
  });

  // Passenger Info
  const [passenger, setPassenger] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    notes: '',
    paymentMethod: 'credit-card'
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) return;
    const parts = (user.full_name || '').trim().split(/\s+/);
    setPassenger((prev) => ({
      ...prev,
      name: parts[0] || prev.name,
      surname: parts.slice(1).join(' ') || prev.surname,
      email: user.email || prev.email,
      phone: user.phone || prev.phone
    }));
  }, []);

  useEffect(() => {
    if (draftHydrated || airports.length === 0 || destinations.length === 0) return;

    const draft = loadBookingDraft();
    if (!draft) {
      setDraftHydrated(true);
      return;
    }

    if (draft.pickupId) {
      const pickupMatch = airports.find((item) => item.id === draft.pickupId);
      if (pickupMatch) setPickup(pickupMatch);
    }

    if (draft.destinationId) {
      const destinationMatch = destinations.find((item) => item.id === draft.destinationId);
      if (destinationMatch) setDestination(destinationMatch);
    }

    if (draft.datetime) setDatetime(draft.datetime);
    if (draft.pax) setPax(draft.pax);
    if (draft.luggage) setLuggage(draft.luggage);
    if (draft.flightNo) setFlightNo(draft.flightNo);
    if (draft.serviceType) setServiceType(draft.serviceType);
    if (draft.tripType) setTripType(draft.tripType);
    if (draft.selectedVehicleId) setSelectedVehicleId(draft.selectedVehicleId);
    if (draft.selectedAmenities) setSelectedAmenities(draft.selectedAmenities);
    if (draft.passenger) setPassenger((prev) => ({ ...prev, ...draft.passenger }));

    setDraftHydrated(true);
  }, [airports, destinations, draftHydrated]);

  useEffect(() => {
    if (!draftHydrated) return;

    saveBookingDraft({
      pickupId: pickup?.id,
      destinationId: destination?.id,
      datetime,
      pax,
      luggage,
      flightNo,
      serviceType,
      tripType,
      selectedVehicleId,
      selectedAmenities,
      passenger,
      activeRouteId: activeRoute?.id || null
    });
  }, [
    draftHydrated,
    pickup,
    destination,
    datetime,
    pax,
    luggage,
    flightNo,
    serviceType,
    tripType,
    selectedVehicleId,
    selectedAmenities,
    passenger,
    activeRoute
  ]);

  // Confirmed booking state
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Dynamic Distance & Duration calculation
  const calculateDistance = () => {
    if (!pickup?.coords || !destination?.coords) return { km: 42, min: 45 };
    const [lat1, lon1] = pickup.coords;
    const [lat2, lon2] = destination.coords;
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightDist = R * c;
    const roadDist = Math.max(15, Math.round(straightDist * 1.35));
    const durMin = Math.max(20, Math.round(roadDist * 1.1 + 10));
    return { km: roadDist, min: durMin };
  };

  const routeMetrics = activeRoute
    ? { km: activeRoute.distanceKm, min: activeRoute.durationMin }
    : calculateDistance();
  const distanceKm = routeMetrics.km;
  const durationMin = routeMetrics.min;

  // Dynamic Price Calculator
  const calculateVehiclePrice = (vehicleId) => {
    const v = fleet.find(item => item.id === vehicleId) || fleet[0];
    if (!v) return 1500;
    let base = v.baseOpeningRate + (distanceKm * v.baseRateKm);
    
    // Amenities surcharge
    let amenitiesTotal = 0;
    Object.entries(selectedAmenities).forEach(([amenityId, val]) => {
      if (val.selected) {
        const item = amenitiesList.find(a => a.id === amenityId);
        if (item && !item.isFree) {
          if (item.hasCount && val.count > 0) {
            amenitiesTotal += item.priceTRY * val.count;
          } else if (!item.hasCount) {
            amenitiesTotal += item.priceTRY;
          }
        }
      }
    });

    let total = base + amenitiesTotal;
    if (tripType === 'roundtrip') {
      total = total * 1.85; // 15% roundtrip discount
    }
    return Math.round(total);
  };

  const currentPriceTRY = calculateVehiclePrice(selectedVehicleId);

  // Format currency
  const formatPrice = (priceTRY) => {
    const cur = CURRENCIES[currency] || CURRENCIES.TRY;
    const converted = (Number(priceTRY) || 0) * cur.rate;
    if (currency === 'TRY') {
      return `${Math.round(converted).toLocaleString('tr-TR')} ₺`;
    }
    return `${cur.symbol}${converted.toFixed(2)}`;
  };

  const formatMoney = formatPrice;

  const calculatePrices = () => {
    const v = fleet.find(item => item.id === selectedVehicleId) || fleet[0];
    const rawBase = v ? (v.baseOpeningRate + (distanceKm * v.baseRateKm)) : 1500;
    const baseFare = tripType === 'roundtrip' ? Math.round(rawBase * 2) : Math.round(rawBase);
    
    let amenitiesTotal = 0;
    Object.entries(selectedAmenities).forEach(([amenityId, val]) => {
      if (val.selected) {
        const item = amenitiesList.find(a => a.id === amenityId);
        if (item && !item.isFree) {
          if (item.hasCount && val.count > 0) {
            amenitiesTotal += item.priceTRY * val.count;
          } else if (!item.hasCount) {
            amenitiesTotal += item.priceTRY;
          }
        }
      }
    });

    const discountTRY = tripType === 'roundtrip' ? Math.round(rawBase * 0.15) : 0;
    const grandTotalTRY = currentPriceTRY;

    return {
      base: baseFare,
      totalBaseTRY: baseFare,
      amenities: Math.round(amenitiesTotal),
      amenitiesPriceTRY: Math.round(amenitiesTotal),
      discountTRY,
      total: grandTotalTRY,
      grandTotalTRY
    };
  };

  // Amenities toggler
  const toggleAmenity = (id) => {
    setSelectedAmenities(prev => {
      const current = prev[id] || { selected: false, count: 0 };
      const nextSelected = !current.selected;
      return {
        ...prev,
        [id]: {
          ...current,
          selected: nextSelected,
          count: nextSelected && current.count === 0 ? 1 : (nextSelected ? current.count : 0)
        }
      };
    });
  };

  const setAmenityCount = (id, count) => {
    setSelectedAmenities(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        selected: count > 0,
        count: Math.max(0, count)
      }
    }));
  };

  const updateAmenityCount = setAmenityCount;

  const setAmenityOption = (id, option) => {
    setSelectedAmenities(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        selected: true,
        lang: option
      }
    }));
  };

  // Submit and Sync to Supabase
  const submitBooking = async () => {
    const fingerprint = buildBookingFingerprint({
      pickupId: pickup?.id,
      destinationId: destination?.id,
      datetime,
      selectedVehicleId,
      tripType,
      serviceType,
      pax,
      luggage,
      flightNo,
      selectedAmenities,
      passenger
    });

    const existingBooking = getSubmittedBookingByFingerprint(fingerprint);
    if (existingBooking?.code) {
      setConfirmedBooking(existingBooking);
      return existingBooking;
    }

    if (!beginSubmitLock(fingerprint)) {
      const lockedBooking = getSubmittedBookingByFingerprint(fingerprint);
      if (lockedBooking?.code) {
        setConfirmedBooking(lockedBooking);
        return lockedBooking;
      }
      return null;
    }

    const selectedVehicle = fleet.find(v => v.id === selectedVehicleId) || fleet[0];
    const code = 'SDRV-2026-' + Math.floor(1000 + Math.random() * 9000);
    const currentUser = getCurrentUser();
    const bookingPayload = {
      code,
      status: getStatusLabel(1),
      status_step: 1,
      passenger_name: `${passenger.name} ${passenger.surname}`.trim(),
      passenger_phone: passenger.phone,
      passenger_email: (currentUser?.email || passenger.email || '').trim().toLowerCase(),
      passenger_notes: passenger.notes || '',
      flight_no: flightNo || '',
      pickup_location: pickup?.name || '',
      destination_location: destination?.name || '',
      service_type: serviceType,
      trip_type: tripType,
      transfer_datetime: new Date(datetime).toISOString(),
      pax_count: pax,
      luggage_count: luggage,
      vehicle_id: selectedVehicle.id,
      vehicle_name: selectedVehicle.name,
      vehicle_plate: '',
      chauffeur_name: 'Atanacak VIP Şoför',
      chauffeur_phone: '',
      chauffeur_photo: '',
      amenities: Object.entries(selectedAmenities)
        .filter(([id, val]) => val.selected && amenitiesList.some((a) => a.id === id))
        .map(([id]) => {
          const am = amenitiesList.find(a => a.id === id);
          return am ? am.title : id;
        }),
      total_price_try: currentPriceTRY,
      currency,
      payment_method: passenger.paymentMethod === 'credit-card' ? '3D Secure Online Kredi Kartı' : 'Araçta Ödeme',
      payment_status: passenger.paymentMethod === 'credit-card' ? 'completed' : 'pending'
    };

    try {
      const result = await createBookingInSupabase(bookingPayload);
      const savedBooking = result?.data || bookingPayload;
      setConfirmedBooking(savedBooking);
      const bookingOwner = currentUser || {
        email: savedBooking.passenger_email,
        phone: savedBooking.passenger_phone,
        full_name: savedBooking.passenger_name
      };
      saveBookingForUser(bookingOwner, savedBooking);
      notifyBookingCreated(savedBooking).catch((e) => console.warn('Notification notice:', e));
      clearBookingDraft();
      markSubmittedBooking(savedBooking, fingerprint);
      return savedBooking;
    } catch (err) {
      console.warn('Supabase save error:', err);
      setConfirmedBooking(bookingPayload);
      const bookingOwner = currentUser || {
        email: bookingPayload.passenger_email,
        phone: bookingPayload.passenger_phone,
        full_name: bookingPayload.passenger_name
      };
      saveBookingForUser(bookingOwner, bookingPayload);
      notifyBookingCreated(bookingPayload).catch((e) => console.warn('Notification notice:', e));
      clearBookingDraft();
      markSubmittedBooking(bookingPayload, fingerprint);
      return bookingPayload;
    } finally {
      releaseSubmitLock(fingerprint);
    }
  };

  const completeReservation = submitBooking;

  const swapLocations = () => {
    const temp = pickup;
    setPickup(destination);
    setDestination(temp);
  };

  const applyRoute = (route) => {
    const matchedPickup = findLocationByLabel(route.from, airports, destinations);
    const matchedDest = findLocationByLabel(route.to, airports, destinations);
    if (matchedPickup) setPickup(matchedPickup);
    if (matchedDest) setDestination(matchedDest);
    setActiveRoute(route);
  };

  const handleSelectRoutePreset = (route, navigate) => {
    const matchedPickup = findLocationByLabel(route.from, airports, destinations);
    const matchedDest = findLocationByLabel(route.to, airports, destinations);

    if (matchedPickup) setPickup(matchedPickup);
    if (matchedDest) setDestination(matchedDest);
    setActiveRoute(route);

    const canStart = hasValidSearchDraft({
      pickup: matchedPickup || pickup,
      destination: matchedDest || destination,
      datetime
    });

    if (canStart && typeof navigate === 'function') {
      navigate(BOOKING_WIZARD_PATHS.vehicle);
      return;
    }

    if (typeof navigate === 'function') {
      navigate('/?booking=search');
      return;
    }

    document.getElementById('booking-widget')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <BookingContext.Provider value={{
      airports,
      destinations,
      fleet,
      amenitiesList,
      popularRoutes,
      activeRoute,
      applyRoute,
      currentStep,
      setCurrentStep,
      isFlowActive,
      setIsFlowActive,
      isTrackerOpen,
      setIsTrackerOpen,
      selectedVehicleModal,
      setSelectedVehicleModal,
      currency,
      setCurrency,
      language,
      setLanguage,
      serviceType,
      setServiceType,
      tripType,
      setTripType,
      pickup,
      setPickup,
      destination,
      setDestination,
      swapLocations,
      datetime,
      setDatetime,
      pax,
      setPax,
      luggage,
      setLuggage,
      flightNo,
      setFlightNo,
      selectedVehicleId,
      setSelectedVehicleId,
      selectedAmenities,
      toggleAmenity,
      setAmenityCount,
      updateAmenityCount,
      setAmenityOption,
      passenger,
      setPassenger,
      confirmedBooking,
      setConfirmedBooking,
      routeMetrics,
      distanceKm,
      durationMin,
      currentPriceTRY,
      calculateVehiclePrice,
      calculatePrices,
      formatPrice,
      formatMoney,
      submitBooking,
      completeReservation,
      handleSelectRoutePreset,
      startNewBooking: () => {
        clearSubmittedBooking();
        clearBookingDraft();
        setConfirmedBooking(null);
      }
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}

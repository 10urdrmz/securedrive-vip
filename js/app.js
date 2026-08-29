/**
 * SecureDrive VIP — Application Controller
 * Transitions.dev Minimalist Interaction & Animation Engine
 */

// Application State
const AppState = {
  serviceType: 'transfer', // 'transfer', 'hourly', 'intercity'
  tripType: 'oneway', // 'oneway', 'roundtrip'
  
  pickup: {
    name: 'İstanbul Havalimanı (IST)',
    coords: [41.2753, 28.7519],
    type: 'airport',
    code: 'IST'
  },
  destination: {
    name: 'Çırağan Palace Kempinski',
    coords: [41.0435, 29.0157],
    type: 'hotel',
    district: 'Beşiktaş'
  },
  
  datetime: '',
  pax: 2,
  luggage: 2,
  flightNo: 'TK 1984',
  
  estimatedDistanceKm: 42,
  estimatedDurationMin: 45,
  
  selectedVehicleId: 'vito-vip',
  selectedAmenities: {
    'baby-seat': { selected: false, count: 0 },
    'vip-meet-greet': { selected: false },
    'flight-tracking-guarantee': { selected: true },
    'wifi-multimedia': { selected: true },
    'minibar-premium': { selected: false },
    'multilingual-chauffeur': { selected: false, lang: 'İngilizce (English)' },
    'starlight-ceiling': { selected: false },
    'privacy-partition': { selected: false },
    'extra-luggage-trailer': { selected: false },
    'pet-friendly': { selected: false },
    'corporate-billing': { selected: false }
  },
  
  currency: 'TRY',
  lang: 'TR',
  
  currentStep: 1,
  currentBooking: null,
  
  passenger: {
    name: 'Onur',
    surname: 'Sefa',
    email: 'onur.sefa@example.com',
    phone: '+90 532 123 45 67',
    notes: '',
    paymentMethod: 'credit-card'
  }
};

// Global Leaflet Map Instance
let routeMap = null;
let mapMarkers = [];
let mapPolyline = null;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initDateTimeDefault();
  initMap();
  initAutocomplete();
  initPaxCounter();
  initBookingTabs();
  initTripToggle();
  initQuickPills();
  initStepNavigation();
  initCurrencySelector();
  initFleetShowcase();
  initPopularRoutes();
  initFaqs();
  initTrackerModal();
  initVehicleModal();
  calculateRoute();
});

// Set default date-time (Current time + 2 hours)
function initDateTimeDefault() {
  const dtInput = document.getElementById('transfer-datetime');
  const now = new Date();
  now.setHours(now.getHours() + 2);
  now.setMinutes(0);
  
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  const defaultVal = `${year}-${month}-${day}T${hours}:${minutes}`;
  dtInput.value = defaultVal;
  AppState.datetime = defaultVal;
}

// Currency Formatter
function formatCurrency(amountTRY, targetCurrency = AppState.currency) {
  const curr = SECUREDRIVE_DATA.currencies[targetCurrency] || SECUREDRIVE_DATA.currencies.TRY;
  const converted = amountTRY * curr.rate;
  
  if (targetCurrency === 'TRY') {
    return `${Math.round(converted).toLocaleString('tr-TR')} ₺`;
  } else if (targetCurrency === 'EUR') {
    return `${converted.toFixed(0)} €`;
  } else if (targetCurrency === 'USD') {
    return `$${converted.toFixed(0)}`;
  } else if (targetCurrency === 'GBP') {
    return `£${converted.toFixed(0)}`;
  }
  return `${converted.toFixed(0)} ${curr.symbol}`;
}

// Initialize Leaflet Map (Light Voyager Tiles)
function initMap() {
  const mapElem = document.getElementById('route-map');
  if (!mapElem) return;

  routeMap = L.map('route-map', {
    zoomControl: false,
    attributionControl: false
  }).setView([41.15, 28.95], 10);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 18,
    subdomains: 'abcd'
  }).addTo(routeMap);

  L.control.zoom({ position: 'bottomright' }).addTo(routeMap);
}

// Update Map Route & Markers
function updateMapRoute() {
  if (!routeMap || !AppState.pickup || !AppState.destination) return;

  mapMarkers.forEach(m => routeMap.removeLayer(m));
  mapMarkers = [];
  if (mapPolyline) routeMap.removeLayer(mapPolyline);

  const pCoords = AppState.pickup.coords;
  const dCoords = AppState.destination.coords;

  const pickupIcon = L.divIcon({
    className: 'custom-map-pin',
    html: `<div style="background:#0d0d0d; color:#fff; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.25); font-size:10px;"><i class="fa-solid fa-plane-departure"></i></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  const destIcon = L.divIcon({
    className: 'custom-map-pin',
    html: `<div style="background:#0d0d0d; color:#fff; width:24px; height:24px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.25); font-size:10px;"><i class="fa-solid fa-hotel"></i></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  const marker1 = L.marker(pCoords, { icon: pickupIcon }).addTo(routeMap);
  const marker2 = L.marker(dCoords, { icon: destIcon }).addTo(routeMap);
  mapMarkers.push(marker1, marker2);

  const latDiff = dCoords[0] - pCoords[0];
  const lngDiff = dCoords[1] - pCoords[1];
  const midLat = pCoords[0] + latDiff * 0.5 + (lngDiff * 0.06);
  const midLng = pCoords[1] + lngDiff * 0.5 - (latDiff * 0.06);

  const routePoints = [pCoords, [midLat, midLng], dCoords];

  mapPolyline = L.polyline(routePoints, {
    color: '#0d0d0d',
    weight: 3,
    opacity: 0.8,
    dashArray: '6, 6'
  }).addTo(routeMap);

  const bounds = L.latLngBounds([pCoords, dCoords]);
  routeMap.fitBounds(bounds, { padding: [24, 24] });
}

// Calculate Distance & Dynamic Pricing
function calculateRoute() {
  const p = AppState.pickup.coords;
  const d = AppState.destination.coords;

  const R = 6371;
  const dLat = (d[0] - p[0]) * Math.PI / 180;
  const dLon = (d[1] - p[1]) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(p[0] * Math.PI / 180) * Math.cos(d[0] * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const straightKm = R * c;

  let roadKm = Math.round(straightKm * 1.35);
  if (roadKm < 20) roadKm = 24;

  let durationMin = Math.round(roadKm * 1.1 + 8);

  AppState.estimatedDistanceKm = roadKm;
  AppState.estimatedDurationMin = durationMin;

  document.getElementById('sidebar-distance').textContent = `${roadKm} KM`;
  document.getElementById('sidebar-duration').textContent = `${durationMin} DK`;
  document.getElementById('pill-route-text').textContent = `${AppState.pickup.name.split('(')[0].trim()} ➔ ${AppState.destination.name.split('(')[0].trim()}`;

  updateMapRoute();
  updatePriceCalculations();
}

// Price Calculator
function updatePriceCalculations() {
  const vehicle = SECUREDRIVE_DATA.fleet.find(v => v.id === AppState.selectedVehicleId) || SECUREDRIVE_DATA.fleet[0];
  
  let basePriceTRY = vehicle.baseOpeningRate + (AppState.estimatedDistanceKm * vehicle.baseRateKm);
  if (AppState.serviceType === 'hourly') basePriceTRY = vehicle.baseOpeningRate * 2.8;

  let isRoundTrip = AppState.tripType === 'roundtrip';
  let totalBaseTRY = isRoundTrip ? basePriceTRY * 2 : basePriceTRY;
  let discountTRY = isRoundTrip ? Math.round(totalBaseTRY * 0.10) : 0;

  let amenitiesPriceTRY = 0;
  SECUREDRIVE_DATA.amenities.forEach(am => {
    const selectedState = AppState.selectedAmenities[am.id];
    if (selectedState && (selectedState.selected || am.checkedByDefault)) {
      if (am.hasCount && selectedState.count > 0) {
        amenitiesPriceTRY += am.priceTRY * selectedState.count;
      } else if (!am.isFree) {
        amenitiesPriceTRY += am.priceTRY;
      }
    }
  });

  const grandTotalTRY = (totalBaseTRY - discountTRY) + amenitiesPriceTRY;

  document.getElementById('price-base-val').textContent = formatCurrency(totalBaseTRY);
  document.getElementById('price-amenities-val').textContent = formatCurrency(amenitiesPriceTRY);
  
  const discountRow = document.getElementById('price-discount-row');
  if (isRoundTrip) {
    discountRow.style.display = 'flex';
    document.getElementById('price-discount-val').textContent = `-${formatCurrency(discountTRY)}`;
  } else {
    discountRow.style.display = 'none';
  }

  document.getElementById('price-grand-total').textContent = formatCurrency(grandTotalTRY);
  document.getElementById('sidebar-trip-mode').textContent = isRoundTrip ? 'Gidiş - Dönüş' : 'Tek Yön';
  document.getElementById('sidebar-vehicle-title').textContent = vehicle.name;
  document.getElementById('sidebar-vehicle-img').src = vehicle.image;

  return { totalBaseTRY, discountTRY, amenitiesPriceTRY, grandTotalTRY };
}

// Autocomplete Dropdowns
function initAutocomplete() {
  const pickupInput = document.getElementById('pickup-input');
  const destInput = document.getElementById('dest-input');
  const pickupDropdown = document.getElementById('pickup-dropdown');
  const destDropdown = document.getElementById('dest-dropdown');

  function renderList(query, isPickup, dropdownElem) {
    const q = query.toLowerCase().trim();
    let html = '';

    const filteredAirports = SECUREDRIVE_DATA.airports.filter(a => 
      a.name.toLowerCase().includes(q) || a.city.toLowerCase().includes(q) || a.code.toLowerCase().includes(q)
    );

    if (filteredAirports.length > 0) {
      html += `<div class="dropdown-header-tag">Havalimanları</div>`;
      filteredAirports.forEach(a => {
        html += `
          <div class="dropdown-option" data-id="${a.id}" data-type="airport">
            <i class="fa-solid fa-plane-arrival" style="font-size: 11px; color: var(--text-muted);"></i>
            <div>
              <div class="dropdown-option-name">${a.name}</div>
              <div class="dropdown-option-sub">${a.city}</div>
            </div>
          </div>
        `;
      });
    }

    const filteredHotels = SECUREDRIVE_DATA.destinations.filter(d => 
      d.name.toLowerCase().includes(q) || d.city.toLowerCase().includes(q) || d.district.toLowerCase().includes(q)
    );

    if (filteredHotels.length > 0) {
      html += `<div class="dropdown-header-tag">Lüks Oteller & Bölgeler</div>`;
      filteredHotels.forEach(d => {
        html += `
          <div class="dropdown-option" data-id="${d.id}" data-type="${d.type}">
            <i class="fa-solid fa-hotel" style="font-size: 11px; color: var(--text-muted);"></i>
            <div>
              <div class="dropdown-option-name">${d.name}</div>
              <div class="dropdown-option-sub">${d.city} (${d.district})</div>
            </div>
          </div>
        `;
      });
    }

    if (html === '') {
      html = `<div style="padding: 12px; font-size: 12px; color: var(--text-muted);">Özel konum olarak seçilecek.</div>`;
    }

    dropdownElem.innerHTML = html;
    dropdownElem.classList.add('open');

    dropdownElem.querySelectorAll('.dropdown-option').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        const type = item.getAttribute('data-type');
        
        let found = type === 'airport' 
          ? SECUREDRIVE_DATA.airports.find(a => a.id === id)
          : SECUREDRIVE_DATA.destinations.find(d => d.id === id);

        if (found) {
          if (isPickup) {
            AppState.pickup = found;
            pickupInput.value = found.name;
          } else {
            AppState.destination = found;
            destInput.value = found.name;
          }
          dropdownElem.classList.remove('open');
          calculateRoute();
        }
      });
    });
  }

  pickupInput.addEventListener('focus', () => renderList(pickupInput.value, true, pickupDropdown));
  pickupInput.addEventListener('input', () => renderList(pickupInput.value, true, pickupDropdown));

  destInput.addEventListener('focus', () => renderList(destInput.value, false, destDropdown));
  destInput.addEventListener('input', () => renderList(destInput.value, false, destDropdown));

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#pickup-wrapper') && !e.target.closest('#pickup-dropdown')) {
      pickupDropdown.classList.remove('open');
    }
    if (!e.target.closest('#dest-wrapper') && !e.target.closest('#dest-dropdown')) {
      destDropdown.classList.remove('open');
    }
    if (!e.target.closest('#pax-wrapper') && !e.target.closest('#pax-dropdown')) {
      document.getElementById('pax-dropdown').classList.remove('open');
    }
  });

  document.getElementById('btn-swap-locations').addEventListener('click', () => {
    const temp = AppState.pickup;
    AppState.pickup = AppState.destination;
    AppState.destination = temp;

    pickupInput.value = AppState.pickup.name;
    destInput.value = AppState.destination.name;

    calculateRoute();
  });
}

// Pax & Luggage Counter
function initPaxCounter() {
  const paxWrapper = document.getElementById('pax-wrapper');
  const paxDropdown = document.getElementById('pax-dropdown');
  const paxDisplay = document.getElementById('pax-display');
  
  const paxMinus = document.getElementById('pax-minus');
  const paxPlus = document.getElementById('pax-plus');
  const paxVal = document.getElementById('pax-count-val');

  const lugMinus = document.getElementById('luggage-minus');
  const lugPlus = document.getElementById('luggage-plus');
  const lugVal = document.getElementById('luggage-count-val');

  paxWrapper.addEventListener('click', () => paxDropdown.classList.toggle('open'));

  paxMinus.addEventListener('click', (e) => {
    e.stopPropagation();
    if (AppState.pax > 1) {
      AppState.pax--;
      paxVal.textContent = AppState.pax;
      updatePax();
    }
  });

  paxPlus.addEventListener('click', (e) => {
    e.stopPropagation();
    if (AppState.pax < 14) {
      AppState.pax++;
      paxVal.textContent = AppState.pax;
      updatePax();
    }
  });

  lugMinus.addEventListener('click', (e) => {
    e.stopPropagation();
    if (AppState.luggage > 0) {
      AppState.luggage--;
      lugVal.textContent = AppState.luggage;
      updatePax();
    }
  });

  lugPlus.addEventListener('click', (e) => {
    e.stopPropagation();
    if (AppState.luggage < 14) {
      AppState.luggage++;
      lugVal.textContent = AppState.luggage;
      updatePax();
    }
  });

  function updatePax() {
    paxDisplay.value = `${AppState.pax} Yolcu, ${AppState.luggage} Bagaj`;
    calculateRoute();
  }
}

// Segmented Booking Tabs
function initBookingTabs() {
  const tabs = document.querySelectorAll('.chip-btn[data-service]');
  const tripToggle = document.getElementById('trip-type-container');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      AppState.serviceType = tab.getAttribute('data-service');

      if (AppState.serviceType === 'hourly') {
        tripToggle.style.display = 'none';
        document.getElementById('dest-input').placeholder = 'Tahsis Semti / Bölgesi';
      } else {
        tripToggle.style.display = 'flex';
        document.getElementById('dest-input').placeholder = 'Otel veya semt...';
      }

      calculateRoute();
    });
  });
}

function initTripToggle() {
  const opts = document.querySelectorAll('.trip-toggle-btn');
  opts.forEach(btn => {
    btn.addEventListener('click', () => {
      opts.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.tripType = btn.getAttribute('data-trip');
      calculateRoute();
    });
  });
}

function initQuickPills() {
  document.querySelectorAll('.preset-chip[data-from]').forEach(pill => {
    pill.addEventListener('click', () => {
      const fromId = pill.getAttribute('data-from');
      const toId = pill.getAttribute('data-to');

      const fromAirport = SECUREDRIVE_DATA.airports.find(a => a.id === fromId);
      const toDest = SECUREDRIVE_DATA.destinations.find(d => d.id === toId);

      if (fromAirport && toDest) {
        AppState.pickup = fromAirport;
        AppState.destination = toDest;
        document.getElementById('pickup-input').value = fromAirport.name;
        document.getElementById('dest-input').value = toDest.name;
        
        calculateRoute();
        document.getElementById('booking-widget').scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// Step-by-Step Flow Navigation
function initStepNavigation() {
  const bookingSection = document.getElementById('booking-flow-section');
  const btnStart = document.getElementById('btn-start-booking');
  
  btnStart.addEventListener('click', () => {
    bookingSection.classList.add('active');
    bookingSection.scrollIntoView({ behavior: 'smooth' });
    goToStep(1);
  });

  document.getElementById('btn-back-to-hero').addEventListener('click', () => {
    document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('btn-proceed-to-amenities').addEventListener('click', () => goToStep(2));
  document.getElementById('btn-back-to-vehicles').addEventListener('click', () => goToStep(1));
  document.getElementById('btn-proceed-to-passenger').addEventListener('click', () => goToStep(3));
  document.getElementById('btn-back-to-amenities').addEventListener('click', () => goToStep(2));
  document.getElementById('btn-confirm-reservation').addEventListener('click', () => completeReservation());
  document.getElementById('btn-new-booking').addEventListener('click', () => {
    goToStep(1);
    document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });
  });

  document.querySelectorAll('.step-item').forEach(item => {
    item.addEventListener('click', () => {
      const step = parseInt(item.getAttribute('data-step'));
      if (step <= AppState.currentStep) goToStep(step);
    });
  });

  // Payment Chips
  document.querySelectorAll('.payment-chip-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.payment-chip-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      AppState.passenger.paymentMethod = card.getAttribute('data-payment');
    });
  });

  document.getElementById('btn-print-voucher').addEventListener('click', () => window.print());

  document.getElementById('btn-whatsapp-share').addEventListener('click', () => {
    if (!AppState.currentBooking) return;
    const msg = `SecureDrive VIP Rezervasyonum: Kod: ${AppState.currentBooking.code}, Rota: ${AppState.currentBooking.pickup} -> ${AppState.currentBooking.destination}, Tarih: ${AppState.currentBooking.date} ${AppState.currentBooking.time}, Araç: ${AppState.currentBooking.vehicle}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  });
}

function goToStep(stepNumber) {
  AppState.currentStep = stepNumber;

  for (let i = 1; i <= 4; i++) {
    const stepHeader = document.getElementById(`wizard-step-${i}`);
    if (i < stepNumber) {
      stepHeader.className = 'step-item completed';
      stepHeader.querySelector('.step-badge').innerHTML = '✓';
    } else if (i === stepNumber) {
      stepHeader.className = 'step-item active';
      stepHeader.querySelector('.step-badge').textContent = i;
    } else {
      stepHeader.className = 'step-item';
      stepHeader.querySelector('.step-badge').textContent = i;
    }
  }

  document.querySelectorAll('.flow-step-pane').forEach(p => p.style.display = 'none');
  const activePane = document.getElementById(`flow-step-pane-${stepNumber}`);
  if (activePane) activePane.style.display = 'block';

  if (stepNumber === 1) renderVehicleList();
  else if (stepNumber === 2) renderAmenities();

  updatePriceCalculations();
  document.getElementById('booking-flow-section').scrollIntoView({ behavior: 'smooth' });
}

// Render Step 1 Minimalist Vehicle Cards
function renderVehicleList() {
  const container = document.getElementById('vehicles-list-container');
  let html = '';

  SECUREDRIVE_DATA.fleet.forEach(vehicle => {
    const isSelected = vehicle.id === AppState.selectedVehicleId;
    const baseFare = vehicle.baseOpeningRate + (AppState.estimatedDistanceKm * vehicle.baseRateKm);
    const fareFormatted = formatCurrency(AppState.tripType === 'roundtrip' ? baseFare * 1.8 : baseFare);

    html += `
      <div class="vehicle-minimal-card ${isSelected ? 'selected' : ''}" data-id="${vehicle.id}">
        <div class="vehicle-thumb">
          <img src="${vehicle.image}" alt="${vehicle.name}" loading="lazy">
        </div>

        <div class="vehicle-meta">
          <h3>${vehicle.name} <span class="spec-chip" style="margin-left: 6px;">${vehicle.class}</span></h3>
          <p>${vehicle.description}</p>
          
          <div class="specs-strip">
            <span class="spec-chip">${vehicle.seats} Yolcu</span>
            <span class="spec-chip">${vehicle.luggage} Valiz</span>
            <span class="spec-chip">${vehicle.transmission}</span>
            <span class="spec-chip">Wi-Fi & TV</span>
          </div>
        </div>

        <div class="vehicle-right-action">
          <span style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Sabit Ücret</span>
          <div class="vehicle-rate mono">${fareFormatted}</div>
          <button type="button" class="btn-select-chip">
            ${isSelected ? 'Seçildi' : 'Tahsis Et'}
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  container.querySelectorAll('.vehicle-minimal-card').forEach(card => {
    card.addEventListener('click', () => {
      AppState.selectedVehicleId = card.getAttribute('data-id');
      renderVehicleList();
      updatePriceCalculations();
    });
  });
}

// Render Step 2 Amenities
function renderAmenities() {
  const container = document.getElementById('amenities-container');
  let html = '';

  SECUREDRIVE_DATA.amenities.forEach(am => {
    const current = AppState.selectedAmenities[am.id] || { selected: false, count: 0 };
    const isChecked = current.selected || am.checkedByDefault;

    let priceBadge = am.isFree 
      ? `<span class="amenity-badge free">Dahil</span>`
      : `<span class="amenity-badge mono">+${formatCurrency(am.priceTRY)}</span>`;

    let counterHtml = '';
    if (am.hasCount) {
      counterHtml = `
        <div style="display: flex; align-items: center; gap: 4px; margin-top: 6px;">
          <button type="button" class="chip-btn am-minus" data-id="${am.id}" style="padding: 1px 6px;">-</button>
          <span class="mono" style="font-size: 11px; font-weight: 600; width: 14px; text-align: center;">${current.count || 0}</span>
          <button type="button" class="chip-btn am-plus" data-id="${am.id}" style="padding: 1px 6px;">+</button>
        </div>
      `;
    }

    html += `
      <div class="amenity-minimal-row ${isChecked ? 'checked' : ''}" data-id="${am.id}">
        <div class="amenity-checkbox-dot">
          ${isChecked ? '✓' : ''}
        </div>
        <div class="amenity-body">
          <div class="amenity-head">
            <strong>${am.title}</strong>
            ${priceBadge}
          </div>
          <p>${am.subtitle}</p>
          ${counterHtml}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  container.querySelectorAll('.amenity-minimal-row').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.am-plus') || e.target.closest('.am-minus')) return;

      const id = card.getAttribute('data-id');
      if (!AppState.selectedAmenities[id]) AppState.selectedAmenities[id] = { selected: true };
      else AppState.selectedAmenities[id].selected = !AppState.selectedAmenities[id].selected;

      renderAmenities();
      updatePriceCalculations();
    });
  });

  container.querySelectorAll('.am-plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      if (!AppState.selectedAmenities[id]) AppState.selectedAmenities[id] = { selected: true, count: 0 };
      if (AppState.selectedAmenities[id].count < 2) {
        AppState.selectedAmenities[id].count++;
        AppState.selectedAmenities[id].selected = true;
      }
      renderAmenities();
      updatePriceCalculations();
    });
  });

  container.querySelectorAll('.am-minus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      if (AppState.selectedAmenities[id] && AppState.selectedAmenities[id].count > 0) {
        AppState.selectedAmenities[id].count--;
        if (AppState.selectedAmenities[id].count === 0) AppState.selectedAmenities[id].selected = false;
      }
      renderAmenities();
      updatePriceCalculations();
    });
  });
}

// Complete Reservation
function completeReservation() {
  const nameInput = document.getElementById('passenger-name').value.trim();
  const surnameInput = document.getElementById('passenger-surname').value.trim();
  const emailInput = document.getElementById('passenger-email').value.trim();
  const phoneInput = document.getElementById('passenger-phone').value.trim();
  const notesInput = document.getElementById('passenger-notes').value.trim();
  const flightInput = document.getElementById('flight-input').value.trim();

  if (!nameInput || !surnameInput || !phoneInput) {
    alert('Lütfen ad, soyad ve telefon numaranızı giriniz.');
    return;
  }

  AppState.passenger.name = nameInput;
  AppState.passenger.surname = surnameInput;
  AppState.passenger.email = emailInput;
  AppState.passenger.phone = phoneInput;
  AppState.passenger.notes = notesInput;
  AppState.flightNo = flightInput || 'Belirtilmedi';

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const bookingCode = `SDRV-2026-${randomNum}`;

  const vehicle = SECUREDRIVE_DATA.fleet.find(v => v.id === AppState.selectedVehicleId) || SECUREDRIVE_DATA.fleet[0];
  const prices = updatePriceCalculations();

  const newBooking = {
    code: bookingCode,
    status: 'Araç Tahsis Edildi',
    statusStep: 2,
    passengerName: `${nameInput} ${surnameInput}`,
    phone: phoneInput,
    email: emailInput,
    flightNo: AppState.flightNo,
    pickup: AppState.pickup.name,
    destination: AppState.destination.name,
    date: AppState.datetime.split('T')[0] || '2026-08-29',
    time: AppState.datetime.split('T')[1] || '15:30',
    pax: AppState.pax,
    luggage: AppState.luggage,
    vehicle: vehicle.name,
    plate: '34 VIP ' + Math.floor(100 + Math.random() * 900),
    chauffeur: {
      name: 'Şahin T. (Kıdemli VIP Şoför)',
      phone: '+90 533 111 22 33',
      rating: '4.97 ⭐',
      languages: 'Türkçe, İngilizce',
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80'
    },
    amenitiesSelected: Object.keys(AppState.selectedAmenities).filter(k => AppState.selectedAmenities[k]?.selected),
    totalPriceTRY: prices.grandTotalTRY,
    currency: AppState.currency,
    paymentMethod: AppState.passenger.paymentMethod === 'credit-card' ? 'Online Ödendi' : 'Araçta Ödeme'
  };

  AppState.currentBooking = newBooking;
  SECUREDRIVE_DATA.sampleBookings[bookingCode] = newBooking;

  document.getElementById('v-code-display').textContent = bookingCode;
  document.getElementById('v-pickup-display').textContent = newBooking.pickup;
  document.getElementById('v-dest-display').textContent = newBooking.destination;
  document.getElementById('v-passenger-display').textContent = newBooking.passengerName;
  document.getElementById('v-datetime-display').textContent = `${newBooking.date} ${newBooking.time}`;
  document.getElementById('v-flight-display').textContent = newBooking.flightNo;
  document.getElementById('v-capacity-display').textContent = `${newBooking.pax} Pax / ${newBooking.luggage} Bag`;
  document.getElementById('v-payment-display').textContent = newBooking.paymentMethod;
  document.getElementById('v-total-price-display').textContent = formatCurrency(newBooking.totalPriceTRY);
  document.getElementById('v-vehicle-name-display').textContent = vehicle.name;
  document.getElementById('v-vehicle-plate-display').textContent = `Plaka: ${newBooking.plate} | Şoför: ${newBooking.chauffeur.name}`;

  let amHtml = '<div style="display:flex; flex-wrap:wrap; gap:6px;">';
  newBooking.amenitiesSelected.forEach(amId => {
    const amObj = SECUREDRIVE_DATA.amenities.find(a => a.id === amId);
    if (amObj) {
      amHtml += `<span class="preset-chip" style="font-size:10px;">${amObj.title}</span>`;
    }
  });
  amHtml += '</div>';
  document.getElementById('v-amenities-list').innerHTML = amHtml;

  goToStep(4);
}

// Fleet Showcase
function initFleetShowcase() {
  const container = document.getElementById('fleet-showcase-grid');
  const filterBtns = document.querySelectorAll('.fleet-filter-chips .chip-btn');

  function renderShowcase(cat = 'all') {
    let list = SECUREDRIVE_DATA.fleet;
    if (cat !== 'all') list = list.filter(v => v.category === cat);

    let html = '';
    list.forEach(v => {
      html += `
        <div class="fleet-item-card">
          <div class="img-box">
            <img src="${v.image}" alt="${v.name}" loading="lazy">
          </div>
          <div class="card-content">
            <span style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">${v.class}</span>
            <h3 style="font-size: 15px; margin: 2px 0 6px 0;">${v.name}</h3>
            <p style="font-size: 12px; color: var(--text-muted); line-height: 1.4; margin-bottom: 10px;">${v.description.substring(0, 95)}...</p>
            
            <div class="specs-strip" style="margin-top: auto;">
              <span class="spec-chip">${v.seats} Pax</span>
              <span class="spec-chip">${v.luggage} Bag</span>
              <span class="spec-chip">${v.specs.engine.split(' ')[0]}</span>
            </div>

            <div class="card-footer">
              <span class="mono" style="font-weight: 700; font-size: 15px;">${formatCurrency(v.baseOpeningRate)}</span>
              <button type="button" class="btn-select-chip btn-view-vehicle-details" data-id="${v.id}">
                İncele
              </button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.btn-view-vehicle-details').forEach(btn => {
      btn.addEventListener('click', () => openVehicleModal(btn.getAttribute('data-id')));
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderShowcase(btn.getAttribute('data-cat'));
    });
  });

  renderShowcase('all');
}

// Popular Routes
function initPopularRoutes() {
  const container = document.getElementById('popular-routes-grid');
  let html = '';

  SECUREDRIVE_DATA.popularRoutes.forEach(r => {
    html += `
      <div class="route-item-card">
        <div style="font-size: 13px; font-weight: 600; color: var(--text);">
          ${r.from.split('(')[0]} ➔ ${r.to.split('&')[0]}
        </div>
        <div style="font-size: 11.5px; color: var(--text-muted);">
          ${r.distanceKm} KM · ~${r.durationMin} DK · ${r.vehicle}
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px;">
          <span class="mono" style="font-weight: 700; font-size: 16px;">${formatCurrency(r.priceTRY)}</span>
          <button type="button" class="btn-select-chip btn-book-route" data-from="${r.from}" data-to="${r.to}" data-pcoords="${r.fromCoords.join(',')}" data-dcoords="${r.toCoords.join(',')}">
            Seç
          </button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  container.querySelectorAll('.btn-book-route').forEach(btn => {
    btn.addEventListener('click', () => {
      const from = btn.getAttribute('data-from');
      const to = btn.getAttribute('data-to');
      const pcoords = btn.getAttribute('data-pcoords').split(',').map(Number);
      const dcoords = btn.getAttribute('data-dcoords').split(',').map(Number);

      AppState.pickup = { name: from, coords: pcoords, type: 'airport' };
      AppState.destination = { name: to, coords: dcoords, type: 'hotel' };

      document.getElementById('pickup-input').value = from;
      document.getElementById('dest-input').value = to;

      calculateRoute();
      document.getElementById('booking-flow-section').classList.add('active');
      goToStep(1);
    });
  });
}

// FAQs Accordion
function initFaqs() {
  const container = document.getElementById('faq-list');
  let html = '';

  SECUREDRIVE_DATA.faqs.forEach((f, idx) => {
    html += `
      <div class="ticket-card" style="margin-bottom: 8px;">
        <div class="faq-question" style="padding: 14px 16px; cursor: pointer; display: flex; justify-content: space-between; font-size: 13.5px; font-weight: 600;">
          <span>${f.q}</span>
          <i class="fa-solid fa-chevron-down" style="font-size: 10px; color: var(--text-muted);"></i>
        </div>
        <div class="faq-answer" style="padding: 0 16px 14px 16px; font-size: 12.5px; color: var(--text-muted); line-height: 1.5; ${idx === 0 ? 'display:block;' : 'display:none;'}">
          ${f.a}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  container.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const ans = q.nextElementSibling;
      const isVisible = ans.style.display === 'block';
      ans.style.display = isVisible ? 'none' : 'block';
    });
  });
}

// Live Booking Tracker Modal
function initTrackerModal() {
  const trackerModal = document.getElementById('tracker-modal');
  const btnOpen = document.getElementById('btn-open-tracker');
  const btnClose = document.getElementById('btn-close-tracker');
  const btnSearch = document.getElementById('btn-search-reservation');
  const searchInput = document.getElementById('tracker-search-input');
  const resultArea = document.getElementById('tracker-result-area');

  btnOpen.addEventListener('click', () => {
    trackerModal.classList.add('open');
    btnSearch.click();
  });

  btnClose.addEventListener('click', () => trackerModal.classList.remove('open'));
  trackerModal.addEventListener('click', (e) => {
    if (e.target === trackerModal) trackerModal.classList.remove('open');
  });

  btnSearch.addEventListener('click', () => {
    const code = searchInput.value.trim().toUpperCase();
    const booking = SECUREDRIVE_DATA.sampleBookings[code];

    if (!booking) {
      resultArea.innerHTML = `
        <div style="padding: 16px; text-align: center; background: var(--bg-stage); border-radius: var(--radius-md); font-size: 12px; color: var(--text-muted);">
          Kayıt bulunamadı. Lütfen rezervasyon kodunuzu kontrol ediniz.
        </div>
      `;
      return;
    }

    resultArea.innerHTML = `
      <div style="background: var(--bg-stage); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 14px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
          <div>
            <span style="font-size: 10px; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">Durum</span>
            <h4 style="font-size: 14px; font-weight: 700; color: var(--text);">${booking.status}</h4>
          </div>
          <span class="preset-chip" style="color: var(--accent-green);">Canlı Radar</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; margin-bottom: 12px;">
          <div><span style="color:var(--text-muted);">Yolcu:</span> <strong>${booking.passengerName}</strong></div>
          <div><span style="color:var(--text-muted);">Uçuş:</span> <strong style="color:var(--accent-green);">${booking.flightNo}</strong></div>
          <div><span style="color:var(--text-muted);">Kalkış:</span> <strong>${booking.pickup}</strong></div>
          <div><span style="color:var(--text-muted);">Varış:</span> <strong>${booking.destination}</strong></div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border); padding-top: 10px;">
          <div>
            <span style="font-size: 10px; color: var(--text-muted); text-transform: uppercase;">Atanan Şoför</span>
            <strong style="font-size: 12.5px; display: block;">${booking.chauffeur.name}</strong>
          </div>
          <a href="tel:${booking.chauffeur.phone}" class="btn-select-chip" style="padding: 4px 10px;">
            Şoförü Ara
          </a>
        </div>
      </div>
    `;
  });
}

// Vehicle Modal
function initVehicleModal() {
  const modal = document.getElementById('vehicle-modal');
  const btnClose = document.getElementById('btn-close-vehicle-modal');

  btnClose.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
}

function openVehicleModal(vehicleId) {
  const modal = document.getElementById('vehicle-modal');
  const content = document.getElementById('vehicle-modal-content');
  const v = SECUREDRIVE_DATA.fleet.find(item => item.id === vehicleId);
  if (!v) return;

  content.innerHTML = `
    <div>
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <h3 style="font-size: 18px; font-weight: 700;">${v.name}</h3>
        <span class="preset-chip">${v.class}</span>
      </div>

      <div style="width: 100%; height: 240px; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 12px;">
        <img src="${v.image}" alt="${v.name}" style="width: 100%; height: 100%; object-fit: cover;">
      </div>

      <p style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 14px; line-height: 1.5;">${v.description}</p>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 16px;">
        <div class="stat-cell">
          <div class="stat-label">Yolcu</div>
          <div class="stat-val">${v.seats} Pax</div>
        </div>
        <div class="stat-cell">
          <div class="stat-label">Valiz</div>
          <div class="stat-val">${v.luggage} Bag</div>
        </div>
        <div class="stat-cell">
          <div class="stat-label">Motor</div>
          <div class="stat-val">${v.specs.engine.split(' ')[0]}</div>
        </div>
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border); padding-top: 14px;">
        <span class="mono" style="font-size: 16px; font-weight: 700;">${formatCurrency(v.baseOpeningRate)} + ${formatCurrency(v.baseRateKm)}/KM</span>
        <button type="button" class="btn-action-primary" id="btn-select-modal-car">
          Bu Aracı Tahsis Et
        </button>
      </div>
    </div>
  `;

  modal.classList.add('open');

  document.getElementById('btn-select-modal-car').addEventListener('click', () => {
    AppState.selectedVehicleId = v.id;
    modal.classList.remove('open');
    document.getElementById('booking-flow-section').classList.add('active');
    goToStep(1);
  });
}

// Currency Selector
function initCurrencySelector() {
  const select = document.getElementById('currency-selector');
  select.addEventListener('change', () => {
    AppState.currency = select.value;
    updatePriceCalculations();
    initFleetShowcase();
    initPopularRoutes();
    if (AppState.currentStep === 1) renderVehicleList();
    if (AppState.currentStep === 2) renderAmenities();
  });
}

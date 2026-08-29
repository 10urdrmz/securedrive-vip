/**
 * SecureDrive VIP — Core Static Data & Presets
 */

export const AIRPORTS = [
  { id: 'IST', code: 'IST', name: 'İstanbul Havalimanı (IST)', city: 'İstanbul', coords: [41.2753, 28.7519], terminal: 'Ana VIP Terminal' },
  { id: 'SAW', code: 'SAW', name: 'Sabiha Gökçen Havalimanı (SAW)', city: 'İstanbul', coords: [40.8986, 29.3092], terminal: 'Dış Hatlar CIP' },
  { id: 'AYT', code: 'AYT', name: 'Antalya Havalimanı (AYT)', city: 'Antalya', coords: [36.8987, 30.8005], terminal: 'CIP Salonu' },
  { id: 'BJV', code: 'BJV', name: 'Bodrum Milas Havalimanı (BJV)', city: 'Muğla / Bodrum', coords: [37.2506, 27.6644], terminal: 'Genel Havacılık' },
  { id: 'DLM', code: 'DLM', name: 'Dalaman Havalimanı (DLM)', city: 'Muğla / Fethiye', coords: [36.7131, 28.7925], terminal: 'VIP Kapısı' },
  { id: 'ADB', code: 'ADB', name: 'İzmir Adnan Menderes (ADB)', city: 'İzmir', coords: [38.2924, 27.1570], terminal: 'İç & Dış Hatlar' }
];

export const DESTINATIONS = [
  { id: 'CIRAGAN', name: 'Çırağan Palace Kempinski', city: 'İstanbul', district: 'Beşiktaş', coords: [41.0435, 29.0157], type: 'hotel' },
  { id: 'FOUR_SEASONS_BOSPHORUS', name: 'Four Seasons Hotel Bosphorus', city: 'İstanbul', district: 'Beşiktaş', coords: [41.0478, 29.0195], type: 'hotel' },
  { id: 'MANDARIN_ORIENTAL', name: 'Mandarin Oriental Bosphorus', city: 'İstanbul', district: 'Kuruçeşme', coords: [41.0601, 29.0345], type: 'hotel' },
  { id: 'RAFFLES_ISTANBUL', name: 'Raffles Istanbul (Zorlu Center)', city: 'İstanbul', district: 'Levazım / Beşiktaş', coords: [41.0668, 29.0175], type: 'hotel' },
  { id: 'THE_PENINSULA', name: 'The Peninsula Istanbul', city: 'İstanbul', district: 'Karaköy', coords: [41.0267, 28.9803], type: 'hotel' },
  { id: 'SWISSOTEL', name: 'Swissôtel The Bosphorus', city: 'İstanbul', district: 'Maçka / Beşiktaş', coords: [41.0416, 29.0006], type: 'hotel' },
  { id: 'TAKSIM_SQUARE', name: 'Taksim Meydanı & Beyoğlu', city: 'İstanbul', district: 'Beyoğlu', coords: [41.0370, 28.9850], type: 'district' },
  { id: 'SULTANAHMET_SQUARE', name: 'Sultanahmet & Tarihi Yarımada', city: 'İstanbul', district: 'Fatih', coords: [41.0054, 28.9768], type: 'district' },
  { id: 'KADIKOY_MODA', name: 'Kadıköy Moda Sahili', city: 'İstanbul', district: 'Kadıköy', coords: [40.9833, 29.0250], type: 'district' },
  { id: 'MAXX_ROYAL_BELEK', name: 'Maxx Royal Belek Golf Resort', city: 'Antalya', district: 'Belek', coords: [36.8522, 31.0614], type: 'hotel' },
  { id: 'REGNUM_CARYA', name: 'Regnum Carya Golf & Spa', city: 'Antalya', district: 'Belek', coords: [36.8703, 31.0182], type: 'hotel' },
  { id: 'YALIKAVAK_MARINA', name: 'Yalıkavak Marina Resort', city: 'Bodrum', district: 'Yalıkavak', coords: [37.1062, 27.2917], type: 'hotel' }
];

export const FLEET = [
  {
    id: 'vito-vip',
    name: 'Mercedes-Benz Vito VIP Lounge',
    class: 'VIP Minivan',
    category: 'vip-minivan',
    badge: 'En Çok Tercih Edilen',
    badgeColor: 'gold',
    seats: 6,
    luggage: 6,
    transmission: '9G-Tronic Otomatik',
    specs: { engine: '2.0L BiTurbo 190 HP', fuel: 'Dizel', year: '2025/2026' },
    baseOpeningRate: 1200,
    baseRateKm: 32,
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Yatar mekanizmalı hakiki deri koltuklar, Apple TV, 5G Wi-Fi, ara bölme ve Nespresso kahve ikramı.',
    features: ['Hakiki Deri Yatar VIP Koltuklar', '32" Smart TV & Apple TV', 'Elektrikli Ara Bölme (Privacy)', 'Yüksek Hızlı 5G Wi-Fi', 'Nespresso Kahve & Minibar']
  },
  {
    id: 'v-class-maybach',
    name: 'Mercedes-Benz V-Class Maybach Edition',
    class: 'Ultra VIP Minivan',
    category: 'ultra-vip',
    badge: 'Özel Seri Maybach',
    badgeColor: 'amber',
    seats: 4,
    luggage: 4,
    transmission: '9G-Tronic Otomatik',
    specs: { engine: '3.0L V6 237 HP', fuel: 'Dizel', year: '2026' },
    baseOpeningRate: 2000,
    baseRateKm: 48,
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Maybach tavan aydınlatması, masajlı ve havalandırmalı first-class koltuklar ve starlight yıldız tavan.',
    features: ['Maybach Rolls-Royce Starlight Tavan', 'Masajlı & Soğutmalı Koltuklar', 'Burmester 3D Surround Ses', 'Şampanya Soğutucu & Kasa', 'PlayStation 5 Konsol']
  },
  {
    id: 's-class-maybach',
    name: 'Mercedes-Benz S-Class (S 400d / S 580)',
    class: 'First Class Sedan',
    category: 'ultra-vip',
    badge: 'Makam & Protokol',
    badgeColor: 'gold',
    seats: 3,
    luggage: 2,
    transmission: '9G-Tronic 4MATIC',
    specs: { engine: '3.0L Inline-6 330 HP', fuel: 'Dizel / Benzin', year: '2025/2026' },
    baseOpeningRate: 2500,
    baseRateKm: 55,
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Liderler ve iş insanları için sessiz konfor, arka multimedya tabletleri ve koku iyonizasyon sistemi.',
    features: ['Executive Yatar Sağ Arka Koltuk', 'MBUX Arka Koltuk Eğlence Paketi', 'Airmatic Havalı Süspansiyon', 'Akustik Konfor Çift Cam']
  },
  {
    id: 'sprinter-vip',
    name: 'Mercedes-Benz Sprinter Jet Class',
    class: 'Geniş Heyet VIP',
    category: 'group-vip',
    badge: 'Grup & Heyet',
    badgeColor: 'blue',
    seats: 12,
    luggage: 14,
    transmission: '7G-Tronic Otomatik',
    specs: { engine: '2.0L CDI 170 HP', fuel: 'Dizel', year: '2025' },
    baseOpeningRate: 2200,
    baseRateKm: 42,
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Büyük aileler ve kurumsal heyetler için geniş hacimli tavan yüksekliği ve konferans masası düzeni.',
    features: ['12 Bağımsız Deri Koltuk', 'Çift 40" Smart TV Monitör', 'Konferans Toplantı Masası', 'Genişletilmiş Bagaj Bölmesi']
  }
];

export const AMENITIES = [
  {
    id: 'baby-seat',
    title: 'Bebek / Çocuk Güvenlik Koltuğu',
    subtitle: 'ECE R44/04 ve i-Size standartlarına uygun Isofix montajlı koltuk (0-36 kg).',
    priceTRY: 150,
    isFree: false,
    icon: 'Baby',
    hasCount: true,
    checkedByDefault: false
  },
  {
    id: 'vip-meet-greet',
    title: 'Özel İsim Panosuyla VIP Karşılama',
    subtitle: 'Gümrük kapısı çıkışında isimli tablet ile karşılama ve bagaj taşıma asistanlığı.',
    priceTRY: 0,
    isFree: true,
    icon: 'UserCheck',
    checkedByDefault: true
  },
  {
    id: 'flight-tracking-guarantee',
    title: 'Canlı Radar Uçuş Takip Güvencesi',
    subtitle: 'Uçağınız erken inse veya rötar yapsa dahi 60 dakika ücretsiz bekleme garantisi.',
    priceTRY: 0,
    isFree: true,
    icon: 'Plane',
    checkedByDefault: true
  },
  {
    id: 'wifi-multimedia',
    title: 'Sınırsız 5G Wi-Fi & Apple TV / Netflix',
    subtitle: 'Yüksek hızlı internet bağlantısı ve araç içi yayın platformları erişimi.',
    priceTRY: 0,
    isFree: true,
    icon: 'Wifi',
    checkedByDefault: true
  },
  {
    id: 'minibar-premium',
    title: 'VIP Minibar & İkram Paketi',
    subtitle: 'Soğuk meşrubatlar, taze sıkılmış meyve suları, San Pellegrino ve atıştırmalıklar.',
    priceTRY: 350,
    isFree: false,
    icon: 'Wine',
    checkedByDefault: false
  },
  {
    id: 'starlight-ceiling',
    title: 'Starlight Yıldız Tavan & Ambiyans Işığı',
    subtitle: 'Rolls-Royce tarzı fiber optik gece yıldız tavanı ve 64 renk ambiyans aydınlatması.',
    priceTRY: 250,
    isFree: false,
    icon: 'Sparkles',
    checkedByDefault: false
  },
  {
    id: 'multilingual-chauffeur',
    title: 'Yabancı Dil Bilen Protokol Şoförü',
    subtitle: 'Akıcı İngilizce, Rusça veya Arapça konuşabilen takım elbiseli deneyimli şoför.',
    priceTRY: 300,
    isFree: false,
    icon: 'Languages',
    options: ['İngilizce (English)', 'Arapça (Arabic)', 'Rusça (Russian)', 'Almanca (German)'],
    checkedByDefault: false
  },
  {
    id: 'privacy-partition',
    title: 'Elektrikli Akustik Ara Bölme',
    subtitle: 'Şoför mahalli ile yolcu kabinini tamamen ayıran ses geçirmez elektrikli cam bölme.',
    priceTRY: 200,
    isFree: false,
    icon: 'Shield',
    checkedByDefault: false
  }
];

export const POPULAR_ROUTES = [
  { from: 'İstanbul Havalimanı (IST)', to: 'Çırağan Palace Kempinski', distanceKm: 42, durationMin: 45, vehicle: 'Mercedes Vito VIP', priceTRY: 1750, badge: 'En Popüler' },
  { from: 'İstanbul Havalimanı (IST)', to: 'Taksim Meydanı & Beyoğlu', distanceKm: 39, durationMin: 40, vehicle: 'Mercedes Vito VIP', priceTRY: 1650, badge: 'Hızlı Transfer' },
  { from: 'Sabiha Gökçen (SAW)', to: 'Kadıköy Moda Sahili', distanceKm: 34, durationMin: 35, vehicle: 'Mercedes Vito VIP', priceTRY: 1550, badge: 'Anadolu Yakası' },
  { from: 'Antalya Havalimanı (AYT)', to: 'Maxx Royal Belek', distanceKm: 36, durationMin: 30, vehicle: 'Mercedes V-Class VIP', priceTRY: 1950, badge: 'Resort VIP' },
  { from: 'Milas Bodrum (BJV)', to: 'Yalıkavak Marina Resort', distanceKm: 52, durationMin: 50, vehicle: 'Mercedes Maybach V-Class', priceTRY: 2600, badge: 'Yat & Marina' }
];

export const FAQS = [
  {
    q: 'Uçağım rötar yaparsa şoförüm beni bekler mi?',
    a: 'Evet. Rezervasyon sırasında girdiğiniz uçuş numarasını (Örn: TK1984) canlı radar sistemiyle anlık takip ediyoruz. Uçağınız 3 saat gecikse bile iniş yaptığınız anda şoförünüz kapıda hazır bulunur ve 60 dakikaya kadar ücretsiz bekler.'
  },
  {
    q: 'Fiyatlara köprü, otoyol ve otopark ücretleri dahil mi?',
    a: 'Kesinlikle evet. SecureDrive platformunda gördüğünüz tüm fiyatlar %100 her şey dahil sabit fiyatlardır. Yolculuk sonunda köprü, Avrasya tüneli veya havalimanı otoparkı adı altında hiçbir ek ücret talep edilmez.'
  },
  {
    q: 'Bebek koltuğu veya özel donanımları nasıl seçebilirim?',
    a: 'Rezervasyon sırasında Step 2 (Donanım & Özellikler) adımında dilediğiniz sayıda bebek koltuğu, minibar paketi, yıldız tavan veya yabancı dil bilen şoför gibi özellikleri seçebilirsiniz. Aracınız bu donanımlarla adınıza tahsis edilir.'
  },
  {
    q: 'İptal ve değişiklik politikası nedir?',
    a: 'Transfer saatinize 24 saat kalana kadar koşulsuz ve %100 kesintisiz iptal veya tarih değişikliği yapabilirsiniz.'
  }
];

export const CURRENCIES = {
  TRY: { symbol: '₺', rate: 1.0, code: 'TRY' },
  EUR: { symbol: '€', rate: 0.026, code: 'EUR' },
  USD: { symbol: '$', rate: 0.028, code: 'USD' },
  GBP: { symbol: '£', rate: 0.022, code: 'GBP' }
};

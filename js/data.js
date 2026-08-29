/**
 * SecureDrive VIP - Data Store
 * Airports, Luxury Hotels, Fleet, Amenities, Routes, Reviews & Translations
 */

const SECUREDRIVE_DATA = {
  // Exchange rates relative to TRY (Base currency)
  currencies: {
    TRY: { symbol: '₺', rate: 1, name: 'Türk Lirası', flag: '🇹🇷' },
    EUR: { symbol: '€', rate: 0.026, name: 'Euro', flag: '🇪🇺' },
    USD: { symbol: '$', rate: 0.029, name: 'US Dollar', flag: '🇺🇸' },
    GBP: { symbol: '£', rate: 0.023, name: 'British Pound', flag: '🇬🇧' }
  },

  // Popular Airports
  airports: [
    {
      id: 'IST',
      name: 'İstanbul Havalimanı (IST)',
      city: 'İstanbul',
      region: 'Avrupa Yakası',
      coords: [41.2753, 28.7519],
      type: 'airport',
      code: 'IST'
    },
    {
      id: 'SAW',
      name: 'Sabiha Gökçen Havalimanı (SAW)',
      city: 'İstanbul',
      region: 'Anadolu Yakası',
      coords: [40.8986, 29.3092],
      type: 'airport',
      code: 'SAW'
    },
    {
      id: 'AYT',
      name: 'Antalya Havalimanı (AYT)',
      city: 'Antalya',
      region: 'Akdeniz',
      coords: [36.8987, 30.8005],
      type: 'airport',
      code: 'AYT'
    },
    {
      id: 'BJV',
      name: 'Milas-Bodrum Havalimanı (BJV)',
      city: 'Muğla / Bodrum',
      region: 'Ege',
      coords: [37.2506, 27.6644],
      type: 'airport',
      code: 'BJV'
    },
    {
      id: 'DLM',
      name: 'Dalaman Havalimanı (DLM)',
      city: 'Muğla / Dalaman',
      region: 'Ege',
      coords: [36.7131, 28.7925],
      type: 'airport',
      code: 'DLM'
    },
    {
      id: 'ADB',
      name: 'İzmir Adnan Menderes Havalimanı (ADB)',
      city: 'İzmir',
      region: 'Ege',
      coords: [38.2924, 27.1570],
      type: 'airport',
      code: 'ADB'
    },
    {
      id: 'ESB',
      name: 'Ankara Esenboğa Havalimanı (ESB)',
      city: 'Ankara',
      region: 'İç Anadolu',
      coords: [40.1281, 32.9951],
      type: 'airport',
      code: 'ESB'
    },
    {
      id: 'NAV',
      name: 'Nevşehir Kapadokya Havalimanı (NAV)',
      city: 'Nevşehir / Kapadokya',
      region: 'İç Anadolu',
      coords: [38.7719, 34.5344],
      type: 'airport',
      code: 'NAV'
    }
  ],

  // Popular Destinations & Luxury Hotels
  destinations: [
    // Istanbul Luxury Hotels & Hubs
    {
      id: 'CIRAGAN',
      name: 'Çırağan Palace Kempinski',
      city: 'İstanbul',
      district: 'Beşiktaş / Bosphorus',
      coords: [41.0435, 29.0157],
      type: 'hotel',
      baseDistanceKmFromIST: 42,
      baseDistanceKmFromSAW: 46
    },
    {
      id: 'FOURSEASONS_BOSPHORUS',
      name: 'Four Seasons Hotel Istanbul at the Bosphorus',
      city: 'İstanbul',
      district: 'Beşiktaş',
      coords: [41.0461, 29.0205],
      type: 'hotel',
      baseDistanceKmFromIST: 43,
      baseDistanceKmFromSAW: 45
    },
    {
      id: 'MANDARIN_BOSPHORUS',
      name: 'Mandarin Oriental Bosphorus',
      city: 'İstanbul',
      district: 'Kuruçeşme / Beşiktaş',
      coords: [41.0556, 29.0345],
      type: 'hotel',
      baseDistanceKmFromIST: 44,
      baseDistanceKmFromSAW: 48
    },
    {
      id: 'RAFFLES_ISTANBUL',
      name: 'Raffles Istanbul (Zorlu Center)',
      city: 'İstanbul',
      district: 'Levazım / Beşiktaş',
      coords: [41.0673, 29.0163],
      type: 'hotel',
      baseDistanceKmFromIST: 38,
      baseDistanceKmFromSAW: 41
    },
    {
      id: 'SWISSOTEL_BOSPHORUS',
      name: 'Swissôtel The Bosphorus',
      city: 'İstanbul',
      district: 'Maçka / Beşiktaş',
      coords: [41.0408, 28.9972],
      type: 'hotel',
      baseDistanceKmFromIST: 40,
      baseDistanceKmFromSAW: 44
    },
    {
      id: 'TAKSIM_SQUARE',
      name: 'Taksim Meydanı & The Marmara',
      city: 'İstanbul',
      district: 'Beyoğlu',
      coords: [41.0370, 28.9851],
      type: 'district',
      baseDistanceKmFromIST: 39,
      baseDistanceKmFromSAW: 43
    },
    {
      id: 'SULTANAHMET',
      name: 'Sultanahmet Meydanı / Ayasofya & Four Seasons Sultanahmet',
      city: 'İstanbul',
      district: 'Fatih',
      coords: [41.0054, 28.9768],
      type: 'district',
      baseDistanceKmFromIST: 46,
      baseDistanceKmFromSAW: 47
    },
    {
      id: 'KADIKOY_MODA',
      name: 'Kadıköy Rıhtım & Moda / DoubleTree by Hilton',
      city: 'İstanbul',
      district: 'Kadıköy',
      coords: [40.9904, 29.0253],
      type: 'district',
      baseDistanceKmFromIST: 54,
      baseDistanceKmFromSAW: 32
    },
    {
      id: 'GALAPORT',
      name: 'Galataport Istanbul Kruvaziyer Limanı & The Peninsula',
      city: 'İstanbul',
      district: 'Karaköy',
      coords: [41.0258, 28.9832],
      type: 'port',
      baseDistanceKmFromIST: 41,
      baseDistanceKmFromSAW: 44
    },

    // Antalya Luxury Resorts
    {
      id: 'MAXX_ROYAL_BELEK',
      name: 'Maxx Royal Belek Golf Resort',
      city: 'Antalya',
      district: 'Belek',
      coords: [36.8529, 31.0664],
      type: 'hotel',
      baseDistanceKmFromAYT: 34
    },
    {
      id: 'REGNUM_CARYA',
      name: 'Regnum Carya Golf & Spa Resort',
      city: 'Antalya',
      district: 'Belek',
      coords: [36.8711, 31.0044],
      type: 'hotel',
      baseDistanceKmFromAYT: 28
    },
    {
      id: 'RIXOS_PREMIUM_BELEK',
      name: 'Rixos Premium Belek & The Land of Legends',
      city: 'Antalya',
      district: 'Belek / Kadriye',
      coords: [36.8485, 31.0963],
      type: 'hotel',
      baseDistanceKmFromAYT: 36
    },
    {
      id: 'TITANIC_MARDAN',
      name: 'Titanic Mardan Palace',
      city: 'Antalya',
      district: 'Kundu / Lara',
      coords: [36.8596, 30.9167],
      type: 'hotel',
      baseDistanceKmFromAYT: 21
    },

    // Bodrum Luxury Resorts
    {
      id: 'MANDARIN_BODRUM',
      name: 'Mandarin Oriental Bodrum',
      city: 'Muğla / Bodrum',
      district: 'Cennet Koyu / Göltürkbükü',
      coords: [37.1147, 27.4262],
      type: 'hotel',
      baseDistanceKmFromBJV: 45
    },
    {
      id: 'YALIKAVAK_MARINA',
      name: 'Yalıkavak Marina & Bodrum Edition',
      city: 'Muğla / Bodrum',
      district: 'Yalıkavak',
      coords: [37.1065, 27.2917],
      type: 'port',
      baseDistanceKmFromBJV: 52
    },
    {
      id: 'MACAKIZI_BODRUM',
      name: 'Maçakızı Hotel & Lounge',
      city: 'Muğla / Bodrum',
      district: 'Türkbükü',
      coords: [37.1264, 27.3879],
      type: 'hotel',
      baseDistanceKmFromBJV: 46
    }
  ],

  // Fleet Categories and Vehicles
  fleet: [
    {
      id: 'vito-vip',
      name: 'Mercedes-Benz Vito VIP Lounge',
      category: 'vip-minivan',
      categoryTitle: 'VIP Minivan (En Çok Tercih Edilen)',
      badge: 'En Popüler',
      badgeColor: 'amber',
      seats: 6,
      luggage: 6,
      fuelType: 'Dizel / Euro 6',
      transmission: 'Otomatik (9G-Tronic)',
      class: 'VIP Business',
      baseRateKm: 38, // TRY per KM
      baseOpeningRate: 950,
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'
      ],
      description: 'Lüks deri ergonomik koltuklar, özel tasarım tavan aydınlatması, geniş bagaj hacmi ve kablosuz şarj üniteleri ile konforlu grup ve aile transferleri için idealdir.',
      features: [
        'Hakiki Deri Karşılıklı VIP Koltuklar',
        'Yüksek Hızlı 5G Wi-Fi',
        'Akıllı TV & Multimedya Sistemi',
        'Kablosuz Hızlı Şarj İstasyonları',
        'Çift Bölgeli Dijital Klima',
        'Buzdolabı / Soğuk İçecek Ünitesi',
        'Özel Katlanır Çalışma Masası',
        'Geniş 6x Büyük Valiz Hacmi'
      ],
      specs: {
        engine: '2.0L Turbo Dizel 190 HP',
        acceleration: '8.8 sn (0-100)',
        comfortLevel: '⭐⭐⭐⭐⭐ (5/5)',
        privacy: 'Karartılmış VIP Camlar'
      }
    },
    {
      id: 'v-class-maybach',
      name: 'Mercedes-Benz V-Class Maybach Edition',
      category: 'ultra-vip',
      categoryTitle: 'Ultra VIP Maybach Design',
      badge: 'Ultra Lüks',
      badgeColor: 'gold',
      seats: 4,
      luggage: 5,
      fuelType: 'Dizel / Euro 6d',
      transmission: '9G-Tronic Otomatik',
      class: 'Maybach First Class',
      baseRateKm: 55,
      baseOpeningRate: 1500,
      image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'
      ],
      description: 'Maybach iç tasarım, masajlı ve baldır destekli First-Class koltuklar, Starlight yıldız tavan, şampanya soğutucu ve ses geçirmez gizlilik bölmesi ile benzersiz VIP deneyimi.',
      features: [
        'Maybach Masajlı & Isıtmalı/Soğutmalı Koltuklar',
        'Rolls-Royce Starlight Yıldız Tavan (RGB)',
        'Elektrikli Gizlilik Bölmesi (Chauffeur Intercom)',
        '32" 4K Smart TV & Apple TV',
        'Nespresso Kahve Makinesi & VIP Minibar',
        'Burmester 3D Surround Ses Sistemi',
        'PlayStation 5 Konsol (Opsiyonel)',
        'Karartılmış Çift Kat Akustik Camlar'
      ],
      specs: {
        engine: '2.0L Bi-Turbo 237 HP',
        acceleration: '7.9 sn (0-100)',
        comfortLevel: '⭐⭐⭐⭐⭐ (Ultra VIP)',
        privacy: 'Tam İzolasyonlu Gizlilik Bölmesi'
      }
    },
    {
      id: 'e-class',
      name: 'Mercedes-Benz E-Class Executive',
      category: 'executive-sedan',
      categoryTitle: 'Executive Business Sedan',
      badge: 'Kurumsal VIP',
      badgeColor: 'blue',
      seats: 3,
      luggage: 2,
      fuelType: 'Hibrit / Benzin',
      transmission: '9G-Tronic Otomatik',
      class: 'Executive Sedan',
      baseRateKm: 34,
      baseOpeningRate: 850,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80'
      ],
      description: 'İş insanları ve bireysel VIP yolcular için yüksek prestijli, sessiz ve konforlu sedan transfer seçeneği. Ücretsiz Wi-Fi, su ikramı ve takım elbiseli şoför hizmeti.',
      features: [
        'Nappa Deri Isıtmalı Koltuklar',
        'Burmester Premium Ses',
        'Yüksek Hızlı Wi-Fi & Şarj Soketleri',
        'MBUX Arka Kontrol Paneli',
        'Otomatik Arka Güneşlikler',
        'Şişelenmiş Doğal Kaynak Suyu & Islak Mendil'
      ],
      specs: {
        engine: 'E200 Mild Hybrid 204 HP',
        acceleration: '7.5 sn (0-100)',
        comfortLevel: '⭐⭐⭐⭐⭐ (5/5)',
        privacy: 'Makam Perdeleri'
      }
    },
    {
      id: 's-class',
      name: 'Mercedes-Benz S-Class Long Presidential',
      category: 'ultra-vip',
      categoryTitle: 'Presidential Ultra Luxury Sedan',
      badge: 'Protokol / VIP',
      badgeColor: 'purple',
      seats: 3,
      luggage: 3,
      fuelType: 'Hibrit / Benzin',
      transmission: '9G-Tronic Otomatik',
      class: 'Presidential Chauffeur',
      baseRateKm: 70,
      baseOpeningRate: 2200,
      image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80'
      ],
      description: 'Dünyanın en prestijli makam otomobili. Arka şezlong yatarlı First Class koltuk, baldır dayama masajı, akustik sessizlik paketi ve özel protokol karşılama standarttır.',
      features: [
        'First-Class Executive Arka Şezlong Koltuk',
        '10 Farklı Masaj Programı & Isıtmalı Boyun Yastığı',
        'OLED Dokunmatik Arka Tablet Ekranları',
        'Burmester 4D High-End Ses Sistemi',
        'Airmatic Havalı Süspansiyon (Uçan Halı Konforu)',
        'Şampanya Bölmesi & Gümüş Kadehler',
        'Havalimanı VIP Apron/Terminal Kapıda Karşılama'
      ],
      specs: {
        engine: 'S500 4MATIC 435 HP',
        acceleration: '4.9 sn (0-100)',
        comfortLevel: '⭐⭐⭐⭐⭐ (Kusursuz)',
        privacy: 'Protokol Karartmalı Akustik Camlar'
      }
    },
    {
      id: 'sprinter-vip',
      name: 'Mercedes-Benz Sprinter Extra Long Jet Class',
      category: 'group-vip',
      categoryTitle: 'VIP Sprinter Jet Class (Geniş Grup / Heyet)',
      badge: 'Geniş Heyet / VIP',
      badgeColor: 'amber',
      seats: 12,
      luggage: 14,
      fuelType: 'Dizel / Euro 6',
      transmission: '7G / 9G-Tronic Otomatik',
      class: 'Jet Class Sprinter',
      baseRateKm: 60,
      baseOpeningRate: 1800,
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'
      ],
      description: 'Geniş aileler, şirket yönetim kurulları ve kalabalık VIP heyetler için 12 kişilik hakiki deri koltuklu, çift tavan klimalı ve dev bagaj hacimli özel jet konforu.',
      features: [
        '12 Adet Tekli Dönerli Deri VIP Koltuk',
        '43" 4K Smart TV & HDMI Konferans Girişi',
        'Geniş Minibar & Çift Buzdolabı',
        'Starlight Ambiyans Aydınlatma',
        '220V Priz & Her Koltukta USB-C Hızlı Şarj',
        'Ekstra Geniş 14+ Bagaj ve Elbise Askılığı',
        'Elektrikli Basamak & Engelli Rampası Uyumluluğu'
      ],
      specs: {
        engine: 'Sprinter 519 CDI 190 HP',
        acceleration: 'Geniş Gövde / Stabil Konfor',
        comfortLevel: '⭐⭐⭐⭐⭐ (Grup Lüks)',
        privacy: 'Özel Karartmalı VIP Camlar'
      }
    },
    {
      id: 'eqv-electric',
      name: 'Mercedes-Benz EQV / Porsche Taycan (100% Elektrikli VIP)',
      category: 'electric-vip',
      categoryTitle: '100% Elektrikli Eko-Lüks VIP',
      badge: 'Sıfır Emisyon',
      badgeColor: 'green',
      seats: 6,
      luggage: 5,
      fuelType: '100% Elektrik (Sıfır Karbon)',
      transmission: 'Tek Vitesli Otomatik EV',
      class: 'Eco-Luxury VIP',
      baseRateKm: 42,
      baseOpeningRate: 1100,
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80'
      ],
      description: 'Doğa dostu, sıfır emisyonlu ve tamamen sessiz sürüş deneyimi sunan 100% elektrikli lüks VIP filo seçeneği.',
      features: [
        '100% Sessiz Elektrikli Sürüş',
        'Sıfır Karbon Ayak İzi Sertifikası',
        'Deri Masajlı Koltuklar',
        'Yüksek Hızlı 5G Wi-Fi',
        'Multimedya Dokunmatik Ekranlar',
        'Tazelenmiş Hava İyonizasyon Sistemi'
      ],
      specs: {
        engine: '100% Elektrikli 204 HP (100 kWh Batarya)',
        acceleration: '6.2 sn (0-100)',
        comfortLevel: '⭐⭐⭐⭐⭐ (Sessiz Konfor)',
        privacy: 'Karartılmış Güneş Korumalı Camlar'
      }
    }
  ],

  // Extra Features & Amenities (Araç ve Özellik Seçimleri)
  amenities: [
    {
      id: 'baby-seat',
      title: 'Bebek / Çocuk Güvenlik Koltuğu (ISOFIX)',
      subtitle: '0-4 yaş (0-18 kg) veya 4-12 yaş yükseltici minder seçeneği',
      priceTRY: 0, // Free / Complimentary
      isFree: true,
      category: 'family',
      icon: 'fa-baby-carriage',
      popular: true,
      hasCount: true,
      maxCount: 2,
      selectedCount: 0
    },
    {
      id: 'vip-meet-greet',
      title: 'Havalimanı Terminal İçi VIP Karşılama',
      subtitle: 'Terminal çıkış kapısında isminizin yazılı olduğu tablet/pano ile karşılama ve bagaj taşıma asistanlığı',
      priceTRY: 350,
      isFree: false,
      category: 'welcome',
      icon: 'fa-user-tie',
      popular: true
    },
    {
      id: 'flight-tracking-guarantee',
      title: 'Uçuş Takip & Ücretsiz 60 Dk Rötar Garantisi',
      subtitle: 'Uçağınız rötar yapsa dahi anlık radar takibi ile iniş anınıza göre şoförünüz kapıda hazır bekler',
      priceTRY: 0,
      isFree: true,
      category: 'flight',
      icon: 'fa-plane-arrival',
      popular: true,
      checkedByDefault: true
    },
    {
      id: 'wifi-multimedia',
      title: '5G Sınırsız Wi-Fi & Apple TV / Netflix',
      subtitle: 'Yolculuk boyunca yüksek hızlı internet bağlantısı ve akıllı TV multimedya eğlence paketi',
      priceTRY: 0,
      isFree: true,
      category: 'tech',
      icon: 'fa-wifi',
      popular: true,
      checkedByDefault: true
    },
    {
      id: 'minibar-premium',
      title: 'VIP Minibar & İkram Paketi',
      subtitle: 'Soğuk meşrubatlar, San Pellegrino maden suyu, çikolata & fıstık atıştırmalıkları, taze kahve',
      priceTRY: 450,
      isFree: false,
      category: 'beverage',
      icon: 'fa-champagne-glasses',
      popular: true
    },
    {
      id: 'multilingual-chauffeur',
      title: 'Yabancı Dil Bilen Özel Şoför',
      subtitle: 'Akıcı İngilizce, Almanca, Rusça veya Arapça konuşabilen profesyonel takım elbiseli şoför tahsisi',
      priceTRY: 250,
      isFree: false,
      category: 'chauffeur',
      icon: 'fa-language',
      popular: false,
      options: ['İngilizce (English)', 'Almanca (Deutsch)', 'Rusça (Русский)', 'Arapça (العربية)']
    },
    {
      id: 'starlight-ceiling',
      title: 'Starlight Yıldız Tavan & Ambiyans Işığı',
      subtitle: 'Maybach tavan yıldız takımyıldızı aydınlatması ve kişiselleştirilebilir RGB ambiyans renkleri',
      priceTRY: 300,
      isFree: false,
      category: 'luxury',
      icon: 'fa-stars',
      popular: true
    },
    {
      id: 'privacy-partition',
      title: 'Şoför Gizlilik Bölmesi & İnterkom İletişim',
      subtitle: 'Ön ve arka kabini tamamen ayıran ses geçirmez elektrikli cam bölme (Özel iş görüşmeleri için)',
      priceTRY: 400,
      isFree: false,
      category: 'luxury',
      icon: 'fa-shield-halved',
      popular: false
    },
    {
      id: 'extra-luggage-trailer',
      title: 'Ekstra Bagaj Römorku / Valiz Taşıma Alanı',
      subtitle: 'Golf çantaları, kayak takımları veya 8+ büyük valiz için kapalı güvenli römork tahsisi',
      priceTRY: 500,
      isFree: false,
      category: 'luggage',
      icon: 'fa-truck-ramp-box',
      popular: false
    },
    {
      id: 'pet-friendly',
      title: 'Evcil Hayvan Dostu Transfer Kiti',
      subtitle: 'Kedi/köpek kafesi için özel koruma örtüsü, su kabı ve alerjen temizlik güvencesi',
      priceTRY: 200,
      isFree: false,
      category: 'pet',
      icon: 'fa-paw',
      popular: false
    },
    {
      id: 'corporate-billing',
      title: 'Kurumsal E-Fatura & Masraf Merkezi Desteği',
      subtitle: 'Şirket vergi numarası ile anında e-fatura kesimi ve muhasebe dökümü',
      priceTRY: 0,
      isFree: true,
      category: 'corporate',
      icon: 'fa-file-invoice-dollar',
      popular: false
    }
  ],

  // Popular Transfer Fixed Routes (Progo inspiration)
  popularRoutes: [
    {
      id: 'ist-taksim',
      from: 'İstanbul Havalimanı (IST)',
      to: 'Taksim & Beyoğlu Otelleri',
      distanceKm: 39,
      durationMin: 42,
      fromCoords: [41.2753, 28.7519],
      toCoords: [41.0370, 28.9851],
      priceTRY: 1650,
      vehicle: 'Mercedes-Benz Vito VIP',
      badge: 'En Çok Tercih Edilen'
    },
    {
      id: 'ist-besiktas',
      from: 'İstanbul Havalimanı (IST)',
      to: 'Beşiktaş & Çırağan / Boğaz Otelleri',
      distanceKm: 42,
      durationMin: 45,
      fromCoords: [41.2753, 28.7519],
      toCoords: [41.0435, 29.0157],
      priceTRY: 1750,
      vehicle: 'Mercedes-Benz Vito VIP',
      badge: 'Boğaz Hattı VIP'
    },
    {
      id: 'saw-kadikoy',
      from: 'Sabiha Gökçen Havalimanı (SAW)',
      to: 'Kadıköy & Ataşehir / Anadolu Yakası',
      distanceKm: 32,
      durationMin: 35,
      fromCoords: [40.8986, 29.3092],
      toCoords: [40.9904, 29.0253],
      priceTRY: 1450,
      vehicle: 'Mercedes-Benz Vito VIP',
      badge: 'Hızlı Transfer'
    },
    {
      id: 'ayt-belek',
      from: 'Antalya Havalimanı (AYT)',
      to: 'Belek Golf Resort Otelleri',
      distanceKm: 34,
      durationMin: 30,
      fromCoords: [36.8987, 30.8005],
      toCoords: [36.8529, 31.0664],
      priceTRY: 1550,
      vehicle: 'Mercedes-Benz Vito VIP',
      badge: 'Resort Express'
    },
    {
      id: 'bjv-yalikavak',
      from: 'Milas-Bodrum Havalimanı (BJV)',
      to: 'Yalıkavak Marina & Türkbükü',
      distanceKm: 52,
      durationMin: 50,
      fromCoords: [37.2506, 27.6644],
      toCoords: [37.1065, 27.2917],
      priceTRY: 2100,
      vehicle: 'Mercedes-Benz V-Class Maybach',
      badge: 'Bodrum VIP'
    },
    {
      id: 'saw-taksim',
      from: 'Sabiha Gökçen Havalimanı (SAW)',
      to: 'Taksim & Şişli / Avrupa Yakası',
      distanceKm: 44,
      durationMin: 55,
      fromCoords: [40.8986, 29.3092],
      toCoords: [41.0370, 28.9851],
      priceTRY: 1750,
      vehicle: 'Mercedes-Benz Vito VIP',
      badge: 'Kıtalararası VIP'
    }
  ],

  // Sample existing bookings for Live Tracking Demo
  sampleBookings: {
    'SDRV-2026-8812': {
      code: 'SDRV-2026-8812',
      status: 'Şoför Yolda (En Route)',
      statusStep: 3, // 1: Onaylandı, 2: Araç Tahsis Edildi, 3: Şoför Yolda, 4: Karşılama Hazır, 5: Tamamlandı
      passengerName: 'Ahmet Yılmaz',
      phone: '+90 532 555 12 34',
      email: 'ahmet.yilmaz@company.com',
      flightNo: 'TK 1984 (Türk Hava Yolları)',
      pickup: 'İstanbul Havalimanı (IST) - Dış Hatlar Kapı 9',
      destination: 'Çırağan Palace Kempinski, Beşiktaş',
      date: '2026-08-29',
      time: '16:30',
      pax: 3,
      luggage: 4,
      vehicle: 'Mercedes-Benz V-Class Maybach Edition',
      plate: '34 VIP 784',
      chauffeur: {
        name: 'Murat K. (VIP Kıdemli Şoför)',
        phone: '+90 533 900 44 22',
        rating: '4.98 ⭐ (1,240 Transfer)',
        languages: 'Türkçe, İngilizce, Almanca',
        photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80'
      },
      amenitiesSelected: ['Uçuş Takip Garantisi', 'Terminal İçi İsimle Karşılama', 'VIP Minibar', '5G Wi-Fi & Apple TV', 'Yıldız Tavan'],
      totalPriceTRY: 2950,
      currency: 'TRY',
      paymentMethod: '3D Secure Kredi Kartı (Ödendi)'
    },
    'SDRV-2026-4521': {
      code: 'SDRV-2026-4521',
      status: 'Araç Tahsis Edildi (Assigned)',
      statusStep: 2,
      passengerName: 'Hans Zimmermann',
      phone: '+49 170 1234567',
      email: 'hans.z@munich-invest.de',
      flightNo: 'LH 1298 (Lufthansa)',
      pickup: 'Antalya Havalimanı (AYT) - Terminal 1',
      destination: 'Maxx Royal Belek Golf Resort',
      date: '2026-08-30',
      time: '14:15',
      pax: 2,
      luggage: 3,
      vehicle: 'Mercedes-Benz E-Class Executive',
      plate: '07 VIP 332',
      chauffeur: {
        name: 'Serkan D. (Almanca Bilen Şoför)',
        phone: '+90 542 411 22 33',
        rating: '5.0 ⭐ (890 Transfer)',
        languages: 'Türkçe, Almanca, İngilizce',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
      },
      amenitiesSelected: ['Uçuş Takip Garantisi', 'Almanca Bilen Şoför', '5G Wi-Fi', 'Bebek Koltuğu (1 Adet)'],
      totalPriceTRY: 1800,
      currency: 'EUR',
      totalPriceConverted: 46.8,
      paymentMethod: 'Araçta Kredi Kartı'
    }
  },

  // Client Testimonials
  testimonials: [
    {
      name: 'Dr. Mehmet Canberk',
      role: 'CEO, Global Finans Holding',
      comment: 'İstanbul Havalimanı’ndan Çırağan’a yaptığımız transferde Maybach V-Class tahsis edildi. Uçuşumuz 40 dakika gecikmesine rağmen şoförümüz Murat Bey kapıda ismimizle bekliyordu. Araç içi internet ve konfor 10 numara.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      service: 'Maybach VIP Transfer'
    },
    {
      name: 'Elena Rostova',
      role: 'Uluslararası Turizm Acentesi Direktörü',
      comment: 'Antalya Belek bölgesindeki üst düzey misafirlerimiz için sürekli SecureDrive ile çalışıyoruz. Hem çocuk koltuğu hem de minibar ikramları eksiksiz hazırlanmıştı. Sabit fiyat garantisi büyük rahatlık.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      service: 'VIP Minivan & Karşılama'
    },
    {
      name: 'Michael Brand',
      role: 'Yatırımcı / Zürih',
      comment: 'Bodrum Havalimanı - Yalıkavak Marina transferimiz mükemmeldi. Şoförümüz çok akıcı İngilizce konuşuyordu ve valizlerimizi bizzat tekneye kadar taşıdı. Kesinlikle Türkiye’deki en iyi VIP servis.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      service: 'Mercedes S-Class Protokol'
    }
  ],

  // Frequently Asked Questions
  faqs: [
    {
      q: 'Uçağım rötar yaparsa şoförüm beni bekler mi?',
      a: 'Evet, kesinlikle! Rezervasyon esnasında girdiğiniz uçuş numarası sayesinde operasyon merkezimiz uçağınızı canlı radardan takip eder. Uçağınız ne kadar gecikirse geciksin, iniş anınıza göre şoförünüz 60 dakika ücretsiz bekleme garantisiyle hazır olacaktır.'
    },
    {
      q: 'Araç tahsisi nasıl ve neye göre yapılıyor?',
      a: 'Yolcu sayınız, bagaj miktarınız ve talep ettiğiniz konfor özelliklerine (örneğin bebek koltuğu, yıldız tavan, minibar veya gizlilik bölmesi) göre filomuzdaki en uygun tam donanımlı araç otomatik olarak adınıza tahsis edilir ve plaka/şoför bilgileri SMS/E-posta ile iletilir.'
    },
    {
      q: 'Fiyatlarınıza köprü, otoyol ve otopark ücretleri dahil mi?',
      a: '%100 Sabit Fiyat Garantisi sunuyoruz. Rezervasyon aşamasında gördüğünüz fiyata tüm otoyol, köprü, tünel, yakıt, KDV ve havalimanı karşılama otopark ücretleri dahildir. Sonradan sürpriz bir ek ücret asla talep edilmez.'
    },
    {
      q: 'Rezervasyonumu nasıl iptal edebilir veya değiştirebilirim?',
      a: 'Transfer saatinize 24 saat kalana kadar hiçbir kesinti olmadan tek tıkla %100 ücretsiz iptal edebilir veya tarih/saat değişikliği yapabilirsiniz.'
    },
    {
      q: 'Havalimanında şoförümü nasıl bulacağım?',
      a: 'Gümrük ve bagaj alımından çıktıktan sonra havalimanı karşılama kapısında şoförümüz veya operasyon görevlimiz adınızın ve soyadınızın yazılı olduğu özel tablet veya SecureDrive VIP panosu ile sizi bekliyor olacaktır.'
    },
    {
      q: 'Ödemeyi araçta veya nakit yapabilir miyim?',
      a: 'Evet! İster 3D Secure güvencesiyle online kredi kartı ile ödeyebilir, isterseniz araçta nakit (TRY, EUR, USD, GBP) ya da araç içi POS cihazından kredi kartı ile güvenle ödeme yapabilirsiniz.'
    }
  ]
};

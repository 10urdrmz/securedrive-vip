import React from 'react';
import { Plane, Clock, Building2, MapPin, Shield, Star, Award, CheckCircle } from 'lucide-react';

const SERVICES = [
  {
    id: 'airport',
    title: 'Havalimanı VIP Karşılama & Transfer',
    desc: 'İstanbul (IST) ve Sabiha Gökçen (SAW) havalimanlarında çıkış kapısında özel isim panosuyla karşılama, bagaj yardımı ve lüks VIP araçla varış noktasına konforlu ulaşım.',
    icon: Plane,
    features: ['Uçuş Takip Garantisi (Rötarda bekler)', '60 Dk Ücretsiz Bekleme Süresi', 'Bagaj & Bagaj Taşıma Desteği']
  },
  {
    id: 'hourly',
    title: 'Şoförlü Saatlik & Günlük VIP Tahsis',
    desc: 'İş toplantılarınız, şehir turu veya özel programlarınız için gün boyu emrinizde özel protokol şoförü ve ultra lüks VIP minivan tahsisi.',
    icon: Clock,
    features: ['Esnek Rota ve Bekleme Seçenekleri', 'İkram Konsolu ve Ofis Düzeni', 'Sınırsız Şehir İçi Seyahat']
  },
  {
    id: 'corporate',
    title: 'Kurumsal & Diplomatik Heyet Lojistiği',
    desc: 'Şirket yöneticileri, yabancı iş ortakları ve büyükelçilik heyetleri için D2 belgeli, TURSAB güvenceli filo lojistik yönetimi ve cari faturalandırma.',
    icon: Building2,
    features: ['Cari Hesap & Kurumsal E-Fatura', 'Dedicated Operasyon Yöneticisi', 'Protokol Eğitimli Yabancı Dil Bilen Şoförler']
  },
  {
    id: 'intercity',
    title: 'Şehirlerarası VIP Lüks Transfer',
    desc: 'İstanbul’dan Bursa, Bodrum, İzmir, Ankara, Sapanca ve diğer tüm şehirlere uçak konforunda ve kapıdan kapıya özel VIP seyahat.',
    icon: MapPin,
    features: ['Otoyol & Köprü Geçişleri Dahil', 'Kapıdan Kapıya Kesintisiz Ulaşım', 'Yatar Koltuklar & Yatak Fonksiyonu']
  }
];

export default function ServicesPage() {
  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <span className="section-badge">
          PREMIUM VIP HİZMETLERİMİZ
        </span>
        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '12px' }}>
          Her İhtiyaca Özel Lüks Ulaşım Çözümleri
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', maxWidth: '600px', margin: '8px auto 0 auto' }}>
          Kusursuz zamanlama, üst düzey güvenlik ve birinci sınıf konfor anlayışıyla 7/24 hizmetinizdeyiz.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
        {SERVICES.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.id} className="fleet-item-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-stage)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', marginBottom: '16px' }}>
                <Icon size={22} />
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{s.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '18px' }}>
                {s.desc}
              </p>

              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px', fontSize: '12.5px' }}>
                {s.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} color="var(--accent-green)" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

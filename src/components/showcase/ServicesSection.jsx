import React from 'react';
import { Plane, Clock, Building2 } from 'lucide-react';

export default function ServicesSection() {
  return (
    <section className="section-pad" id="services">
      <div className="container">
        <div className="section-head-mini">
          <span className="tag">HİZMETLER</span>
          <h2>Ayrıcalıklı VIP Seyahat Çözümleri</h2>
        </div>

        <div className="fleet-grid-3">
          <div className="fleet-item-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Plane size={18} />
              <h3 style={{ fontSize: '15px' }}>VIP Havalimanı Karşılama</h3>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Gümrük çıkış kapısında isim panosuyla karşılama, bagaj taşıma asistanlığı ve beklemeden doğrudan hareket.
            </p>
          </div>

          <div className="fleet-item-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Clock size={18} />
              <h3 style={{ fontSize: '15px' }}>Şoförlü Saatlik VIP Tahsis</h3>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Şehir içi iş toplantıları, alışveriş ve özel turlarınız için tam donanımlı VIP aracınız gün boyu emrinizde.
            </p>
          </div>

          <div className="fleet-item-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Building2 size={18} />
              <h3 style={{ fontSize: '15px' }}>Kurumsal Heyet Lojistiği</h3>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Şirketiniz için merkezi e-fatura desteği, 30 gün vadeli kurumsal hesap ve koordinatörlü filo operasyonu.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

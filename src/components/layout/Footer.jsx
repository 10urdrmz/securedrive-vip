import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Phone, Mail, MapPin, Award, CheckCircle2, Lock, ArrowUpRight, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="light-footer">
      {/* Top Pre-Footer Trust Bar (Light & Clean) */}
      <div className="light-footer-trust-strip">
        <div className="light-footer-container">
          <div className="light-trust-grid">
            <div className="light-trust-item">
              <div className="light-trust-icon-box">
                <ShieldCheck size={20} color="#10b981" />
              </div>
              <div>
                <strong>T.C. Ulaştırma Bakanlığı D2 Belgeli</strong>
                <p>Resmi D2 yetki belgesi ile %100 yasal, belgeli ve sigortalı VIP transfer.</p>
              </div>
            </div>

            <div className="light-trust-item">
              <div className="light-trust-icon-box">
                <Award size={20} color="#2563eb" />
              </div>
              <div>
                <strong>TÜRSAB A Grubu Lisanslı Acente</strong>
                <p>Belge No: 12450 — Güvenilir kurumsal seyahat acentası güvencesi.</p>
              </div>
            </div>

            <div className="light-trust-item">
              <div className="light-trust-icon-box">
                <Clock size={20} color="#059669" />
              </div>
              <div>
                <strong>60 Dk Ücretsiz Uçuş Rötar Bekleme</strong>
                <p>Canlı radar takip sistemiyle uçağınız gecikse dahi ek ücret alınmaz.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 4-Column Light Footer Content */}
      <div className="light-footer-container light-footer-main">
        <div className="light-footer-grid">
          
          {/* Col 1: Brand & License Details */}
          <div className="light-footer-col brand-col">
            <Link to="/" className="light-footer-brand">
              <img 
                src="/logo.png" 
                alt="Secure drive" 
                className="footer-logo-image" 
              />
              <span className="light-vip-tag">VIP</span>
            </Link>

            <p className="light-footer-desc">
              Havalimanı VIP karşılama, tahsisli protokol şoförü ve lüks şehirlerarası transfer hizmetlerinde Türkiye'nin lider dijital platformu.
            </p>

            <div className="light-badges-stack">
              <div className="light-badge-chip">
                <CheckCircle2 size={13} color="#10b981" />
                <span>D2 Belge No: İST.U-NET.D2.34992</span>
              </div>
              <div className="light-badge-chip">
                <CheckCircle2 size={13} color="#10b981" />
                <span>TÜRSAB Belge No: 12450</span>
              </div>
            </div>
          </div>

          {/* Col 2: Hızlı Bağlantılar */}
          <div className="light-footer-col">
            <h4 className="light-col-heading">Hızlı Bağlantılar</h4>
            <ul className="light-links-list">
              <li>
                <Link to="/filo" className="light-footer-link">VIP Filo Kataloğu</Link>
              </li>
              <li>
                <Link to="/rotalar" className="light-footer-link">Rotalar & Sabit Fiyatlar</Link>
              </li>
              <li>
                <Link to="/hizmetler" className="light-footer-link">Hizmetlerimiz</Link>
              </li>
              <li>
                <Link to="/kurumsal" className="light-footer-link">Kurumsal B2B Anlaşması</Link>
              </li>
              <li>
                <Link to="/takip" className="light-footer-link">Canlı Kupon Sorgulama</Link>
              </li>
              <li>
                <Link to="/sss" className="light-footer-link">Sıkça Sorulan Sorular</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Yönetim Portalları */}
          <div className="light-footer-col">
            <h4 className="light-col-heading">Yönetim & Portallar</h4>
            <ul className="light-links-list">
              <li>
                <Link to="/login" className="light-footer-link">Tek Giriş Portalı</Link>
              </li>
              <li>
                <Link to="/account" className="light-footer-link">VIP Yolcu Portalı</Link>
              </li>
              <li>
                <Link to="/driver" className="light-footer-link">VIP Şoför Konsolu</Link>
              </li>
              <li>
                <Link to="/admin" className="light-footer-link">
                  <span>Lojistik Yönetici Paneli</span>
                  <ArrowUpRight size={12} color="#64748b" />
                </Link>
              </li>
              <li>
                <Link to="/admin/reservations" className="light-footer-link">Tüm Rezervasyonlar</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: 7/24 İletişim & Masalar */}
          <div className="light-footer-col contact-col">
            <h4 className="light-col-heading">7/24 Operasyon Masası</h4>
            <ul className="light-contact-list">
              <li>
                <a href="tel:+908503000000" className="light-contact-item">
                  <Phone size={14} className="light-contact-icon" />
                  <div>
                    <span className="light-contact-sub">7/24 Rezervasyon & Çağrı</span>
                    <strong>+90 (850) 300 00 00</strong>
                  </div>
                </a>
              </li>

              <li>
                <a href="mailto:operasyon@securedrive.com" className="light-contact-item">
                  <Mail size={14} className="light-contact-icon" />
                  <div>
                    <span className="light-contact-sub">Kurumsal Destek</span>
                    <strong>operasyon@securedrive.com</strong>
                  </div>
                </a>
              </li>

              <li className="light-contact-item">
                <MapPin size={14} className="light-contact-icon" />
                <div>
                  <span className="light-contact-sub">VIP Karşılama Masaları</span>
                  <p>İstanbul Havalimanı (IST) & Sabiha Gökçen (SAW) CIP Çıkışları</p>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Light Bar */}
      <div className="light-footer-bottom">
        <div className="light-footer-container light-bottom-inner">
          <div className="light-copyright">
            © 2026 <strong>SecureDrive VIP</strong> Lojistik ve Taşımacılık A.Ş. Tüm hakları saklıdır.
          </div>

          <div className="light-legal-links">
            <Link to="/sss" className="light-legal-link">Gizlilik Politikası</Link>
            <span>·</span>
            <Link to="/sss" className="light-legal-link">KVKK Metni</Link>
            <span>·</span>
            <Link to="/sss" className="light-legal-link">Kullanım Şartları</Link>
            <span>·</span>
            <Link to="/sss" className="light-legal-link">İptal & İade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

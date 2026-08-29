import React, { useState, useEffect } from 'react';
import { ArrowRight, FileDown, Share2, RefreshCw, Satellite } from 'lucide-react';
import { printVoucher } from '../../lib/printVoucher';
import { fetchBookingByCode } from '../../lib/bookingService';

export default function BoardingPassModal({ booking: initialBooking, onClose, onNewBooking }) {
  const [liveBooking, setLiveBooking] = useState(initialBooking);

  useEffect(() => {
    setLiveBooking(initialBooking);
    if (!initialBooking?.code) return;

    let cancelled = false;
    fetchBookingByCode(initialBooking.code).then((fresh) => {
      if (!cancelled && fresh) setLiveBooking(fresh);
    });

    const onBookingUpdated = (event) => {
      if (event.detail?.code === initialBooking.code) {
        fetchBookingByCode(initialBooking.code).then((fresh) => {
          if (!cancelled && fresh) setLiveBooking(fresh);
        });
      }
    };

    window.addEventListener('securedrive-booking-updated', onBookingUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener('securedrive-booking-updated', onBookingUpdated);
    };
  }, [initialBooking]);

  if (!liveBooking) return null;

  const handlePrint = () => {
    printVoucher();
  };

  const handleShare = () => {
    const text = `SecureDrive VIP Transfer Kuponum: Kod: ${liveBooking.code}, Rota: ${liveBooking.pickup_location} -> ${liveBooking.destination_location}, Tarih: ${new Date(liveBooking.transfer_datetime || Date.now()).toLocaleString('tr-TR')}, Araç: ${liveBooking.vehicle_name} (${liveBooking.vehicle_plate || '34 VIP 645'})`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const formatPrice = (val) => {
    return `${Number(val || 0).toLocaleString('tr-TR')} ₺`;
  };

  const formattedDate = liveBooking.transfer_datetime
    ? `${new Date(liveBooking.transfer_datetime).toLocaleDateString('tr-TR')} ${new Date(liveBooking.transfer_datetime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`
    : '29.08.2026 17:00';

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 2500 }}>
      <div className="modal-sheet" style={{ maxWidth: '780px', padding: 0, overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
        
        <div className="ticket-card" id="voucher-pass-card" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          
          <div className="ticket-header">
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                SECUREDRIVE VIP BOARDING PASS
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                RESMİ VIP D2 TAHSİS BELGESİ & KUPON
              </span>
            </div>
            <div className="mono" style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)' }}>
              {liveBooking.code}
            </div>
          </div>

          <div className="ticket-body" style={{ padding: '24px' }}>
            <div>
              <div className="ticket-route" style={{ padding: '14px 18px', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                <div>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                    KALKIŞ NOKTASI
                  </span>
                  <strong style={{ fontSize: '14px', display: 'block', color: 'var(--text)', marginTop: '2px' }}>
                    {liveBooking.pickup_location}
                  </strong>
                </div>
                <ArrowRight size={16} color="var(--text-muted)" style={{ margin: '0 8px' }} />
                <div>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                    VARIŞ NOKTASI
                  </span>
                  <strong style={{ fontSize: '14px', display: 'block', color: 'var(--text)', marginTop: '2px' }}>
                    {liveBooking.destination_location}
                  </strong>
                </div>
              </div>

              <div className="ticket-details-grid" style={{ margin: '20px 0', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Yolcu:</span>
                  <strong style={{ fontSize: '13.5px', display: 'block', color: 'var(--text)' }}>
                    {liveBooking.passenger_name}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tarih & Saat:</span>
                  <strong style={{ fontSize: '13.5px', display: 'block', color: 'var(--text)' }} className="mono">
                    {formattedDate}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Uçuş No:</span>
                  <strong style={{ fontSize: '13.5px', display: 'block', color: 'var(--accent-green)' }}>
                    {liveBooking.flight_no || 'TK 1984'}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Kapasite:</span>
                  <strong style={{ fontSize: '13.5px', display: 'block', color: 'var(--text)' }}>
                    {liveBooking.pax_count || 2} Pax / {liveBooking.luggage_count || 2} Bag
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Transfer Durumu:</span>
                  <strong style={{ fontSize: '13.5px', display: 'block', color: '#2563eb' }}>
                    {liveBooking.status || 'Araç Tahsis Edildi'}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ödeme Durumu:</span>
                  <strong style={{ fontSize: '13.5px', display: 'block', color: 'var(--accent-green)' }}>
                    {liveBooking.payment_status === 'completed' ? '3D Secure Onaylandı' : 'Araçta Ödeme'}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Toplam Tutar:</span>
                  <strong style={{ fontSize: '16px', display: 'block', color: 'var(--text)' }} className="mono">
                    {formatPrice(liveBooking.total_price_try)}
                  </strong>
                </div>
              </div>

              <div className="ticket-allocated-vehicle" style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '14px 18px' }}>
                <div>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                    TAHSİS EDİLEN VIP ARAÇ & ŞOFÖR
                  </span>
                  <strong style={{ fontSize: '14px', display: 'block', color: 'var(--text)', marginTop: '2px' }}>
                    {liveBooking.vehicle_name}
                  </strong>
                  <small style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    Plaka: {liveBooking.vehicle_plate || '—'} · Şoför: {liveBooking.chauffeur_name || 'Atanmadı'}
                  </small>
                </div>
                <span className="preset-chip" style={{ color: 'var(--accent-green)', background: 'var(--accent-green-bg)', fontWeight: 600, padding: '4px 12px' }}>
                  Tahsis Onaylı
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '16px' }}>
                {liveBooking.amenities && liveBooking.amenities.length > 0 ? (
                  liveBooking.amenities.map((am, i) => (
                    <span key={i} className="preset-chip" style={{ fontSize: '11px', background: '#f1f5f9', color: 'var(--text)', border: '1px solid var(--border)' }}>
                      {typeof am === 'string' ? am : am.title || am.name}
                    </span>
                  ))
                ) : (
                  <>
                    <span className="preset-chip" style={{ fontSize: '11px' }}>Bebek / Çocuk Güvenlik Koltuğu</span>
                    <span className="preset-chip" style={{ fontSize: '11px' }}>Özel İsim Panosuyla VIP Karşılama</span>
                    <span className="preset-chip" style={{ fontSize: '11px' }}>Sınırsız 5G Wi-Fi & Apple TV / Netflix</span>
                    <span className="preset-chip" style={{ fontSize: '11px' }}>VIP Minibar & İkram Paketi</span>
                    <span className="preset-chip" style={{ fontSize: '11px' }}>Starlight Yıldız Tavan & Ambiyans Işığı</span>
                    <span className="preset-chip" style={{ fontSize: '11px' }}>Yabancı Dil Bilen Protokol Şoförü</span>
                    <span className="preset-chip" style={{ fontSize: '11px' }}>Elektrikli Akustik Ara Bölme</span>
                  </>
                )}
              </div>
            </div>

            <div className="ticket-qr-col" style={{ paddingLeft: '24px' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${liveBooking.code}`} 
                alt="QR Code"
                style={{ width: '130px', height: '130px', borderRadius: 'var(--radius-md)', padding: '6px', background: '#ffffff', border: '1px solid var(--border)' }}
              />
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', maxWidth: '140px', lineHeight: 1.4, marginTop: '4px' }}>
                Havalimanı çıkışında şoförünüze gösteriniz
              </span>
              <div style={{ fontSize: '11.5px', color: 'var(--accent-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px' }}>
                <Satellite size={13} />
                <span>Canlı Radar Aktif</span>
              </div>
            </div>
          </div>

          <div className="ticket-footer" style={{ padding: '16px 24px', background: '#f8fafc' }}>
            <button 
              type="button" 
              className="btn-ghost" 
              onClick={() => {
                if (onNewBooking) onNewBooking();
                onClose();
              }}
            >
              <RefreshCw size={13} />
              <span>Yeni Rezervasyon</span>
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                className="btn-ghost" 
                onClick={handleShare}
                style={{ color: 'var(--accent-green)', borderColor: 'var(--accent-green-border)', background: 'var(--accent-green-bg)' }}
              >
                <Share2 size={13} />
                <span>WhatsApp</span>
              </button>
              <button 
                type="button" 
                className="btn-action-primary btn-print-voucher" 
                onClick={handlePrint}
                style={{ height: '38px' }}
              >
                <FileDown size={13} />
                <span>Yazdır / PDF</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

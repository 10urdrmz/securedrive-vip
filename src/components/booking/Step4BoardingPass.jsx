import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { getSubmittedBookingByCode } from '../../lib/bookingWizard';
import { ArrowRight, FileDown, Share2, RefreshCw, Satellite } from 'lucide-react';
import { printVoucher } from '../../lib/printVoucher';

function formatTransferDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${date.toLocaleDateString('tr-TR')} ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
}

export default function Step4BoardingPass() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    confirmedBooking,
    formatMoney,
    setConfirmedBooking,
    startNewBooking
  } = useBooking();

  const codeFromUrl = searchParams.get('code');
  const booking = confirmedBooking || getSubmittedBookingByCode(codeFromUrl);

  React.useEffect(() => {
    if (!confirmedBooking && booking) {
      setConfirmedBooking(booking);
    }
  }, [confirmedBooking, booking, setConfirmedBooking]);

  if (!booking) return null;

  const handlePrint = () => {
    printVoucher();
  };

  const handleShare = () => {
    const text = `SecureDrive VIP Transfer Kuponum: Kod: ${booking.code}, Rota: ${booking.pickup_location} -> ${booking.destination_location}, Tarih: ${new Date(booking.transfer_datetime).toLocaleString('tr-TR')}, Araç: ${booking.vehicle_name} (${booking.vehicle_plate})`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleNewBooking = () => {
    startNewBooking();
    navigate('/?booking=search', { replace: true });
  };

  return (
    <div>
      <div className="ticket-card" id="voucher-pass-card">
        
        {/* Header */}
        <div className="ticket-header">
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700 }}>SECUREDRIVE VIP BOARDING PASS</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              RESMİ VIP D2 TAHSİS BELGESİ & KUPON
            </span>
          </div>
          <div className="mono" style={{ fontSize: '14px', fontWeight: 700 }}>
            {booking.code}
          </div>
        </div>

        {/* Body */}
        <div className="ticket-body">
          <div>
            <div className="ticket-row">
              <span className="ticket-label">KALKIŞ</span>
              <span className="ticket-value">
                {booking.pickup_location}
              </span>
            </div>
            <div className="ticket-row">
              <span className="ticket-label">VARIŞ</span>
              <span className="ticket-value">
                {booking.destination_location}
              </span>
            </div>
            <div className="ticket-row">
              <span className="ticket-label">TARİH & SAAT</span>
              <span className="ticket-value">
                {formatTransferDateTime(booking.transfer_datetime)}
              </span>
            </div>
            <div className="ticket-row">
              <span className="ticket-label">ARAÇ</span>
              <span className="ticket-value">
                {booking.vehicle_name}
              </span>
            </div>
            <div className="ticket-row">
              <span className="ticket-label">ŞOFÖR</span>
              <span className="ticket-value">
                {booking.chauffeur_name || 'Atanacak VIP Şoför'}
              </span>
            </div>
            <div className="ticket-row">
              <span className="ticket-label">TOPLAM</span>
              <span className="ticket-value mono" style={{ fontWeight: 800 }}>
                {formatMoney(booking.total_price_try)}
              </span>
            </div>
          </div>

          <div className="ticket-qr-col">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking.code}`} 
              alt="VIP Boarding QR"
            />
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              Havalimanı çıkışında şoförünüze gösteriniz
            </span>
            <div style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Satellite size={12} />
              <span>Canlı Radar Aktif</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="ticket-footer">
          <button 
            type="button" 
            className="btn-ghost" 
            onClick={handleNewBooking}
          >
            <RefreshCw size={12} />
            <span>Yeni Rezervasyon</span>
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link
              to={`/rezervasyon/${booking.code}`}
              className="btn-ghost"
              style={{ textDecoration: 'none' }}
            >
              <ArrowRight size={12} />
              <span>Detayı Gör</span>
            </Link>
            <button 
              type="button" 
              className="btn-ghost" 
              onClick={handleShare}
              style={{ color: 'var(--accent-green)' }}
            >
              <Share2 size={12} />
              <span>WhatsApp</span>
            </button>
            <button 
              type="button" 
              className="btn-action-primary btn-print-voucher" 
              onClick={handlePrint}
            >
              <FileDown size={12} />
              <span>Yazdır / PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

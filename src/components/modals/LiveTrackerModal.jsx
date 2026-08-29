import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { getBookingByCodeFromSupabase } from '../../lib/supabase';
import { BOOKING_STATUS_STEPS, normalizeStatusStep } from '../../lib/bookingStatus';
import { Satellite, Phone, Search, AlertCircle, X } from 'lucide-react';

export default function LiveTrackerModal() {
  const { isTrackerOpen, setIsTrackerOpen } = useBooking();
  const [searchInput, setSearchInput] = useState('');
  const [bookingResult, setBookingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  if (!isTrackerOpen) return null;

  const handleSearch = async (codeToSearch = searchInput) => {
    const code = codeToSearch.trim().toUpperCase();
    if (!code) return;

    setLoading(true);
    setNotFound(false);
    setBookingResult(null);

    try {
      const { data } = await getBookingByCodeFromSupabase(code);
      if (data) {
        setBookingResult(data);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const steps = BOOKING_STATUS_STEPS.map((s) => ({ num: s.step, title: s.label }));

  return (
    <div className="modal-backdrop" onClick={() => setIsTrackerOpen(false)}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close"
          onClick={() => setIsTrackerOpen(false)}
        >
          <X size={14} />
        </button>

        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
          Canlı Rezervasyon & Araç Takibi
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Rezervasyon kodunuzu girerek veritabanındaki canlı durumu görüntüleyin.
        </p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <div className="input-field-box" style={{ flex: 1 }}>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Rezervasyon kodu (SDRV-2026-XXXX)"
            />
          </div>
          <button
            type="button"
            className="btn-action-primary"
            onClick={() => handleSearch(searchInput)}
            disabled={loading}
          >
            <Search size={13} />
            <span>{loading ? 'Aranıyor...' : 'Sorgula'}</span>
          </button>
        </div>

        {notFound && (
          <div style={{ padding: '16px', textAlign: 'center', background: 'var(--bg-stage)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-muted)' }}>
            <AlertCircle size={20} color="var(--text-muted)" style={{ margin: '0 auto 6px auto' }} />
            <div>Girdiğiniz rezervasyon kodu ({searchInput}) ile eşleşen kayıt bulunamadı.</div>
          </div>
        )}

        {bookingResult && (
          <div style={{ background: 'var(--bg-stage)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Canlı Durum
                </span>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
                  {bookingResult.status}
                </h4>
              </div>
              <span className="preset-chip" style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Satellite size={11} />
                <span>Canlı Radar</span>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '14px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '10px 0' }}>
              {steps.map(s => {
                const currentStep = normalizeStatusStep(bookingResult.status_step, bookingResult);
                const isPassed = s.num < currentStep;
                const isCurrent = s.num === currentStep;

                return (
                  <div key={s.num} style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      margin: '0 auto 4px auto',
                      background: isPassed ? 'var(--accent-green-bg)' : isCurrent ? 'var(--accent-black)' : 'var(--bg-chip)',
                      color: isPassed ? 'var(--accent-green)' : isCurrent ? '#fff' : 'var(--text-muted)',
                      border: isPassed ? '1px solid var(--accent-green-border)' : '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 700
                    }}>
                      {isPassed ? '✓' : s.num}
                    </div>
                    <span style={{ fontSize: '10px', color: isCurrent ? 'var(--text)' : 'var(--text-muted)', fontWeight: isCurrent ? 600 : 400 }}>
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', marginBottom: '12px' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Yolcu:</span> <strong>{bookingResult.passenger_name}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Uçuş:</span> <strong style={{ color: 'var(--accent-green)' }}>{bookingResult.flight_no}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Kalkış:</span> <strong>{bookingResult.pickup_location}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Varış:</span> <strong>{bookingResult.destination_location}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Tahsis Araç:</span> <strong>{bookingResult.vehicle_name} ({bookingResult.vehicle_plate})</strong></div>
            </div>

            {bookingResult.chauffeur_name && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Atanan VIP Şoför
                  </span>
                  <strong style={{ fontSize: '12.5px', display: 'block' }}>
                    {bookingResult.chauffeur_name}
                  </strong>
                </div>
                {bookingResult.chauffeur_phone && (
                  <a href={`tel:${bookingResult.chauffeur_phone}`} className="btn-select-chip" style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={11} />
                    <span>Şoförü Ara</span>
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

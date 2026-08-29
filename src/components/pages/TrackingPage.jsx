import React, { useState } from 'react';
import { fetchBookingByCode } from '../../lib/bookingService';
import { verifyGuestAccess } from '../../lib/bookingAccess';
import BoardingPassModal from '../modals/BoardingPassModal';
import BookingCodeLink from '../common/BookingCodeLink';
import { Search, ArrowRight, Lock, AlertCircle, User, Mail } from 'lucide-react';

export default function TrackingPage() {
  const [code, setCode] = useState('');
  const [verifyName, setVerifyName] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showVoucher, setShowVoucher] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!code.trim() || !verifyName.trim() || !verifyEmail.trim()) {
      setErrorMsg('Lütfen rezervasyon kodu, ad soyad ve kayıtlı e-posta adresinizi giriniz.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setResult(null);
    try {
      const data = await fetchBookingByCode(code.trim().toUpperCase());
      if (!data) {
        setErrorMsg('Bu koda ait aktif bir rezervasyon bulunamadı.');
        return;
      }

      if (
        verifyGuestAccess(data, {
          fullName: verifyName,
          email: verifyEmail
        })
      ) {
        setResult(data);
      } else {
        setErrorMsg(
          'Güvenlik doğrulaması başarısız: Ad soyad ve e-posta rezervasyon kaydıyla birebir eşleşmiyor.'
        );
      }
    } catch (err) {
      setErrorMsg('Sorgulama yapılırken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <span className="section-badge">
          GÜVENLİ VIP RADAR & KUPON SORGULAMA
        </span>
        <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '12px' }}>
          Transferinizi & VIP Şoförünüzü Güvenle Takip Edin
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', maxWidth: '580px', margin: '8px auto 0 auto' }}>
          Kişisel veri güvenliğiniz için <strong>SDRV-XXXX</strong> rezervasyon kodunuzla birlikte
          kayıtlı <strong>ad soyad</strong> ve <strong>e-posta</strong> adresinizi eksiksiz giriniz.
        </p>

        <form
          onSubmit={handleSearch}
          style={{
            maxWidth: '540px',
            margin: '24px auto 0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div className="input-field-box" style={{ height: '44px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="SDRV-2026-XXXX"
              className="mono"
              style={{ fontSize: '13.5px', fontWeight: 700 }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div className="input-field-box" style={{ height: '44px' }}>
              <User size={16} color="var(--text-muted)" />
              <input
                type="text"
                value={verifyName}
                onChange={(e) => setVerifyName(e.target.value)}
                placeholder="Ad Soyad (tam)"
                style={{ fontSize: '13px' }}
                autoComplete="name"
                required
              />
            </div>

            <div className="input-field-box" style={{ height: '44px' }}>
              <Mail size={16} color="var(--text-muted)" />
              <input
                type="email"
                value={verifyEmail}
                onChange={(e) => setVerifyEmail(e.target.value)}
                placeholder="Kayıtlı e-posta"
                style={{ fontSize: '13px' }}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-action-primary"
            disabled={loading}
            style={{
              height: '44px',
              width: '100%',
              justifyContent: 'center',
              background: '#0f172a',
              fontSize: '13.5px'
            }}
          >
            <Lock size={14} />
            <span>{loading ? 'Doğrulanıyor...' : 'Güvenli Sorgula & Kuponu Göster'}</span>
          </button>
        </form>

        {errorMsg && (
          <div
            style={{
              maxWidth: '540px',
              margin: '16px auto 0 auto',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textAlign: 'left'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {result && (
        <div
          className="fleet-item-card"
          style={{
            padding: '28px',
            maxWidth: '640px',
            margin: '0 auto',
            boxShadow: 'var(--shadow-modal)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '16px',
              marginBottom: '18px'
            }}
          >
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                DOĞRULANMIŞ VIP BELGESİ
              </span>
              <BookingCodeLink code={result.code} style={{ fontSize: '20px' }} />
            </div>

            <span className="status-tag completed" style={{ fontSize: '12px', padding: '6px 12px' }}>
              ✓ {result.status}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '22px' }}>
            <div
              style={{
                background: '#f8fafc',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)'
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Yolcu Bilgisi:
              </div>
              <strong style={{ fontSize: '15px' }}>{result.passenger_name}</strong>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {result.pax_count} Yolcu · Uçuş:{' '}
                <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{result.flight_no}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div
                style={{
                  background: '#f8fafc',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)'
                }}
              >
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Kalkış:</span>
                <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>
                  {result.pickup_location}
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)'
                }}
              >
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Varış:</span>
                <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>
                  {result.destination_location}
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#f8fafc',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)'
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tahsisli Araç & Plaka:</span>
              <div style={{ fontSize: '13.5px', fontWeight: 700, marginTop: '2px' }}>
                {result.vehicle_name} ({result.vehicle_plate})
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn-action-primary"
              onClick={() => setShowVoucher(true)}
              style={{ flex: 1, justifyContent: 'center', height: '42px' }}
            >
              <span>Resmi Boarding Pass Kuponunu Aç</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {showVoucher && result && (
        <BoardingPassModal booking={result} onClose={() => setShowVoucher(false)} />
      )}
    </div>
  );
}

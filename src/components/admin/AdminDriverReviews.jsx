import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchAllDriverReviews,
  getComplaintsFromReviews,
  isComplaintReview
} from '../../lib/reviewService';
import BookingCodeLink from '../common/BookingCodeLink';
import {
  MessageSquareWarning,
  Star,
  StarHalf,
  AlertCircle,
  RefreshCw,
  Users
} from 'lucide-react';

export default function AdminDriverReviews() {
  const [allReviews, setAllReviews] = useState([]);
  const [reviewFilter, setReviewFilter] = useState('complaints');
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const reviews = await fetchAllDriverReviews();
      setAllReviews(reviews);
    } catch (err) {
      console.error('Reviews fetch error:', err);
      setAllReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const complaints = getComplaintsFromReviews(allReviews);
  const displayedReviews = reviewFilter === 'complaints'
    ? complaints
    : reviewFilter === 'low'
      ? allReviews.filter((r) => Number(r.rating) <= 3)
      : allReviews;

  const formatReviewDate = (review) =>
    new Date(review.created_at || review._savedAt || Date.now()).toLocaleString('tr-TR');

  const feedbackLabel = (type) => {
    if (type === 'complaint') return 'Şikayet';
    if (type === 'neutral') return 'Orta';
    return 'Olumlu';
  };

  return (
    <div className="admin-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>
            Müşteri Değerlendirmeleri & Şoför Şikayetleri
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Tamamlanan transferlerden gelen puanlar ve şikayet bildirimleri burada listelenir.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link
            to="/admin/drivers"
            className="btn-ghost"
            style={{ height: '38px', gap: '6px', textDecoration: 'none' }}
          >
            <Users size={13} />
            <span>Şoför Kadrosu</span>
          </Link>
          <button type="button" className="btn-ghost" onClick={loadReviews} style={{ height: '38px', gap: '6px' }}>
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            <span>Yenile</span>
          </button>
        </div>
      </div>

      <div className="fleet-item-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div className="admin-kpi-grid" style={{ minWidth: '280px', marginBottom: 0, width: '100%', maxWidth: '520px' }}>
            <div className="kpi-card" style={{ padding: '12px 14px' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Toplam Değerlendirme</span>
                <div className="mono" style={{ fontSize: '20px', fontWeight: 800 }}>{allReviews.length}</div>
              </div>
              <Star size={16} color="#f59e0b" />
            </div>
            <div className="kpi-card" style={{ padding: '12px 14px' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Açık Şikayet</span>
                <div className="mono" style={{ fontSize: '20px', fontWeight: 800, color: '#b91c1c' }}>{complaints.length}</div>
              </div>
              <AlertCircle size={16} color="#b91c1c" />
            </div>
          </div>
        </div>

        <div className="service-chips" style={{ marginBottom: '14px' }}>
          <button
            type="button"
            className={`chip-btn ${reviewFilter === 'complaints' ? 'active' : ''}`}
            onClick={() => setReviewFilter('complaints')}
          >
            <MessageSquareWarning size={13} />
            <span>Şikayetler ({complaints.length})</span>
          </button>
          <button
            type="button"
            className={`chip-btn ${reviewFilter === 'low' ? 'active' : ''}`}
            onClick={() => setReviewFilter('low')}
          >
            <StarHalf size={13} />
            <span>Düşük Puanlar (≤3)</span>
          </button>
          <button
            type="button"
            className={`chip-btn ${reviewFilter === 'all' ? 'active' : ''}`}
            onClick={() => setReviewFilter('all')}
          >
            <Star size={13} />
            <span>Tüm Değerlendirmeler ({allReviews.length})</span>
          </button>
        </div>

        {loading ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            background: '#f8fafc',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border)'
          }}>
            <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px auto', display: 'block' }} />
            Değerlendirmeler yükleniyor...
          </div>
        ) : displayedReviews.length === 0 ? (
          <div style={{
            padding: '28px',
            textAlign: 'center',
            background: '#f8fafc',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border)',
            color: 'var(--text-muted)',
            fontSize: '13px'
          }}>
            {reviewFilter === 'complaints'
              ? 'Henüz kayıtlı şoför şikayeti bulunmuyor. Müşteriler tamamlanan transferleri /account sayfasından değerlendirdikçe burada görünecektir.'
              : 'Bu filtre için değerlendirme bulunamadı.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {displayedReviews.map((review) => (
              <div
                key={review.id || review.booking_code}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${isComplaintReview(review) ? '#fecaca' : 'var(--border)'}`,
                  background: isComplaintReview(review) ? '#fef2f2' : '#ffffff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <BookingCodeLink code={review.booking_code} style={{ fontSize: '12px' }} />
                      <span className="preset-chip" style={{
                        fontSize: '10.5px',
                        background: isComplaintReview(review) ? '#fee2e2' : '#eff6ff',
                        color: isComplaintReview(review) ? '#b91c1c' : '#2563eb'
                      }}>
                        {feedbackLabel(review.feedback_type)}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b' }}>
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)} ({review.rating}/5)
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                      Şoför: {review.chauffeur_name} · {review.chauffeur_phone}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Yolcu: {review.passenger_name}
                      {review.passenger_phone ? ` · ${review.passenger_phone}` : ''}
                    </div>
                    {review.comment && (
                      <p style={{ fontSize: '12.5px', color: 'var(--text)', margin: '8px 0 0 0', lineHeight: 1.5 }}>
                        “{review.comment}”
                      </p>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {formatReviewDate(review)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

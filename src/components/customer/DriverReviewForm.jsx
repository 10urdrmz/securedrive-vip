import React, { useState } from 'react';
import { Star, MessageSquareWarning, Send, CheckCircle2 } from 'lucide-react';
import { submitDriverReview } from '../../lib/reviewService';

const FEEDBACK_OPTIONS = [
  { id: 'praise', label: 'Memnunum' },
  { id: 'neutral', label: 'Orta' },
  { id: 'complaint', label: 'Şikayetim Var' }
];

export default function DriverReviewForm({ booking, user, existingReview, onSubmitted }) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState(existingReview?.feedback_type || 'praise');
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (existingReview) {
    return (
      <div style={{
        marginTop: '14px',
        padding: '14px 16px',
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: 'var(--radius-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <CheckCircle2 size={15} color="var(--accent-green)" />
          <strong style={{ fontSize: '13px', color: 'var(--accent-green)' }}>Değerlendirmeniz kaydedildi</strong>
        </div>
        <div style={{ fontSize: '12.5px', color: 'var(--text)' }}>
          Puan: {'★'.repeat(existingReview.rating)}{'☆'.repeat(5 - existingReview.rating)} ({existingReview.rating}/5)
        </div>
        {existingReview.comment && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', marginBottom: 0 }}>
            "{existingReview.comment}"
          </p>
        )}
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setErrorMsg('Lütfen şoförünüze 1-5 arası puan verin.');
      return;
    }
    if (feedbackType === 'complaint' && !comment.trim()) {
      setErrorMsg('Şikayet bildirmek için kısa bir açıklama yazmanız gerekiyor.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const result = await submitDriverReview({
        booking,
        user,
        rating,
        feedbackType,
        comment
      });

      if (result.success) {
        onSubmitted?.(result.data);
      } else {
        setErrorMsg(result.error || 'Değerlendirme gönderilemedi.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Değerlendirme gönderilirken hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginTop: '14px',
        padding: '16px',
        background: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: 'var(--radius-md)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <Star size={15} color="#d97706" />
        <strong style={{ fontSize: '13px' }}>Transfer Tamamlandı — Şoförünüzü Değerlendirin</strong>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
        {booking.chauffeur_name} için deneyiminizi paylaşın. Şikayetler operasyon ekibimiz tarafından takip edilir.
      </p>

      {errorMsg && (
        <div style={{ fontSize: '12px', color: '#b91c1c', marginBottom: '10px' }}>{errorMsg}</div>
      )}

      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '22px',
              lineHeight: 1,
              color: star <= displayRating ? '#f59e0b' : '#d1d5db',
              padding: '2px'
            }}
            aria-label={`${star} yıldız`}
          >
            ★
          </button>
        ))}
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', alignSelf: 'center', marginLeft: '6px' }}>
          {rating ? `${rating}/5` : 'Puan seçin'}
        </span>
      </div>

      <div className="service-chips" style={{ marginBottom: '12px' }}>
        {FEEDBACK_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`chip-btn ${feedbackType === opt.id ? 'active' : ''}`}
            onClick={() => setFeedbackType(opt.id)}
            style={{ fontSize: '11.5px', height: '32px' }}
          >
            {opt.id === 'complaint' && <MessageSquareWarning size={12} />}
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      <textarea
        className="input-field-box"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={
          feedbackType === 'complaint'
            ? 'Şikayetinizi veya yaşadığınız sorunu kısaca yazın...'
            : 'İsteğe bağlı: Teşekkür veya öneriniz...'
        }
        rows={3}
        style={{ width: '100%', resize: 'vertical', minHeight: '72px', marginBottom: '10px' }}
      />

      <button
        type="submit"
        className="btn-action-primary"
        disabled={submitting}
        style={{ height: '36px', fontSize: '12.5px', background: '#d97706' }}
      >
        <Send size={13} />
        <span>{submitting ? 'Gönderiliyor...' : 'Değerlendirmeyi Gönder'}</span>
      </button>
    </form>
  );
}

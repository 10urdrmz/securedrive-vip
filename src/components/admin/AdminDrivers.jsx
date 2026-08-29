import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  buildDriverAccountDefaults,
  createDriverAppUser,
  updateDriverAppUser,
  fetchAppUserById,
  enrichDriversWithAccounts
} from '../../lib/driverAccountService';
import { Link } from 'react-router-dom';
import { fetchDriverReviewStats, getDriverStatsById } from '../../lib/reviewService';
import BookingCodeLink from '../common/BookingCodeLink';
import { 
  UserPlus, 
  Phone, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  RefreshCw,
  Search,
  Users,
  MessageSquareWarning,
  Mail,
  KeyRound,
  User
} from 'lucide-react';

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [reviewStats, setReviewStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [accountForm, setAccountForm] = useState({ username: '', email: '', password: '' });
  const [savedCredentials, setSavedCredentials] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    role: 'Kıdemli VIP Protokol Şoförü',
    phone: '',
    rating: 4.95,
    transfers_count: 0,
    languages: 'Türkçe, İngilizce',
    vehicle_plate: '34 VIP 770',
    status: 'on_duty',
    photo_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80'
  });

  // Fetch Drivers from Supabase
  const fetchDrivers = async () => {
    setLoading(true);
    setFeedbackMsg('');
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch error:', error);
      } else {
        const driverList = data || [];
        const enriched = await enrichDriversWithAccounts(driverList);
        setDrivers(enriched);
        const stats = await fetchDriverReviewStats(driverList);
        setReviewStats(stats);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const resetAccountFormForName = (name, keepPassword = false) => {
    const defaults = buildDriverAccountDefaults(name);
    setAccountForm((prev) => ({
      username: defaults.username,
      email: defaults.email,
      password: keepPassword && prev.password ? prev.password : defaults.password
    }));
  };

  const handleOpenAddModal = () => {
    setEditingDriver(null);
    setSavedCredentials(null);
    setFormData({
      name: '',
      role: 'Kıdemli VIP Protokol Şoförü',
      phone: '',
      rating: 4.95,
      transfers_count: 0,
      languages: 'Türkçe, İngilizce',
      vehicle_plate: '34 VIP 770',
      status: 'on_duty',
      photo_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80'
    });
    resetAccountFormForName('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (driver) => {
    setEditingDriver(driver);
    setSavedCredentials(null);
    setFormData({
      name: driver.name,
      role: driver.role || 'Kıdemli VIP Protokol Şoförü',
      phone: driver.phone || '',
      rating: driver.rating || 4.95,
      transfers_count: driver.transfers_count || 0,
      languages: driver.languages || 'Türkçe, İngilizce',
      vehicle_plate: driver.vehicle_plate || '34 VIP 770',
      status: driver.status || 'on_duty',
      photo_url: driver.photo_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80'
    });

    const account = driver.account || (driver.app_user_id ? await fetchAppUserById(driver.app_user_id) : null);
    if (account) {
      setAccountForm({
        username: account.username || '',
        email: account.email || '',
        password: ''
      });
    } else {
      resetAccountFormForName(driver.name);
    }
    setIsModalOpen(true);
  };

  const handleNameChange = (name) => {
    setFormData((prev) => ({ ...prev, name }));
    if (!editingDriver) {
      resetAccountFormForName(name);
    }
  };

  const handleSaveDriver = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Lütfen şoför adı ve telefon numarasını giriniz.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingDriver) {
        let appUserId = editingDriver.app_user_id;

        if (appUserId) {
          await updateDriverAppUser(appUserId, {
            fullName: formData.name,
            phone: formData.phone,
            username: accountForm.username,
            email: accountForm.email,
            password: accountForm.password,
            photoUrl: formData.photo_url
          });
        } else {
          const { user, credentials } = await createDriverAppUser({
            fullName: formData.name,
            phone: formData.phone,
            username: accountForm.username,
            email: accountForm.email,
            password: accountForm.password,
            photoUrl: formData.photo_url
          });
          appUserId = user.id;
          setSavedCredentials({ ...credentials, name: formData.name });
        }

        const { error } = await supabase
          .from('drivers')
          .update({
            name: formData.name,
            role: formData.role,
            phone: formData.phone,
            rating: Number(formData.rating) || 4.95,
            transfers_count: Number(formData.transfers_count) || 0,
            languages: formData.languages,
            vehicle_plate: formData.vehicle_plate,
            status: formData.status,
            photo_url: formData.photo_url,
            app_user_id: appUserId
          })
          .eq('id', editingDriver.id);

        if (error) {
          alert('Güncelleme hatası: ' + error.message);
          return;
        }

        await fetchDrivers();
        setFeedbackMsg(`"${formData.name}" başarıyla güncellendi.`);
        if (!savedCredentials) setIsModalOpen(false);
      } else {
        const { user, credentials } = await createDriverAppUser({
          fullName: formData.name,
          phone: formData.phone,
          username: accountForm.username,
          email: accountForm.email,
          password: accountForm.password,
          photoUrl: formData.photo_url
        });

        const payload = {
          name: formData.name,
          role: formData.role,
          phone: formData.phone,
          rating: Number(formData.rating) || 4.95,
          transfers_count: Number(formData.transfers_count) || 0,
          languages: formData.languages,
          vehicle_plate: formData.vehicle_plate,
          status: formData.status,
          photo_url: formData.photo_url,
          app_user_id: user.id,
          created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('drivers')
          .insert([payload])
          .select()
          .single();

        if (error) {
          alert('Kayıt hatası: ' + error.message);
          return;
        }

        setSavedCredentials({ ...credentials, name: formData.name });
        setFeedbackMsg(`"${formData.name}" eklendi. Giriş bilgileri aşağıda görüntüleniyor.`);
        await fetchDrivers();
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDriver = async (driver) => {
    if (!window.confirm(`"${driver.name}" adlı şoförü silmek istediğinize emin misiniz?`)) return;
    try {
      const { error } = await supabase.from('drivers').delete().eq('id', driver.id);
      if (error) {
        alert('Silme hatası: ' + error.message);
        return;
      }
      setDrivers(prev => prev.filter(d => d.id !== driver.id));
      setFeedbackMsg(`"${driver.name}" başarıyla silindi.`);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleToggleDuty = async (driver) => {
    const nextStatus = driver.status === 'on_duty' ? 'off_duty' : 'on_duty';
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ status: nextStatus })
        .eq('id', driver.id);

      if (error) {
        alert('Durum güncelleme hatası: ' + error.message);
        return;
      }

      setDrivers(prev => prev.map(d => d.id === driver.id ? { ...d, status: nextStatus } : d));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = drivers.filter(d => 
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.role?.toLowerCase().includes(search.toLowerCase()) ||
    d.phone?.toLowerCase().includes(search.toLowerCase()) ||
    d.vehicle_plate?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>VIP Şoför Kadrosu & Nöbet Yönetimi</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Supabase canlı veritabanı üzerinden şoför ekleyin, düzenleyin, silin ve nöbet durumlarını kontrol edin.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link
            to="/admin/driver-reviews"
            className="btn-ghost"
            style={{ height: '38px', gap: '6px', textDecoration: 'none' }}
          >
            <MessageSquareWarning size={13} />
            <span>Değerlendirmeler & Şikayetler</span>
          </Link>
          <button type="button" className="btn-ghost" onClick={fetchDrivers} style={{ height: '38px', gap: '6px' }}>
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            <span>Yenile</span>
          </button>
          <button type="button" className="btn-action-primary" onClick={handleOpenAddModal} style={{ height: '38px' }}>
            <UserPlus size={14} />
            <span>Yeni Şoför Ekle</span>
          </button>
        </div>
      </div>

      {/* Success alert message */}
      {feedbackMsg && (
        <div style={{
          background: 'var(--accent-green-bg)',
          border: '1px solid var(--accent-green-border)',
          color: 'var(--accent-green)',
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Search Bar */}
      <div style={{ marginBottom: '16px', maxWidth: '340px' }}>
        <div className="input-field-box" style={{ height: '38px' }}>
          <Search size={14} color="var(--text-muted)" />
          <input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Şoför adı, plaka veya telefon ara..." 
            style={{ fontSize: '13px' }}
          />
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', background: '#fff', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
          <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px auto', display: 'block' }} />
          <span>Supabase şoför verileri yükleniyor...</span>
        </div>
      ) : drivers.length === 0 ? (
        /* Clean Empty State */
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          background: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          border: '1px dashed var(--border)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <Users size={28} />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>
            Henüz Kayıtlı VIP Şoför Bulunmuyor
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px auto' }}>
            Veritabanınız tamamen temizlendi. Sağ üstteki veya aşağıdaki buton ile ilk protokol şoförünüzü ekleyebilirsiniz.
          </p>
          <button type="button" className="btn-action-primary" onClick={handleOpenAddModal} style={{ margin: '0 auto', height: '40px' }}>
            <UserPlus size={14} />
            <span>İlk Şoförü Ekle</span>
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', background: '#fff', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
          Arama kriterine uygun şoför bulunamadı.
        </div>
      ) : (
        /* Grid of Real Drivers from Supabase */
        <div className="fleet-grid-3">
          {filtered.map(d => {
            const stats = getDriverStatsById(reviewStats, d.id);
            const displayRating = stats?.average ?? d.rating ?? '4.95';
            const transferCount = stats?.count ?? d.transfers_count ?? 0;
            const complaintCount = stats?.complaints ?? 0;

            return (
            <div key={d.id} className="fleet-item-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <img 
                  src={d.photo_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80'} 
                  alt={d.name} 
                  style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {d.name}
                    </h3>
                    <span className={`status-tag ${d.status === 'on_duty' ? 'waiting' : 'completed'}`} style={{ flexShrink: 0 }}>
                      {d.status === 'on_duty' ? 'Nöbette' : 'İzinli'}
                    </span>
                  </div>
                  <small style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>{d.role}</small>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px', background: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div><strong>İletişim:</strong> {d.phone}</div>
                <div><strong>Müşteri Puanı:</strong> {displayRating} ⭐ ({transferCount} değerlendirme)</div>
                {complaintCount > 0 && (
                  <div style={{ color: '#b91c1c', fontWeight: 600 }}>
                    <strong>Şikayet:</strong> {complaintCount} bildirim
                  </div>
                )}
                <div><strong>Diller:</strong> {d.languages || 'Türkçe, İngilizce'}</div>
                <div><strong>Tahsis Araç:</strong> {d.vehicle_plate || '34 VIP 770'}</div>
                {d.account && (
                  <div style={{ marginTop: '6px', paddingTop: '8px', borderTop: '1px dashed var(--border)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', marginBottom: '4px' }}>Giriş Hesabı</div>
                    <div>👤 {d.account.username}</div>
                    <div>✉️ {d.account.email}</div>
                  </div>
                )}
                {stats?.complaintReviews?.length > 0 && (
                  <div style={{ marginTop: '6px', paddingTop: '8px', borderTop: '1px dashed #fecaca' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#b91c1c', marginBottom: '4px' }}>
                      Son Şikayetler:
                    </div>
                    {stats.complaintReviews.slice(0, 2).map((c) => (
                      <div key={c.booking_code} style={{ fontSize: '11px', color: '#7f1d1d', marginBottom: '4px' }}>
                        · <BookingCodeLink code={c.booking_code} style={{ fontSize: '11px' }} />
                        {c.comment ? `: "${c.comment.slice(0, 60)}${c.comment.length > 60 ? '...' : ''}"` : `: ${c.rating}/5 puan`}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                <a 
                  href={`tel:${d.phone}`} 
                  className="btn-ghost" 
                  style={{ flex: 1, justifyContent: 'center', fontSize: '12px', padding: '6px 8px', textDecoration: 'none' }}
                  title="Şoförü Ara"
                >
                  <Phone size={12} />
                  <span>Ara</span>
                </a>

                <button 
                  type="button" 
                  className="btn-ghost"
                  onClick={() => handleToggleDuty(d)}
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                  title="Nöbet Durumunu Değiştir"
                >
                  {d.status === 'on_duty' ? 'İzinli Yap' : 'Nöbete Al'}
                </button>

                <button 
                  type="button" 
                  className="btn-ghost"
                  onClick={() => handleOpenEditModal(d)}
                  style={{ padding: '6px 8px' }}
                  title="Şoför Bilgilerini Düzenle"
                >
                  <Edit3 size={13} />
                </button>

                <button 
                  type="button" 
                  className="btn-ghost"
                  onClick={() => handleDeleteDriver(d)}
                  style={{ padding: '6px 8px', color: '#ef4444' }}
                  title="Şoförü Sil"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
          })}
        </div>
      )}

      {/* Add / Edit Driver Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <button type="button" className="modal-close" onClick={() => setIsModalOpen(false)}>
              <X size={14} />
            </button>

            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                SUPABASE ŞOFÖR YÖNETİMİ
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                {editingDriver ? 'Şoför Bilgilerini Düzenle' : 'Yeni VIP Şoför Ekle'}
              </h3>
            </div>

            <form onSubmit={handleSaveDriver} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {savedCredentials && (
                <div style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <ShieldCheck size={16} color="#2563eb" />
                    <strong style={{ fontSize: '13px', color: '#1d4ed8' }}>
                      {savedCredentials.name} — Giriş Bilgileri Oluşturuldu
                    </strong>
                  </div>
                  <div style={{ fontSize: '12.5px', lineHeight: 1.7 }}>
                    <div><strong>Kullanıcı adı:</strong> <span className="mono">{savedCredentials.username}</span></div>
                    <div><strong>E-posta:</strong> <span className="mono">{savedCredentials.email}</span></div>
                    <div><strong>Şifre:</strong> <span className="mono">{savedCredentials.password}</span></div>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '8px 0 0 0' }}>
                    Bu bilgileri şoföre iletin. Düzenleme ekranından güncelleyebilirsiniz.
                  </p>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ marginTop: '10px', fontSize: '12px' }}
                    onClick={() => { setSavedCredentials(null); setIsModalOpen(false); }}
                  >
                    Tamam, Kapat
                  </button>
                </div>
              )}

              <div className="input-block">
                <label className="input-label">Ad Soyad *</label>
                <input 
                  type="text" 
                  className="input-field-box" 
                  value={formData.name} 
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Örn: Burak Özdemir"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="input-block">
                  <label className="input-label">Telefon *</label>
                  <input 
                    type="text" 
                    className="input-field-box" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+90 532 000 00 00"
                    required
                  />
                </div>

                <div className="input-block">
                  <label className="input-label">Unvan / Rol</label>
                  <input 
                    type="text" 
                    className="input-field-box" 
                    value={formData.role} 
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Kıdemli VIP Protokol Şoförü"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="input-block">
                  <label className="input-label">Konuşulan Diller</label>
                  <input 
                    type="text" 
                    className="input-field-box" 
                    value={formData.languages} 
                    onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                    placeholder="Türkçe, İngilizce, Almanca"
                  />
                </div>

                <div className="input-block">
                  <label className="input-label">Tahsisli Araç / Plaka</label>
                  <input 
                    type="text" 
                    className="input-field-box" 
                    value={formData.vehicle_plate} 
                    onChange={(e) => setFormData({ ...formData, vehicle_plate: e.target.value })}
                    placeholder="34 VIP 770"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="input-block">
                  <label className="input-label">Nöbet Durumu</label>
                  <select 
                    className="select-chip"
                    style={{ width: '100%', height: '38px' }}
                    value={formData.status} 
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="on_duty">Nöbette / Aktif</option>
                    <option value="off_duty">İzinli / Mola</option>
                  </select>
                </div>

                <div className="input-block">
                  <label className="input-label">Fotoğraf URL</label>
                  <input 
                    type="text" 
                    className="input-field-box" 
                    value={formData.photo_url} 
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} color="#2563eb" />
                    <strong style={{ fontSize: '13px' }}>Şoför Giriş Hesabı</strong>
                  </div>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ fontSize: '11px', height: '30px', padding: '0 8px' }}
                    onClick={() => resetAccountFormForName(formData.name)}
                  >
                    Otomatik Oluştur
                  </button>
                </div>
                <small style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '-4px' }}>
                  Kayıt sırasında otomatik oluşturulur. Varsayılan e-posta: ad.soyad@securedrive.org
                </small>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="input-block">
                    <label className="input-label">Kullanıcı Adı</label>
                    <div className="input-field-box" style={{ height: '38px' }}>
                      <User size={14} color="var(--text-muted)" />
                      <input
                        type="text"
                        value={accountForm.username}
                        onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value })}
                        placeholder="burak.ozdemir"
                        required
                      />
                    </div>
                  </div>
                  <div className="input-block">
                    <label className="input-label">E-Posta</label>
                    <div className="input-field-box" style={{ height: '38px' }}>
                      <Mail size={14} color="var(--text-muted)" />
                      <input
                        type="email"
                        value={accountForm.email}
                        onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                        placeholder="burak.ozdemir@securedrive.org"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="input-block">
                  <label className="input-label">
                    {editingDriver ? 'Yeni Şifre (boş bırakılırsa değişmez)' : 'Geçici Şifre'}
                  </label>
                  <div className="input-field-box" style={{ height: '38px' }}>
                    <KeyRound size={14} color="var(--text-muted)" />
                    <input
                      type="text"
                      value={accountForm.password}
                      onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                      placeholder={editingDriver ? 'Değiştirmek istemiyorsanız boş bırakın' : 'Otomatik üretilir'}
                      required={!editingDriver}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn-ghost" onClick={() => { setSavedCredentials(null); setIsModalOpen(false); }}>
                  İptal
                </button>
                {!savedCredentials && (
                  <button type="submit" className="btn-action-primary" disabled={isSaving}>
                    {isSaving ? 'Kaydediliyor...' : editingDriver ? 'Değişiklikleri Kaydet' : 'Şoförü & Hesabı Oluştur'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

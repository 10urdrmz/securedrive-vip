import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { updateBookingStatus, assignDriverToBooking, findDriverIdForBooking } from '../../lib/bookingService';
import { BOOKING_STATUS_STEPS, getStatusLabel, hasAssignedDriver } from '../../lib/bookingStatus';
import { notifyBookingCreated } from '../../lib/notificationService';
import BoardingPassModal from '../modals/BoardingPassModal';
import BookingCodeLink from '../common/BookingCodeLink';
import { 
  Search, 
  RefreshCw, 
  Trash2, 
  PlusCircle, 
  Edit3, 
  Ticket, 
  X,
  Phone,
  Plane,
  Eye,
  CheckCircle2
} from 'lucide-react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingPassBooking, setViewingPassBooking] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');

  // Form state for Add/Edit
  const [formData, setFormData] = useState({
    code: '',
    passenger_name: '',
    passenger_phone: '',
    passenger_email: '',
    flight_no: 'TK 1984',
    pickup_location: 'İstanbul Havalimanı (IST)',
    destination_location: 'Çırağan Palace Kempinski',
    vehicle_name: 'Mercedes-Benz V-Class Maybach Edition',
    vehicle_plate: '34 VIP 770',
    chauffeur_name: '',
    chauffeur_phone: '',
    status: 'Rezervasyon Alındı',
    status_step: 1,
    pax_count: 2,
    luggage_count: 2,
    total_price_try: 2850,
    payment_status: 'completed',
    payment_method: '3D Secure Kredi Kartı'
  });

  const fetchDrivers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data?.length) {
        setDrivers(data);
        return data;
      }
    } catch (err) {
      console.warn(err);
    }
    setDrivers([]);
    return [];
  }, []);

  const findDriverIdForBookingLocal = (driverList, booking) => findDriverIdForBooking(driverList, booking);

  const applyDriverToForm = (driver, prev) => {
    if (!driver) return prev;
    return {
      ...prev,
      chauffeur_name: driver.name,
      chauffeur_phone: driver.phone,
      vehicle_plate: driver.vehicle_plate || prev.vehicle_plate
    };
  };

  const handleDriverSelect = (driverId) => {
    setSelectedDriverId(driverId);
    const driver = drivers.find((d) => d.id === driverId);
    if (driver) {
      setFormData((prev) => applyDriverToForm(driver, prev));
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Bookings fetch error:', error.message);
      }

      setBookings(data || []);
    } catch (err) {
      console.warn(err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchDrivers();
  }, [fetchDrivers]);

  const handleOpenAdd = async () => {
    setEditingBooking(null);
    const driverList = drivers.length ? drivers : await fetchDrivers();

    const baseForm = {
      code: 'SDRV-2026-' + Math.floor(1000 + Math.random() * 9000),
      passenger_name: '',
      passenger_phone: '',
      passenger_email: '',
      flight_no: 'TK 1984',
      pickup_location: 'İstanbul Havalimanı (IST)',
      destination_location: 'Çırağan Palace Kempinski',
      vehicle_name: 'Mercedes-Benz V-Class Maybach Edition',
      vehicle_plate: '34 VIP 770',
      chauffeur_name: '',
      chauffeur_phone: '',
      status: 'Rezervasyon Alındı',
      status_step: 1,
      pax_count: 2,
      luggage_count: 2,
      total_price_try: 2850,
      payment_status: 'completed',
      payment_method: '3D Secure Kredi Kartı'
    };

    setFormData(baseForm);
    setSelectedDriverId('');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = async (b) => {
    setEditingBooking(b);
    const driverList = drivers.length ? drivers : await fetchDrivers();
    const matchedDriverId = findDriverIdForBookingLocal(driverList, b);

    setFormData({
      code: b.code,
      passenger_name: b.passenger_name || '',
      passenger_phone: b.passenger_phone || '',
      passenger_email: b.passenger_email || '',
      flight_no: b.flight_no || 'TK 1984',
      pickup_location: b.pickup_location || '',
      destination_location: b.destination_location || '',
      vehicle_name: b.vehicle_name || 'Mercedes-Benz V-Class Maybach Edition',
      vehicle_plate: b.vehicle_plate || '34 VIP 770',
      chauffeur_name: b.chauffeur_name || '',
      chauffeur_phone: b.chauffeur_phone || '',
      status: b.status || getStatusLabel(1, b),
      status_step: b.status_step || 1,
      pax_count: b.pax_count || 2,
      luggage_count: b.luggage_count || 2,
      total_price_try: b.total_price_try || 2500,
      payment_status: b.payment_status || 'completed',
      payment_method: b.payment_method || '3D Secure Kredi Kartı'
    });
    setSelectedDriverId(matchedDriverId);
    setIsFormModalOpen(true);
  };

  const handleSaveBooking = async (e) => {
    e.preventDefault();
    if (!formData.passenger_name.trim() || !formData.passenger_phone.trim()) {
      alert('Lütfen yolcu adı ve telefonunu giriniz.');
      return;
    }

    const driver = selectedDriverId ? drivers.find((d) => d.id === selectedDriverId) : null;
    const hasDriver = hasAssignedDriver(formData);
    const payload = {
      ...formData,
      chauffeur_name: formData.chauffeur_name?.trim() || 'Atanacak VIP Şoför',
      chauffeur_phone: formData.chauffeur_phone || '',
      status_step: hasDriver ? 2 : 1,
      status: hasDriver ? getStatusLabel(2, formData) : getStatusLabel(1, formData)
    };

    if (editingBooking) {
      try {
        await supabase.from('bookings').update(payload).eq('id', editingBooking.id);
      } catch (err) {
        console.warn(err);
      }
      setBookings(prev => prev.map(b => b.id === editingBooking.id ? { ...b, ...payload } : b));
    } else {
      const newB = {
        id: 'b_' + Date.now(),
        ...payload,
        total_price_try: Number(formData.total_price_try),
        transfer_datetime: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      try {
        const { data } = await supabase.from('bookings').insert([newB]).select().single();
        if (data) {
          newB.id = data.id;
          Object.assign(newB, data);
        }
      } catch (err) {
        console.warn(err);
      }

      if (driver && hasAssignedDriver(newB)) {
        try {
          await assignDriverToBooking(newB, driver, { assignedBy: 'admin' });
        } catch (err) {
          console.warn(err);
        }
      } else {
        notifyBookingCreated(newB).catch((e) => console.warn(e));
      }

      setBookings(prev => [newB, ...prev]);
    }

    setIsFormModalOpen(false);
  };

  const handleUpdateStatus = async (booking, newStep) => {
    try {
      const label = getStatusLabel(newStep, booking);
      const updated = await updateBookingStatus(
        booking,
        { status: label, status_step: newStep },
        { actorRole: 'admin' }
      );
      setBookings(prev => prev.map(b => (b.id === booking.id ? { ...b, ...updated } : b)));
    } catch (err) {
      alert(err?.message || 'Durum güncellenemedi.');
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Bu rezervasyonu silmek istediğinize emin misiniz?')) return;
    try {
      await supabase.from('bookings').delete().eq('id', id);
    } catch (err) {
      console.warn('Delete error:', err);
    }
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  const filtered = bookings.filter(b => {
    const matchSearch = 
      b.code?.toLowerCase().includes(search.toLowerCase()) ||
      b.passenger_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.flight_no?.toLowerCase().includes(search.toLowerCase()) ||
      b.vehicle_name?.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === 'all') return matchSearch;
    if (statusFilter === 'step1') return matchSearch && (b.status_step || 1) === 1;
    if (statusFilter === 'step2') return matchSearch && b.status_step === 2;
    if (statusFilter === 'step3') return matchSearch && b.status_step === 3;
    if (statusFilter === 'step4') return matchSearch && b.status_step === 4;
    if (statusFilter === 'step5') return matchSearch && b.status_step === 5;
    if (statusFilter === 'step6') return matchSearch && b.status_step === 6;
    return matchSearch;
  });

  return (
    <div className="admin-content">
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Tüm Rezervasyonlar</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Rezervasyon oluşturun, düzenleyin, silin, durumları güncelleyin ve VIP Boarding Pass kuponunu görüntüleyin.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn-ghost" onClick={() => { fetchBookings(); fetchDrivers(); }} style={{ height: '38px', gap: '6px' }}>
            <RefreshCw size={13} />
            <span>Yenile</span>
          </button>
          <button type="button" className="btn-action-primary" onClick={handleOpenAdd} style={{ height: '38px' }}>
            <PlusCircle size={14} />
            <span>Yeni Rezervasyon Ekle</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div className="input-field-box" style={{ width: '320px', height: '38px' }}>
          <Search size={14} color="var(--text-muted)" />
          <input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Rezervasyon kodu, yolcu veya uçuş no..." 
            style={{ fontSize: '13px' }}
          />
        </div>

        <div className="service-chips">
          <button 
            type="button" 
            className={`chip-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Tümü ({bookings.length})
          </button>
          <button 
            type="button" 
            className={`chip-btn ${statusFilter === 'step1' ? 'active' : ''}`}
            onClick={() => setStatusFilter('step1')}
          >
            Şoför Bekliyor
          </button>
          <button 
            type="button" 
            className={`chip-btn ${statusFilter === 'step2' ? 'active' : ''}`}
            onClick={() => setStatusFilter('step2')}
          >
            Şoför Atandı
          </button>
          <button 
            type="button" 
            className={`chip-btn ${statusFilter === 'step3' ? 'active' : ''}`}
            onClick={() => setStatusFilter('step3')}
          >
            Araç Tahsis
          </button>
          <button 
            type="button" 
            className={`chip-btn ${statusFilter === 'step4' ? 'active' : ''}`}
            onClick={() => setStatusFilter('step4')}
          >
            Kapıda
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>KOD</th>
                <th>YOLCU & İLETİŞİM</th>
                <th>UÇUŞ</th>
                <th>ROTA</th>
                <th>TAHSİS ARAÇ / ŞOFÖR</th>
                <th>DURUM DEĞİŞTİR</th>
                <th>TUTAR</th>
                <th>İŞLEM</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    Supabase verileri yükleniyor...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    {bookings.length === 0
                      ? 'Henüz kayıtlı rezervasyon bulunmuyor. Sağ üstten yeni rezervasyon ekleyebilirsiniz.'
                      : 'Kriterlere uygun rezervasyon bulunamadı.'}
                  </td>
                </tr>
              ) : filtered.map(b => (
                <tr key={b.id || b.code}>
                  <td className="mono">
                    <BookingCodeLink code={b.code} />
                  </td>
                  <td>
                    <strong>{b.passenger_name}</strong>
                    <small style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px' }}>{b.passenger_phone}</small>
                  </td>
                  <td>
                    <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{b.flight_no}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px' }}>{b.pickup_location?.split('(')[0]}</div>
                    <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>➔ {b.destination_location?.split('(')[0]}</small>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{b.vehicle_name}</span>
                    <small style={{ display: 'block', color: 'var(--text-muted)', fontSize: '11px' }}>
                      {b.vehicle_plate || '34 VIP 770'} · {b.chauffeur_name}
                    </small>
                  </td>
                  <td>
                    <select 
                      value={b.status_step || 1}
                      onChange={(e) => handleUpdateStatus(b, Number(e.target.value))}
                      className="select-chip"
                      style={{ fontSize: '11.5px', padding: '4px 8px', maxWidth: '180px' }}
                    >
                      {BOOKING_STATUS_STEPS.map((s) => (
                        <option key={s.step} value={s.step}>
                          {s.step}: {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="mono" style={{ fontWeight: 700 }}>
                    {Number(b.total_price_try || 0).toLocaleString('tr-TR')} ₺
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button 
                        type="button" 
                        className="btn-ghost" 
                        onClick={() => setViewingPassBooking(b)}
                        style={{ padding: '5px 8px', color: '#2563eb' }}
                        title="Boarding Pass Kuponunu Görüntüle"
                      >
                        <Ticket size={14} />
                      </button>
                      <button 
                        type="button" 
                        className="btn-ghost" 
                        onClick={() => handleOpenEdit(b)}
                        style={{ padding: '5px 8px' }}
                        title="Düzenle"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button 
                        type="button" 
                        className="btn-ghost" 
                        onClick={() => handleDeleteBooking(b.id)}
                        style={{ padding: '5px 8px', color: '#ef4444' }}
                        title="Sil"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Boarding Pass Ticket View Modal (Matching User Screenshot!) */}
      {viewingPassBooking && (
        <BoardingPassModal 
          booking={viewingPassBooking} 
          onClose={() => setViewingPassBooking(null)} 
        />
      )}

      {/* Add / Edit Booking Modal */}
      {isFormModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsFormModalOpen(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <button type="button" className="modal-close" onClick={() => setIsFormModalOpen(false)}>
              <X size={14} />
            </button>

            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                REZERVASYON YÖNETİMİ
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                {editingBooking ? 'Rezervasyon Bilgilerini Düzenle' : 'Yeni Manuel Rezervasyon Ekle'}
              </h3>
            </div>

            <form onSubmit={handleSaveBooking} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="input-block">
                  <label className="input-label">Rezervasyon Kodu</label>
                  <input 
                    type="text" 
                    className="input-field-box mono" 
                    value={formData.code} 
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>

                <div className="input-block">
                  <label className="input-label">Uçuş Numarası</label>
                  <input 
                    type="text" 
                    className="input-field-box" 
                    value={formData.flight_no} 
                    onChange={(e) => setFormData({ ...formData, flight_no: e.target.value })}
                    placeholder="TK 1984"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="input-block">
                  <label className="input-label">Yolcu Adı Soyadı *</label>
                  <input 
                    type="text" 
                    className="input-field-box" 
                    value={formData.passenger_name} 
                    onChange={(e) => setFormData({ ...formData, passenger_name: e.target.value })}
                    placeholder="Onur Sefa"
                    required
                  />
                </div>

                <div className="input-block">
                  <label className="input-label">Telefon Numarası *</label>
                  <input 
                    type="text" 
                    className="input-field-box" 
                    value={formData.passenger_phone} 
                    onChange={(e) => setFormData({ ...formData, passenger_phone: e.target.value })}
                    placeholder="+90 532 000 00 00"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="input-block">
                  <label className="input-label">Kalkış Noktası</label>
                  <input 
                    type="text" 
                    className="input-field-box" 
                    value={formData.pickup_location} 
                    onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                    placeholder="Sabiha Gökçen Havalimanı (SAW)"
                  />
                </div>

                <div className="input-block">
                  <label className="input-label">Varış Noktası</label>
                  <input 
                    type="text" 
                    className="input-field-box" 
                    value={formData.destination_location} 
                    onChange={(e) => setFormData({ ...formData, destination_location: e.target.value })}
                    placeholder="Kadıköy Moda Sahili"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="input-block">
                  <label className="input-label">Tahsis Araç</label>
                  <input 
                    type="text" 
                    className="input-field-box" 
                    value={formData.vehicle_name} 
                    onChange={(e) => setFormData({ ...formData, vehicle_name: e.target.value })}
                    placeholder="Mercedes-Benz Vito VIP Lounge"
                  />
                </div>

                <div className="input-block">
                  <label className="input-label">Plaka</label>
                  <input 
                    type="text" 
                    className="input-field-box" 
                    value={formData.vehicle_plate} 
                    onChange={(e) => setFormData({ ...formData, vehicle_plate: e.target.value })}
                    placeholder="34 VIP 645"
                  />
                </div>
              </div>

              <div className="input-block" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Atanacak VIP Şoför *</label>
                <select
                  className="select-chip"
                  style={{ width: '100%', height: '40px' }}
                  value={selectedDriverId}
                  onChange={(e) => handleDriverSelect(e.target.value)}
                  required
                >
                  <option value="">Sistemdeki şoförlerden seçin...</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} · {d.phone} · {d.vehicle_plate || 'Plaka yok'} · {d.status === 'on_duty' ? 'Nöbette' : 'İzinli'}
                    </option>
                  ))}
                </select>
                {drivers.length === 0 ? (
                  <small style={{ display: 'block', marginTop: '6px', color: 'var(--text-muted)', fontSize: '11.5px' }}>
                    Kayıtlı şoför bulunamadı.{' '}
                    <Link to="/admin/drivers" style={{ color: '#2563eb', fontWeight: 600 }}>
                      Şoför kadrosuna gidin
                    </Link>
                  </small>
                ) : formData.chauffeur_phone ? (
                  <small style={{ display: 'block', marginTop: '6px', color: 'var(--text-muted)', fontSize: '11.5px' }}>
                    Seçili şoför: <strong>{formData.chauffeur_name}</strong> · {formData.chauffeur_phone}
                    {formData.vehicle_plate ? ` · Plaka: ${formData.vehicle_plate}` : ''}
                  </small>
                ) : null}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="input-block">
                  <label className="input-label">Toplam Tutar (TRY)</label>
                  <input 
                    type="number" 
                    className="input-field-box" 
                    value={formData.total_price_try} 
                    onChange={(e) => setFormData({ ...formData, total_price_try: e.target.value })}
                    placeholder="3570"
                  />
                </div>

                <div className="input-block">
                  <label className="input-label">Yolcu E-Posta</label>
                  <input 
                    type="email" 
                    className="input-field-box" 
                    value={formData.passenger_email} 
                    onChange={(e) => setFormData({ ...formData, passenger_email: e.target.value })}
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn-ghost" onClick={() => setIsFormModalOpen(false)}>
                  İptal
                </button>
                <button type="submit" className="btn-action-primary">
                  {editingBooking ? 'Değişiklikleri Kaydet' : 'Rezervasyonu Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

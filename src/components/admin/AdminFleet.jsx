import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { fetchFleetFromDb } from '../../lib/dbService';
import { 
  Car, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  X, 
  Fuel, 
  Users, 
  Briefcase, 
  RefreshCw,
  Search
} from 'lucide-react';

export default function AdminFleet() {
  const [fleetList, setFleetList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    class: 'VIP Minivan',
    plate: '34 VIP 888',
    seats: 6,
    luggage: 6,
    baseOpeningRate: 1500,
    baseRateKm: 35,
    assignedDriver: '',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
    description: 'Özel tasarım deri koltuklar, multimedya sistemi ve VIP ikram konsolu.'
  });

  const fetchFleet = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('fleet').select('*');
      if (data && data.length > 0) {
        setFleetList(data.map(d => ({
          ...d,
          plate: d.plate || '34 VIP 770',
          status: d.status || 'active',
          assignedDriver: d.assignedDriver || d.assigned_driver || ''
        })));
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setFormData({
      name: '',
      class: 'VIP Minivan',
      plate: '34 VIP ' + Math.floor(100 + Math.random() * 900),
      seats: 6,
      luggage: 6,
      baseOpeningRate: 1500,
      baseRateKm: 35,
      assignedDriver: '',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
      description: 'Özel tasarım VIP araç.'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVehicle(v);
    setFormData({
      name: v.name,
      class: v.class || 'VIP Minivan',
      plate: v.plate || '34 VIP 770',
      seats: v.seats || 6,
      luggage: v.luggage || 6,
      baseOpeningRate: v.baseOpeningRate || 1500,
      baseRateKm: v.baseRateKm || 35,
      assignedDriver: v.assignedDriver || v.assigned_driver || '',
      status: v.status || 'active',
      image: v.image || '',
      description: v.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveVehicle = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Lütfen araç model adını giriniz.');
      return;
    }

    if (editingVehicle) {
      // UPDATE
      try {
        await supabase.from('fleet').update({
          name: formData.name,
          class_name: formData.class,
          seats: Number(formData.seats),
          luggage: Number(formData.luggage),
          base_opening_rate: Number(formData.baseOpeningRate),
          base_rate_km: Number(formData.baseRateKm),
          image_url: formData.image,
          description: formData.description
        }).eq('id', editingVehicle.id);
      } catch (e) {
        console.warn(e);
      }
      setFleetList(prev => prev.map(v => v.id === editingVehicle.id ? { ...v, ...formData } : v));
    } else {
      // CREATE
      const newV = {
        id: 'fleet_' + Date.now(),
        ...formData,
        seats: Number(formData.seats),
        luggage: Number(formData.luggage),
        baseOpeningRate: Number(formData.baseOpeningRate),
        baseRateKm: Number(formData.baseRateKm),
        specs: { engine: '2.0 BiTurbo Dizel', power: '239 HP', sound: 'Burmester VIP', seats: formData.seats + ' Kişi' }
      };

      try {
        await supabase.from('fleet').insert([{
          id: newV.id,
          name: newV.name,
          class_name: newV.class,
          category: 'vip',
          seats: newV.seats,
          luggage: newV.luggage,
          transmission: 'Otomatik 9G-Tronic',
          fuel_engine: 'Dizel / Hibrit',
          base_opening_rate: newV.baseOpeningRate,
          base_rate_km: newV.baseRateKm,
          image_url: newV.image,
          description: newV.description
        }]);
      } catch (e) {
        console.warn(e);
      }

      setFleetList(prev => [newV, ...prev]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Bu aracı filodan silmek istediğinize emin misiniz?')) return;
    try {
      await supabase.from('fleet').delete().eq('id', id);
    } catch (e) {
      console.warn(e);
    }
    setFleetList(prev => prev.filter(v => v.id !== id));
  };

  const toggleStatus = (id) => {
    setFleetList(prev => prev.map(v => {
      if (v.id === id) {
        const next = v.status === 'active' ? 'on_trip' : v.status === 'on_trip' ? 'maintenance' : 'active';
        return { ...v, status: next };
      }
      return v;
    }));
  };

  const filtered = fleetList.filter(v => 
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.plate?.toLowerCase().includes(search.toLowerCase()) ||
    v.class?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>VIP Filo Yönetimi & Envanter</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Lüks transfer araçlarını yönetin, yeni model ekleyin, bakım durumlarını ve şoför atamalarını güncelleyin.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn-ghost" onClick={fetchFleet} style={{ height: '38px', gap: '6px' }}>
            <RefreshCw size={13} />
            <span>Yenile</span>
          </button>
          <button type="button" className="btn-action-primary" onClick={handleOpenAdd} style={{ height: '38px' }}>
            <PlusCircle size={14} />
            <span>Yeni VIP Araç Ekle</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '16px', maxWidth: '340px' }}>
        <div className="input-field-box" style={{ height: '38px' }}>
          <Search size={14} color="var(--text-muted)" />
          <input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Araç modeli, plaka veya segment ara..." 
            style={{ fontSize: '13px' }}
          />
        </div>
      </div>

      {/* Fleet Cards */}
      <div className="fleet-grid-3">
        {filtered.map(v => (
          <div key={v.id} className="fleet-item-card">
            <div className="img-box" style={{ position: 'relative' }}>
              <img src={v.image} alt={v.name} />
              <span 
                className="status-tag"
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: v.status === 'active' ? 'var(--accent-green-bg)' : v.status === 'on_trip' ? '#eff6ff' : '#fffbeb',
                  color: v.status === 'active' ? 'var(--accent-green)' : v.status === 'on_trip' ? '#2563eb' : '#d97706',
                  borderColor: v.status === 'active' ? 'var(--accent-green-border)' : v.status === 'on_trip' ? '#bfdbfe' : '#fde68a'
                }}
              >
                {v.status === 'active' ? 'Hazır / Boşta' : v.status === 'on_trip' ? 'Transferde' : 'Bakımda'}
              </span>
            </div>

            <div className="card-content">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>{v.class}</span>
                <span className="mono" style={{ fontSize: '11px', fontWeight: 700, background: 'var(--bg-chip)', padding: '2px 6px', borderRadius: '4px' }}>
                  {v.plate}
                </span>
              </div>
              <h3 style={{ fontSize: '15px', margin: '4px 0 8px 0', fontWeight: 700 }}>{v.name}</h3>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>Atanan Şoför:</strong> {v.assignedDriver}</div>
                <div><strong>Kapasite:</strong> {v.seats} Kişi / {v.luggage} Valiz</div>
                <div><strong>Açılış Ücreti:</strong> {v.baseOpeningRate || 1500} ₺ ({v.baseRateKm || 35} ₺/km)</div>
              </div>

              <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                <button 
                  type="button" 
                  className="btn-select-chip"
                  onClick={() => toggleStatus(v.id)}
                  style={{ flex: 1, justifyContent: 'center', fontSize: '11.5px' }}
                >
                  Durum ({v.status === 'active' ? 'Göreve Ver' : v.status === 'on_trip' ? 'Bakıma Al' : 'Hazır Et'})
                </button>
                <button 
                  type="button" 
                  className="btn-ghost"
                  onClick={() => handleOpenEdit(v)}
                  style={{ padding: '6px 8px' }}
                  title="Düzenle"
                >
                  <Edit3 size={13} />
                </button>
                <button 
                  type="button" 
                  className="btn-ghost"
                  onClick={() => handleDeleteVehicle(v.id)}
                  style={{ padding: '6px 8px', color: '#ef4444' }}
                  title="Sil"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Vehicle Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <button type="button" className="modal-close" onClick={() => setIsModalOpen(false)}>
              <X size={14} />
            </button>

            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                FİLO YÖNETİMİ
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                {editingVehicle ? 'Araç Bilgilerini Düzenle' : 'Yeni VIP Araç Ekle'}
              </h3>
            </div>

            <form onSubmit={handleSaveVehicle} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-block">
                <label className="input-label">Araç Modeli / Adı *</label>
                <input 
                  type="text" 
                  className="input-field-box" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: Mercedes-Benz V-Class Maybach Edition"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="input-block">
                  <label className="input-label">Araç Segmenti / Sınıfı</label>
                  <input 
                    type="text" 
                    className="input-field-box" 
                    value={formData.class} 
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    placeholder="VIP Minivan / Ultra Luxury"
                  />
                </div>

                <div className="input-block">
                  <label className="input-label">Plaka</label>
                  <input 
                    type="text" 
                    className="input-field-box" 
                    value={formData.plate} 
                    onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                    placeholder="34 VIP 770"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="input-block">
                  <label className="input-label">Yolcu Kapasitesi (Pax)</label>
                  <input 
                    type="number" 
                    className="input-field-box" 
                    value={formData.seats} 
                    onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                  />
                </div>

                <div className="input-block">
                  <label className="input-label">Bagaj Kapasitesi (Bag)</label>
                  <input 
                    type="number" 
                    className="input-field-box" 
                    value={formData.luggage} 
                    onChange={(e) => setFormData({ ...formData, luggage: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="input-block">
                  <label className="input-label">Taban Açılış Fiyatı (TRY)</label>
                  <input 
                    type="number" 
                    className="input-field-box" 
                    value={formData.baseOpeningRate} 
                    onChange={(e) => setFormData({ ...formData, baseOpeningRate: e.target.value })}
                  />
                </div>

                <div className="input-block">
                  <label className="input-label">Km Başı Tarife (TRY)</label>
                  <input 
                    type="number" 
                    className="input-field-box" 
                    value={formData.baseRateKm} 
                    onChange={(e) => setFormData({ ...formData, baseRateKm: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-block">
                <label className="input-label">Fotoğraf URL</label>
                <input 
                  type="text" 
                  className="input-field-box" 
                  value={formData.image} 
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn-ghost" onClick={() => setIsModalOpen(false)}>
                  İptal
                </button>
                <button type="submit" className="btn-action-primary">
                  {editingVehicle ? 'Değişiklikleri Kaydet' : 'Aracı Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

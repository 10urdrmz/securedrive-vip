import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  MapPin, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  X, 
  RefreshCw, 
  Search,
  Eye,
  EyeOff
} from 'lucide-react';

const EMPTY_FORM = {
  from_location: 'İstanbul Havalimanı (IST)',
  to_location: '',
  distance_km: 35,
  duration_min: 40,
  vehicle: 'Mercedes Vito VIP',
  price_try: 1600,
  badge: 'Sabit Fiyat',
  is_active: true
};

function toRoutePayload(formData) {
  return {
    from_location: formData.from_location.trim(),
    to_location: formData.to_location.trim(),
    distance_km: Number(formData.distance_km) || 0,
    duration_min: Number(formData.duration_min) || 0,
    vehicle: formData.vehicle?.trim() || 'Mercedes Vito VIP',
    price_try: Number(formData.price_try) || 0,
    badge: formData.badge?.trim() || 'Sabit Fiyat',
    is_active: formData.is_active !== false
  };
}

export default function AdminRoutes() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRoutes(data || []);
    } catch (e) {
      console.warn(e);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleOpenAdd = () => {
    setEditingRoute(null);
    setFormData({ ...EMPTY_FORM });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      from_location: route.from_location,
      to_location: route.to_location,
      distance_km: route.distance_km,
      duration_min: route.duration_min,
      vehicle: route.vehicle || 'Mercedes Vito VIP',
      price_try: route.price_try,
      badge: route.badge || 'Sabit Fiyat',
      is_active: route.is_active !== false
    });
    setIsModalOpen(true);
  };

  const handleSaveRoute = async (e) => {
    e.preventDefault();
    if (!formData.from_location.trim() || !formData.to_location.trim()) {
      alert('Lütfen kalkış ve varış noktalarını giriniz.');
      return;
    }

    const payload = toRoutePayload(formData);

    if (editingRoute) {
      try {
        const { error } = await supabase
          .from('routes')
          .update(payload)
          .eq('id', editingRoute.id);
        if (error) throw error;
        setRoutes((prev) => prev.map((route) => (
          route.id === editingRoute.id ? { ...route, ...payload } : route
        )));
      } catch (err) {
        console.warn(err);
        alert('Rota güncellenemedi. Lütfen tekrar deneyin.');
        return;
      }
    } else {
      try {
        const { data, error } = await supabase
          .from('routes')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        setRoutes((prev) => [data, ...prev]);
      } catch (err) {
        console.warn(err);
        alert('Rota eklenemedi. Lütfen tekrar deneyin.');
        return;
      }
    }

    setIsModalOpen(false);
  };

  const handleDeleteRoute = async (id) => {
    if (!window.confirm('Bu rotayı silmek istediğinize emin misiniz?')) return;
    try {
      const { error } = await supabase.from('routes').delete().eq('id', id);
      if (error) throw error;
      setRoutes((prev) => prev.filter((route) => route.id !== id));
    } catch (err) {
      console.warn(err);
      alert('Rota silinemedi.');
    }
  };

  const toggleActive = async (route) => {
    const nextActive = route.is_active === false;
    try {
      const { error } = await supabase
        .from('routes')
        .update({ is_active: nextActive })
        .eq('id', route.id);
      if (error) throw error;
      setRoutes((prev) => prev.map((item) => (
        item.id === route.id ? { ...item, is_active: nextActive } : item
      )));
    } catch (err) {
      console.warn(err);
      alert('Rota durumu güncellenemedi.');
    }
  };

  const filtered = routes.filter((route) => 
    route.from_location?.toLowerCase().includes(search.toLowerCase()) ||
    route.to_location?.toLowerCase().includes(search.toLowerCase()) ||
    route.badge?.toLowerCase().includes(search.toLowerCase()) ||
    route.vehicle?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Popüler Transfer Rotaları & Sabit Fiyatlar</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Havalimanı ve otel rotalarını ekleyin; arama sayfasındaki hızlı seçim ve araç listeleme filtrelerinde otomatik görünür.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn-ghost" onClick={fetchRoutes} style={{ height: '38px', gap: '6px' }}>
            <RefreshCw size={13} />
            <span>Yenile</span>
          </button>
          <button type="button" className="btn-action-primary" onClick={handleOpenAdd} style={{ height: '38px' }}>
            <PlusCircle size={14} />
            <span>Yeni Rota Ekle</span>
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '16px', maxWidth: '340px' }}>
        <div className="input-field-box" style={{ height: '38px' }}>
          <Search size={14} color="var(--text-muted)" />
          <input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Kalkış, varış veya araç ara..." 
            style={{ fontSize: '13px' }}
          />
        </div>
      </div>

      <div className="admin-table-container">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ETİKET</th>
                <th>KALKIŞ NOKTASI</th>
                <th>VARIŞ NOKTASI</th>
                <th>MESAFE / SÜRE</th>
                <th>ARAÇ TİPİ</th>
                <th>SABİT ÜCRET</th>
                <th>SİTEDE</th>
                <th>İŞLEM</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    Rotalar yükleniyor...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    Henüz rota tanımlanmadı.
                  </td>
                </tr>
              ) : filtered.map((route) => (
                <tr key={route.id} style={{ opacity: route.is_active === false ? 0.55 : 1 }}>
                  <td>
                    <span className="preset-chip" style={{ background: '#eff6ff', color: '#2563eb', fontWeight: 700 }}>
                      {route.badge || 'Sabit Fiyat'}
                    </span>
                  </td>
                  <td><strong>{route.from_location}</strong></td>
                  <td><strong>{route.to_location}</strong></td>
                  <td>
                    <span>{route.distance_km} km</span> · <small style={{ color: 'var(--text-muted)' }}>{route.duration_min} dk</small>
                  </td>
                  <td>{route.vehicle || 'Mercedes Vito VIP'}</td>
                  <td className="mono" style={{ fontWeight: 700, fontSize: '14px' }}>
                    {Number(route.price_try || 0).toLocaleString('tr-TR')} ₺
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => toggleActive(route)}
                      title={route.is_active !== false ? 'Sitede gizle' : 'Sitede göster'}
                      style={{
                        padding: '6px 10px',
                        gap: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        color: route.is_active !== false ? 'var(--accent-green)' : 'var(--text-muted)',
                        fontSize: '12px',
                        fontWeight: 600
                      }}
                    >
                      {route.is_active !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                      <span>{route.is_active !== false ? 'Görünür' : 'Gizli'}</span>
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button type="button" className="btn-ghost" onClick={() => handleOpenEdit(route)} style={{ padding: '6px 8px' }}>
                        <Edit3 size={13} />
                      </button>
                      <button type="button" className="btn-ghost" onClick={() => handleDeleteRoute(route.id)} style={{ padding: '6px 8px', color: '#ef4444' }}>
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

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <button type="button" className="modal-close" onClick={() => setIsModalOpen(false)}>
              <X size={14} />
            </button>

            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>ROTA YÖNETİMİ</span>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{editingRoute ? 'Rotayı Düzenle' : 'Yeni Rota Tanımla'}</h3>
            </div>

            <form onSubmit={handleSaveRoute} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-block">
                <label className="input-label">Kalkış Noktası *</label>
                <input 
                  type="text" 
                  className="input-field-box" 
                  value={formData.from_location} 
                  onChange={(e) => setFormData({ ...formData, from_location: e.target.value })}
                  placeholder="İstanbul Havalimanı (IST)"
                  required
                />
              </div>

              <div className="input-block">
                <label className="input-label">Varış Noktası *</label>
                <input 
                  type="text" 
                  className="input-field-box" 
                  value={formData.to_location} 
                  onChange={(e) => setFormData({ ...formData, to_location: e.target.value })}
                  placeholder="Çırağan Palace Kempinski"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="input-block">
                  <label className="input-label">Mesafe (Km)</label>
                  <input 
                    type="number" 
                    className="input-field-box" 
                    value={formData.distance_km} 
                    onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
                  />
                </div>

                <div className="input-block">
                  <label className="input-label">Tahmini Süre (Dk)</label>
                  <input 
                    type="number" 
                    className="input-field-box" 
                    value={formData.duration_min} 
                    onChange={(e) => setFormData({ ...formData, duration_min: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-block">
                <label className="input-label">Araç Tipi</label>
                <input
                  type="text"
                  className="input-field-box"
                  value={formData.vehicle}
                  onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                  placeholder="Mercedes Vito VIP"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="input-block">
                  <label className="input-label">Sabit VIP Ücret (TRY) *</label>
                  <input 
                    type="number" 
                    className="input-field-box" 
                    value={formData.price_try} 
                    onChange={(e) => setFormData({ ...formData, price_try: e.target.value })}
                    required
                  />
                </div>

                <div className="input-block">
                  <label className="input-label">Öne Çıkan Etiket</label>
                  <input 
                    type="text" 
                    className="input-field-box" 
                    value={formData.badge} 
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="En Popüler / Hızlı Transfer"
                  />
                </div>
              </div>

              <div className="input-block">
                <label className="input-label">Sitede Göster</label>
                <select
                  className="select-chip"
                  style={{ width: '100%', height: '38px' }}
                  value={formData.is_active ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                >
                  <option value="true">Evet — arama ve filtrelerde görünsün</option>
                  <option value="false">Hayır — sadece admin panelinde kalsın</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn-ghost" onClick={() => setIsModalOpen(false)}>İptal</button>
                <button type="submit" className="btn-action-primary">
                  {editingRoute ? 'Değişiklikleri Kaydet' : 'Rotayı Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { supabase } from './supabase';

const LOCAL_KEY = 'securedrive_corporate_applications';

function saveApplicationLocally(application) {
  try {
    const list = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    list.unshift({
      ...application,
      id: application.id || `local_${Date.now()}`,
      _savedAt: new Date().toISOString()
    });
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(0, 100)));
  } catch (e) {
    console.warn('Local corporate application save failed:', e);
  }
}

export async function submitCorporateApplication({
  companyName,
  taxNumber,
  contactPerson,
  email,
  phone,
  monthlyTrips,
  source = 'kurumsal-page'
}) {
  const payload = {
    company_name: companyName.trim(),
    tax_number: taxNumber?.trim() || null,
    contact_person: contactPerson.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    monthly_trips: monthlyTrips || null,
    source,
    status: 'pending',
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('corporate_applications')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.warn('Corporate application insert notice:', error.message);
    const isRlsError = error.code === '42501' || /row-level security/i.test(error.message || '');

    if (!isRlsError) {
      saveApplicationLocally(payload);
    }

    return {
      success: false,
      error: isRlsError
        ? 'Veritabanı izin hatası: corporate_applications tablosu için INSERT policy eksik. Supabase SQL Editor\'da migrations dosyasını çalıştırın.'
        : error.message,
      data: payload,
      savedLocally: !isRlsError
    };
  }

  return { success: true, data };
}

export async function fetchCorporateApplications() {
  const { data, error } = await supabase
    .from('corporate_applications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    console.warn('Corporate applications fetch notice:', error.message);
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    } catch {
      return [];
    }
  }

  return data || [];
}

export async function updateCorporateApplicationStatus(id, status, notes) {
  const patch = {
    status,
    notes: notes || null,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('corporate_applications')
    .update(patch)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.warn('Corporate application update notice:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

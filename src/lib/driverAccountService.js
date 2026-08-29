import { supabase } from './supabase';

const EMAIL_DOMAIN = 'securedrive.org';

function slugifyTurkish(text) {
  return (text || '')
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s.]/g, '')
    .trim();
}

export function buildDriverAccountDefaults(fullName) {
  const parts = slugifyTurkish(fullName).split(/\s+/).filter(Boolean);
  const first = parts[0] || 'sofor';
  const last = parts.length > 1 ? parts[parts.length - 1] : '';
  const username = last ? `${first}.${last}` : first;
  const email = `${username}@${EMAIL_DOMAIN}`;
  const password = `Sofor${Math.floor(1000 + Math.random() * 9000)}!`;

  return { username, email, password };
}

async function ensureUniqueUsername(baseUsername) {
  let candidate = baseUsername;
  let counter = 1;

  while (counter < 50) {
    const { data } = await supabase
      .from('app_users')
      .select('id')
      .eq('username', candidate)
      .maybeSingle();

    if (!data) return candidate;
    counter += 1;
    candidate = `${baseUsername}${counter}`;
  }

  return `${baseUsername}${Date.now()}`;
}

async function ensureUniqueEmail(baseEmail) {
  const [local, domain] = baseEmail.split('@');
  let candidate = baseEmail;
  let counter = 1;

  while (counter < 50) {
    const { data } = await supabase
      .from('app_users')
      .select('id')
      .eq('email', candidate)
      .maybeSingle();

    if (!data) return candidate;
    counter += 1;
    candidate = `${local}${counter}@${domain || EMAIL_DOMAIN}`;
  }

  return `${local}${Date.now()}@${domain || EMAIL_DOMAIN}`;
}

export async function createDriverAppUser({ fullName, phone, username, email, password, photoUrl }) {
  const defaults = buildDriverAccountDefaults(fullName);
  const finalUsername = await ensureUniqueUsername((username || defaults.username).trim().toLowerCase());
  const finalEmail = await ensureUniqueEmail((email || defaults.email).trim().toLowerCase());
  const finalPassword = (password || defaults.password).trim();

  const payload = {
    username: finalUsername,
    email: finalEmail,
    password_hash: finalPassword,
    full_name: fullName.trim(),
    phone: phone?.trim() || null,
    role: 'driver',
    avatar_url: photoUrl || null,
    is_active: true
  };

  const { data, error } = await supabase
    .from('app_users')
    .insert([payload])
    .select('id, username, email, full_name, phone, role, is_active')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    user: data,
    credentials: {
      username: finalUsername,
      email: finalEmail,
      password: finalPassword
    }
  };
}

export async function updateDriverAppUser(appUserId, { fullName, phone, username, email, password, photoUrl, isActive }) {
  if (!appUserId) return null;

  const patch = {
    full_name: fullName?.trim(),
    phone: phone?.trim() || null,
    role: 'driver',
    avatar_url: photoUrl || null
  };

  if (username?.trim()) patch.username = username.trim().toLowerCase();
  if (email?.trim()) patch.email = email.trim().toLowerCase();
  if (password?.trim()) patch.password_hash = password.trim();
  if (typeof isActive === 'boolean') patch.is_active = isActive;

  const { data, error } = await supabase
    .from('app_users')
    .update(patch)
    .eq('id', appUserId)
    .select('id, username, email, full_name, phone, role, is_active')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function fetchAppUserById(appUserId) {
  if (!appUserId) return null;

  const { data, error } = await supabase
    .from('app_users')
    .select('id, username, email, full_name, phone, role, is_active')
    .eq('id', appUserId)
    .maybeSingle();

  if (error) {
    console.warn('App user fetch notice:', error.message);
    return null;
  }

  return data;
}

export async function enrichDriversWithAccounts(drivers = []) {
  const ids = drivers.map((d) => d.app_user_id).filter(Boolean);
  if (!ids.length) return drivers.map((d) => ({ ...d, account: null }));

  const { data } = await supabase
    .from('app_users')
    .select('id, username, email, full_name, phone, role, is_active')
    .in('id', ids);

  const map = new Map((data || []).map((u) => [u.id, u]));

  return drivers.map((driver) => ({
    ...driver,
    account: driver.app_user_id ? map.get(driver.app_user_id) || null : null
  }));
}

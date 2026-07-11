// Couche d'accès à l'API senedoc.
// Toutes les requêtes passent par ici. Le cookie de session (httpOnly)
// est géré par le navigateur via credentials:'include'.

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.senedoc.net';

type ApiOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean; // envoyer le cookie de session
};

export async function apiFetch<T = any>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: auth ? 'include' : 'omit',
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Le backend renvoie { message, statusCode }. On propage le message.
    throw new Error(data?.message || `Erreur ${res.status}`);
  }
  return data as T;
}

// ── Auth ──────────────────────────────────────────────
export const auth = {
  register: (body: {
    firstName: string;
    lastName: string;
    phone: string;
    region?: string;
    city?: string;
    email?: string;
    password?: string;
  }) => apiFetch('/auth/register', { method: 'POST', body, auth: false }),

  verifyOtp: (body: { userId: string; otp: string }) =>
    apiFetch('/auth/verify-otp', { method: 'POST', body }),

  setPin: (body: { pin: string }) =>
    apiFetch('/auth/set-pin', { method: 'POST', body }),

  loginPin: (body: { phone: string; pin: string }) =>
    apiFetch('/auth/login-pin', { method: 'POST', body }),

  requestPinReset: (body: { phone: string }) =>
    apiFetch('/auth/request-pin-reset', { method: 'POST', body, auth: false }),

  resetPin: (body: { phone: string; otp: string; newPin: string }) =>
    apiFetch('/auth/reset-pin', { method: 'POST', body, auth: false }),

  loginAdmin: (body: { email: string; password: string }) =>
    apiFetch('/auth/login', { method: 'POST', body }),

  me: () => apiFetch('/auth/me'),

  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
};

// ── Patients ──────────────────────────────────────────
export const patients = {
  getMe: () => apiFetch('/patients/me'),
};

// ── Spécialités (autocomplétion) ─────────────────────
export const specialties = {
  getAll: (): Promise<{ id: string; name: string }[]> =>
    apiFetch('/specialties', { auth: false }),
};

// ── Doctors ───────────────────────────────────────────
export const doctors = {
  search: (params: { specialty?: string; city?: string; teleconsultation?: boolean }) => {
    const qs = new URLSearchParams();
    if (params.specialty) qs.set('specialty', params.specialty);
    if (params.city) qs.set('city', params.city);
    if (params.teleconsultation) qs.set('teleconsultation', 'true');
    const query = qs.toString();
    return apiFetch(`/doctors${query ? `?${query}` : ''}`, { auth: false });
  },

  getOne: (id: string) => apiFetch(`/doctors/${id}`, { auth: false }),
};

// ── Créneaux ──────────────────────────────────────────
export const slots = {
  getCalendar: (doctorId: string, month: string) =>
    apiFetch(`/slots/doctor/${doctorId}/calendar/${month}`, { auth: false }),

  getForDate: (doctorId: string, date: string) =>
    apiFetch(`/slots/doctor/${doctorId}/date/${date}`, { auth: false }),
};

// ── Appointments ──────────────────────────────────────
export const appointments = {
  getMine: () => apiFetch('/appointments/my'),

  create: (body: { doctorId: string; appointmentDate: string; reason?: string }) =>
    apiFetch('/appointments', { method: 'POST', body }),
};

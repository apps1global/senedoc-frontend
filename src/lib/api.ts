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

  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
};

// ── Patients ──────────────────────────────────────────
export const patients = {
  getMe: () => apiFetch('/patients/me'),
};

// ── Appointments ──────────────────────────────────────
export const appointments = {
  getMine: () => apiFetch('/appointments/my'),
};

import { supabase } from './supabaseClient';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * Calls the ASP.NET Core backend, attaching the current Supabase session's
 * access token as a Bearer header so [Authorize]-protected endpoints
 * (e.g. /api/matriculants/me) can validate it.
 */
export async function apiFetch(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();

  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let body;
    try { body = text ? JSON.parse(text) : null; } catch { body = null; }
    const err = new Error(body?.error || body?.message || `Request failed (${res.status}). Please try again.`);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  // Some endpoints (e.g. PUT .../subjects) return 204 No Content.
  if (res.status === 204) return null;
  return options.responseType === 'blob' ? res.blob() : res.json();
}

// --- Convenience wrappers matching the current backend's actual endpoints ---

// --- Account role (binds a Supabase account to one role, permanently) ---

export const getMyAccountRole = () => apiFetch('/api/account/role');
export const getMyAdminAccount = () => apiFetch('/api/admin/me');

export const claimAccountRole = (role) =>
  apiFetch('/api/account/role', { method: 'POST', body: JSON.stringify({ role }) });

export const calculateAps = (subjects) =>
  apiFetch('/api/aps/calculate', {
    method: 'POST',
    body: JSON.stringify({ subjects }),
  });

export const matchCourses = (subjects, { provinceFilter, facultyFilter } = {}) =>
  apiFetch('/api/courses/match', {
    method: 'POST',
    body: JSON.stringify({ subjects, provinceFilter, facultyFilter }),
  });

export const listCourses = ({ faculty, province } = {}) => {
  const params = new URLSearchParams();
  if (faculty) params.set('faculty', faculty);
  if (province) params.set('province', province);
  const qs = params.toString();
  return apiFetch(`/api/courses${qs ? `?${qs}` : ''}`);
};

export const getMyMatriculantProfile = () => apiFetch('/api/matriculants/me');

export const createMatriculantProfile = (profile) =>
  apiFetch('/api/matriculants', {
    method: 'POST',
    body: JSON.stringify(profile),
  });

export const updateMySubjects = (subjects) =>
  apiFetch('/api/matriculants/me/subjects', {
    method: 'PUT',
    body: JSON.stringify(subjects),
  });

// The backend stores this as opaque JSON text — it never inspects the
// content, so the double encoding (JSON.stringify'd payload, itself sent as
// one field of a JSON request body) is intentional, not a mistake.
export const updateMyProfileData = (profileData) =>
  apiFetch('/api/matriculants/me/profile-data', {
    method: 'PUT',
    body: JSON.stringify({ data: profileData ? JSON.stringify(profileData) : null }),
  });

export const searchSaqa = (q) =>
  apiFetch(`/api/qualifications/saqa${q ? `?q=${encodeURIComponent(q)}` : ''}`);

export const searchOfo = (q) =>
  apiFetch(`/api/qualifications/ofo${q ? `?q=${encodeURIComponent(q)}` : ''}`);

// --- Mentor hub ---

export const listMentors = ({ field, province, q } = {}) => {
  const params = new URLSearchParams();
  if (field) params.set('field', field);
  if (province) params.set('province', province);
  if (q) params.set('q', q);
  const qs = params.toString();
  return apiFetch(`/api/mentors${qs ? `?${qs}` : ''}`);
};

export const submitMentorApplication = (application, idDocument, transcript) => {
  const body = new FormData();
  body.append('application', JSON.stringify(application));
  body.append('idDocument', idDocument);
  if (transcript) body.append('transcript', transcript);
  return apiFetch('/api/mentorapplications', { method: 'POST', body });
};

export const downloadApplicationDocument = (id, kind) =>
  apiFetch(`/api/mentorapplications/${id}/documents/${kind}`, { responseType: 'blob' });

export const getAdminMentorApplications = () => apiFetch('/api/mentorapplications');

export const getMyMentorApplications = () => apiFetch('/api/mentorapplications/me');

export const getPendingMentorApplications = () => apiFetch('/api/mentorapplications/pending');

export const approveMentorApplication = (id) =>
  apiFetch(`/api/mentorapplications/${id}/approve`, { method: 'POST' });

export const rejectMentorApplication = (id) =>
  apiFetch(`/api/mentorapplications/${id}/reject`, { method: 'POST' });

export const createHelpRequest = (request) =>
  apiFetch('/api/helprequests', { method: 'POST', body: JSON.stringify(request) });

export const getMyHelpRequests = () => apiFetch('/api/helprequests/mine');

export const respondToHelpRequest = (id, accept) =>
  apiFetch(`/api/helprequests/${id}/respond`, { method: 'POST', body: JSON.stringify({ accept }) });

export const getMessagesForRequest = (helpRequestId) =>
  apiFetch(`/api/messages/for-request/${helpRequestId}`);

export const sendMessage = (helpRequestId, body) =>
  apiFetch('/api/messages/send', { method: 'POST', body: JSON.stringify({ helpRequestId, body }) });

export const issueRecommendationLetter = (helpRequestId, strength, body) =>
  apiFetch('/api/recommendationletters/issue', { method: 'POST', body: JSON.stringify({ helpRequestId, strength, body }) });

export const getMyRecommendationLetters = () => apiFetch('/api/recommendationletters/for-learner/mine');

// --- Notifications ---

export const getMyNotifications = () => apiFetch('/api/notifications/mine');

export const markNotificationRead = (id) =>
  apiFetch(`/api/notifications/${id}/mark-read`, { method: 'POST' });

export const markAllNotificationsRead = () =>
  apiFetch('/api/notifications/mark-all-read', { method: 'POST' });

// --- Admin analytics ---

export const getAdminAnalytics = () => apiFetch('/api/admin/analytics');

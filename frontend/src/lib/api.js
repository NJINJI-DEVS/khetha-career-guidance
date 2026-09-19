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
  headers.set('Content-Type', 'application/json');
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`API error ${res.status}: ${text}`);
    err.status = res.status;
    try { err.body = text ? JSON.parse(text) : null; } catch { err.body = null; }
    throw err;
  }

  // Some endpoints (e.g. PUT .../subjects) return 204 No Content.
  if (res.status === 204) return null;
  return res.json();
}

// --- Convenience wrappers matching the current backend's actual endpoints ---

// --- Account role (binds a Supabase account to one role, permanently) ---

export const getMyAccountRole = () => apiFetch('/api/account/role');

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

/** Whole-object replace; see MatriculantsController.UpdatePreferences. */
export const updateMyPreferences = (preferences) =>
  apiFetch('/api/matriculants/me/preferences', {
    method: 'PUT',
    body: JSON.stringify(preferences),
  });

export const searchSaqa = (q) =>
  apiFetch(`/api/qualifications/saqa${q ? `?q=${encodeURIComponent(q)}` : ''}`);

export const searchOfo = (q) =>
  apiFetch(`/api/qualifications/ofo${q ? `?q=${encodeURIComponent(q)}` : ''}`);

// --- Careers directory (OFO occupations) ---
// Returns the same object shape as data/occupations.js — ofo, riasec, subjects,
// tasks, demand, salary, context — plus `link` and `provenance`, so screens and
// the matching engines can read either source without a translation layer.
// Anonymous: a learner must be able to browse careers before creating an
// account, and guest mode depends on it.

export const listOccupations = ({ q, field, page = 1, pageSize = 24 } = {}) => {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (field && field !== 'all') params.set('field', field);
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  return apiFetch(`/api/occupations?${params.toString()}`);
};

export const getOccupation = (code) =>
  apiFetch(`/api/occupations/${encodeURIComponent(code)}`);

/** Occupation counts per career field, for directory filter chips. */
export const getOccupationFields = () => apiFetch('/api/occupations/fields');

// --- CV builder ---

export const getMyCv = () => apiFetch('/api/cv/me');

export const saveMyCv = ({ payload, template, completeness }) =>
  apiFetch('/api/cv/me', {
    method: 'PUT',
    body: JSON.stringify({ payload, template, completeness }),
  });

export const shareMyCv = () => apiFetch('/api/cv/me/share', { method: 'POST' });

export const unshareMyCv = () => apiFetch('/api/cv/me/share', { method: 'DELETE' });

/** Public read behind a share token — no auth, by design. */
export const getSharedCv = (token) =>
  apiFetch(`/api/cv/shared/${encodeURIComponent(token)}`);

// --- Mentor hub ---

export const listMentors = ({ field, province, q } = {}) => {
  const params = new URLSearchParams();
  if (field) params.set('field', field);
  if (province) params.set('province', province);
  if (q) params.set('q', q);
  const qs = params.toString();
  return apiFetch(`/api/mentors${qs ? `?${qs}` : ''}`);
};

export const submitMentorApplication = (application) =>
  apiFetch('/api/mentorapplications', { method: 'POST', body: JSON.stringify(application) });

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

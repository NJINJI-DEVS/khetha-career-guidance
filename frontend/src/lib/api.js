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

// Real AI fallback for the Advisor chat, once its own instant keyword
// scripts find no match. Requires a signed-in session (not guest mode).
export const askAdvisor = (message, language) =>
  apiFetch('/api/advisor/ask', {
    method: 'POST',
    body: JSON.stringify({ message, language }),
  });

/** Consent already on file. Throws with status 404 when there is none, or when
 *  what is on file predates the current consent wording. */
export const getMyConsent = () => apiFetch('/api/account/consent');

export const saveMyConsent = (consent) =>
  apiFetch('/api/account/consent', { method: 'POST', body: JSON.stringify(consent) });

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

export const deleteMyProfileData = () =>
  apiFetch('/api/matriculants/me/profile-data', { method: 'DELETE' });

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

// --- Mentor events: seminars, work shadowing, site visits ---
// Every one of these is approved by an administrator before a learner sees it.

export const requestMentorEvent = (event) =>
  apiFetch('/api/mentorevents', { method: 'POST', body: JSON.stringify(event) });

export const getMyMentorEvents = () => apiFetch('/api/mentorevents/mine');

export const getPendingMentorEvents = () => apiFetch('/api/mentorevents/pending');

export const getAllMentorEvents = (status) =>
  apiFetch(`/api/mentorevents/all${status ? `?status=${encodeURIComponent(status)}` : ''}`);

export const approveMentorEvent = (id, note) =>
  apiFetch(`/api/mentorevents/${id}/approve`, { method: 'POST', body: JSON.stringify({ note: note || null }) });

export const declineMentorEvent = (id, note) =>
  apiFetch(`/api/mentorevents/${id}/decline`, { method: 'POST', body: JSON.stringify({ note: note || null }) });

/** Takes a place at an approved event. Fails with 409 if it is already full. */
export const acceptMentorEvent = (id) =>
  apiFetch(`/api/mentorevents/${id}/accept`, { method: 'POST' });

/** Releases a place, returning it to the pool. */
export const cancelMentorEventPlace = (id) =>
  apiFetch(`/api/mentorevents/${id}/cancel`, { method: 'POST' });

/** The events this learner has accepted — what their calendar counts as theirs. */
export const getMyRegisteredEvents = () => apiFetch('/api/mentorevents/registered');

/** The register for one event. Host mentor and administrators only. */
export const getEventAttendees = (id) => apiFetch(`/api/mentorevents/${id}/attendees`);

/** Approved, still-ahead events for a learner's calendar. */
export const getUpcomingMentorEvents = ({ province, days } = {}) => {
  const params = new URLSearchParams();
  if (province) params.set('province', province);
  if (days) params.set('days', String(days));
  const qs = params.toString();
  return apiFetch(`/api/mentorevents/upcoming${qs ? `?${qs}` : ''}`);
};

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

/** Every application, decided or not — what the admin queue's three tabs need. */
export const getAllMentorApplications = (status) =>
  apiFetch(`/api/mentorapplications/all${status ? `?status=${encodeURIComponent(status)}` : ''}`);

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

// --- Administrator identity and management ---

/** The signed-in account's admin record. Throws with status 404 if it is not
 *  an administrator — that is the answer, not a failure. */
export const getMyAdmin = () => apiFetch('/api/admin/me');

export const listAdmins = () => apiFetch('/api/admin/admins');

export const grantAdmin = (email, note) =>
  apiFetch('/api/admin/admins', { method: 'POST', body: JSON.stringify({ email, note: note || null }) });

export const revokeAdmin = (userId, note) =>
  apiFetch(`/api/admin/admins/${userId}`, { method: 'DELETE', body: JSON.stringify({ note: note || null }) });

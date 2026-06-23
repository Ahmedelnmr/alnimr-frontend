/**
 * api.js — Base API client using Fetch API
 * Handles all HTTP communication with the Laravel backend.
 */

const API_BASE = window.APP_CONFIG?.API_URL || 'http://localhost:8000/api/v1';

class ApiError extends Error {
  constructor(message, status, errors = null) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const headers = {
    'Accept': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set Content-Type for JSON requests (not FormData)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 204 No Content
    if (response.status === 204) return null;

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || `HTTP Error ${response.status}`,
        response.status,
        data.errors || null
      );
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Network error — please check your connection.', 0);
  }
}

export const api = {
  get:    (endpoint, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`${endpoint}${qs ? '?' + qs : ''}`);
  },
  post:   (endpoint, body)  => request(endpoint, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (endpoint, body)  => request(endpoint, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (endpoint)        => request(endpoint, { method: 'DELETE' }),

  // For file uploads (FormData)
  upload: (endpoint, formData) => request(endpoint, { method: 'POST', body: formData }),
};

export { ApiError };

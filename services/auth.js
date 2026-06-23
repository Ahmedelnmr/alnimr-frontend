/**
 * auth.js — Authentication service
 * Manages token storage and session state.
 */

import { api } from './api.js';

const TOKEN_KEY    = 'auth_token';
const USER_KEY     = 'auth_user';
const REDIRECT_KEY = 'auth_redirect';

export const auth = {
  /**
   * Login with email & password, store token and user data.
   */
  async login(email, password) {
    const data = await api.post('/auth/login', { email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data.user;
  },

  /**
   * Logout — revoke token on server, clear local storage.
   */
  async logout() {
    try {
      await api.post('/auth/logout', {});
    } catch (_) {
      // Proceed even if server call fails
    } finally {
      auth.clearSession();
      window.location.href = '/pages/dashboard/login.html';
    }
  },

  /**
   * Get the currently stored user.
   */
  getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  },

  /**
   * Get the stored token.
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Check if user is authenticated.
   */
  isAuthenticated() {
    return !!this.getToken() && !!this.getUser();
  },

  /**
   * Require authentication — redirect to login if not authenticated.
   */
  requireAuth() {
    if (!this.isAuthenticated()) {
      localStorage.setItem(REDIRECT_KEY, window.location.pathname);
      window.location.href = '/pages/dashboard/login.html';
      return false;
    }
    return true;
  },

  /**
   * Get redirect URL after login.
   */
  getRedirect() {
    return localStorage.getItem(REDIRECT_KEY) || '/pages/dashboard/index.html';
  },

  clearRedirect() {
    localStorage.removeItem(REDIRECT_KEY);
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

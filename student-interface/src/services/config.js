/**
 * Configuration module for SENTINEL Student Interface.
 * Reads environment variables configured via Vite, with sensible local defaults.
 */

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
).replace(/\/$/, '');

export const WS_BASE_URL = (
  import.meta.env.VITE_WS_BASE_URL || API_BASE_URL.replace(/^http/, 'ws')
).replace(/\/$/, '');


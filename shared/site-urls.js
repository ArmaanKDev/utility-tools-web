// Runtime URL constants derived from site-config.json base path.
// Import this instead of hardcoding /utility-tools-web/ anywhere.
// In dev, Vite serves each app from localhost so we use '' as base.

const BASE = import.meta.env.PROD ? '/utility-tools-web' : '';

export const LANDING_URL  = import.meta.env.PROD ? '/utility-tools-web/' : 'http://localhost:5174/';
export const CASHFLOW_URL = `${BASE}/cashflow`;
export const ADMIN_URL    = `${BASE}/admin`;
export const LOGIN_URL    = `${BASE}/login`;
export const PRICING_URL  = `${BASE}/pricing`;

export const API_BASE_URL = "https://api.tecnoincubadora.com";

export const LOGIN_ENDPOINT = `${API_BASE_URL}/api/auth/login`;
export const REFRESH_ENDPOINT = `${API_BASE_URL}/api/auth/refresh`;
export const ME_ENDPOINT = `${API_BASE_URL}/api/users/me`;

export const AUTH_STORAGE_KEY = "tecnoincubadora.auth";
export const TOKEN_REFRESH_MARGIN_MS = 60_000;
export const ALARM_NAME = "tecnoincubadora.token-refresh";
export const ALARM_PERIOD_MINUTES = 5;
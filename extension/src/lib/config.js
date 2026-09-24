export const API_BASE_URL = "https://tecnoincubadora-api.onrender.com";
export const API_BASE_OVERRIDE_KEY = "tecnoincubadora.apiBaseUrl";

export const ME_PATH = "/api/users/me";

export const AUTH_STORAGE_KEY = "tecnoincubadora.auth";
export const TOKEN_REFRESH_MARGIN_MS = 60_000;
export const ALARM_NAME = "tecnoincubadora.token-refresh";
export const ALARM_PERIOD_MINUTES = 5;

export async function getApiBaseUrl() {
  const obj = await chrome.storage.local.get(API_BASE_OVERRIDE_KEY);
  return obj[API_BASE_OVERRIDE_KEY] || API_BASE_URL;
}
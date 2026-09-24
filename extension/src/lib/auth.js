import {
  AUTH_STORAGE_KEY,
  LOGIN_ENDPOINT,
  REFRESH_ENDPOINT,
  TOKEN_REFRESH_MARGIN_MS,
} from "./config.js";

function normalizeAuth(data) {
  const accessToken = data.access_token ?? data.token ?? data.jwt;
  if (!accessToken) {
    throw new Error("Resposta de autenticação sem token.");
  }
  const expiresIn = data.expires_in ?? data.expiresIn ?? 3600;
  return {
    accessToken,
    refreshToken: data.refresh_token ?? data.refreshToken ?? null,
    expiresAt: Date.now() + expiresIn * 1000,
    user: data.user ?? null,
  };
}

async function read() {
  const obj = await chrome.storage.local.get(AUTH_STORAGE_KEY);
  return obj[AUTH_STORAGE_KEY] ?? null;
}

async function write(auth) {
  await chrome.storage.local.set({ [AUTH_STORAGE_KEY]: auth });
}

export function isExpired(auth) {
  return !auth || Date.now() > (auth.expiresAt ?? 0) - TOKEN_REFRESH_MARGIN_MS;
}

export function getAuth() {
  return read();
}

async function doRefresh(auth) {
  if (!auth?.refreshToken) return null;
  const res = await fetch(REFRESH_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: auth.refreshToken }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const next = { ...auth, ...normalizeAuth(data) };
  await write(next);
  return next;
}

export async function refreshToken() {
  return doRefresh(await read());
}

export async function login(credentials) {
  const res = await fetch(LOGIN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    let message = `Falha no login (${res.status}).`;
    try {
      const detail = await res.json();
      message = detail?.message ?? detail?.error ?? message;
    } catch {
      /* corpo não é JSON */
    }
    throw new Error(message);
  }
  const data = await res.json();
  const auth = normalizeAuth(data);
  await write(auth);
  return auth;
}

export async function logout() {
  await chrome.storage.local.remove(AUTH_STORAGE_KEY);
}

export async function getValidAuth() {
  let auth = await read();
  if (!auth) return null;
  if (isExpired(auth)) {
    const refreshed = await doRefresh(auth);
    if (refreshed) {
      auth = refreshed;
    } else {
      await logout();
      throw new Error("Sessão expirada. Faça login novamente.");
    }
  }
  return auth;
}
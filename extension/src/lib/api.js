import { getApiBaseUrl } from "./config.js";
import { getValidAuth, logout } from "./auth.js";

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const auth = await getValidAuth();
  const base = await getApiBaseUrl();
  const res = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Authorization: `Bearer ${auth.accessToken}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    await logout();
    throw new Error("Não autorizado. Faça login novamente.");
  }

  if (!res.ok) {
    let message = `Erro da API (${res.status}).`;
    try {
      const detail = await res.json();
      message = detail?.message ?? detail?.error ?? message;
    } catch {
      /* corpo não é JSON */
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};
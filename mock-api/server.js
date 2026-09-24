const http = require("http");

const PORT = process.env.PORT || 3000;

const USERS = {
  admin: {
    password: "1234",
    user: {
      id: 1,
      name: "Afonso",
      username: "admin",
      email: "admin@tecnoincubadora.com",
    },
  },
};

const refreshStore = {};

function send(res, code, body) {
  res.writeHead(code, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  });
  res.end(body ? JSON.stringify(body) : "");
}

function makeToken(username, kind, ttl) {
  return Buffer.from(JSON.stringify({ u: username, k: kind, ttl, iat: Date.now() })).toString("base64url");
}

function bearerUsername(header) {
  if (!header || !header.startsWith("Bearer ")) return null;
  try {
    const payload = JSON.parse(Buffer.from(header.slice(7), "base64url").toString());
    return payload.k === "access" ? payload.u : null;
  } catch {
    return null;
  }
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") return send(res, 204);

  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;

    if (req.method === "POST" && path === "/api/auth/login") {
      const { username, password } = JSON.parse(body || "{}");
      const entry = USERS[username];
      if (!entry || entry.password !== password) {
        return send(res, 401, { message: "Credenciais inválidas" });
      }
      const access = makeToken(username, "access", 3600);
      const refresh = makeToken(username, "refresh", 86400);
      refreshStore[refresh] = username;
      return send(res, 200, {
        access_token: access,
        refresh_token: refresh,
        expires_in: 3600,
        user: entry.user,
      });
    }

    if (req.method === "POST" && path === "/api/auth/refresh") {
      const { refresh_token } = JSON.parse(body || "{}");
      const username = refreshStore[refresh_token];
      if (!username) return send(res, 401, { message: "Refresh token inválido" });
      delete refreshStore[refresh_token];
      const access = makeToken(username, "access", 3600);
      const refresh = makeToken(username, "refresh", 86400);
      refreshStore[refresh] = username;
      return send(res, 200, { access_token: access, refresh_token: refresh, expires_in: 3600 });
    }

    if (req.method === "GET" && path === "/api/users/me") {
      const username = bearerUsername(req.headers.authorization);
      if (!username) return send(res, 401, { message: "Token inválido" });
      return send(res, 200, USERS[username].user);
    }

    send(res, 404, { message: `Endpoint inexistente: ${path}` });
  });
});

server.listen(PORT, () => {
  console.log(`Mock API TECNOINCUBADORA em http://localhost:${PORT}`);
  console.log("Utilizador: admin | Password: 1234");
});
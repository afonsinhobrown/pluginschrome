const users = {
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

const refreshStore = new Map();

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

module.exports = {
  users,
  refreshStore,
  makeToken,
  bearerUsername,
  findByUsername: (username) => users[username] ?? null,
  validateCredentials: (username, password) => {
    const entry = users[username];
    return entry && entry.password === password ? entry.user : null;
  },
};
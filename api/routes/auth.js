const express = require("express");
const { validateCredentials, makeToken, refreshStore } = require("../store");

const ACCESS_TTL = 3600;
const REFRESH_TTL = 86400;

function issueTokens(username) {
  const access = makeToken(username, "access", ACCESS_TTL);
  const refresh = makeToken(username, "refresh", REFRESH_TTL);
  refreshStore.set(refresh, username);
  return { access, refresh };
}

const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body ?? {};
  const user = validateCredentials(username, password);
  if (!user) {
    return res.status(401).json({ message: "Credenciais inválidas" });
  }
  const { access, refresh } = issueTokens(username);
  res.json({
    access_token: access,
    refresh_token: refresh,
    expires_in: ACCESS_TTL,
    user,
  });
});

router.post("/refresh", (req, res) => {
  const { refresh_token } = req.body ?? {};
  const username = refreshStore.get(refresh_token);
  if (!username) {
    return res.status(401).json({ message: "Refresh token inválido" });
  }
  refreshStore.delete(refresh_token);
  const { access, refresh } = issueTokens(username);
  res.json({
    access_token: access,
    refresh_token: refresh,
    expires_in: ACCESS_TTL,
  });
});

module.exports = router;
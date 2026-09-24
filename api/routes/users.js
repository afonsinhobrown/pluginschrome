const express = require("express");
const { findByUsername, bearerUsername } = require("../store");

const router = express.Router();

router.get("/me", (req, res) => {
  const username = bearerUsername(req.headers.authorization);
  if (!username) {
    return res.status(401).json({ message: "Token inválido" });
  }
  const entry = findByUsername(username);
  if (!entry) {
    return res.status(401).json({ message: "Utilizador não encontrado" });
  }
  res.json(entry.user);
});

module.exports = router;
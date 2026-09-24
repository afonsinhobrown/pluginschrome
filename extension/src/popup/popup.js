import { api } from "../lib/api.js";
import { getAuth, login, logout } from "../lib/auth.js";
import { ME_PATH } from "../lib/config.js";

const formLogin = document.getElementById("form-login");
const btnLogin = document.getElementById("btn-login");
const loginError = document.getElementById("login-error");
const loginInfo = document.getElementById("login-info");

const viewLogin = document.getElementById("view-login");
const viewDashboard = document.getElementById("view-dashboard");

const profileUser = document.getElementById("profile-user");
const profileEmail = document.getElementById("profile-email");
const dashboardStatus = document.getElementById("dashboard-status");
const dashboardData = document.getElementById("dashboard-data");

function showLoading(btn, isLoading) {
  if (isLoading) {
    btn.dataset.label = btn.textContent;
    btn.textContent = "Aguarde…";
    btn.disabled = true;
  } else {
    btn.textContent = btn.dataset.label ?? "Entrar";
    btn.disabled = false;
  }
}

function setLoginError(message) {
  loginError.textContent = message;
  loginError.classList.toggle("hidden", !message);
}

async function handleLogin(event) {
  event.preventDefault();
  setLoginError("");
  showLoading(btnLogin, true);
  try {
    const credentials = {
      username: document.getElementById("login-username").value.trim(),
      password: document.getElementById("login-password").value,
    };
    const auth = await login(credentials);
    loginInfo.textContent = `Bem-vindo, ${auth.user?.name ?? auth.user?.username ?? ""}`.trim();
    loginInfo.classList.remove("hidden");
    formLogin.reset();
    await showDashboard();
  } catch (error) {
    setLoginError(error.message);
  } finally {
    showLoading(btnLogin, false);
  }
}

async function showDashboard() {
  viewLogin.classList.add("hidden");
  viewDashboard.classList.remove("hidden");
  await loadDashboard();
}

async function loadDashboard() {
  dashboardStatus.textContent = "A carregar…";
  dashboardData.classList.remove("hidden");
  try {
    const me = await api.get(ME_PATH);
    profileUser.textContent = me?.name ?? me?.username ?? me?.email ?? "—";
    profileEmail.textContent = me?.email ?? "—";
    dashboardStatus.textContent = "Conectado à API.";
    dashboardData.textContent = JSON.stringify(me, null, 2);
  } catch (error) {
    dashboardStatus.textContent = error.message;
    dashboardData.textContent = "";
  }
}

async function init() {
  const auth = await getAuth();
  if (auth) {
    await showDashboard();
  }
}

formLogin.addEventListener("submit", handleLogin);
document.getElementById("btn-logout").addEventListener("click", async () => {
  await logout();
  viewDashboard.classList.add("hidden");
  viewLogin.classList.remove("hidden");
  setLoginError("");
});
document.getElementById("btn-refresh").addEventListener("click", loadDashboard);

void init();
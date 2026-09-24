import {
  ALARM_NAME,
  ALARM_PERIOD_MINUTES,
} from "../lib/config.js";
import { getAuth, isExpired, refreshToken } from "../lib/auth.js";

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD_MINUTES });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    void checkAndRefresh();
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "AUTH_REFRESH") {
    checkAndRefresh()
      .then((refreshed) => sendResponse({ ok: true, refreshed }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }
});

async function checkAndRefresh() {
  const auth = await getAuth();
  if (!auth) return false;
  if (!isExpired(auth)) return true;
  return Boolean(await refreshToken());
}
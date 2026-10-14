import { clearSession, getStoredUser, getToken, storeSession } from "./client";

const jwt = (expiresAt) => {
  const payload = window.btoa(JSON.stringify({ exp: Math.floor(expiresAt / 1000) }))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `header.${payload}.signature`;
};

beforeEach(() => clearSession());

test("an expired JWT is removed with its account data", () => {
  storeSession(jwt(Date.now() - 60_000), { email: "expired@example.com" });

  expect(getToken()).toBeNull();
  expect(getStoredUser()).toBeNull();
});

test("an active JWT remains available", () => {
  const token = jwt(Date.now() + 60_000);
  storeSession(token, { email: "active@example.com" });

  expect(getToken()).toBe(token);
  expect(getStoredUser().email).toBe("active@example.com");
});

test("access credentials are never persisted in browser storage", () => {
  storeSession(jwt(Date.now() + 60_000), { email: "active@example.com" });
  expect(localStorage.getItem("token")).toBeNull();
  expect(localStorage.getItem("user")).toBeNull();
  expect(sessionStorage.getItem("token")).toBeNull();
});

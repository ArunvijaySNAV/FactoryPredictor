import type { User } from "@machine-health/shared";

const STORAGE_KEY = "machine-health-user";

export function getStoredUser(): User | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as User;
    if (parsed.role === "operator" || parsed.role === "boss") {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

export function setStoredUser(user: User) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  window.localStorage.removeItem(STORAGE_KEY);
}

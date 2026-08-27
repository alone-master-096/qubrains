export const USERNAME_RULES = "3–20 characters: letters, numbers, and underscores only.";

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidUsername(username) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username.trim());
}

export function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

/** Returns an error string, or null if the password is acceptable. */
export function passwordStrengthError(password) {
  if (!password || password.length < 6) {
    return "Password must be at least 6 characters.";
  }
  return null;
}

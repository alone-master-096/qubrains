const MESSAGES = {
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "No account found with that email or password.",
  "auth/wrong-password": "No account found with that email or password.",
  "auth/invalid-credential": "No account found with that email or password.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Wait a moment and try again.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/requires-recent-login": "Please log in again to complete this action.",
};

export function getAuthErrorMessage(error) {
  const code = error?.code || "";
  return MESSAGES[code] || "Something went wrong. Please try again.";
}

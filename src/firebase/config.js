import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (import.meta.env.DEV && !firebaseConfig.apiKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "[QuBrains] Missing Firebase config. Copy .env.example to .env and fill in your project's values."
  );
}

// Guard against re-initializing during Vite's hot module reload.
export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

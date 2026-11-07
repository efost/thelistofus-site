import "server-only";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

// Read on the server only, at run time (from /etc/thelistofus.env on the Droplet), so
// the site can be built anywhere without them. The names keep their NEXT_PUBLIC_
// prefix from the old setup; looked up by computed name so Next doesn't inline them at
// build time.
function setting(name: string) {
  const env = process.env;
  return env[`FIREBASE_${name}`] ?? env[`NEXT_PUBLIC_FIREBASE_${name}`];
}

let instance: Firestore | null = null;

/** The shared Firestore client, created on first use. */
export function firestore(): Firestore {
  if (instance) return instance;
  const app = getApps().length
    ? getApp()
    : initializeApp({
        apiKey: setting("API_KEY"),
        authDomain: setting("AUTH_DOMAIN"),
        projectId: setting("PROJECT_ID"),
        storageBucket: setting("STORAGE_BUCKET"),
        messagingSenderId: setting("MESSAGING_SENDER_ID"),
        appId: setting("APP_ID"),
      });
  instance = getFirestore(app);
  return instance;
}

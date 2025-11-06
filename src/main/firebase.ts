import admin from "firebase-admin";

const projectId = import.meta.env.MAIN_VITE_FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = import.meta.env.MAIN_VITE_FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = import.meta.env.MAIN_VITE_FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("❌ Variáveis não carregadas:", { projectId, clientEmail, privateKey });
  throw new Error("As variáveis do Firebase Admin não foram carregadas.");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export const adminApp = admin.app();
export const adminDb = admin.firestore(adminApp);

import 'dotenv/config';
import admin from "firebase-admin";

if (!admin.apps.length) {
  if (!process.env.FIREBASE_ADMIN_PROJECT_ID) {
    throw new Error("FIREBASE_ADMIN_PROJECT_ID não está definido!");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    }),
  });
}

export const adminApp = admin.app();
export const adminDb = admin.firestore(adminApp);

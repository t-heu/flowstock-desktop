/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MAIN_VITE_FIREBASE_ADMIN_PROJECT_ID: string;
  readonly MAIN_VITE_FIREBASE_ADMIN_CLIENT_EMAIL: string;
  readonly MAIN_VITE_FIREBASE_ADMIN_PRIVATE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

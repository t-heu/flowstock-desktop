import ElectronStore from "electron-store";

const Store = (ElectronStore as any).default || ElectronStore;

interface AuthStore {
  token?: string;
  user?: any;
}

const store: import("electron-store").Store<AuthStore> = new Store({
  name: "auth"
});

export function savePersistedToken(token: string) {
  store.set("token", token);
}

export function readPersistedToken(): string | null {
  return store.get("token") ?? null;
}

export function clearPersistedToken() {
  store.delete("token");
}

// ================================
// USER
// ================================
export function savePersistedUser(user: any) {
  store.set("user", JSON.parse(JSON.stringify(user)));
}

export function readPersistedUser(): any | null {
  return store.get("user") ?? null;
}

export function clearPersistedUser() {
  store.delete("user");
}

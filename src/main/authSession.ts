import __Store from 'electron-store'

const Store = (__Store as any).default || __Store;

interface AuthStore {
  token?: string;
  user?: any;
}

const store = new Store({ name: "auth" }) as __Store<AuthStore>;;

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

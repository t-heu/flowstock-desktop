// authSession.ts
const sessionTokens = new Map<number, string>();

export function setTokenForWindow(senderId: number, token: string) {
  sessionTokens.set(senderId, token);
}

export function getTokenForWindow(senderId: number) {
  return sessionTokens.get(senderId);
}

export function clearTokenForWindow(senderId: number) {
  sessionTokens.delete(senderId);
}
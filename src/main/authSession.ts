// src/main/authSession.ts
export let currentUser: {
  uid: string;
  role: "admin" | "manager" | "operator";
  department: string;
  branchId: string;
} | null = null;

export function setCurrentUser(user: {
  uid: string;
  role: "admin" | "manager" | "operator";
  department: string;
  branchId: string;
}) {
  currentUser = user;
}

export function getCurrentUser() {
  return currentUser;
}

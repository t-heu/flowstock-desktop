// lib/permissions.ts
export const Permissions = {
  viewUsers: ["admin"],
  manageBranches: ["admin", "manager"], // "manager" é quem pode criar filiais
  viewReports: ["admin", "manager", "user"],
  // etc
}

export function can(userRole: string, permission: keyof typeof Permissions) {
  return Permissions[permission].includes(userRole)
}

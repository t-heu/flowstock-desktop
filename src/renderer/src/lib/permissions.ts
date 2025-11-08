export const Permissions = {
  viewUsers: ["admin"],
  manageBranches: ["admin", "manager"], // "manager" é quem pode criar filiais
  viewReports: ["admin", "manager", "operator"],
}

export function can(userRole: string, permission: keyof typeof Permissions) {
  return Permissions[permission].includes(userRole)
}

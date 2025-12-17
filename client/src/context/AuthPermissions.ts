export type Role = 'admin' | 'hr' | 'employee';

export type Permission =
  | 'manageUsers'
  | 'manageEmployees'
  | 'manageDepartments'
  | 'managePayroll'
  | 'viewAuditLogs'
  | string;

export const PERMISSIONS_MAP: Record<Role, Record<Permission, boolean>> = {
  admin: {
    manageUsers: true,
    manageEmployees: true,
    manageDepartments: true,
    managePayroll: true,
    viewAuditLogs: true,
  },
  hr: {
    manageUsers: false,
    manageEmployees: true,
    manageDepartments: true,
    managePayroll: true,
    viewAuditLogs: true,
  },
  employee: {
    manageUsers: false,
    manageEmployees: false,
    manageDepartments: false,
    managePayroll: false,
    viewAuditLogs: false,
  },
};

export function getPermissions(role: Role | null) {
  if (!role) return {} as Record<Permission, boolean>;
  return PERMISSIONS_MAP[role] ?? ({} as Record<Permission, boolean>);
}

export function canRole(role: Role | null, permission: Permission) {
  const perms = getPermissions(role);
  return !!perms[permission];
}

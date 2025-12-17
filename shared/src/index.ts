// Shared TypeScript API types for client and server

export type Role = 'admin' | 'hr' | 'employee';

export interface UserDTO {
  _id: string;
  name: string;
  email?: string;
  role: Role;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthLoginResponse {
  token: string;
  refreshToken: string;
  user: UserDTO;
}

export interface AuthRefreshRequest {
  refreshToken: string;
}

export interface AuthRefreshResponse {
  token: string;
  refreshToken?: string;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// Domain types (minimal)
export interface DepartmentDTO {
  _id: string;
  name: string;
  managerId?: string | null;
  description?: string;
}

export interface EmployeeDTO {
  _id: string;
  name: string;
  email: string;
  departmentId?: string | null;
  role?: Role;
  profile?: { department?: { _id?: string; name?: string } } | null;
  active?: boolean;
  createdAt?: string;
}

export interface AuditLogDTO {
  _id: string;
  collectionName: string;
  documentId?: string | null;
  action: string;
  user?: string | null;
  before?: unknown;
  after?: unknown;
  createdAt: string;
}

export interface PayrollDTO {
  _id: string;
  employeeId: string;
  periodStart: string; // ISO date
  periodEnd: string; // ISO date
  gross: number;
  net: number;
  payDate?: string;
  tax?: number;
}

export default {};

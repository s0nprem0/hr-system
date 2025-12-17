// Shared TypeScript API types for client and server

export type Role = 'admin' | 'hr' | 'employee';

export interface UserDTO {
  _id: string;
  name: string;
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
}

export interface EmployeeDTO {
  _id: string;
  name: string;
  email: string;
  departmentId?: string | null;
  role?: Role;
}

export interface PayrollDTO {
  _id: string;
  employeeId: string;
  periodStart: string; // ISO date
  periodEnd: string; // ISO date
  gross: number;
  net: number;
}

export default {};

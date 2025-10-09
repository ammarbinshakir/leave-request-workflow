// TypeScript type definitions for the Leave Request API
// Note: This would be a .d.ts file in a full TypeScript project

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'manager';
  managerId?: string;
  department: string;
}

export interface LeaveBalance {
  userId: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  managerId: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string; // ISO date string
  type: 'vacation' | 'sick' | 'personal';
  approvedDate?: string; // ISO date string
  rejectedDate?: string; // ISO date string
  approvedBy?: string;
  rejectedBy?: string;
  comments?: string;
}

export interface LeaveApplicationRequest {
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  reason: string;
  type?: 'vacation' | 'sick' | 'personal';
}

export interface LeaveApprovalRequest {
  action: 'approve' | 'reject';
  comments?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: string | string[];
}

export interface PendingRequestsResponse extends ApiResponse {
  data: LeaveRequest[];
  count: number;
}

export interface EmployeeRequestsResponse extends ApiResponse {
  data: {
    requests: LeaveRequest[];
    balance: LeaveBalance;
  };
}

export interface MonthlySummary {
  totalRequests: number;
  approvedRequests: number;
  pendingRequests: number;
  rejectedRequests: number;
  totalDaysRequested: number;
  approvedDays: number;
  requestsByType: {
    vacation: number;
    sick: number;
    personal: number;
  };
}

export interface MonthlySummaryResponse extends ApiResponse {
  data: {
    period: {
      year: number;
      month: number;
    };
    summary: MonthlySummary;
  };
}

// Validation Types
export interface DateValidationResult {
  isValid: boolean;
  errors: string[];
  businessDays?: number;
}

export interface OverlapCheckResult {
  hasOverlap: boolean;
  overlappingRequests: Array<{
    id: string;
    startDate: string;
    endDate: string;
    status: string;
  }>;
}

export interface BalanceValidationResult {
  isValid: boolean;
  error?: string;
  availableDays?: number;
  requestedDays?: number;
}

export interface LeaveValidationResult {
  isValid: boolean;
  errors?: string[];
  businessDays?: number;
}

// Service Response Types
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Authentication Types
export interface LoginRequest {
  email: string;
}

export interface LoginResponse extends ApiResponse {
  data: {
    user: User;
    token: string;
    message: string;
  };
}

// Context Types (for React)
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  isEmployee: boolean;
  isManager: boolean;
}

// Component Props Types
export interface LeaveRequestFormProps {
  onSuccess?: () => void;
}

export interface HeaderProps {
  // No specific props needed
}

export interface EmployeeDashboardProps {
  // No specific props needed
}

export interface ManagerDashboardProps {
  // No specific props needed
}

export interface LoginFormProps {
  // No specific props needed
}
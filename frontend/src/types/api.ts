// TypeScript type definitions for the Leave Request API

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

export interface MonthlySummaryProps {
  // No specific props needed for manager dashboard component
}
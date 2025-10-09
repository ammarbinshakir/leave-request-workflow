// Leave management service
const {
  findUserById,
  getLeaveBalance,
  addLeaveRequest,
  updateLeaveRequest,
  getLeaveRequestById,
  getPendingRequests,
  getEmployeeRequests,
  updateLeaveBalance,
  getMonthlyLeaveSummary
} = require('../data/mockData');

const { validateLeaveRequest } = require('../utils/validation');

class LeaveService {
  // Apply for leave
  static async applyForLeave(employeeId, requestData) {
    try {
      const employee = findUserById(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      // Validate the leave request
      const validation = validateLeaveRequest(employeeId, requestData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join('; '));
      }

      // Create the leave request
      const leaveRequest = {
        employeeId: employeeId,
        employeeName: employee.name,
        managerId: employee.managerId,
        startDate: requestData.startDate,
        endDate: requestData.endDate,
        days: validation.businessDays,
        reason: requestData.reason,
        type: requestData.type || 'vacation'
      };

      const newRequest = addLeaveRequest(leaveRequest);
      
      return {
        success: true,
        data: newRequest,
        message: 'Leave request submitted successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get pending requests for a manager
  static async getPendingRequestsForManager(managerId) {
    try {
      const manager = findUserById(managerId);
      if (!manager || manager.role !== 'manager') {
        throw new Error('Invalid manager or insufficient permissions');
      }

      const pendingRequests = getPendingRequests(managerId);
      
      return {
        success: true,
        data: pendingRequests,
        count: pendingRequests.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Approve or reject a leave request
  static async processLeaveRequest(requestId, managerId, action, comments = '') {
    try {
      const manager = findUserById(managerId);
      if (!manager || manager.role !== 'manager') {
        throw new Error('Invalid manager or insufficient permissions');
      }

      const leaveRequest = getLeaveRequestById(requestId);
      if (!leaveRequest) {
        throw new Error('Leave request not found');
      }

      if (leaveRequest.status !== 'pending') {
        throw new Error('Leave request has already been processed');
      }

      if (leaveRequest.managerId !== managerId) {
        throw new Error('You are not authorized to process this request');
      }

      // Update the leave request
      const updateData = {
        status: action,
        [action === 'approve' ? 'approvedDate' : 'rejectedDate']: new Date().toISOString().split('T')[0],
        [action === 'approve' ? 'approvedBy' : 'rejectedBy']: managerId,
        comments: comments
      };

      const updatedRequest = updateLeaveRequest(requestId, updateData);

      // If approved and it's vacation/personal leave, update leave balance
      if (action === 'approve' && (leaveRequest.type === 'vacation' || leaveRequest.type === 'personal')) {
        updateLeaveBalance(leaveRequest.employeeId, leaveRequest.days, 'subtract');
      }

      return {
        success: true,
        data: updatedRequest,
        message: `Leave request ${action}d successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get employee's leave requests
  static async getEmployeeLeaveRequests(employeeId) {
    try {
      const employee = findUserById(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      const requests = getEmployeeRequests(employeeId);
      const balance = getLeaveBalance(employeeId);
      
      return {
        success: true,
        data: {
          requests: requests,
          balance: balance
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get monthly leave summary (bonus feature)
  static async getMonthlySummary(year, month) {
    try {
      const summary = getMonthlyLeaveSummary(year, month);
      
      return {
        success: true,
        data: {
          period: { year, month },
          summary
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get user's leave balance
  static async getUserLeaveBalance(userId) {
    try {
      const balance = getLeaveBalance(userId);
      if (!balance) {
        throw new Error('Leave balance not found');
      }

      return {
        success: true,
        data: balance
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = LeaveService;
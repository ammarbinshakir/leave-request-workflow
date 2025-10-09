// Mock data store for the application
const { v4: uuidv4 } = require('uuid');

// Mock users with different roles
const users = [
  {
    id: 'emp-001',
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'employee',
    managerId: 'mgr-001',
    department: 'Engineering'
  },
  {
    id: 'emp-002',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    role: 'employee',
    managerId: 'mgr-001',
    department: 'Engineering'
  },
  {
    id: 'emp-003',
    name: 'Bob Johnson',
    email: 'bob.johnson@company.com',
    role: 'employee',
    managerId: 'mgr-002',
    department: 'Marketing'
  },
  {
    id: 'mgr-001',
    name: 'Alice Manager',
    email: 'alice.manager@company.com',
    role: 'manager',
    department: 'Engineering'
  },
  {
    id: 'mgr-002',
    name: 'Charlie Boss',
    email: 'charlie.boss@company.com',
    role: 'manager',
    department: 'Marketing'
  }
];

// Mock leave balances (days available per year)
const leaveBalances = [
  { userId: 'emp-001', totalDays: 25, usedDays: 5, remainingDays: 20 },
  { userId: 'emp-002', totalDays: 25, usedDays: 8, remainingDays: 17 },
  { userId: 'emp-003', totalDays: 25, usedDays: 3, remainingDays: 22 },
  { userId: 'mgr-001', totalDays: 30, usedDays: 10, remainingDays: 20 },
  { userId: 'mgr-002', totalDays: 30, usedDays: 7, remainingDays: 23 }
];

// Mock leave requests
let leaveRequests = [
  {
    id: 'req-001',
    employeeId: 'emp-001',
    employeeName: 'John Doe',
    managerId: 'mgr-001',
    startDate: '2025-11-15',
    endDate: '2025-11-17',
    days: 3,
    reason: 'Personal vacation',
    status: 'pending',
    appliedDate: '2025-10-08',
    type: 'vacation'
  },
  {
    id: 'req-002',
    employeeId: 'emp-002',
    employeeName: 'Jane Smith',
    managerId: 'mgr-001',
    startDate: '2025-12-20',
    endDate: '2025-12-24',
    days: 5,
    reason: 'Holiday break',
    status: 'approved',
    appliedDate: '2025-10-07',
    approvedDate: '2025-10-08',
    approvedBy: 'mgr-001',
    type: 'vacation'
  },
  {
    id: 'req-003',
    employeeId: 'emp-003',
    employeeName: 'Bob Johnson',
    managerId: 'mgr-002',
    startDate: '2025-10-25',
    endDate: '2025-10-25',
    days: 1,
    reason: 'Medical appointment',
    status: 'pending',
    appliedDate: '2025-10-09',
    type: 'sick'
  }
];

// Helper functions
const findUserById = (id) => users.find(user => user.id === id);
const findUserByEmail = (email) => users.find(user => user.email === email);
const getLeaveBalance = (userId) => leaveBalances.find(balance => balance.userId === userId);
const getManagerEmployees = (managerId) => users.filter(user => user.managerId === managerId);

// Leave request functions
const addLeaveRequest = (requestData) => {
  const newRequest = {
    id: uuidv4(),
    ...requestData,
    appliedDate: new Date().toISOString().split('T')[0],
    status: 'pending'
  };
  leaveRequests.push(newRequest);
  return newRequest;
};

const updateLeaveRequest = (id, updateData) => {
  const index = leaveRequests.findIndex(req => req.id === id);
  if (index !== -1) {
    leaveRequests[index] = { ...leaveRequests[index], ...updateData };
    return leaveRequests[index];
  }
  return null;
};

const getLeaveRequestById = (id) => leaveRequests.find(req => req.id === id);

const getPendingRequests = (managerId) => {
  const employeeIds = getManagerEmployees(managerId).map(emp => emp.id);
  return leaveRequests.filter(req => 
    req.status === 'pending' && employeeIds.includes(req.employeeId)
  );
};

const getEmployeeRequests = (employeeId) => {
  return leaveRequests.filter(req => req.employeeId === employeeId);
};

const updateLeaveBalance = (userId, days, operation = 'subtract') => {
  const balance = getLeaveBalance(userId);
  if (balance) {
    if (operation === 'subtract') {
      balance.usedDays += days;
      balance.remainingDays -= days;
    } else if (operation === 'add') {
      balance.usedDays -= days;
      balance.remainingDays += days;
    }
    return balance;
  }
  return null;
};

// Monthly summary calculation
const getMonthlyLeaveSummary = (year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  const monthlyRequests = leaveRequests.filter(req => {
    const reqStartDate = new Date(req.startDate);
    const reqEndDate = new Date(req.endDate);
    return (reqStartDate >= startDate && reqStartDate <= endDate) ||
           (reqEndDate >= startDate && reqEndDate <= endDate) ||
           (reqStartDate <= startDate && reqEndDate >= endDate);
  });

  const summary = {
    totalRequests: monthlyRequests.length,
    approvedRequests: monthlyRequests.filter(req => req.status === 'approved').length,
    pendingRequests: monthlyRequests.filter(req => req.status === 'pending').length,
    rejectedRequests: monthlyRequests.filter(req => req.status === 'rejected').length,
    totalDaysRequested: monthlyRequests.reduce((sum, req) => sum + req.days, 0),
    approvedDays: monthlyRequests
      .filter(req => req.status === 'approved')
      .reduce((sum, req) => sum + req.days, 0),
    requestsByType: {
      vacation: monthlyRequests.filter(req => req.type === 'vacation').length,
      sick: monthlyRequests.filter(req => req.type === 'sick').length,
      personal: monthlyRequests.filter(req => req.type === 'personal').length
    }
  };

  return summary;
};

module.exports = {
  users,
  leaveBalances,
  leaveRequests,
  findUserById,
  findUserByEmail,
  getLeaveBalance,
  getManagerEmployees,
  addLeaveRequest,
  updateLeaveRequest,
  getLeaveRequestById,
  getPendingRequests,
  getEmployeeRequests,
  updateLeaveBalance,
  getMonthlyLeaveSummary
};
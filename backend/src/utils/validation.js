const Joi = require('joi');
const { isWeekend, isAfter, isBefore, differenceInDays, parseISO, startOfDay } = require('date-fns');
const { getEmployeeRequests } = require('../data/mockData');

// Validation schemas
const leaveApplicationSchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().required(),
  reason: Joi.string().min(3).max(500).required(),
  type: Joi.string().valid('vacation', 'sick', 'personal').default('vacation')
});

const leaveApprovalSchema = Joi.object({
  action: Joi.string().valid('approve', 'reject').required(),
  comments: Joi.string().max(500).optional()
});

// Date validation functions
const validateDates = (startDate, endDate) => {
  const errors = [];
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const today = startOfDay(new Date());

  // Check if start date is in the past
  if (isBefore(start, today)) {
    errors.push('Start date cannot be in the past');
  }

  // Check if end date is before start date
  if (isBefore(end, start)) {
    errors.push('End date cannot be before start date');
  }

  // Calculate business days (excluding weekends)
  const totalDays = calculateBusinessDays(start, end);
  if (totalDays === 0) {
    errors.push('Leave request must include at least one business day');
  }

  return {
    isValid: errors.length === 0,
    errors,
    businessDays: totalDays
  };
};

// Calculate business days between two dates (excluding weekends)
const calculateBusinessDays = (startDate, endDate) => {
  let count = 0;
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    if (!isWeekend(current)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
};

// Check for overlapping leave requests
const checkForOverlaps = (employeeId, startDate, endDate, excludeRequestId = null) => {
  const employeeRequests = getEmployeeRequests(employeeId);
  
  const newStart = parseISO(startDate);
  const newEnd = parseISO(endDate);

  const overlappingRequests = employeeRequests.filter(request => {
    // Skip the request being updated
    if (excludeRequestId && request.id === excludeRequestId) {
      return false;
    }

    // Only check approved and pending requests
    if (request.status === 'rejected') {
      return false;
    }

    const existingStart = parseISO(request.startDate);
    const existingEnd = parseISO(request.endDate);

    // Check for any overlap
    return (newStart <= existingEnd && newEnd >= existingStart);
  });

  return {
    hasOverlap: overlappingRequests.length > 0,
    overlappingRequests: overlappingRequests.map(req => ({
      id: req.id,
      startDate: req.startDate,
      endDate: req.endDate,
      status: req.status
    }))
  };
};

// Validate leave balance
const validateLeaveBalance = (userId, requestedDays) => {
  const { getLeaveBalance } = require('../data/mockData');
  const balance = getLeaveBalance(userId);

  if (!balance) {
    return {
      isValid: false,
      error: 'Leave balance not found for user'
    };
  }

  if (balance.remainingDays < requestedDays) {
    return {
      isValid: false,
      error: `Insufficient leave balance. Requested: ${requestedDays} days, Available: ${balance.remainingDays} days`,
      availableDays: balance.remainingDays,
      requestedDays
    };
  }

  return {
    isValid: true,
    availableDays: balance.remainingDays,
    requestedDays
  };
};

// Comprehensive leave request validation
const validateLeaveRequest = (employeeId, requestData, excludeRequestId = null) => {
  const { startDate, endDate, reason, type } = requestData;
  
  // Schema validation
  const { error } = leaveApplicationSchema.validate(requestData);
  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message)
    };
  }

  // Date validation
  const dateValidation = validateDates(startDate, endDate);
  if (!dateValidation.isValid) {
    return {
      isValid: false,
      errors: dateValidation.errors
    };
  }

  // Overlap validation
  const overlapCheck = checkForOverlaps(employeeId, startDate, endDate, excludeRequestId);
  if (overlapCheck.hasOverlap) {
    return {
      isValid: false,
      errors: [`Leave request overlaps with existing requests: ${overlapCheck.overlappingRequests.map(r => `${r.startDate} to ${r.endDate} (${r.status})`).join(', ')}`]
    };
  }

  // Balance validation (only for vacation and personal leave)
  if (type === 'vacation' || type === 'personal') {
    const balanceValidation = validateLeaveBalance(employeeId, dateValidation.businessDays);
    if (!balanceValidation.isValid) {
      return {
        isValid: false,
        errors: [balanceValidation.error]
      };
    }
  }

  return {
    isValid: true,
    businessDays: dateValidation.businessDays
  };
};

module.exports = {
  leaveApplicationSchema,
  leaveApprovalSchema,
  validateDates,
  calculateBusinessDays,
  checkForOverlaps,
  validateLeaveBalance,
  validateLeaveRequest
};
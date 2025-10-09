// Simple authentication middleware for demo purposes
const { findUserById } = require('../data/mockData');

// Mock authentication middleware
const authenticate = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  
  if (!userId) {
    return res.status(401).json({ error: 'No user ID provided. Include x-user-id header.' });
  }

  const user = findUserById(userId);
  if (!user) {
    return res.status(401).json({ error: 'Invalid user ID' });
  }

  req.user = user;
  next();
};

// Authorization middleware to check if user has required role
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};

// Middleware to check if manager can access employee data
const checkManagerAccess = (req, res, next) => {
  const { employeeId } = req.params;
  const { user } = req;

  // If user is accessing their own data, allow
  if (user.id === employeeId) {
    return next();
  }

  // If user is a manager, check if they manage this employee
  if (user.role === 'manager') {
    const { getManagerEmployees } = require('../data/mockData');
    const managedEmployees = getManagerEmployees(user.id);
    const canAccess = managedEmployees.some(emp => emp.id === employeeId);
    
    if (!canAccess) {
      return res.status(403).json({ 
        error: 'Access denied. You can only access your own employees.' 
      });
    }
  }

  next();
};

module.exports = {
  authenticate,
  authorize,
  checkManagerAccess
};
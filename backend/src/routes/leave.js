const express = require('express');
const router = express.Router();
const LeaveService = require('../services/leaveService');
const { authenticate, authorize } = require('../middleware/auth');
const { leaveApplicationSchema, leaveApprovalSchema } = require('../utils/validation');

// Apply for leave (Employee only)
router.post('/apply', authenticate, authorize(['employee']), async (req, res) => {
  try {
    const { error } = leaveApplicationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }

    const result = await LeaveService.applyForLeave(req.user.id, req.body);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Get pending requests (Manager only)
router.get('/pending', authenticate, authorize(['manager']), async (req, res) => {
  try {
    const result = await LeaveService.getPendingRequestsForManager(req.user.id);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Approve or reject leave request (Manager only)
router.post('/approve/:id', authenticate, authorize(['manager']), async (req, res) => {
  try {
    const { error } = leaveApprovalSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }

    const { action, comments } = req.body;
    const result = await LeaveService.processLeaveRequest(
      req.params.id,
      req.user.id,
      action,
      comments
    );
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Get employee's own leave requests and balance
router.get('/my-requests', authenticate, authorize(['employee']), async (req, res) => {
  try {
    const result = await LeaveService.getEmployeeLeaveRequests(req.user.id);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Get user's leave balance
router.get('/balance', authenticate, async (req, res) => {
  try {
    const result = await LeaveService.getUserLeaveBalance(req.user.id);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Monthly leave summary (Bonus feature - Manager only)
router.get('/summary', authenticate, authorize(['manager']), async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
    
    const result = await LeaveService.getMonthlySummary(parseInt(year), parseInt(month));
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

module.exports = router;
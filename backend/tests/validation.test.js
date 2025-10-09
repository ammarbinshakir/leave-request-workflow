const { validateDates, calculateBusinessDays, validateLeaveBalance, checkForOverlaps } = require('../src/utils/validation');
const { parseISO, addDays, format } = require('date-fns');

describe('Leave Request Validation', () => {
  
  describe('Date Validation', () => {
    test('should reject past start dates', () => {
      const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd');
      const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
      
      const result = validateDates(yesterday, tomorrow);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Start date cannot be in the past');
    });

    test('should reject end date before start date', () => {
      const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
      const dayAfter = format(addDays(new Date(), 2), 'yyyy-MM-dd');
      
      const result = validateDates(dayAfter, tomorrow);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('End date cannot be before start date');
    });

    test('should accept valid future dates', () => {
      const startDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');
      const endDate = format(addDays(new Date(), 3), 'yyyy-MM-dd');
      
      const result = validateDates(startDate, endDate);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.businessDays).toBeGreaterThan(0);
    });

    test('should calculate business days correctly (excluding weekends)', () => {
      // Monday to Wednesday (3 business days)
      const monday = '2025-11-10'; // Assuming this is a Monday
      const wednesday = '2025-11-12';
      
      const businessDays = calculateBusinessDays(parseISO(monday), parseISO(wednesday));
      
      expect(businessDays).toBe(3);
    });
  });

  describe('Leave Balance Validation', () => {
    // Mock the data import for testing
    const mockGetLeaveBalance = jest.fn();
    
    beforeEach(() => {
      // Reset mock before each test
      mockGetLeaveBalance.mockClear();
      
      // Mock the module
      jest.doMock('../src/data/mockData', () => ({
        getLeaveBalance: mockGetLeaveBalance
      }));
    });

    test('should reject request if insufficient balance', () => {
      mockGetLeaveBalance.mockReturnValue({
        remainingDays: 5,
        usedDays: 20,
        totalDays: 25
      });

      const result = validateLeaveBalance('emp-001', 10);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Insufficient leave balance');
      expect(result.availableDays).toBe(5);
      expect(result.requestedDays).toBe(10);
    });

    test('should accept request if sufficient balance', () => {
      mockGetLeaveBalance.mockReturnValue({
        remainingDays: 15,
        usedDays: 10,
        totalDays: 25
      });

      const result = validateLeaveBalance('emp-001', 5);
      
      expect(result.isValid).toBe(true);
      expect(result.availableDays).toBe(15);
      expect(result.requestedDays).toBe(5);
    });

    test('should handle user not found', () => {
      mockGetLeaveBalance.mockReturnValue(null);

      const result = validateLeaveBalance('invalid-user', 5);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Leave balance not found');
    });
  });

  describe('Overlap Detection', () => {
    const mockGetEmployeeRequests = jest.fn();
    
    beforeEach(() => {
      mockGetEmployeeRequests.mockClear();
      
      jest.doMock('../src/data/mockData', () => ({
        getEmployeeRequests: mockGetEmployeeRequests
      }));
    });

    test('should detect overlapping requests', () => {
      mockGetEmployeeRequests.mockReturnValue([
        {
          id: 'req-001',
          startDate: '2025-11-15',
          endDate: '2025-11-17',
          status: 'approved'
        }
      ]);

      const result = checkForOverlaps('emp-001', '2025-11-16', '2025-11-18');
      
      expect(result.hasOverlap).toBe(true);
      expect(result.overlappingRequests).toHaveLength(1);
    });

    test('should not detect overlap with rejected requests', () => {
      mockGetEmployeeRequests.mockReturnValue([
        {
          id: 'req-001',
          startDate: '2025-11-15',
          endDate: '2025-11-17',
          status: 'rejected'
        }
      ]);

      const result = checkForOverlaps('emp-001', '2025-11-16', '2025-11-18');
      
      expect(result.hasOverlap).toBe(false);
    });

    test('should exclude specified request from overlap check', () => {
      mockGetEmployeeRequests.mockReturnValue([
        {
          id: 'req-001',
          startDate: '2025-11-15',
          endDate: '2025-11-17',
          status: 'approved'
        }
      ]);

      const result = checkForOverlaps('emp-001', '2025-11-16', '2025-11-18', 'req-001');
      
      expect(result.hasOverlap).toBe(false);
    });
  });
});

describe('Business Days Calculation', () => {
  test('should calculate single business day correctly', () => {
    const monday = parseISO('2025-11-10'); // Monday
    const result = calculateBusinessDays(monday, monday);
    
    expect(result).toBe(1);
  });

  test('should exclude weekends', () => {
    const friday = parseISO('2025-11-07'); // Friday
    const monday = parseISO('2025-11-10'); // Following Monday
    
    const result = calculateBusinessDays(friday, monday);
    
    expect(result).toBe(2); // Friday + Monday, excluding weekend
  });

  test('should handle weekend-only period', () => {
    const saturday = parseISO('2025-11-08'); // Saturday
    const sunday = parseISO('2025-11-09'); // Sunday
    
    const result = calculateBusinessDays(saturday, sunday);
    
    expect(result).toBe(0); // No business days
  });
});
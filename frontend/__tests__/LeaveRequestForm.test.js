import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../src/contexts/AuthContext';
import LeaveRequestForm from '../src/components/LeaveRequestForm';

// Mock the API module
jest.mock('../src/lib/api', () => ({
  leaveAPI: {
    getLeaveBalance: jest.fn(() => 
      Promise.resolve({
        data: {
          data: {
            totalDays: 25,
            usedDays: 5,
            remainingDays: 20
          }
        }
      })
    ),
    applyForLeave: jest.fn(() => 
      Promise.resolve({
        data: {
          success: true,
          message: 'Leave request submitted successfully'
        }
      })
    )
  }
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => {
    if (formatStr === 'yyyy-MM-dd') {
      return '2025-10-09';
    }
    return date;
  }),
  parseISO: jest.fn()
}));

const MockedLeaveRequestForm = (props) => {
  return (
    <AuthProvider>
      <LeaveRequestForm {...props} />
    </AuthProvider>
  );
};

describe('LeaveRequestForm', () => {
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'emp-001'),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });
  });

  test('renders form fields correctly', async () => {
    render(<MockedLeaveRequestForm />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/leave type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit leave request/i })).toBeInTheDocument();
    });
  });

  test('displays leave balance information', async () => {
    render(<MockedLeaveRequestForm />);
    
    await waitFor(() => {
      expect(screen.getByText(/leave balance/i)).toBeInTheDocument();
      expect(screen.getByText(/25 days/)).toBeInTheDocument();
      expect(screen.getByText(/20 days/)).toBeInTheDocument();
    });
  });

  test('validates required fields', async () => {
    render(<MockedLeaveRequestForm />);
    
    const submitButton = screen.getByRole('button', { name: /submit leave request/i });
    
    fireEvent.click(submitButton);
    
    // Form should not submit without required fields
    expect(screen.getByLabelText(/start date/i)).toBeRequired();
    expect(screen.getByLabelText(/end date/i)).toBeRequired();
    expect(screen.getByLabelText(/reason/i)).toBeRequired();
  });

  test('shows validation error for empty reason', async () => {
    render(<MockedLeaveRequestForm />);
    
    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);
    const submitButton = screen.getByRole('button', { name: /submit leave request/i });
    
    fireEvent.change(startDateInput, { target: { value: '2025-11-15' } });
    fireEvent.change(endDateInput, { target: { value: '2025-11-17' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please provide a reason/i)).toBeInTheDocument();
    });
  });

  test('submits form with valid data', async () => {
    const mockOnSuccess = jest.fn();
    const { leaveAPI } = require('../src/lib/api');
    
    render(<MockedLeaveRequestForm onSuccess={mockOnSuccess} />);
    
    await waitFor(() => screen.getByLabelText(/start date/i));
    
    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);
    const reasonInput = screen.getByLabelText(/reason/i);
    const submitButton = screen.getByRole('button', { name: /submit leave request/i });
    
    fireEvent.change(startDateInput, { target: { value: '2025-11-15' } });
    fireEvent.change(endDateInput, { target: { value: '2025-11-17' } });
    fireEvent.change(reasonInput, { target: { value: 'Personal vacation' } });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(leaveAPI.applyForLeave).toHaveBeenCalledWith({
        startDate: '2025-11-15',
        endDate: '2025-11-17',
        reason: 'Personal vacation',
        type: 'vacation'
      });
    });
    
    await waitFor(() => {
      expect(screen.getByText(/leave request submitted successfully/i)).toBeInTheDocument();
    });
    
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  test('shows loading state during submission', async () => {
    const { leaveAPI } = require('../src/lib/api');
    
    // Mock a delayed response
    leaveAPI.applyForLeave.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        data: { success: true }
      }), 100))
    );
    
    render(<MockedLeaveRequestForm />);
    
    await waitFor(() => screen.getByLabelText(/start date/i));
    
    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);
    const reasonInput = screen.getByLabelText(/reason/i);
    const submitButton = screen.getByRole('button', { name: /submit leave request/i });
    
    fireEvent.change(startDateInput, { target: { value: '2025-11-15' } });
    fireEvent.change(endDateInput, { target: { value: '2025-11-17' } });
    fireEvent.change(reasonInput, { target: { value: 'Personal vacation' } });
    
    fireEvent.click(submitButton);
    
    expect(screen.getByText(/submitting/i)).toBeInTheDocument();
  });

  test('handles API errors gracefully', async () => {
    const { leaveAPI } = require('../src/lib/api');
    
    leaveAPI.applyForLeave.mockRejectedValue({
      response: {
        data: {
          error: 'Insufficient leave balance'
        }
      }
    });
    
    render(<MockedLeaveRequestForm />);
    
    await waitFor(() => screen.getByLabelText(/start date/i));
    
    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);
    const reasonInput = screen.getByLabelText(/reason/i);
    const submitButton = screen.getByRole('button', { name: /submit leave request/i });
    
    fireEvent.change(startDateInput, { target: { value: '2025-11-15' } });
    fireEvent.change(endDateInput, { target: { value: '2025-11-17' } });
    fireEvent.change(reasonInput, { target: { value: 'Personal vacation' } });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/insufficient leave balance/i)).toBeInTheDocument();
    });
  });
});
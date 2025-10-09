import { useState, useEffect } from 'react';
import { leaveAPI } from '../lib/api';
import { format, parseISO } from 'date-fns';

export default function LeaveRequestForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    type: 'vacation'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [leaveBalance, setLeaveBalance] = useState(null);

  useEffect(() => {
    // Load user's leave balance
    const loadBalance = async () => {
      try {
        const response = await leaveAPI.getLeaveBalance();
        setLeaveBalance(response.data.data);
      } catch (error) {
        console.error('Error loading leave balance:', error);
      }
    };
    
    loadBalance();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateDates = () => {
    const today = new Date();
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (startDate < today) {
      return 'Start date cannot be in the past';
    }

    if (endDate < startDate) {
      return 'End date cannot be before start date';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Client-side validation
    const dateError = validateDates();
    if (dateError) {
      setError(dateError);
      setLoading(false);
      return;
    }

    if (!formData.reason.trim()) {
      setError('Please provide a reason for your leave request');
      setLoading(false);
      return;
    }

    try {
      const response = await leaveAPI.applyForLeave(formData);
      
      if (response.data.success) {
        setSuccess('Leave request submitted successfully!');
        setFormData({
          startDate: '',
          endDate: '',
          reason: '',
          type: 'vacation'
        });
        
        // Refresh balance and call parent callback
        const balanceResponse = await leaveAPI.getLeaveBalance();
        setLeaveBalance(balanceResponse.data.data);
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.details?.join('; ') || 
                          'Failed to submit leave request';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Apply for Leave
      </h2>

      {leaveBalance && (
        <div className="mb-6 p-4 bg-primary-50 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Leave Balance
          </h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-primary-600">Total:</span>
              <span className="ml-1 font-medium">{leaveBalance.totalDays} days</span>
            </div>
            <div>
              <span className="text-primary-600">Used:</span>
              <span className="ml-1 font-medium">{leaveBalance.usedDays} days</span>
            </div>
            <div>
              <span className="text-primary-600">Remaining:</span>
              <span className="ml-1 font-medium">{leaveBalance.remainingDays} days</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="form-label">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="form-input"
              required
            />
          </div>

          <div>
            <label htmlFor="endDate" className="form-label">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              min={formData.startDate || format(new Date(), 'yyyy-MM-dd')}
              className="form-input"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="type" className="form-label">
            Leave Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="form-input"
          >
            <option value="vacation">Vacation</option>
            <option value="sick">Sick Leave</option>
            <option value="personal">Personal</option>
          </select>
        </div>

        <div>
          <label htmlFor="reason" className="form-label">
            Reason
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows="3"
            placeholder="Please provide a reason for your leave request..."
            className="form-input"
            required
          />
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Submitting...' : 'Submit Leave Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { leaveAPI } from '../lib/api';

const MonthlySummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1
    };
  });

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await leaveAPI.getMonthlySummary(selectedPeriod.year, selectedPeriod.month);
      if (response.data.success) {
        setSummary(response.data.data.summary);
      } else {
        setError(response.data.error || 'Failed to fetch summary');
      }
    } catch (err) {
      setError('Error fetching monthly summary');
      console.error('Error fetching monthly summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedPeriod]);

  const handlePeriodChange = (field, value) => {
    setSelectedPeriod(prev => ({
      ...prev,
      [field]: parseInt(value)
    }));
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'vacation':
        return 'text-blue-600';
      case 'sick':
        return 'text-red-600';
      case 'personal':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Monthly Summary</h2>

      {/* Period Selector */}
      <div className="mb-6 flex gap-4 items-center">
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium text-gray-700">Year:</label>
          <select
            value={selectedPeriod.year}
            onChange={(e) => handlePeriodChange('year', e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-900 bg-white"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium text-gray-700">Month:</label>
          <select
            value={selectedPeriod.month}
            onChange={(e) => handlePeriodChange('month', e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-900 bg-white"
          >
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading summary...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {summary && !loading && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-700 mb-1">Total Requests</h3>
              <p className="text-2xl font-bold text-blue-800">{summary.totalRequests}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-700 mb-1">Approved</h3>
              <p className="text-2xl font-bold text-green-800">{summary.approvedRequests}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-700 mb-1">Pending</h3>
              <p className="text-2xl font-bold text-yellow-800">{summary.pendingRequests}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-red-700 mb-1">Rejected</h3>
              <p className="text-2xl font-bold text-red-800">{summary.rejectedRequests}</p>
            </div>
          </div>

          {/* Days Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-1">Total Days Requested</h3>
              <p className="text-2xl font-bold text-gray-800">{summary.totalDaysRequested}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-1">Approved Days</h3>
              <p className="text-2xl font-bold text-gray-800">{summary.approvedDays}</p>
            </div>
          </div>

          {/* Request Types Breakdown */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Requests by Type</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getTypeColor('vacation')}`}>
                  {summary.requestsByType.vacation}
                </div>
                <div className="text-sm text-gray-600">Vacation</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getTypeColor('sick')}`}>
                  {summary.requestsByType.sick}
                </div>
                <div className="text-sm text-gray-600">Sick Leave</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getTypeColor('personal')}`}>
                  {summary.requestsByType.personal}
                </div>
                <div className="text-sm text-gray-600">Personal</div>
              </div>
            </div>
          </div>

          {/* Approval Rate */}
          {summary.totalRequests > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Approval Metrics</h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Approval Rate:</span>
                <span className="text-lg font-semibold text-green-600">
                  {Math.round((summary.approvedRequests / summary.totalRequests) * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Days per Request:</span>
                <span className="text-lg font-semibold text-blue-600">
                  {summary.totalRequests > 0 ? Math.round(summary.totalDaysRequested / summary.totalRequests * 10) / 10 : 0}
                </span>
              </div>
            </div>
          )}

          {summary.totalRequests === 0 && (
            <div className="text-center py-8 text-gray-500">
              No leave requests found for {months.find(m => m.value === selectedPeriod.month)?.label} {selectedPeriod.year}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MonthlySummary;
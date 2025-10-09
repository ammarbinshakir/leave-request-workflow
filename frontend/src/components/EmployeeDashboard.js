import { useState, useEffect } from 'react';
import { leaveAPI } from '../lib/api';
import { format, parseISO } from 'date-fns';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};

const typeColors = {
  vacation: 'bg-blue-100 text-blue-800',
  sick: 'bg-red-100 text-red-800',
  personal: 'bg-purple-100 text-purple-800'
};

export default function EmployeeDashboard() {
  const [myRequests, setMyRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMyRequests();
  }, []);

  const loadMyRequests = async () => {
    try {
      setLoading(true);
      const response = await leaveAPI.getMyRequests();
      setMyRequests(response.data.data.requests || []);
      setLeaveBalance(response.data.data.balance);
    } catch (error) {
      setError('Failed to load your leave requests');
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadMyRequests();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading your requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Leave Balance Card */}
      {leaveBalance && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Leave Balance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">
                {leaveBalance.totalDays}
              </div>
              <div className="text-sm text-primary-800">Total Days</div>
            </div>
            <div className="bg-warning-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-warning-600">
                {leaveBalance.usedDays}
              </div>
              <div className="text-sm text-warning-800">Days Used</div>
            </div>
            <div className="bg-success-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-success-600">
                {leaveBalance.remainingDays}
              </div>
              <div className="text-sm text-success-800">Days Remaining</div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Requests History */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Your Leave Requests
        </h2>

        {error && (
          <div className="alert alert-error mb-4">
            {error}
          </div>
        )}

        {myRequests.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 text-lg mb-2">
              No leave requests found
            </div>
            <div className="text-gray-400 text-sm">
              Submit your first leave request using the form above
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {myRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {format(parseISO(request.startDate), 'MMM d, yyyy')}
                      </div>
                      <div className="text-gray-500">
                        to {format(parseISO(request.endDate), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.days} day{request.days !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${typeColors[request.type]}`}>
                        {request.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="truncate" title={request.reason}>
                        {request.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[request.status]}`}>
                        {request.status}
                      </span>
                      {request.comments && (
                        <div className="text-xs text-gray-500 mt-1 italic">
                          "{request.comments}"
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(parseISO(request.appliedDate), 'MMM d, yyyy')}
                      {request.approvedDate && (
                        <div className="text-xs text-success-600">
                          Approved: {format(parseISO(request.approvedDate), 'MMM d, yyyy')}
                        </div>
                      )}
                      {request.rejectedDate && (
                        <div className="text-xs text-danger-600">
                          Rejected: {format(parseISO(request.rejectedDate), 'MMM d, yyyy')}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={refreshData}
            className="btn btn-secondary text-sm"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
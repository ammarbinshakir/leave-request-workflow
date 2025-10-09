import { useState, useEffect } from 'react';
import { leaveAPI } from '../lib/api';
import { format, parseISO } from 'date-fns';
import MonthlySummary from './MonthlySummary';

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

export default function ManagerDashboard() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionComments, setActionComments] = useState('');

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await leaveAPI.getPendingRequests();
      setPendingRequests(response.data.data);
    } catch (error) {
      setError('Failed to load pending requests');
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = async (requestId, action) => {
    try {
      setProcessingId(requestId);
      
      const response = await leaveAPI.processLeaveRequest(
        requestId, 
        action, 
        actionComments
      );
      
      if (response.data.success) {
        // Remove the processed request from pending list
        setPendingRequests(prev => 
          prev.filter(request => request.id !== requestId)
        );
        setSelectedRequest(null);
        setActionComments('');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          `Failed to ${action} request`;
      setError(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const openActionModal = (request) => {
    setSelectedRequest(request);
    setActionComments('');
    setError('');
  };

  const closeActionModal = () => {
    setSelectedRequest(null);
    setActionComments('');
    setError('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading pending requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending Requests
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'summary'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Monthly Summary
          </button>
        </nav>
      </div>

      {/* Pending Requests Tab */}
      {activeTab === 'pending' && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Pending Leave Requests
          </h2>

        {error && (
          <div className="alert alert-error mb-4">
            {error}
          </div>
        )}

        {pendingRequests.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 text-lg mb-2">
              No pending requests
            </div>
            <div className="text-gray-400 text-sm">
              All leave requests have been processed
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
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
                    Applied
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium text-gray-900">
                        {request.employeeName}
                      </div>
                    </td>
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
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {request.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(parseISO(request.appliedDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 text-gray-900">
                      <button
                        onClick={() => openActionModal(request)}
                        disabled={processingId === request.id}
                        className="btn btn-success text-xs px-3 py-1"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      )}

      {/* Action Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Review Leave Request
              </h3>
              
              <div className="mb-4 space-y-2 text-sm">
                <div><strong>Employee:</strong> {selectedRequest.employeeName}</div>
                <div><strong>Dates:</strong> {format(parseISO(selectedRequest.startDate), 'MMM d, yyyy')} - {format(parseISO(selectedRequest.endDate), 'MMM d, yyyy')}</div>
                <div><strong>Duration:</strong> {selectedRequest.days} days</div>
                <div><strong>Type:</strong> {selectedRequest.type}</div>
                <div><strong>Reason:</strong> {selectedRequest.reason}</div>
              </div>

              <div className="mb-4">
                <label htmlFor="comments" className="form-label">
                  Comments (Optional)
                </label>
                <textarea
                  id="comments"
                  value={actionComments}
                  onChange={(e) => setActionComments(e.target.value)}
                  rows="3"
                  placeholder="Add any comments..."
                  className="form-input"
                />
              </div>

              {error && (
                <div className="alert alert-error mb-4">
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => handleProcessRequest(selectedRequest.id, 'approve')}
                  disabled={processingId === selectedRequest.id}
                  className="btn btn-success flex-1"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleProcessRequest(selectedRequest.id, 'reject')}
                  disabled={processingId === selectedRequest.id}
                  className="btn btn-danger flex-1"
                >
                  Reject
                </button>
              </div>
              
              <button
                onClick={closeActionModal}
                className="btn btn-secondary w-full mt-3"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Summary Tab */}
      {activeTab === 'summary' && <MonthlySummary />}
    </div>
  );
}
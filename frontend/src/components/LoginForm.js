import { useState, useEffect } from 'react';
import { authAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function LoginForm() {
  const [users, setUsers] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  useEffect(() => {
    // Load available users for demo purposes
    const loadUsers = async () => {
      try {
        const response = await authAPI.getUsers();
        setUsers(response.data.data);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    
    loadUsers();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!selectedEmail) {
      setError('Please select a user');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(selectedEmail);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Leave Request System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Demo Login - Select a user to continue
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="user-select" className="form-label">
              Select User
            </label>
            <select
              id="user-select"
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
              className="form-input"
              disabled={loading}
            >
              <option value="">Choose a user...</option>
              {users.map((user) => (
                <option key={user.id} value={user.email}>
                  {user.name} ({user.role}) - {user.department}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || !selectedEmail}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Demo Users</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="text-xs text-gray-500">
              <strong>Employees:</strong> John Doe, Jane Smith, Bob Johnson
            </div>
            <div className="text-xs text-gray-500">
              <strong>Managers:</strong> Alice Manager, Charlie Boss
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
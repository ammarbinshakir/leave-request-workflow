import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import LoginForm from '../components/LoginForm';
import LeaveRequestForm from '../components/LeaveRequestForm';
import EmployeeDashboard from '../components/EmployeeDashboard';
import ManagerDashboard from '../components/ManagerDashboard';

export default function Home() {
  const { user, loading, isEmployee, isManager } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const handleLeaveRequestSuccess = () => {
    // Trigger a refresh of the dashboard
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-6">
            
            {/* Employee View */}
            {isEmployee && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <LeaveRequestForm onSuccess={handleLeaveRequestSuccess} />
                  <div className="card p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Quick Info
                    </h2>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div>• Leave requests require manager approval</div>
                      <div>• Past dates are not allowed</div>
                      <div>• Overlapping requests will be rejected</div>
                      <div>• Sick leave doesn't count against your balance</div>
                      <div>• Weekend days are automatically excluded</div>
                    </div>
                  </div>
                </div>
                
                <EmployeeDashboard key={refreshKey} />
              </>
            )}

            {/* Manager View */}
            {isManager && (
              <ManagerDashboard />
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
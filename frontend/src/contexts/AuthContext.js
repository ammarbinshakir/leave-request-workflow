import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUserId = localStorage.getItem('currentUserId');
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedUserId && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUserId');
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email) => {
    try {
      const response = await authAPI.login(email);
      const userData = response.data.data.user;
      
      setUser(userData);
      localStorage.setItem('currentUserId', userData.id);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUser');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isEmployee: user?.role === 'employee',
    isManager: user?.role === 'manager',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
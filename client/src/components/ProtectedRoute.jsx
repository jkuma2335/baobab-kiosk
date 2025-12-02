import { Navigate } from 'react-router-dom';
import { Suspense } from 'react';

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFF5F7' }}>
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#FF69B4' }}></div>
      <p className="mt-4 font-medium" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Loading...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  // Check if user info exists in localStorage
  const user = localStorage.getItem('user');

  if (!user) {
    // No user found, redirect to login
    return <Navigate to="/login" replace />;
  }

  try {
    const userData = JSON.parse(user);
    
    // Optionally check if user is admin
    if (!userData.isAdmin) {
      // Not an admin, redirect to login
      return <Navigate to="/login" replace />;
    }

    // User is authenticated and is admin, wrap children in Suspense for lazy loading
    return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
  } catch (error) {
    // Invalid user data, redirect to login
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;


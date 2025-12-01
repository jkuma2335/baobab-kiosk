import { Navigate } from 'react-router-dom';

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

    // User is authenticated and is admin, render children
    return children;
  } catch (error) {
    // Invalid user data, redirect to login
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;


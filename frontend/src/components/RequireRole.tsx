import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface RequireRoleProps {
  role: UserRole | UserRole[];
  children: React.ReactNode;
}

/**
 * Route guard. Redirects unauthenticated users to /login and users with the
 * wrong role to the home page. RLS on Supabase is the real security boundary;
 * this is the UX layer that keeps the wrong portal out of view.
 */
export const RequireRole: React.FC<RequireRoleProps> = ({ role, children }) => {
  const { session, role: userRole, loading } = useAuth();
  const location = useLocation();
  const allowed = Array.isArray(role) ? role : [role];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <div className="w-8 h-8 border-3 border-[#FF914D]/30 border-t-[#FF914D] rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (userRole && !allowed.includes(userRole)) {
    // Signed in but wrong portal — send them somewhere they belong.
    const home = userRole === 'admin' ? '/admin' : userRole === 'merchant' ? '/merchant' : '/';
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
};

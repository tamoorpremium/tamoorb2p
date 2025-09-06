// src/components/RoleProtectedRoute.tsx
import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { User } from '@supabase/supabase-js';

interface RoleProtectedRouteProps {
  requiredRoles: string[];
  children: ReactNode;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ requiredRoles, children }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          console.log('⛔ RoleProtectedRoute - No session found.');
          setIsAuthorized(false);
          setLoading(false);
          return;
        }

        const user: User = session.user;

        // Read role from user_metadata safely
        const role = (user.user_metadata as any)?.role ?? null;

        console.log('🔎 RoleProtectedRoute - user:', user);
        console.log('🔎 RoleProtectedRoute - role:', role);
        console.log('🔎 RoleProtectedRoute - requiredRoles:', requiredRoles);

        if (role && requiredRoles.includes(role)) {
          setIsAuthorized(true);
          console.log('✅ RoleProtectedRoute - Authorized');
        } else {
          setIsAuthorized(false);
          console.log('⛔ RoleProtectedRoute - Not authorized');
        }
      } catch (err) {
        console.error('❌ RoleProtectedRoute - Error checking role:', err);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, [requiredRoles]);

  if (loading)
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  if (!isAuthorized) {
    // Redirect if not authorized or not logged in
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;

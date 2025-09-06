//src\components\AuthProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setLoggedIn(!!user);
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  if (!authChecked) {
    return <div>Loading...</div>; // or a spinner
  }

  if (!loggedIn) {
    return <Navigate to="/auth" replace />; // redirect to Auth page
  }

  return children; // render protected component
};

export default ProtectedRoute;

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast.error('Access denied! You are not authorized to view this page.');
  }, []);

  return (
    <div className="min-h-screen bg-tamoor-gray flex flex-col justify-center items-center p-6">
      <div className="luxury-card glass p-10 rounded-3xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-4xl font-display font-bold text-tamoor-charcoal mb-6">Unauthorized</h1>
        <p className="mb-8 text-tamoor-charcoal text-lg">
          You do not have permission to access this page.
        </p>
        <button
          onClick={() => navigate('/')}
          className="btn-secondary w-full py-3 text-lg font-semibold hover:bg-gray-300 transition-colors rounded"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;

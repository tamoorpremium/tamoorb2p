import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminCategoryForm from '../../components/categories/AdminCategoryForm';
import { supabase } from '../../utils/supabaseClient';
import { toast, ToastContainer } from 'react-toastify';

const AdminCategoryAdd: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: { name: string; slug: string; parent_id: number | null; description?: string }) => {
    setLoading(true);
    const { error } = await supabase.from('categories').insert(formData);
    setLoading(false);
    if (error) {
      toast.error('Failed to add category.');
    } else {
      toast.success('Category added successfully!');
      navigate('/admin/categories');
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-8">
        <h1 className="text-3xl font-bold mb-6">Add New Category</h1>
        <AdminCategoryForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </>
  );
};

export default AdminCategoryAdd;

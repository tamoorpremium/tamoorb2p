import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminCategoryForm from '../../components/categories/AdminCategoryForm';
import { supabase } from '../../utils/supabaseClient';
import { toast, ToastContainer } from 'react-toastify';

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
}

const AdminCategoryAdd: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch only top-level categories for parent dropdown
  useEffect(() => {
    const fetchParentCategories = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id')
        .is('parent_id', null)
        .order('name', { ascending: true });

      if (error) {
        console.error('Parent categories fetch error:', error);
        toast.error('Failed to load parent categories.');
      } else {
        setCategories(data || []);
      }
      setLoading(false);
    };

    fetchParentCategories();
  }, []);

  const handleSubmit = async (formData: Omit<Category, 'id'>) => {
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
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="w-full max-w-full sm:max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6 bg-white rounded shadow-sm sm:shadow-md mt-6 sm:mt-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center sm:text-left">
          Add New Category
        </h1>

        <AdminCategoryForm
          categories={categories} // pass parent categories
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </>
  );
};

export default AdminCategoryAdd;

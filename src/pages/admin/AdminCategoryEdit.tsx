import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminCategoryForm from '../../components/categories/AdminCategoryForm';
import { supabase } from '../../utils/supabaseClient';
import { toast, ToastContainer } from 'react-toastify';

const AdminCategoryEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchCategory = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('id', parseInt(id))
          .single();
        if (error) {
          toast.error('Failed to load category.');
        } else {
          setInitialData(data);
        }
        setLoading(false);
      };
      fetchCategory();
    }
  }, [id]);

  const handleSubmit = async (formData: Omit<typeof initialData, 'id'>) => {
    if (!id) return;
    setLoading(true);
    const { error } = await supabase
      .from('categories')
      .update(formData)
      .eq('id', parseInt(id));
    setLoading(false);
    if (error) {
      toast.error('Failed to update category.');
    } else {
      toast.success('Category updated successfully.');
      navigate('/admin/categories');
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) return;

    setLoading(true);
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', parseInt(id));
    setLoading(false);
    if (error) {
      toast.error('Failed to delete category.');
    } else {
      toast.success('Category deleted successfully.');
      navigate('/admin/categories');
    }
  };

  if (!id) return null;

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-8">
        <h1 className="text-3xl font-bold mb-6">Edit Category</h1>
        {initialData ? (
          <>
            <AdminCategoryForm initialData={initialData} onSubmit={handleSubmit} loading={loading} />
            <button
              onClick={handleDelete}
              disabled={loading}
              className="btn-premium bg-red-600 hover:bg-red-700 w-full py-3 mt-6 font-semibold"
            >
              Delete Category
            </button>
          </>
        ) : (
          <p>Loading category data...</p>
        )}
      </div>
    </>
  );
};

export default AdminCategoryEdit;

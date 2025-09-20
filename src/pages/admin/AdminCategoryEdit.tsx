import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminCategoryForm from '../../components/categories/AdminCategoryForm';
import { supabase } from '../../utils/supabaseClient';
import { toast, ToastContainer } from 'react-toastify';

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
}

const AdminCategoryEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);

      // Fetch current category
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', parseInt(id))
        .single();

      if (categoryError) {
        console.error('Category fetch error:', categoryError);
        toast.error('Failed to load category.');
      } else {
        setInitialData(category);
      }

      // Fetch only parent categories for dropdown
      const { data: parentCategories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id')
        .is('parent_id', null)
        .order('name', { ascending: true });

      if (categoriesError) {
        console.error('Categories fetch error:', categoriesError);
        toast.error('Failed to load categories list.');
      } else {
        setCategories(parentCategories || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (formData: Omit<Category, 'id'>) => {
    if (!id) return;
    setLoading(true);

    const { error } = await supabase.from('categories').update(formData).eq('id', parseInt(id));

    setLoading(false);

    if (error) {
      toast.error('Failed to update category.');
    } else {
      toast.success('Category updated successfully.');
      navigate('/admin/categories');
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this category? This action cannot be undone.'))
      return;

    setLoading(true);
    const { error } = await supabase.from('categories').delete().eq('id', parseInt(id));
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
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="w-full max-w-full sm:max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6 bg-white rounded shadow-sm sm:shadow-md mt-6 sm:mt-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center sm:text-left">
          Edit Category
        </h1>

        {initialData ? (
          <>
            <AdminCategoryForm
              initialData={initialData}
              categories={categories.filter((c) => c.id !== Number(id))} // exclude itself
              onSubmit={handleSubmit}
              loading={loading}
            />

            <button
              onClick={handleDelete}
              disabled={loading}
              className="btn-premium bg-red-600 hover:bg-red-700 w-full py-3 sm:py-4 mt-4 sm:mt-6 font-semibold"
            >
              Delete Category
            </button>
          </>
        ) : (
          <p className="text-center py-4">Loading category data...</p>
        )}
      </div>
    </>
  );
};

export default AdminCategoryEdit;

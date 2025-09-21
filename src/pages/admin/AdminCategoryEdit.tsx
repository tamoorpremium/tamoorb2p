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
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Fetch category and parent categories
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

      // Fetch parent categories for dropdown
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

  // Handle category update
  const handleSubmit = async (formData: Omit<Category, 'id'>) => {
    if (!id) return;
    setLoading(true);

    const slug = formData.slug
      ? formData.slug
      : formData.name
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');

    if (!formData.name.trim()) {
      toast.error('Category name cannot be empty.');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('categories')
      .update({
        name: formData.name,
        slug,
        parent_id: formData.parent_id || null,
      })
      .eq('id', parseInt(id));

    setLoading(false);

    if (error) {
      if (error.code === '23505') {
        toast.error('A category with this slug already exists.');
      } else {
        console.error('Update error:', error);
        toast.error(`Failed to update category: ${error.message}`);
      }
    } else {
      toast.success('Category updated successfully.');
      navigate('/admin/categories');
    }
  };

  // Handle category delete
  const handleDelete = async () => {
    if (!id) return;

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

            {/* Inline Delete Confirmation */}
            {!showConfirmDelete ? (
              <button
                onClick={() => setShowConfirmDelete(true)}
                disabled={loading}
                className="btn-premium bg-red-600 hover:bg-red-700 w-full py-3 sm:py-4 mt-4 sm:mt-6 font-semibold"
              >
                Delete Category
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-6">
                <span className="text-sm sm:text-base text-gray-700 mb-2 sm:mb-0">
                  Are you sure you want to delete this category?
                </span>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="btn-premium bg-red-600 hover:bg-red-700 w-full sm:w-auto py-2 px-4 font-semibold"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  disabled={loading}
                  className="btn-premium bg-gray-400 hover:bg-gray-500 w-full sm:w-auto py-2 px-4 font-semibold"
                >
                  Cancel
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center py-4">Loading category data...</p>
        )}
      </div>
    </>
  );
};

export default AdminCategoryEdit;

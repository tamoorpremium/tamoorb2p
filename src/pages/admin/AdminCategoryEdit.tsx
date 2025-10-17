import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { toast, ToastContainer } from 'react-toastify';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

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
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  // State for the inline form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);

  // --- All your original data-fetching and handler logic is preserved ---

  useEffect(() => {
    const isNew = !id;
    if (isNew) {
      setInitialData({ id: 0, name: '', slug: '', parent_id: null }); // Set a blank slate for a new category
    }

    const fetchData = async () => {
      setLoading(true);

      // Fetch all potential parent categories (those with no parent)
      const { data: parents, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id')
        .is('parent_id', null)
        .order('name', { ascending: true });
      
      if (categoriesError) {
        toast.error('Failed to load parent categories.');
      } else {
        setParentCategories(parents || []);
      }

      // If editing an existing category, fetch its data
      if (!isNew) {
        const { data: category, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('id', parseInt(id!))
          .single();

        if (categoryError) {
          toast.error('Failed to load category data.');
        } else {
          setInitialData(category);
          // Populate form state
          setName(category.name);
          setSlug(category.slug);
          setParentId(category.parent_id);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name.trim()) {
      toast.error('Category name cannot be empty.');
      setLoading(false);
      return;
    }

    // Auto-generate slug if it's empty
    const finalSlug = slug.trim() ? slug.trim() : name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

    const formData = {
      name: name.trim(),
      slug: finalSlug,
      parent_id: parentId || null,
    };
    
    let error;
    if (id) { // Update existing
      const { error: updateError } = await supabase.from('categories').update(formData).eq('id', parseInt(id));
      error = updateError;
    } else { // Create new
      const { error: insertError } = await supabase.from('categories').insert(formData);
      error = insertError;
    }

    setLoading(false);

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        toast.error('A category with this slug already exists.');
      } else {
        toast.error(`Failed to save category: ${error.message}`);
      }
    } else {
      toast.success(`Category ${id ? 'updated' : 'created'} successfully!`);
      navigate('/admin/categories');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setLoading(true);
    const { error } = await supabase.from('categories').delete().eq('id', parseInt(id));
    setLoading(false);
    if (error) {
      toast.error('Failed to delete category. It might be in use by products.');
    } else {
      toast.success('Category deleted successfully.');
      navigate('/admin/categories');
    }
  };

  if (loading && id) {
     return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div></div>;
  }

  // --- UI/JSX Section Completely Redesigned for Consistency and Clarity ---
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 sm:p-6 lg:p-8 font-sans text-gray-100">
        
        <header className="flex items-center justify-between mb-6 pb-4 border-b border-yellow-400/20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/categories')} 
              className="p-2 bg-gray-700/50 rounded-full hover:bg-yellow-400/20 transition-colors"
            >
              <ArrowLeft size={20} className="text-yellow-300" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-yellow-400">
              {id ? `Edit: ${initialData?.name || 'Category'}` : "Add New Category"}
            </h1>
          </div>
        </header>

        <div className="max-w-2xl mx-auto">
          {/* Main Form Card */}
          <div className="p-6 rounded-xl bg-black/20 border border-yellow-400/20 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-yellow-300 mb-2">Category Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., California Almonds"
                  className="w-full rounded-lg py-2 px-4 bg-gray-900/70 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-semibold text-yellow-300 mb-2">URL Slug</label>
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g., california-almonds"
                  className="w-full rounded-lg py-2 px-4 bg-gray-900/70 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <p className="text-xs text-gray-400 mt-2">Leave blank to auto-generate from name.</p>
              </div>

              <div>
                <label htmlFor="parent_id" className="block text-sm font-semibold text-yellow-300 mb-2">Parent Category</label>
                <select
                  id="parent_id"
                  value={parentId || ''}
                  onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-lg py-2 px-4 bg-gray-900/70 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="">-- No Parent (Top Level) --</option>
                  {parentCategories.filter(c => c.id !== Number(id)).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-2">Assigning a parent makes this a sub-category.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-400 text-gray-900 rounded-lg shadow-lg hover:shadow-yellow-500/50 transition-all hover:scale-105 font-bold disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                {loading ? 'Saving...' : (id ? 'Update Category' : 'Create Category')}
              </button>
            </form>
          </div>

          {/* Danger Zone for Deletion (only on edit page) */}
          {id && (
            <div className="mt-8 p-6 rounded-xl bg-red-900/20 border border-red-500/50 shadow-lg">
              <h3 className="text-lg font-bold text-red-300">Danger Zone</h3>
              <p className="text-sm text-red-200/80 mt-1 mb-4">Deleting a category cannot be undone. Make sure no products are using this category before deleting.</p>
              
              {!showConfirmDelete ? (
                  <button
                    onClick={() => setShowConfirmDelete(true)}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={16} /> Delete Category
                  </button>
              ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-red-900/30 rounded-lg">
                      <p className="flex-1 text-sm font-semibold text-white">Are you sure?</p>
                      <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-red-800"
                      >
                        {loading ? 'Deleting...' : 'Yes, Delete'}
                      </button>
                      <button
                        onClick={() => setShowConfirmDelete(false)}
                        disabled={loading}
                        className="w-full sm:w-auto px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                  </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminCategoryEdit;

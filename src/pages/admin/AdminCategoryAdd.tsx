import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { toast, ToastContainer } from 'react-toastify';
import { ArrowLeft, Save } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
}

const AdminCategoryAdd: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);

  // State for the inline form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);

  // Fetch top-level categories for parent dropdown
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
        setParentCategories(data || []);
      }
      setLoading(false);
    };

    fetchParentCategories();
  }, []);

  // Handle form submission for creating a new category
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name.trim()) {
      toast.error('Category name cannot be empty.');
      setLoading(false);
      return;
    }

    // Auto-generate slug if not present
    const finalSlug = slug.trim()
      ? slug.trim()
      : name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

    const { error } = await supabase.from('categories').insert([
      {
        name: name.trim(),
        slug: finalSlug,
        parent_id: parentId || null,
      },
    ]);

    setLoading(false);

    if (error) {
      if (error.code === '23505') { // Handle duplicate slug specifically
        toast.error('A category with this slug already exists.');
      } else {
        console.error('Insert error:', error);
        toast.error(`Failed to add category: ${error.message}`);
      }
    } else {
      toast.success('Category added successfully!');
      navigate('/admin/categories');
    }
  };

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
              Add New Category
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
                  disabled={loading}
                >
                  <option value="">-- No Parent (Top Level) --</option>
                  {parentCategories.map(cat => (
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
                {loading ? 'Saving...' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminCategoryAdd;

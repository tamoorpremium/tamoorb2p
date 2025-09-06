import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  description?: string;
}

interface AdminCategoryFormProps {
  initialData?: Category;
  onSubmit: (data: Omit<Category, 'id'>) => Promise<void>;
  loading: boolean;
}

const AdminCategoryForm: React.FC<AdminCategoryFormProps> = ({ initialData, onSubmit, loading }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [parentId, setParentId] = useState<number | null>(initialData?.parent_id || null);
  const [description, setDescription] = useState(initialData?.description || '');
  const [categories, setCategories] = useState<Category[]>([]);

  // Load categories to populate parent dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id, description')
        .order('name', { ascending: true });
      if (error) {
        alert('Failed to load categories');
      } else {
        setCategories(data || []);
      }
    };
    fetchCategories();
  }, []);

  // Auto-generate slug from name
  useEffect(() => {
    const generateSlug = (text: string) =>
      text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

    setSlug(generateSlug(name));
  }, [name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      slug,
      parent_id: parentId,
      description,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 p-6 bg-white rounded shadow">
      <div>
        <label className="block font-semibold mb-1" htmlFor="name">Category Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1" htmlFor="slug">Slug (auto-generated)</label>
        <input
          id="slug"
          type="text"
          value={slug}
          readOnly
          disabled
          className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block font-semibold mb-1" htmlFor="parent">Parent Category</label>
        <select
          id="parent"
          value={parentId === null ? '' : parentId}
          onChange={(e) => setParentId(e.target.value === '' ? null : Number(e.target.value))}
          disabled={loading}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="">No Parent (Top Level)</option>
          {categories
            .filter((cat) => cat.id !== initialData?.id) // Prevent selecting itself as parent
            .map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
        </select>
      </div>

      <div>
        <label className="block font-semibold mb-1" htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          className="w-full border border-gray-300 rounded px-3 py-2 resize-y"
          rows={4}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-premium w-full py-3 font-semibold"
      >
        {loading ? 'Saving...' : 'Save Category'}
      </button>
    </form>
  );
};

export default AdminCategoryForm;

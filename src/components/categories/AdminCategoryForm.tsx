import React, { useEffect, useState } from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  description?: string;
}

interface AdminCategoryFormProps {
  initialData?: Category;
  categories: Category[];
  onSubmit: (data: Omit<Category, 'id'>) => Promise<void>;
  loading: boolean;
}

const AdminCategoryForm: React.FC<AdminCategoryFormProps> = ({
  initialData,
  categories,
  onSubmit,
  loading,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [parentId, setParentId] = useState<number | null>(initialData?.parent_id || null);
  const [description, setDescription] = useState(initialData?.description || '');

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
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-full sm:max-w-2xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6 bg-white rounded shadow-sm sm:shadow-md"
    >
      {/* Category Name */}
      <div>
        <label className="block font-semibold mb-1 text-base sm:text-lg" htmlFor="name">
          Category Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block font-semibold mb-1 text-base sm:text-lg" htmlFor="slug">
          Slug (auto-generated)
        </label>
        <input
          id="slug"
          type="text"
          value={slug}
          readOnly
          disabled
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base bg-gray-100 cursor-not-allowed"
        />
      </div>

      {/* Parent Category */}
      <div>
        <label className="block font-semibold mb-1 text-base sm:text-lg" htmlFor="parent">
          Parent Category
        </label>
        <select
          id="parent"
          value={parentId === null ? '' : parentId}
          onChange={(e) => setParentId(e.target.value === '' ? null : Number(e.target.value))}
          disabled={loading}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
        >
          <option value="">No Parent (Top Level)</option>
          {categories
            .filter((cat) => cat.id !== initialData?.id && cat.parent_id === null) // only parent categories
            .map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block font-semibold mb-1 text-base sm:text-lg" htmlFor="description">
          Description (optional)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          className="w-full border border-gray-300 rounded px-3 py-2 resize-y text-sm sm:text-base"
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="btn-premium w-full py-3 sm:py-4 text-sm sm:text-base font-semibold"
      >
        {loading ? 'Saving...' : 'Save Category'}
      </button>
    </form>
  );
};

export default AdminCategoryForm;

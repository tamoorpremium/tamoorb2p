import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

const AdminCategoriesList: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, parent:parent_id(id, name)')
      .order('name', { ascending: true });

    if (error) {
      alert('Failed to load categories');
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Local search filter
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) =>
      [cat.name, cat.slug, cat.parent?.name]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(search.toLowerCase()))
    );
  }, [categories, search]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900 p-6 sm:p-10 font-sans text-gray-100">
        {/* Header + Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-wide drop-shadow-lg text-yellow-400">
            Manage Categories
          </h1>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories..."
                className="pl-10 pr-4 py-2 rounded-full bg-gray-800 text-gray-100 border border-yellow-400/40 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <Link
              to="/admin/categories/new"
              className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-full shadow-lg hover:shadow-yellow-500/75 transition-transform hover:scale-105"
            >
              Add New Category
            </Link>
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <p className="text-yellow-400 font-semibold text-center py-8 text-lg">
            Loading categories...
          </p>
        ) : (
          <>
            {/* ✅ Mobile view (cards) */}
            <div className="block sm:hidden space-y-4">
              {filteredCategories.length === 0 ? (
                <p className="text-yellow-300 text-center py-10 font-semibold text-lg select-none">
                  No categories found.
                </p>
              ) : (
                filteredCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-4 rounded-xl bg-gray-800/60 border border-yellow-400/30 shadow-neumorphic hover:scale-[1.02] transition"
                  >
                    <p className="text-lg font-semibold text-yellow-300">{cat.name}</p>
                    <p className="text-sm text-gray-300 mt-1">Slug: {cat.slug}</p>
                    <p className="text-sm text-gray-300">
                      Parent: {cat.parent?.name || '-'}
                    </p>
                    <Link
                      to={`/admin/categories/${cat.id}`}
                      className="mt-3 inline-block bg-yellow-400 text-gray-900 rounded-full px-4 py-1 font-semibold shadow-md hover:scale-105 transition"
                    >
                      Edit
                    </Link>
                  </div>
                ))
              )}
            </div>

            {/* ✅ Desktop view (table) */}
            <div className="hidden sm:block overflow-hidden rounded-xl backdrop-blur-xl bg-white bg-opacity-[0.05] border border-yellow-400 border-opacity-30 shadow-neumorphic">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 uppercase tracking-widest">
                    <th className="p-5 text-left">Name</th>
                    <th className="p-5 text-left">Slug</th>
                    <th className="p-5 text-left">Parent</th>
                    <th className="p-5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td
                        className="text-yellow-300 text-center py-20 font-semibold text-lg select-none"
                        colSpan={4}
                      >
                        No categories found.
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((cat) => (
                      <tr
                        key={cat.id}
                        className="cursor-default hover:scale-[1.03] hover:bg-yellow-400/20 transition duration-300 ease-in-out"
                      >
                        <td className="border-b border-yellow-400 border-opacity-20 px-6 py-5 font-semibold text-yellow-300 whitespace-nowrap">
                          {cat.name}
                        </td>
                        <td className="border-b border-yellow-400 border-opacity-20 px-6 py-5">
                          {cat.slug}
                        </td>
                        <td className="border-b border-yellow-400 border-opacity-20 px-6 py-5 whitespace-nowrap">
                          {cat.parent?.name || '-'}
                        </td>
                        <td className="border-b border-yellow-400 border-opacity-20 px-6 py-5 text-center">
                          <Link
                            to={`/admin/categories/${cat.id}`}
                            className="bg-yellow-400 text-gray-900 rounded-full px-4 py-2 font-semibold shadow-md hover:shadow-yellow-500/75 transition-transform hover:scale-110"
                            title="Edit category"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <style>{`
        .shadow-neumorphic {
          box-shadow:
            8px 8px 15px #1f2937,
            -8px -8px 15px #323f50;
        }
      `}</style>
    </>
  );
};

export default AdminCategoriesList;

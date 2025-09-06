import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { Link } from 'react-router-dom';

const AdminCategoriesList: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
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

  return (
    <>
      <div className="min-h-screen bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900 p-10 font-sans text-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold tracking-wide drop-shadow-lg text-yellow-400">Manage Categories</h1>
          <Link
            to="/admin/categories/new"
            className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-full shadow-lg hover:shadow-yellow-500/75 transition-transform hover:scale-105"
          >
            Add New Category
          </Link>
        </div>

        {loading ? (
          <p className="text-yellow-400 font-semibold text-center py-8 text-lg">Loading categories...</p>
        ) : (
          <div className="overflow-hidden rounded-xl backdrop-blur-xl bg-white bg-opacity-[0.05] border border-yellow-400 border-opacity-30 shadow-neumorphic">
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
                {categories.length === 0 ? (
                  <tr>
                    <td className="text-yellow-300 text-center py-20 font-semibold text-lg select-none" colSpan={4}>
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr
                      key={cat.id}
                      className="cursor-default hover:scale-[1.03] hover:bg-yellow-400/20 transition duration-300 ease-in-out"
                    >
                      <td className="border-b border-yellow-400 border-opacity-20 px-6 py-5 font-semibold text-yellow-300 whitespace-nowrap">
                        {cat.name}
                      </td>
                      <td className="border-b border-yellow-400 border-opacity-20 px-6 py-5">{cat.slug}</td>
                      <td className="border-b border-yellow-400 border-opacity-20 px-6 py-5 whitespace-nowrap">
                        {cat.parent_id || '-'}
                      </td>
                      <td className="border-b border-yellow-400 border-opacity-20 px-6 py-5 text-center">
                        <Link
                          to={`/admin/categories/${cat.id}`}
                          className="bg-yellow-400 text-gray-900 rounded-full px-4 py-2 font-semibold shadow-md hover:shadow-yellow-500/75 transition-transform hover:scale-110"
                          title="Edit category"
                        >
                          Edit
                        </Link>
                        {/* You can add Delete button here if desired */}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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

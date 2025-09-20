import React, { useEffect, useState } from 'react';
import { Search, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { supabase } from '../../utils/supabaseClient';

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  category_id: number | null;
  measurement_unit: string;
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesMap, setCategoriesMap] = useState<Record<number, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch all categories and create a mapping from id to name
  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name');
    if (error) {
      console.error('Failed to fetch categories:', error);
      setCategoriesMap({});
    } else {
      const map = (data || []).reduce((acc, cat) => {
        acc[cat.id] = cat.name;
        return acc;
      }, {} as Record<number, string>);
      setCategoriesMap(map);
    }
  };

  // Fetch products with optional search term and category filter
  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('id, name, price, measurement_unit, category_id')
        .order('name', { ascending: true });

      if (searchTerm.trim()) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      if (selectedCategoryId && selectedCategoryId !== 0) {
        query = query.eq('category_id', selectedCategoryId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      toast.error('Failed to load products.');
      setProducts([]);
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, selectedCategoryId]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success('Product deleted successfully.');
    } catch {
      toast.error('Failed to delete product.');
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="min-h-screen bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900 p-10 font-sans text-gray-100">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-extrabold tracking-wide drop-shadow-lg text-yellow-400">
            Products
          </h1>
          <button
            onClick={() => navigate('/admin/products/new')}
            className="px-6 py-3 bg-yellow-400 text-gray-900 rounded-full shadow-lg hover:shadow-yellow-500/75 transition-transform hover:scale-105"
          >
            Add New Product
          </button>
        </div>

        {/* Category filter dropdown */}
        <div className="max-w-xs mb-6">
          <label className="block mb-2 text-yellow-300 font-semibold">Filter by Category</label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
            className="w-full rounded-full py-3 pl-4 pr-4 bg-gray-900 bg-opacity-40 text-yellow-300 focus:outline-none focus:ring-4 focus:ring-yellow-400 shadow-inner"
          >
            <option value={0}>All Categories</option>
            {Object.entries(categoriesMap).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Search bar */}
        <div className="max-w-sm mb-8 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Products"
            className="w-full rounded-full py-3 pl-12 pr-4 bg-gray-900 bg-opacity-40 placeholder-yellow-300 text-yellow-300 focus:outline-none focus:ring-4 focus:ring-yellow-400 backdrop-blur-sm shadow-inner"
          />
          <Search className="absolute left-4 top-3.5 text-yellow-300" />
        </div>

        {/* Products Table - Desktop */}
{loading ? (
  <p className="text-center text-yellow-400 font-bold text-xl">Loading...</p>
) : (
  <>
    {/* Desktop Table */}
    <div className="hidden sm:block overflow-x-auto rounded-xl backdrop-blur-xl bg-white bg-opacity-[0.05] border border-yellow-400 border-opacity-30 shadow-neumorphic">
      <table className="min-w-full table-auto">
        <thead>
          <tr className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 uppercase tracking-widest text-base">
            <th className="p-5 text-left">Name</th>
            <th className="p-5 text-left">Category</th>
            <th className="p-5 text-left">Measurement Unit</th>
            <th className="p-5 text-left">Price (₹)</th>
            <th className="p-5 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="text-center py-20 text-yellow-300 font-semibold text-lg select-none"
              >
                No products found.
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr
                key={product.id}
                className="cursor-pointer hover:scale-[1.03] hover:bg-yellow-400/20 transition duration-300 ease-in-out"
              >
                <td
                  onClick={() => navigate(`/admin/products/${product.id}`)}
                  className="border-b border-yellow-400 border-opacity-20 px-6 py-5 font-semibold text-yellow-300"
                >
                  {product.name}
                </td>
                <td
                  onClick={() => navigate(`/admin/products/${product.id}`)}
                  className="border-b border-yellow-400 border-opacity-20 px-6 py-5 capitalize"
                >
                  {product.category_id && categoriesMap[product.category_id]
                    ? categoriesMap[product.category_id]
                    : 'Uncategorized'}
                </td>
                <td
                  onClick={() => navigate(`/admin/products/${product.id}`)}
                  className="border-b border-yellow-400 border-opacity-20 px-6 py-5 capitalize"
                >
                  {product.measurement_unit}
                </td>
                <td
                  onClick={() => navigate(`/admin/products/${product.id}`)}
                  className="border-b border-yellow-400 border-opacity-20 px-6 py-5"
                >
                  ₹{product.price.toFixed(2)}
                </td>
                <td className="border-b border-yellow-400 border-opacity-20 px-6 py-5 text-center">
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/products/${product.id}`);
                      }}
                      className="bg-yellow-400 text-gray-900 rounded-full px-4 py-2 font-semibold shadow-md hover:shadow-yellow-500/75 transition-transform hover:scale-110 flex items-center gap-2"
                      aria-label={`Edit ${product.name}`}
                      title="Edit product"
                    >
                      <Edit size={18} />
                      Edit
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(product.id);
                      }}
                      className="bg-red-600 text-gray-50 rounded-full px-4 py-2 font-semibold shadow-md hover:shadow-red-700/75 transition-transform hover:scale-110 flex items-center gap-2"
                      aria-label={`Delete ${product.name}`}
                      title="Delete product"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* Mobile Card View */}
    <div className="block sm:hidden space-y-4">
      {products.length === 0 ? (
        <p className="text-center py-10 text-yellow-300 font-semibold text-base select-none">
          No products found.
        </p>
      ) : (
        products.map((product) => (
          <div
            key={product.id}
            onClick={() => navigate(`/admin/products/${product.id}`)}
            className="rounded-xl p-4 bg-white/5 border border-yellow-400/30 shadow-neumorphic hover:bg-yellow-400/20 transition duration-300 ease-in-out"
          >
            <h3 className="text-lg font-bold text-yellow-300">{product.name}</h3>
            <p className="text-sm text-gray-300 mt-1">
              <span className="font-semibold">Category:</span>{' '}
              {product.category_id && categoriesMap[product.category_id]
                ? categoriesMap[product.category_id]
                : 'Uncategorized'}
            </p>
            <p className="text-sm text-gray-300 mt-1">
              <span className="font-semibold">Unit:</span> {product.measurement_unit}
            </p>
            <p className="text-sm text-gray-300 mt-1">
              <span className="font-semibold">Price:</span> ₹{product.price.toFixed(2)}
            </p>

            {/* Actions */}
            <div className="flex justify-between mt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/products/${product.id}`);
                }}
                className="bg-yellow-400 text-gray-900 rounded-full px-3 py-2 text-sm font-semibold shadow-md hover:shadow-yellow-500/75 transition-transform hover:scale-105 flex items-center gap-1"
                aria-label={`Edit ${product.name}`}
                title="Edit product"
              >
                <Edit size={16} />
                Edit
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(product.id);
                }}
                className="bg-red-600 text-gray-50 rounded-full px-3 py-2 text-sm font-semibold shadow-md hover:shadow-red-700/75 transition-transform hover:scale-105 flex items-center gap-1"
                aria-label={`Delete ${product.name}`}
                title="Delete product"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))
      )}
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

export default AdminProducts;

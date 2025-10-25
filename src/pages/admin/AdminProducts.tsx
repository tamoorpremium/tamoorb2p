import React, { useEffect, useState, useMemo } from 'react';
import { Search, Trash2, Edit, ToggleLeft, ToggleRight, Plus, Upload, Package, PackageX, PackageCheck, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { supabase } from '../../utils/supabaseClient';

interface Product {
  id: number;
  name: string;
  price: number;
  //category_id: number | null;
  category_ids?: number[];
  measurement_unit: string;
  is_active: boolean;
  is_in_stock: boolean;
  stock_quantity: number;
  image: string | null; // Added for thumbnail
}

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesMap, setCategoriesMap] = useState<Record<number, string>>({});
  const [searchTerm, setSearchTerm] = useState(() => {
    // Read the saved search term, or default to ''
    return sessionStorage.getItem('adminProducts_searchTerm') || '';
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState(() => {
    // Read the saved category ID, or default to 0
    return Number(sessionStorage.getItem('adminProducts_category')) || 0;
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState(() => {
    // Read the saved status filter, or default to 'all'
    return sessionStorage.getItem('adminProducts_status') || 'all';
  });

  // --- All your data-fetching and update logic remains unchanged ---

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('id, name');
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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // 1. Fetch basic product data (without category_id)
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        // Remove category_id from select
        .select('id, name, price, measurement_unit, is_active, is_in_stock, stock_quantity, image')
        .order('name', { ascending: true });

      if (productsError) throw productsError;
      if (!productsData) {
          setProducts([]);
          setLoading(false);
          return;
      }

      // 2. Get IDs of fetched products
      const productIds = productsData.map(p => p.id);

      // 3. Fetch category links for these products
      let categoryLinks: { product_id: number; category_id: number }[] = [];
      if (productIds.length > 0) {
          const { data: linksData, error: linksError } = await supabase
              .from('product_categories')
              .select('product_id, category_id')
              .in('product_id', productIds);

          if (linksError) {
              console.error("Failed to fetch category links:", linksError);
              toast.warn("Could not load category associations for products.");
              // Continue without category info if links fail
          } else {
              categoryLinks = linksData || [];
          }
      }

      // 4. Augment product data with category IDs
      const productsWithCategories = productsData.map(product => {
          const linkedCategoryIds = categoryLinks
              .filter(link => link.product_id === product.id)
              .map(link => link.category_id);
          return {
              ...product,
              category_ids: linkedCategoryIds // Add the category_ids array
          };
      });

      setProducts(productsWithCategories);

    } catch (error) {
      toast.error('Failed to load products.');
      setProducts([]);
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };


  // Save searchTerm when it changes
  useEffect(() => {
    sessionStorage.setItem('adminProducts_searchTerm', searchTerm);
  }, [searchTerm]);

  // Save selectedCategoryId when it changes
  useEffect(() => {
    // We save it as a string, but that's fine.
    sessionStorage.setItem('adminProducts_category', String(selectedCategoryId));
  }, [selectedCategoryId]);

  // Save statusFilter when it changes
  useEffect(() => {
    sessionStorage.setItem('adminProducts_status', statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const updateStatus = async (
    productId: number,
    currentProduct: Product,
    updates: { isActive?: boolean; isInStock?: boolean }
  ) => {
    setProducts(currentProducts =>
      currentProducts.map(p => {
        if (p.id === productId) {
          return { ...p, ...updates };
        }
        return p;
      })
    );

    const updatePayload: { is_active?: boolean; is_in_stock?: boolean; stock_quantity?: number } = {};
    if (updates.isActive !== undefined) {
      updatePayload.is_active = updates.isActive;
    }
    if (updates.isInStock !== undefined) {
      updatePayload.is_in_stock = updates.isInStock;
      if (updates.isInStock === false) {
        updatePayload.stock_quantity = 0;
      } else if (updates.isInStock === true && currentProduct.stock_quantity <= 0) {
        updatePayload.stock_quantity = 1;
      }
    }

    const { error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', productId);

    if (error) {
      toast.error(`Error updating product ID ${productId}.`);
      console.error('Failed to update product:', error);
      fetchProducts();
    } else {
      toast.success('Product status updated!');
      setProducts(currentProducts =>
        currentProducts.map(p => {
          if (p.id === productId) {
            return { ...p, ...updatePayload };
          }
          return p;
        })
      );
    }
  };

  const handleDelete = async (id: number) => {
    // 1. Find the product to get its name for the prompt
    const productToDelete = products.find(p => p.id === id);
    const productName = productToDelete ? productToDelete.name : 'this product';

    // 2. Use window.confirm to show a confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete "${productName}"?\n\nThis action cannot be undone.`
    );

    // 3. If the user clicks "Cancel", stop the function
    if (!confirmed) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== id));
      // 4. Improved success toast
      toast.success(`"${productName}" deleted successfully.`);
    } catch (error) { // It's good practice to log the error
      console.error('Failed to delete product:', error);
      // 5. Improved error toast
      toast.error(`Failed to delete "${productName}".`);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const searchMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());

      // --- UPDATED CATEGORY MATCH LOGIC ---
      // Check if the product's category_ids array includes the selectedCategoryId
      const categoryMatch = !selectedCategoryId || (product.category_ids && product.category_ids.includes(selectedCategoryId));
      // --- END UPDATE ---

      let statusMatch = true;
      if (statusFilter === 'active') {
        statusMatch = product.is_active && product.is_in_stock;
      } else if (statusFilter === 'inactive') {
        statusMatch = !product.is_active;
      } else if (statusFilter === 'outOfStock') {
        statusMatch = product.is_active && !product.is_in_stock;
      }
      return searchMatch && categoryMatch && statusMatch;
    });
  }, [products, searchTerm, selectedCategoryId, statusFilter]);
  
  // --- UI/JSX Section Completely Redesigned ---

  const StatusFilterButton = ({ value, label, count, icon: Icon }: { value: string, label: string, count: number, icon: React.ElementType }) => (
    <button
      onClick={() => setStatusFilter(value)}
      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 border-2 ${statusFilter === value ? 'bg-yellow-400 text-gray-900 border-yellow-400' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 border-gray-700'}`}
    >
      <Icon size={16} />
      <span>{label}</span>
      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusFilter === value ? 'bg-gray-800 text-yellow-300' : 'bg-gray-600 text-gray-200'}`}>{count}</span>
    </button>
  );

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 sm:p-6 lg:p-8 font-sans text-gray-100">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-yellow-400/20">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide text-yellow-400 mb-4 sm:mb-0">
            Manage Products
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/products/new')}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg shadow-lg hover:shadow-yellow-500/50 transition-all hover:scale-105"
            >
              <Plus size={18} /> <span className="font-semibold">Add New</span>
            </button>
            <button
              onClick={() => navigate('/admin/excel-import')}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg hover:shadow-green-500/50 transition-all hover:scale-105"
            >
              <Upload size={18} /> <span className="font-semibold">Bulk Import</span>
            </button>
          </div>
        </header>

        {/* Control Panel */}
        <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 mb-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by product name..."
                        className="w-full rounded-lg py-2 pl-10 pr-4 bg-gray-900/70 placeholder-gray-400 text-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                </div>
                <div>
                    <select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                        className="w-full rounded-lg py-2 pl-4 pr-10 bg-gray-900/70 text-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                        <option value={0}>All Categories</option>
                        {Object.entries(categoriesMap).map(([id, name]) => (
                            <option key={id} value={id}>{name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusFilterButton value="all" label="All Products" count={products.length} icon={Package} />
              <StatusFilterButton value="active" label="Active" count={products.filter(p => p.is_active && p.is_in_stock).length} icon={PackageCheck} />
              <StatusFilterButton value="outOfStock" label="Out of Stock" count={products.filter(p => p.is_active && !p.is_in_stock).length} icon={PackageX} />
              <StatusFilterButton value="inactive" label="Delisted" count={products.filter(p => !p.is_active).length} icon={EyeOff} />
            </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          </div>
        ) : (
          <>
            {/* Desktop Table - Redesigned */}
            <div className="hidden lg:block overflow-x-auto rounded-xl backdrop-blur-sm bg-black/20 border border-yellow-400/20 shadow-lg">
              <table className="min-w-full table-auto">
                <thead className="bg-yellow-400/10">
                  <tr className="text-yellow-300 uppercase tracking-wider text-sm">
                    <th className="p-4 text-left w-1/2">Product</th>
                    <th className="p-4 text-right">Price</th>
                    <th className="p-4 text-center">Stock</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-yellow-400/10">
                  {filteredProducts.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-16 text-gray-400">No products match filters.</td></tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-yellow-400/5 transition-colors">
                        <td className="p-3">
                           <div className="flex items-center gap-4">
                               <img 
                                   src={product.image || 'https://placehold.co/64x64/2d3748/FBBF24?text=Img'} 
                                   alt={product.name}
                                   className="w-16 h-16 object-cover rounded-lg"
                               />
                               <div>
                                   <p className="font-bold text-base text-gray-100">{product.name}</p>
                                   {/* Display the name of the first category, if available */}
                                    <p className="text-sm text-gray-400">
                                      {(product.category_ids && product.category_ids.length > 0 && categoriesMap[product.category_ids[0]])
                                        ? categoriesMap[product.category_ids[0]]
                                        : 'N/A'}
                                      {/* Optionally indicate if there are more categories */}
                                      {(product.category_ids && product.category_ids.length > 1) ? ' (+ more)' : ''}
                                    </p>
                               </div>
                           </div>
                        </td>
                        <td className="p-3 text-right font-mono text-gray-300">₹{product.price.toFixed(2)}</td>
                        <td className="p-3 text-center font-mono font-bold text-lg">{product.stock_quantity}</td>
                        <td className="p-3 text-center">
                            <div className="flex justify-center items-center gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Listed</label>
                                    <button onClick={() => updateStatus(product.id, product, { isActive: !product.is_active })}>
                                        {product.is_active ? <ToggleRight size={28} className="text-green-400" /> : <ToggleLeft size={28} className="text-gray-500" />}
                                    </button>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">In Stock</label>
                                    <button onClick={() => updateStatus(product.id, product, { isInStock: !product.is_in_stock })} disabled={!product.is_active} className="disabled:opacity-30">
                                        {product.is_in_stock ? <ToggleRight size={28} className="text-green-400" /> : <ToggleLeft size={28} className="text-red-500" />}
                                    </button>
                                </div>
                            </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => navigate(`/admin/products/${product.id}`)} className="p-2 bg-yellow-400/80 text-gray-900 rounded-full hover:bg-yellow-400 hover:scale-110 transition-all" title="Edit">
                               <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-600/80 text-white rounded-full hover:bg-red-600 hover:scale-110 transition-all" title="Delete">
                               <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile & Tablet Card View - Redesigned */}
            <div className="block lg:hidden space-y-4">
              {filteredProducts.length === 0 ? (
                <p className="text-center py-16 text-gray-400">No products match filters.</p>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product.id} className="rounded-xl p-4 bg-black/20 border border-yellow-400/20 shadow-lg">
                    <div className="flex gap-4">
                        <img 
                           src={product.image || 'https://placehold.co/80x80/2d3748/FBBF24?text=Img'}
                           alt={product.name}
                           className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-yellow-300">{product.name}</h3>
                            {/* Display the name of the first category, if available */}
                            <p className="text-sm text-gray-400">
                              {(product.category_ids && product.category_ids.length > 0 && categoriesMap[product.category_ids[0]])
                                ? categoriesMap[product.category_ids[0]]
                                : 'N/A'}
                              {/* Optionally indicate if there are more categories */}
                              {(product.category_ids && product.category_ids.length > 1) ? ' (+ more)' : ''}
                            </p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <p className="font-mono text-lg font-bold text-white">₹{product.price.toFixed(2)}</p>
                                <p className="font-mono text-sm text-gray-400">Stock: {product.stock_quantity}</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center border-t border-yellow-400/20 pt-3">
                        <div className="flex gap-4">
                            <div>
                                <label className="text-xs text-gray-400 block">Listed</label>
                                <button onClick={() => updateStatus(product.id, product, { isActive: !product.is_active })}>
                                  {product.is_active ? <ToggleRight size={28} className="text-green-400" /> : <ToggleLeft size={28} className="text-gray-500" />}
                                </button>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block">In Stock</label>
                                <button onClick={() => updateStatus(product.id, product, { isInStock: !product.is_in_stock })} disabled={!product.is_active} className="disabled:opacity-30">
                                  {product.is_in_stock ? <ToggleRight size={28} className="text-green-400" /> : <ToggleLeft size={28} className="text-red-500" />}
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => navigate(`/admin/products/${product.id}`)} className="p-2 bg-yellow-400 text-gray-900 rounded-full" title="Edit">
                               <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-600 text-white rounded-full" title="Delete">
                               <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AdminProducts;


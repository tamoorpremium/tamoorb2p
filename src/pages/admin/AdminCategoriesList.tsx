import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Folder, CornerDownRight, Edit, Hash } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

// Interface for a category, now including children
interface Category {
  id: number;
  name: string;
  slug: string;
  parent: { id: number; name: string } | null;
  children: Category[];
}

const AdminCategoriesList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // --- Using YOUR ORIGINAL, WORKING fetchCategories logic ---
  useEffect(() => {
    const fetchAndBuildTree = async () => {
      setLoading(true);
      try {
        const { data: flatCategories, error } = await supabase
          .from('categories')
          .select('id, name, slug, parent:parent_id(id, name)')
          .order('name', { ascending: true });

        if (error) {
          throw error;
        }

        // --- UI ENHANCEMENT: Build the tree structure on the client-side ---
        const categoryMap = new Map<number, Category>();
        const categoryTree: Category[] = [];

        (flatCategories || []).forEach((cat: any) => {
          // Supabase v2 can return relation as an array. We handle it safely.
           const parentObject = Array.isArray(cat.parent) && cat.parent.length > 0 ? cat.parent[0] : cat.parent;
          
          categoryMap.set(cat.id, {
            ...cat,
            parent: parentObject,
            children: [],
          });
        });

        categoryMap.forEach(cat => {
          if (cat.parent?.id && categoryMap.has(cat.parent.id)) {
            categoryMap.get(cat.parent.id)!.children.push(cat);
          } else {
            categoryTree.push(cat);
          }
        });

        setCategories(categoryTree);

      } catch (error: any) {
        console.error("Failed to load categories:", error);
        // FIX: Replaced alert with toast
        toast.error(`Failed to load categories: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAndBuildTree();
  }, []);

  // Recursive search to filter the tree structure
  const filteredCategories = useMemo(() => {
    if (!search) return categories;

    const filterTree = (nodes: Category[]): Category[] => {
      return nodes.reduce((acc: Category[], node) => {
        const children = filterTree(node.children);
        const hasMatchingChild = children.length > 0;
        const selfMatches = node.name.toLowerCase().includes(search.toLowerCase()) || node.slug.toLowerCase().includes(search.toLowerCase());

        if (selfMatches || hasMatchingChild) {
          acc.push({ ...node, children });
        }
        return acc;
      }, []);
    };
    return filterTree(categories);
  }, [categories, search]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 sm:p-6 lg:p-8 font-sans text-gray-100">
        
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-yellow-400/20">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide text-yellow-400 mb-4 sm:mb-0">
            Manage Categories
          </h1>
          <Link
            to="/admin/categories/new"
            className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg shadow-lg hover:shadow-yellow-500/50 transition-all hover:scale-105"
          >
            <Plus size={18} /> <span className="font-semibold">Add New Category</span>
          </Link>
        </header>

        <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 mb-6 shadow-lg max-w-md">
            <div className="relative">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or slug..."
                    className="w-full rounded-lg py-2 pl-10 pr-4 bg-gray-900/70 placeholder-gray-400 text-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
        </div>

        {loading ? (
            <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div></div>
        ) : (
            <div className="space-y-3">
                {filteredCategories.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 bg-black/20 rounded-lg">No categories found or match your search.</div>
                ) : (
                    filteredCategories.map(parentCat => (
                        <div key={parentCat.id} className="p-4 rounded-xl bg-black/20 border border-yellow-400/20 shadow-lg">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                <div className="flex-1 flex items-center gap-3">
                                    <Folder size={20} className="text-yellow-400" />
                                    <span className="font-bold text-lg text-gray-100">{parentCat.name}</span>
                                </div>
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                  <div className="flex-1 flex items-center gap-2 text-sm text-gray-400">
                                    <Hash size={14}/>
                                    <span>{parentCat.slug}</span>
                                  </div>
                                  <button
                                      onClick={() => navigate(`/admin/categories/${parentCat.id}`)}
                                      className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400/80 text-gray-900 rounded-full hover:bg-yellow-400 hover:scale-105 transition-all text-sm font-semibold"
                                  >
                                      <Edit size={14} /> Edit
                                  </button>
                                </div>
                            </div>
                            
                            {parentCat.children.length > 0 && (
                                <div className="mt-3 ml-4 sm:ml-8 pl-4 border-l-2 border-yellow-400/20 space-y-2">
                                    {parentCat.children.map(childCat => (
                                        <div key={childCat.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                            <div className="flex-1 flex items-center gap-3">
                                                <CornerDownRight size={20} className="text-gray-500"/>
                                                <span className="font-semibold text-gray-200">{childCat.name}</span>
                                            </div>
                                             <div className="flex items-center gap-4 w-full sm:w-auto">
                                                <div className="flex-1 flex items-center gap-2 text-sm text-gray-400">
                                                    <Hash size={14}/>
                                                    <span>{childCat.slug}</span>
                                                </div>
                                                <button
                                                    onClick={() => navigate(`/admin/categories/${childCat.id}`)}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-600/50 text-gray-200 rounded-full hover:bg-gray-600 hover:scale-105 transition-all text-sm font-semibold"
                                                >
                                                    <Edit size={14} /> Edit
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        )}
      </div>
    </>
  );
};

export default AdminCategoriesList;


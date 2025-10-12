// src/components/SearchBar.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Package, Tag } from 'lucide-react';
import { supabase } from '../utils/supabaseClient'; // Adjust the import path as needed

// Define a unified type for our search results
type SearchResult = {
  id: number;
  name: string;
  type: 'product' | 'category';
};

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  // --- Debounced Search Logic ---
  useEffect(() => {
    // If the query is empty, clear results and do nothing
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const searchProductsAndCategories = async () => {
      setIsLoading(true);

      // 1. Fetch products that match the query
      const fetchProducts = supabase
        .from('products')
        .select('id, name')
        .ilike('name', `%${query}%`) // 'ilike' is case-insensitive
        .limit(5);

      // 2. Fetch categories that match the query
      const fetchCategories = supabase
        .from('categories')
        .select('id, name')
        .ilike('name', `%${query}%`)
        .limit(3);

      // 3. Run both queries at the same time for performance
      const [productResponse, categoryResponse] = await Promise.all([
        fetchProducts,
        fetchCategories,
      ]);

      // 4. Combine and format the results
      const products = productResponse.data?.map(p => ({ ...p, type: 'product' as const })) || [];
      const categories = categoryResponse.data?.map(c => ({ ...c, type: 'category' as const })) || [];
      
      setResults([...products, ...categories]);
      setIsLoading(false);
    };

    // This is the debounce timer. It waits 500ms after the user stops typing.
    const timerId = setTimeout(() => {
      searchProductsAndCategories();
    }, 300);

    // Cleanup function: If the user types again, clear the previous timer.
    return () => clearTimeout(timerId);
  }, [query]);

  // --- Navigation Handler ---
  const handleSelect = (item: SearchResult) => {
    setQuery(''); // Clear the search bar
    setResults([]); // Clear results
    setIsFocused(false); // Hide dropdown

    if (item.type === 'category') {
      // Navigate to products page filtered by category ID
      navigate(`/products?categoryId=${item.id}`);
    } else {
      // Navigate to products page filtered by a search query for that product name
      navigate(`/products?search=${encodeURIComponent(item.name)}`);
    }
  };

  // --- Click Outside Handler ---
  // This ensures the dropdown closes if you click anywhere else on the page.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="flex items-center glass rounded-full px-4 py-2 w-full shadow-md focus-within:ring-2 focus-within:ring-luxury-gold transition-all duration-300">
        <Search className="w-5 h-5 text-neutral-500 mr-3 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search for products & categories..."
          className="bg-transparent flex-1 outline-none text-base text-neutral-700 placeholder-neutral-400 min-w-0"
        />
        {isLoading && <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" />}
      </div>

      {isFocused && (query.length > 0 || isLoading) && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl overflow-hidden z-10 animate-fade-in">
          {isLoading && results.length === 0 ? (
            <div className="p-4 text-center text-neutral-500">Searching...</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((item) => (
                <li
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item)}
                  className="flex items-center px-4 py-3 cursor-pointer hover:bg-luxury-gold/10 transition-colors duration-200"
                >
                  {item.type === 'product' ? (
                     <Package className="w-4 h-4 mr-3 text-neutral-500" />
                  ) : (
                     <Tag className="w-4 h-4 mr-3 text-neutral-500" />
                  )}
                  <span className="text-neutral-700">{item.name}</span>
                  <span className="ml-auto text-xs text-neutral-400 capitalize">{item.type}</span>
                </li>
              ))}
            </ul>
          ) : (
            !isLoading && <div className="p-4 text-center text-neutral-500">No results found.</div>
          )}
        </div>
      )}
    </div>
  );
};
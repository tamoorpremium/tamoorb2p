import React, { useState, useEffect, useMemo , forwardRef} from 'react';
import { supabase } from '../../utils/supabaseClient';
import { X } from 'lucide-react'; // Import the X icon

// Interface for Category (only need id and name for display/selection)
interface Category {
  id: number;
  name: string;
}

interface ProductFormProps {
  initialData: any; // Contains product data AND category_ids array
  onSubmit: (formData: any) => Promise<void>;
  loading: boolean;
  productImageUrl?: string | null;
}

// Badge options (unchanged)
const badgeOptions = [
  { label: 'Popular', colorClass: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
  { label: 'Fresh', colorClass: 'bg-gradient-to-r from-orange-500 to-amber-500' },
  { label: 'Premium', colorClass: 'bg-gradient-to-r from-luxury-gold to-luxury-gold-light' },
  { label: 'Limited', colorClass: 'bg-gradient-to-r from-red-500 to-rose-500' },
  { label: 'Organic', colorClass: 'bg-gradient-to-r from-luxury-sage to-luxury-sage-dark' },
  { label: 'Best Seller', colorClass: 'bg-gradient-to-r from-green-500 to-emerald-500' },
];

const ProductForm = forwardRef<HTMLFormElement, ProductFormProps>(
  ({ initialData, onSubmit, loading }, ref) => { // 'ref' is now the second argument
  // --- 1. STATE CHANGES ---
  const [formData, setFormData] = useState({
    name: '',
    price: '' as string | number,
    // category_id REMOVED
    measurement_unit: 'kilograms',
    stock_quantity: '' as string | number,
    stock_unit: 'kilograms',
    image: '' as string | null,
    description: '',
    badge: '',
    badge_color: '',
    original_price: '' as string | number | null,
    rating: '' as string | number | null,
    reviews: '' as string | number | null,
  });

  // State for all categories fetched from DB (flat list is fine for dropdown)
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  // State for the IDs of the currently selected categories for this product
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  // State to control the value of the category *adder* dropdown
  const [categoryToAdd, setCategoryToAdd] = useState<string>('');
  // --- END STATE CHANGES ---

  // --- 2. FETCH ALL CATEGORIES ---
  useEffect(() => {
    const fetchCategories = async () => {
      // Fetch all categories, including potentially nested ones if needed later, but sort flatly
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name'); // Order flat list alphabetically

      if (error) {
        console.error("Failed to fetch categories:", error);
        setAllCategories([]);
      } else {
        setAllCategories(data || []);
      }
    };
    fetchCategories();
  }, []);
  // --- END FETCH ALL CATEGORIES ---

  // --- 3. INITIALIZE STATE FROM PROPS ---
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        name: initialData.name || '',
        price: initialData.price ?? '',
        measurement_unit: initialData.measurement_unit || 'kilograms',
        stock_quantity: initialData.stock_quantity ?? '',
        stock_unit: initialData.stock_unit || 'kilograms',
        image: initialData.image || null, // Ensure null if empty
        description: initialData.description || '',
        badge: initialData.badge || '',
        badge_color: initialData.badge_color || '',
        original_price: initialData.original_price ?? '',
        rating: initialData.rating ?? '',
        reviews: initialData.reviews ?? '',
      });
      // Set the selected categories based on the array passed in
      setSelectedCategoryIds(initialData.category_ids || []);
    } else {
       // Reset categories if creating new or initialData is empty/null
       setSelectedCategoryIds([]);
       // Reset form data for a new entry
       setFormData({
         name: '', price: '', measurement_unit: 'kilograms', stock_quantity: '',
         stock_unit: 'kilograms', image: null, description: '', badge: '',
         badge_color: '', original_price: null, rating: null, reviews: null
       });
    }
    // Reset the adder dropdown when initial data changes
    setCategoryToAdd('');
  }, [initialData]);
  // --- END INITIALIZE STATE ---

  // Badge color effect (unchanged)
  useEffect(() => {
    const badgeObj = badgeOptions.find(b => b.label === formData.badge);
    setFormData(prev => ({ ...prev, badge_color: badgeObj ? badgeObj.colorClass : (formData.badge ? prev.badge_color : '') }));
  }, [formData.badge]);

  // handleImageChange (unchanged)
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    try {
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
      if (uploadError) { alert('Upload failed: ' + uploadError.message); return; }
      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
      if (data?.publicUrl) setFormData(prev => ({ ...prev, image: data.publicUrl }));
      else { alert('Failed to get public URL after upload.'); }
    } catch (err) {
      alert('Image upload error: ' + (err as Error).message);
    }
  };

  // --- 4. UPDATE handleChange (Remove category_id) ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData: any = { ...prev, [name]: value };
      if (name === 'measurement_unit' && prev.stock_unit === prev.measurement_unit) {
          newData.stock_unit = value;
      }
      // Use null for empty number fields
      if (['price', 'stock_quantity', 'original_price', 'rating', 'reviews'].includes(name)) {
        newData[name] = value === '' ? null : Number(value);
      } else if (name === 'badge' && value === 'custom') {
          newData[name] = ''; // Clear if custom is selected initially
      }
      return newData;
    });
  };
  // --- END UPDATE handleChange ---

  // --- 5. ADD/REMOVE CATEGORY HANDLERS ---
  const handleAddCategory = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryIdToAdd = Number(event.target.value);
    if (categoryIdToAdd && !selectedCategoryIds.includes(categoryIdToAdd)) {
        setSelectedCategoryIds(prev => [...prev, categoryIdToAdd]);
    }
    // Reset dropdown after selection
    setCategoryToAdd('');
  };

  const handleRemoveCategory = (categoryIdToRemove: number) => {
    setSelectedCategoryIds(prev => prev.filter(id => id !== categoryIdToRemove));
  };
  // --- END ADD/REMOVE HANDLERS ---

  // --- 6. UPDATE handleSubmit ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Optional: Add validation for at least one category selected
    if (selectedCategoryIds.length === 0) {
       alert('Please select at least one category.');
       return;
    }

    // Ensure numeric fields are numbers or null
    const dataToSubmit = {
        ...formData,
        price: formData.price === '' ? null : Number(formData.price),
        stock_quantity: formData.stock_quantity === '' ? null : Number(formData.stock_quantity),
        original_price: formData.original_price === '' ? null : Number(formData.original_price),
        rating: formData.rating === '' ? null : Number(formData.rating),
        reviews: formData.reviews === '' ? null : Number(formData.reviews),
        category_ids: selectedCategoryIds // Add selected IDs
    };
    // Remove category_id if it somehow lingers
    delete (dataToSubmit as any).category_id;

    onSubmit(dataToSubmit);
  };
  // --- END UPDATE handleSubmit ---

  // Helper to get category name from ID
  const getCategoryName = (id: number): string => {
    return allCategories.find(cat => cat.id === id)?.name || 'Unknown';
  };

  return (
    <form ref={ref} onSubmit={handleSubmit} className="space-y-6 p-6 bg-white/10 backdrop-blur-lg rounded-3xl shadow-xl max-w-4xl mx-auto">

      <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Details</h2>

      {/* Name (Unchanged) */}
      <div className="flex flex-col">
        <label className="font-semibold text-gray-900 mb-1">Product Name *</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required disabled={loading} className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-black placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-luxury-gold" placeholder="Enter product name"/>
      </div>

      {/* --- 7. NEW CATEGORY UI (Dropdown + Box) --- */}
      <div className="flex flex-col space-y-3">
        {/* Dropdown to ADD Categories */}
        <div>
           <label className="font-semibold text-gray-900 mb-1 block">Add Category</label>
           <select
             value={categoryToAdd} // Controlled by categoryToAdd state
             onChange={handleAddCategory} // Use specific handler
             disabled={loading || allCategories.length === 0}
             className="w-full px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-black focus:outline-none focus:ring-2 focus:ring-luxury-gold"
           >
             <option value="" disabled>-- Select category to add --</option>
             {allCategories
               // Filter out categories already selected
               .filter(cat => !selectedCategoryIds.includes(cat.id))
               .map(c => <option key={c.id} value={c.id}>{c.name}</option>)
             }
           </select>
        </div>

        {/* Box displaying Selected Categories */}
        <div>
            <label className="font-semibold text-gray-900 mb-1 block">Selected Categories *</label>
            <div className="min-h-[6rem] p-3 rounded-xl bg-white/10 border border-gray-400/30 flex flex-wrap gap-2 items-start">
                {selectedCategoryIds.length === 0 ? (
                    <p className="text-gray-600 text-sm italic w-full text-center py-4">No categories selected.</p>
                ) : (
                    selectedCategoryIds.map(id => (
                        <div key={id} className="flex items-center gap-1 bg-luxury-gold/30 text-luxury-gold-dark font-semibold px-3 py-1 rounded-full text-sm">
                            <span>{getCategoryName(id)}</span>
                            <button
                                type="button" // Prevent form submission
                                onClick={() => handleRemoveCategory(id)}
                                disabled={loading}
                                className="ml-1 p-0.5 rounded-full hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                                aria-label={`Remove ${getCategoryName(id)}`}
                            >
                                <X size={14} strokeWidth={3}/>
                            </button>
                        </div>
                    ))
                )}
            </div>
             <p className="text-xs text-gray-600 mt-1">Select one or more categories using the dropdown above.</p>
        </div>
      </div>
      {/* --- END NEW CATEGORY UI --- */}

      {/* Price & Original Price (Required added to Price) */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex flex-col">
          <label className="font-semibold text-gray-900 mb-1">Our Price (₹) *</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="e.g., 150.00" step="0.01" className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-black placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-luxury-gold" disabled={loading} required/>
        </div>
        <div className="flex-1 flex flex-col">
          <label className="font-semibold text-gray-900 mb-1">Original Price (₹)</label>
          <input type="number" name="original_price" value={formData.original_price ?? ''} onChange={handleChange} placeholder="Optional (e.g., 200.00)" step="0.01" className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-black placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-luxury-gold" disabled={loading}/>
        </div>
      </div>

      {/* Measurement & Stock Unit (Required added) */}
       <div className="flex flex-col md:flex-row gap-4">
         <div className="flex-1 flex flex-col">
           <label className="font-semibold text-gray-900 mb-1">Measurement Unit *</label>
           <select name="measurement_unit" value={formData.measurement_unit} onChange={handleChange} className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-black focus:outline-none focus:ring-2 focus:ring-luxury-gold" disabled={loading} required>
             <option value="kilograms">Kilograms</option>
             <option value="grams">Grams</option>
             <option value="pieces">Pieces</option>
             <option value="liters">Liters</option>
           </select>
         </div>
         <div className="flex-1 flex flex-col">
           <label className="font-semibold text-gray-900 mb-1">Stock Unit *</label>
           <select name="stock_unit" value={formData.stock_unit} onChange={handleChange} className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-black focus:outline-none focus:ring-2 focus:ring-luxury-gold" disabled={loading} required>
             <option value="kilograms">Kilograms</option>
             <option value="grams">Grams</option>
             <option value="pieces">Pieces</option>
             <option value="liters">Liters</option>
           </select>
         </div>
       </div>

      {/* Stock Quantity (Required added) */}
      <div className="flex flex-col">
        <label className="font-semibold text-gray-900 mb-1">Stock Quantity *</label>
        <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} placeholder="e.g., 50" step="1" min="0" className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-black placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-luxury-gold" disabled={loading} required/>
      </div>

      {/* Description (Unchanged) */}
      <div className="flex flex-col">
        <label className="font-semibold text-gray-900 mb-1">Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Enter product description..." rows={4} className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-black placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-luxury-gold" disabled={loading}></textarea>
      </div>

      {/* Badge (Updated Custom Logic) */}
      <div className="flex flex-col">
         <label className="font-semibold text-gray-900 mb-1">Badge (Optional)</label>
         <select
           name="badge"
           // Determine select value: if current formData.badge matches an option, use it. Otherwise, if formData.badge has *any* value, assume it's custom. If empty, use empty string.
           value={badgeOptions.find(b => b.label === formData.badge) ? formData.badge : (formData.badge ? 'custom' : '')}
           onChange={handleChange}
           className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-black focus:outline-none focus:ring-2 focus:ring-luxury-gold"
           disabled={loading}
         >
           <option value="">-- No Badge --</option>
           {badgeOptions.map(b => ( <option key={b.label} value={b.label}>{b.label}</option> ))}
           <option value="custom">Custom...</option>
         </select>
         {/* Show input if custom is selected OR if current badge isn't in predefined options */}
         {(!badgeOptions.find(b => b.label === formData.badge) && formData.badge) && ( // Show if badge has a value NOT in options
             <input
                type="text"
                name="badge" // Use the same name to overwrite
                value={formData.badge} // Display the current custom value
                onChange={handleChange}
                placeholder="Enter custom badge text"
                className="mt-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-black placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                disabled={loading}
             />
         )}
       </div>

      {/* Rating & Reviews (Use ?? '' for potentially null values) */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex flex-col">
          <label className="font-semibold text-gray-900 mb-1">Rating (Optional)</label>
          <input type="number" name="rating" value={formData.rating ?? ''} onChange={handleChange} placeholder="e.g., 4.5" step="0.1" min="0" max="5" className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-black placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-luxury-gold" disabled={loading}/>
        </div>
        <div className="flex-1 flex flex-col">
          <label className="font-semibold text-gray-900 mb-1">Reviews Count (Optional)</label>
          <input type="number" name="reviews" value={formData.reviews ?? ''} onChange={handleChange} placeholder="e.g., 120" step="1" min="0" className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-black placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-luxury-gold" disabled={loading}/>
        </div>
      </div>

      {/* Product Image Upload (Unchanged) */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-gray-900 mb-1">Main Product Image (Thumbnail)</label>
        {formData.image && <img src={formData.image} alt="Product Thumbnail" className="w-32 h-32 object-cover rounded-xl shadow-lg"/>}
        <input type="file" accept="image/*" onChange={handleImageChange} className="text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200 disabled:opacity-50" disabled={loading}/>
        <p className="text-xs text-gray-400">This image is used for product listings. Upload additional gallery images after saving/editing.</p>
      </div>

      {/* Submit Button (Unchanged) */}
      <button type="submit" disabled={loading} className={`w-full py-3 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-light text-gray-900 font-semibold transition-all hover:brightness-110 shadow-lg ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}`}>
        {loading ? 'Saving...' : 'Save Product'}
      </button>

    </form>
  );
});

export default ProductForm;
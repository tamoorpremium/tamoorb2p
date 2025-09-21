import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

interface Category {
  id: number;
  name: string;
}

interface ProductFormProps {
  initialData: any;
  onSubmit: (formData: any) => Promise<void>;
  loading: boolean;
  productImageUrl?: string | null;
}

// Badge options with labels and colors
const badgeOptions = [
  { label: 'Popular', colorClass: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
  { label: 'Fresh', colorClass: 'bg-gradient-to-r from-orange-500 to-amber-500' },
  { label: 'Premium', colorClass: 'bg-gradient-to-r from-luxury-gold to-luxury-gold-light' },
  { label: 'Limited', colorClass: 'bg-gradient-to-r from-red-500 to-rose-500' },
  { label: 'Organic', colorClass: 'bg-gradient-to-r from-luxury-sage to-luxury-sage-dark' },
  { label: 'Best Seller', colorClass: 'bg-gradient-to-r from-green-500 to-emerald-500' },
];

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category_id: '',
    measurement_unit: 'kilograms',
    stock_quantity: '',
    stock_unit: 'kilograms',
    image: '',
    description: '',
    badge: '',
    badge_color: '',
    original_price: '',
    rating: '',
    reviews: '',
  });

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('id, name').order('name');
      if (error) console.error(error);
      else setCategories(data || []);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        price: initialData.price || '',
        category_id: initialData.category_id || '',
        measurement_unit: initialData.measurement_unit || 'kilograms',
        stock_quantity: initialData.stock_quantity || '',
        stock_unit: initialData.stock_unit || 'kilograms',
        image: initialData.image || '',
        description: initialData.description || '',
        badge: initialData.badge || '',
        badge_color: initialData.badge_color || '',
        original_price: initialData.original_price || '',
        rating: initialData.rating || '',
        reviews: initialData.reviews || '',
      });
    }
  }, [initialData]);

  useEffect(() => {
    const badgeObj = badgeOptions.find(b => b.label === formData.badge);
    setFormData(prev => ({ ...prev, badge_color: badgeObj ? badgeObj.colorClass : '' }));
  }, [formData.badge]);

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
    } catch (err) {
      alert('Image upload error: ' + (err as Error).message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData: any = { ...prev, [name]: value };
      if (name === 'measurement_unit' && prev.stock_unit === prev.measurement_unit) newData.stock_unit = value;
      if (['price', 'stock_quantity', 'original_price', 'rating', 'reviews', 'category_id'].includes(name)) {
        newData[name] = value === '' ? '' : Number(value);
      }
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.category_id === '') { alert('Please select a category.'); return; }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white/10 backdrop-blur-lg rounded-3xl shadow-xl max-w-4xl mx-auto">
      
      <h2 className="text-2xl font-bold text-tamoor-charcoal mb-4">Product Details</h2>

      {/* Name */}
      <div className="flex flex-col">
        <label className="font-semibold text-gray-900 mb-1">Product Name</label>
        <input
          type="text" name="name" value={formData.name} onChange={handleChange} required
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-black placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-tamoor-gold"
          placeholder="Enter product name"
        />
      </div>

      {/* Category */}
      <div className="flex flex-col">
        <label className="font-semibold text-gray-900 mb-1">Category</label>
        <select
          name="category_id" value={formData.category_id} onChange={handleChange} required disabled={loading}
          className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-black focus:outline-none focus:ring-2 focus:ring-tamoor-gold"
        >
          <option value="" disabled>-- Select Category --</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Price & Original Price */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex flex-col">
          <label className="font-semibold text-gray-900 mb-1">Our Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Price (₹)"
            className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-black placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-tamoor-gold"
          />
        </div>

        <div className="flex-1 flex flex-col">
          <label className="font-semibold text-gray-900 mb-1">Original Price</label>
          <input
            type="number"
            name="original_price"
            value={formData.original_price}
            onChange={handleChange}
            placeholder="Original Price (₹)"
            className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-black placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-tamoor-gold"
          />
        </div>
      </div>


      {/* Measurement & Stock Unit */}
      {/* Measurement Unit & Stock Unit */}
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 flex flex-col">
        <label className="font-semibold text-gray-900 mb-1">Measurement Unit</label>
        <select
          name="measurement_unit"
          value={formData.measurement_unit}
          onChange={handleChange}
          className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-black focus:outline-none focus:ring-2 focus:ring-tamoor-gold"
        >
          <option value="kilograms">Kilograms</option>
          <option value="grams">Grams</option>
          <option value="pieces">Pieces</option>
          <option value="liters">Liters</option>
        </select>
      </div>

      <div className="flex-1 flex flex-col">
        <label className="font-semibold text-gray-900 mb-1">Stock Unit</label>
        <select
          name="stock_unit"
          value={formData.stock_unit}
          onChange={handleChange}
          className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-black focus:outline-none focus:ring-2 focus:ring-tamoor-gold"
        >
          <option value="kilograms">Kilograms</option>
          <option value="grams">Grams</option>
          <option value="pieces">Pieces</option>
          <option value="liters">Liters</option>
        </select>
      </div>
    </div>


      {/* Stock Quantity */}
      <div className="flex flex-col mb-4">
        <label className="font-semibold text-gray-900 mb-1">Stock Quantity</label>
        <input
          type="number"
          name="stock_quantity"
          value={formData.stock_quantity}
          onChange={handleChange}
          placeholder="Stock Quantity"
          className="w-full px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-black placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-tamoor-gold"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col mb-4">
        <label className="font-semibold text-gray-900 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          rows={4}
          className="w-full px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-black placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-tamoor-gold"
        />
      </div>

      {/* Badge */}
      <div className="flex flex-col mb-4">
        <label className="font-semibold text-gray-900 mb-1">Badge</label>
        <select
          name="badge"
          value={formData.badge}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-black focus:outline-none focus:ring-2 focus:ring-tamoor-gold"
        >
          <option value="">-- Select Badge --</option>
          {badgeOptions.map(b => (
            <option key={b.label} value={b.label}>{b.label}</option>
          ))}
        </select>
      </div>

      {/* Rating & Reviews */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 flex flex-col">
          <label className="font-semibold text-gray-900 mb-1">Rating</label>
          <input
            type="number"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            placeholder="Rating"
            className="w-full px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-black placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-tamoor-gold"
          />
        </div>
        <div className="flex-1 flex flex-col">
          <label className="font-semibold text-gray-900 mb-1">Reviews</label>
          <input
            type="number"
            name="reviews"
            value={formData.reviews}
            onChange={handleChange}
            placeholder="Reviews"
            className="w-full px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-black placeholder-gray-800 focus:outline-none focus:ring-2 focus:ring-tamoor-gold"
          />
        </div>
      </div>

      {/* Product Image */}
      <div className="flex flex-col gap-2 mb-4">
        <label className="font-semibold text-gray-900 mb-1">Product Image</label>
        {formData.image && (
          <img
            src={formData.image}
            alt="Product"
            className="w-32 rounded-xl shadow-lg"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="text-white"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-light text-gray-900 font-semibold hover:from-gold-light hover:to-gold shadow-lg"
      >
        {loading ? 'Saving...' : 'Save Product'}
      </button>
    </form>
  );
};

export default ProductForm;

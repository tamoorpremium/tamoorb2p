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

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, loading, productImageUrl }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    category_id: 0,
    measurement_unit: 'kilograms',
    stock_quantity: 0,
    stock_unit: 'pieces',
    image: '',
    description: '',
    badge: '',
    badge_color: '',
    original_price: 0,
    rating: 0,
    reviews: 0,
  });

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('id, name').order('name');
      if (error) {
        console.error('Failed to load categories:', error);
      } else {
        setCategories(data || []);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        price: initialData.price || 0,
        category_id: initialData.category_id || 0,
        measurement_unit: initialData.measurement_unit || 'kilograms',
        stock_quantity: initialData.stock_quantity || 0,
        stock_unit: initialData.stock_unit || 'pieces',
        image: initialData.image || '',
        description: initialData.description || '',
        badge: initialData.badge || '',
        badge_color: initialData.badge_color || '',
        original_price: initialData.original_price || 0,
        rating: initialData.rating || 0,
        reviews: initialData.reviews || 0,
      });
    }
  }, [initialData]);

  // Update badge_color automatically when badge changes
  useEffect(() => {
    const badgeObj = badgeOptions.find(b => b.label === formData.badge);
    if (badgeObj) {
      setFormData(prev => ({ ...prev, badge_color: badgeObj.colorClass }));
    } else {
      setFormData(prev => ({ ...prev, badge_color: '' }));
    }
  }, [formData.badge]);

  // Handle image file selection and upload to supabase storage
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = fileName;

    try {
      // Upload to "product-images" bucket
      const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
      if (uploadError) {
        alert('Image upload failed: ' + uploadError.message);
        return;
      }

      // Get public URL for the uploaded image
      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      const publicURL = data.publicUrl;

      if (publicURL) {
        setFormData(prev => ({ ...prev, image: publicURL }));
      }
    } catch (error) {
      alert('Image upload error: ' + (error as Error).message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        name === 'price' ||
        name === 'stock_quantity' ||
        name === 'category_id' ||
        name === 'original_price' ||
        name === 'rating' ||
        name === 'reviews'
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.category_id === 0) {
      alert('Please select a category.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Name */}
      <div>
        <label className="font-semibold text-gray-700">Product Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={loading}
          className="w-full rounded border border-gray-300 px-3 py-2 mt-1"
        />
      </div>

      {/* Category Dropdown */}
      <div>
        <label className="font-semibold text-gray-700">Category</label>
        <select
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          required
          disabled={loading}
          className="w-full rounded border border-gray-300 px-3 py-2 mt-1"
        >
          <option value={0} disabled>
            -- Select Category --
          </option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price and Original Price */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="font-semibold text-gray-700">Price (₹)</label>
          <input
            type="number"
            name="price"
            min={0}
            step={0.01}
            value={formData.price}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full rounded border border-gray-300 px-3 py-2 mt-1"
          />
        </div>

        <div className="flex-1">
          <label className="font-semibold text-gray-700">Original Price (₹)</label>
          <input
            type="number"
            name="original_price"
            min={0}
            step={0.01}
            value={formData.original_price}
            onChange={handleChange}
            disabled={loading}
            className="w-full rounded border border-gray-300 px-3 py-2 mt-1"
          />
        </div>
      </div>

      {/* Measurement Unit */}
      <div>
        <label className="font-semibold text-gray-700">Measurement Unit</label>
        <select
          name="measurement_unit"
          value={formData.measurement_unit}
          onChange={handleChange}
          disabled={loading}
          className="w-full rounded border border-gray-300 px-3 py-2 mt-1"
        >
          <option value="kilograms">Kilograms</option>
          <option value="grams">Grams</option>
          <option value="pieces">Pieces</option>
          <option value="liters">Liters</option>
        </select>
      </div>

      {/* Stock Quantity and Unit */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="font-semibold text-gray-700">Stock Quantity</label>
          <input
            type="number"
            name="stock_quantity"
            min={0}
            step={0.01}
            value={formData.stock_quantity}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full rounded border border-gray-300 px-3 py-2 mt-1"
          />
        </div>

        <div className="flex-1">
          <label className="font-semibold text-gray-700">Stock Unit</label>
          <select
            name="stock_unit"
            value={formData.stock_unit}
            onChange={handleChange}
            disabled={loading}
            className="w-full rounded border border-gray-300 px-3 py-2 mt-1"
          >
            <option value="pieces">Pieces</option>
            <option value="kilograms">Kilograms</option>
            <option value="grams">Grams</option>
            <option value="liters">Liters</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="font-semibold text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          disabled={loading}
          className="w-full rounded border border-gray-300 px-3 py-2 mt-1"
          rows={4}
        />
      </div>

      {/* Badge dropdown */}
      <div>
        <label className="font-semibold text-gray-700">Badge</label>
        <select
          name="badge"
          value={formData.badge}
          onChange={handleChange}
          disabled={loading}
          className="w-full rounded border border-gray-300 px-3 py-2 mt-1"
        >
          <option value="">-- Select Badge --</option>
          {badgeOptions.map(({ label }) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Badge Color (readonly) */}
      <div>
        <label className="font-semibold text-gray-700">Badge Color</label>
        <input
          type="text"
          name="badge_color"
          value={formData.badge_color}
          readOnly
          disabled
          className="w-full rounded border border-gray-300 px-3 py-2 mt-1 bg-gray-100 cursor-not-allowed"
        />
      </div>

      {/* Rating and Reviews */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="font-semibold text-gray-700">Rating</label>
          <input
            type="number"
            name="rating"
            min={0}
            max={5}
            step={0.1}
            value={formData.rating}
            onChange={handleChange}
            disabled={loading}
            className="w-full rounded border border-gray-300 px-3 py-2 mt-1"
          />
        </div>

        <div className="flex-1">
          <label className="font-semibold text-gray-700">Reviews</label>
          <input
            type="number"
            name="reviews"
            min={0}
            value={formData.reviews}
            onChange={handleChange}
            disabled={loading}
            className="w-full rounded border border-gray-300 px-3 py-2 mt-1"
          />
        </div>
      </div>

      {/* Product Image */}
      <div>
        <label className="font-semibold text-gray-700 mb-2 block">Product Image</label>
        {formData.image && (
          <img
            src={formData.image}
            alt="Product"
            className="mb-4 max-w-xs rounded shadow"
          />
        )}
        <input
          type="file"
          name="image"
          accept="image/*"
          disabled={loading}
          onChange={handleImageChange}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="btn-premium w-full py-3 font-semibold"
      >
        {loading ? 'Saving...' : 'Save Product'}
      </button>
    </form>
  );
};

export default ProductForm;

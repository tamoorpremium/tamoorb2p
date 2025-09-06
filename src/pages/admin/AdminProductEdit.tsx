import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductForm from '../../components/products/ProductForm';
import { supabase } from '../../utils/supabaseClient';
import { toast, ToastContainer } from 'react-toastify';

const AdminProductEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch existing product if editing
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', parseInt(id))
          .single();
        if (error) {
          toast.error('Failed to load product.');
        } else {
          setInitialData(data);
        }
      } catch {
        toast.error('Unexpected error while loading product.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Submit handler for add/update
  const handleSubmit = async (formData: any) => {
    setLoading(true);
    try {
      if (id) {
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', parseInt(id));
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(formData);
        if (error) throw error;
      }
      toast.success('Product saved successfully!');
      navigate('/admin/products');
    } catch {
      toast.error('Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="min-h-screen bg-dashboard-gradient p-12">
        <h1 className="text-4xl font-display font-bold text-tamoor-charcoal mb-8">
          {id ? 'Edit Product' : 'Add New Product'}
        </h1>

        <ProductForm
          initialData={initialData}
          onSubmit={handleSubmit}
          loading={loading}
          productImageUrl={initialData?.image}
        />
      </div>
    </>
  );
};

export default AdminProductEdit;

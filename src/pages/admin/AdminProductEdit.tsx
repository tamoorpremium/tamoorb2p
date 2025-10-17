import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductForm from "../../components/products/ProductForm";
import { supabase } from "../../utils/supabaseClient";
import { toast, ToastContainer } from "react-toastify";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { ArrowLeft, UploadCloud, Image as ImageIcon, Star, Trash2, GripVertical } from "lucide-react";

interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  is_primary: boolean;
  sort_order?: number;
}

const AdminProductEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // --- All of your existing data-fetching and handler logic is preserved perfectly ---

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        // For a new product, create a basic structure
        setInitialData({});
        return;
      };
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", parseInt(id))
          .single();
        if (error) {
          toast.error("Failed to load product.");
        } else {
          setInitialData(data);
          await fetchProductImages(parseInt(id));
        }
      } catch {
        toast.error("Unexpected error while loading product.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const fetchProductImages = async (productId: number) => {
    const { data, error } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true });
    if (error) {
      console.error(error);
      toast.error("Failed to load product images.");
    } else {
      setProductImages(data || []);
    }
  };

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    try {
      if (id) {
        const { error } = await supabase.from("products").update(formData).eq("id", parseInt(id));
        if (error) throw error;
        toast.success("Product updated successfully!");
        navigate("/admin/products");
      } else {
        // For new products, insert and then redirect to the edit page
        const { data, error } = await supabase.from("products").insert(formData).select().single();
        if (error) throw error;
        toast.success("Product created! You can now add images.");
        navigate(`/admin/products/${data.id}`);
      }
    } catch {
      toast.error("Failed to save product.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleUploadImages = async () => {
    if (!id || !initialData?.name || selectedFiles.length === 0) {
      toast.error("No product or files selected.");
      return;
    }
    setUploading(true);
    const productId = parseInt(id);
    const productName = initialData.name.replace(/\s+/g, "-").toLowerCase();
    const alreadyHasImages = productImages.length > 0;
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileExt = file.name.split(".").pop();
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${productName}/${uniqueName}`;
      const { error: uploadError } = await supabase.storage.from("product-detailed-images").upload(filePath, file);
      if (uploadError) {
        toast.error(`Failed to upload ${file.name}: ${uploadError.message}`);
        continue;
      }
      const { data: publicUrlData } = supabase.storage.from("product-detailed-images").getPublicUrl(filePath);
      const { data: maxSort } = await supabase.from("product_images").select("sort_order").eq("product_id", productId).order("sort_order", { ascending: false }).limit(1).maybeSingle();
      const newSortOrder = (maxSort?.sort_order ?? -1) + 1;
      const isPrimary = !alreadyHasImages && i === 0;
      const { error: dbError } = await supabase.from("product_images").insert({ product_id: productId, image_url: publicUrlData.publicUrl, is_primary: isPrimary, sort_order: newSortOrder });
      if (dbError) {
        toast.error(`Failed to save ${file.name} in database`);
        continue;
      }
      if (isPrimary) {
        const { error: productError } = await supabase.from("products").update({ image: publicUrlData.publicUrl }).eq("id", productId);
        if (productError) {
          toast.error("Failed to set product main image.");
        }
      }
    }
    await fetchProductImages(productId);
    setSelectedFiles([]);
    setUploading(false);
  };
  
  const handleDeleteImage = async (imageId: number) => {
    // Prevent deleting the primary image if it's the last one
    const imageToDelete = productImages.find(img => img.id === imageId);
    if (imageToDelete?.is_primary && productImages.length === 1) {
        toast.warn("Cannot delete the only primary image.");
        return;
    }

    const { error } = await supabase.from("product_images").delete().eq("id", imageId);
    if (error) toast.error("Failed to delete image.");
    else {
      toast.success("Image deleted.");
      // If the deleted image was primary, set a new primary
      if (imageToDelete?.is_primary) {
          const nextImage = productImages.find(img => img.id !== imageId);
          if (nextImage) {
              await handleSetPrimary(nextImage.id, nextImage.image_url);
          } else {
             await supabase.from("products").update({ image: null }).eq("id", id);
          }
      }
      setProductImages((prev) => prev.filter((img) => img.id !== imageId));
    }
  };
  
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(productImages);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setProductImages(reordered);
    const updates = reordered.map((img, index) =>
      supabase.from("product_images").update({ sort_order: index }).eq("id", img.id)
    );
    await Promise.all(updates);
    toast.success("Image order updated!");
  };

  const handleSetPrimary = async (imageId: number, imageUrl: string) => {
    if (!id) return;
    const productId = parseInt(id);
    await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);
    const { error } = await supabase.from("product_images").update({ is_primary: true }).eq("id", imageId);
    if (error) {
      toast.error("Failed to set primary image.");
      return;
    }
    const { error: productError } = await supabase.from("products").update({ image: imageUrl }).eq("id", productId);
    if (productError) toast.error("Failed to update product main image.");
    else toast.success("Primary image updated!");
    await fetchProductImages(productId);
  };

  if (loading && id) {
     return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div></div>;
  }
  
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 sm:p-6 lg:p-8 font-sans text-gray-100">
        
        {/* Header with Back Button */}
        <header className="flex items-center justify-between mb-6 pb-4 border-b border-yellow-400/20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin/products')} 
              className="p-2 bg-gray-700/50 rounded-full hover:bg-yellow-400/20 transition-colors"
            >
              <ArrowLeft size={20} className="text-yellow-300" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-yellow-400">
              {id ? `Edit: ${initialData?.name || 'Product'}` : "Add New Product"}
            </h1>
          </div>
        </header>

        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Product Details Form */}
          <div className="lg:col-span-2">
            <div className="p-6 rounded-xl bg-black/20 border border-yellow-400/20 shadow-lg">
              <h2 className="text-xl font-bold text-yellow-300 mb-4 border-b border-yellow-400/10 pb-2">Product Details</h2>
              <ProductForm
                initialData={initialData}
                onSubmit={handleSubmit}
                loading={loading}
                productImageUrl={initialData?.image}
              />
            </div>
          </div>
          
          {/* Right Column: Image Management */}
          {id && (
            <div className="lg:col-span-1 space-y-8">
              <div className="p-6 rounded-xl bg-black/20 border border-yellow-400/20 shadow-lg">
                <h2 className="text-xl font-bold text-yellow-300 mb-4 border-b border-yellow-400/10 pb-2">Image Uploader</h2>
                
                {/* Custom File Dropzone */}
                <div 
                  className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-yellow-400 hover:bg-gray-800/30 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud size={40} className="mx-auto text-gray-400 mb-2"/>
                  <p className="text-gray-400">Drag & drop files or click to browse</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => setSelectedFiles(e.target.files ? Array.from(e.target.files) : [])}
                  />
                </div>
                
                {/* Pre-upload Previews */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                      <h3 className="text-sm font-semibold text-gray-300 mb-2">Selected files:</h3>
                      <div className="flex flex-wrap gap-2">
                          {selectedFiles.map((file, index) => (
                              <div key={index} className="w-16 h-16 rounded-md overflow-hidden relative">
                                  <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                              </div>
                          ))}
                      </div>
                      <button
                        onClick={handleUploadImages}
                        disabled={uploading}
                        className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-semibold transition-colors ${uploading ? "bg-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                      >
                        {uploading ? "Uploading..." : `Upload ${selectedFiles.length} Image(s)`}
                      </button>
                  </div>
                )}
              </div>

              <div className="p-6 rounded-xl bg-black/20 border border-yellow-400/20 shadow-lg">
                <h2 className="text-xl font-bold text-yellow-300 mb-4 border-b border-yellow-400/10 pb-2">Image Gallery</h2>
                <p className="text-xs text-gray-400 mb-4">Drag and drop to reorder images.</p>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="images" direction="vertical">
                    {(provided) => (
                      <div className="space-y-3" ref={provided.innerRef} {...provided.droppableProps}>
                        {productImages.map((img, index) => (
                          <Draggable key={img.id} draggableId={img.id.toString()} index={index}>
                            {(provided) => (
                              <div 
                                className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50 border border-gray-700 group"
                                ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                              >
                                <GripVertical size={20} className="text-gray-500"/>
                                <div className="relative w-16 h-16 rounded-md overflow-hidden">
                                  <img src={img.image_url} alt="product" className="w-full h-full object-cover" />
                                  {img.is_primary && <div className="absolute inset-0 bg-yellow-400/50 flex items-center justify-center"><Star size={20} className="text-white"/></div>}
                                </div>
                                <div className="flex-1 text-xs text-gray-400 truncate">{img.image_url.split('/').pop()}</div>
                                
                                {/* Hover Actions */}
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!img.is_primary && (
                                        <button onClick={() => handleSetPrimary(img.id, img.image_url)} className="p-2 bg-blue-600/80 rounded-full hover:bg-blue-600" title="Set as primary">
                                            <Star size={14} className="text-white"/>
                                        </button>
                                    )}
                                    <button onClick={() => handleDeleteImage(img.id)} className="p-2 bg-red-600/80 rounded-full hover:bg-red-600" title="Delete image">
                                        <Trash2 size={14} className="text-white"/>
                                    </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                {productImages.length === 0 && <p className="text-center text-gray-500 py-8">No images uploaded.</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminProductEdit;

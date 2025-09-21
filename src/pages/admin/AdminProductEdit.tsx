import React, { useState, useEffect } from "react";
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

  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // ✅ Fetch product info + images
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
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

  // ✅ Fetch product images
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

  // ✅ Handle Save (product info only)
  const handleSubmit = async (formData: any) => {
    setLoading(true);
    try {
      if (id) {
        const { error } = await supabase
          .from("products")
          .update(formData)
          .eq("id", parseInt(id));
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(formData);
        if (error) throw error;
      }
      toast.success("Product saved successfully!");
      navigate("/admin/products");
    } catch {
      toast.error("Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Upload images
  const handleUploadImages = async () => {
    if (!id || !initialData?.name || selectedFiles.length === 0) {
      toast.error("No product or files selected.");
      return;
    }

    const productId = parseInt(id);
    const productName = initialData.name.replace(/\s+/g, "-").toLowerCase();

    for (const file of selectedFiles) {
      const fileExt = file.name.split(".").pop();
      const uniqueName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `${productName}/${uniqueName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-detailed-images")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error(`Failed to upload ${file.name}: ${uploadError.message}`);
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from("product-detailed-images")
        .getPublicUrl(filePath);

      // Check max sort_order
      const { data: maxSort } = await supabase
        .from("product_images")
        .select("sort_order")
        .eq("product_id", productId)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();

      const newSortOrder = (maxSort?.sort_order ?? 0) + 1;

      const { error: dbError } = await supabase.from("product_images").insert({
        product_id: productId,
        image_url: publicUrlData.publicUrl,
        is_primary: productImages.length === 0, // first uploaded image auto primary
        sort_order: newSortOrder,
      });

      if (dbError) {
        console.error("DB error:", dbError);
        toast.error(`Failed to save ${file.name} in database`);
      }
    }

    await fetchProductImages(productId);
    setSelectedFiles([]);
  };

  // ✅ Delete image (DB only)
  const handleDeleteImage = async (imageId: number) => {
    const { error } = await supabase
      .from("product_images")
      .delete()
      .eq("id", imageId);

    if (error) toast.error("Failed to delete image.");
    else {
      toast.success("Image deleted.");
      setProductImages((prev) => prev.filter((img) => img.id !== imageId));
    }
  };

  // ✅ Drag & Drop reorder
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const reordered = Array.from(productImages);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    setProductImages(reordered);

    for (let i = 0; i < reordered.length; i++) {
      await supabase
        .from("product_images")
        .update({ sort_order: i + 1 })
        .eq("id", reordered[i].id);
    }
    toast.success("Image order updated!");
  };

  // ✅ Set primary image
  const handleSetPrimary = async (imageId: number, imageUrl: string) => {
    if (!id) return;
    const productId = parseInt(id);

    // Set all others to false
    await supabase
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", productId);

    // Set selected as primary
    const { error } = await supabase
      .from("product_images")
      .update({ is_primary: true })
      .eq("id", imageId);

    if (error) {
      toast.error("Failed to set primary image.");
      return;
    }

    // Update products.image
    const { error: productError } = await supabase
      .from("products")
      .update({ image: imageUrl })
      .eq("id", productId);

    if (productError) toast.error("Failed to update product main image.");
    else toast.success("Primary image updated!");

    // Refresh
    await fetchProductImages(productId);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="min-h-screen bg-dashboard-gradient p-4 sm:p-6 lg:p-12 flex flex-col w-full max-w-[1440px] mx-auto overflow-x-hidden">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-tamoor-charcoal mb-6 sm:mb-8">
          {id ? "Edit Product" : "Add New Product"}
        </h1>

        {/* Product Form */}
        <div className="w-full max-w-full sm:max-w-3xl lg:max-w-5xl mb-10">
          <ProductForm
            initialData={initialData}
            onSubmit={handleSubmit}
            loading={loading}
            productImageUrl={initialData?.image}
          />
        </div>

        {/* Product Detailed Images */}
        {id && (
          <div className="w-full max-w-full sm:max-w-3xl lg:max-w-5xl">
            <h2 className="text-xl font-semibold mb-4">Product Detailed Images</h2>

            <input
              type="file"
              multiple
              onChange={(e) =>
                setSelectedFiles(e.target.files ? Array.from(e.target.files) : [])
              }
            />
            <button
              onClick={handleUploadImages}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              + Upload Images
            </button>

            <DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId="images" direction="horizontal">
    {(provided) => (
      <div
        className="flex gap-4 mt-6 overflow-x-auto pb-4"
        ref={provided.innerRef}
        {...provided.droppableProps}
      >
        {productImages.map((img, index) => (
          <Draggable
            key={img.id}
            draggableId={img.id.toString()}
            index={index}
          >
            {(provided) => (
              <div
                className="relative border rounded-lg overflow-hidden min-w-[120px]"
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                {/* Primary Badge */}
                {img.is_primary && (
                  <span className="absolute top-1 left-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded z-10">
                    Primary
                  </span>
                )}
                
                <img
                  src={img.image_url}
                  alt="product"
                  className="w-full h-32 object-cover"
                />

                {/* Set as Primary Button */}
                {!img.is_primary && (
                  <button
                    onClick={() => handleSetPrimary(img.id, img.image_url)}
                    className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded z-10"
                  >
                    Set Primary
                  </button>
                )}

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteImage(img.id)}
                  className="absolute top-1 right-1 bg-red-600 text-white px-2 py-1 text-xs rounded z-10"
                >
                  Delete
                </button>
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
</DragDropContext>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminProductEdit;

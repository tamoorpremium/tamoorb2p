import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductForm from "../../components/products/ProductForm"; // Make sure this path is correct
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

// --- NEW: Badge Master List ---
// Consistent source of truth for badge names and colors
const badgeMasterList = [
  { name: 'Popular', color: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
  { name: 'Fresh', color: 'bg-gradient-to-r from-orange-500 to-amber-500' },
  { name: 'Premium', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600' },
  { name: 'Limited', color: 'bg-gradient-to-r from-purple-500 to-fuchsia-500' },
  { name: 'Organic', color: 'bg-gradient-to-r from-lime-500 to-green-500' },
  { name: 'Best Seller', color: 'bg-gradient-to-r from-rose-500 to-red-500' }
];

// Create a map for quick lookups (case-insensitive)
const badgeMap: Record<string, { name: string, color: string }> =
  badgeMasterList.reduce((acc, badge) => {
    acc[badge.name.toLowerCase().trim()] = badge;
    return acc;
  }, {} as Record<string, { name: string, color: string }>);
// ----------------------------

const AdminProductEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // --- All existing useEffects and handlers remain the same ---
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setInitialData({}); // Keep this for new products
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

  // --- MODIFIED handleSubmit ---
  const handleSubmit = async (formData: any) => {
    setLoading(true);

    // --- NEW: Auto-set badge_color based on badge name ---
    const badgeName = formData.badge || "";
    const normalizedBadge = badgeName.toLowerCase().trim();
    const matchedBadge = badgeMap[normalizedBadge];

    if (matchedBadge) {
      // Found a match in our master list
      formData.badge = matchedBadge.name; // Ensure consistent casing
      formData.badge_color = matchedBadge.color;
    } else if (badgeName) {
      // User entered a badge name not in the list, keep it but clear the color
      formData.badge = badgeName.trim(); // Trim whitespace just in case
      formData.badge_color = null;
    } else {
      // Badge field is empty
      formData.badge = null;
      formData.badge_color = null;
    }
    // ----------------------------------------------------

    try {
      if (id) {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update(formData) // formData now includes the correct badge_color
          .eq("id", parseInt(id));
        if (error) throw error;
        toast.success("Product updated successfully!");
        navigate("/admin/products");
      } else {
        // Create new product
        const { data, error } = await supabase
          .from("products")
          .insert(formData) // formData includes the correct badge_color
          .select()
          .single();
        if (error) throw error;
        toast.success("Product created! You can now add images.");
        navigate(`/admin/products/${data.id}`); // Redirect to edit page
      }
    } catch (err: any) { // Added type annotation for err
      console.error("Save error:", err); // Log the actual error
      toast.error(`Failed to save product: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  // --- END OF MODIFIED handleSubmit ---

  // --- handleUploadImages, handleDeleteImage, handleDragEnd, handleSetPrimary remain the same ---
  const handleUploadImages = async () => {
    if (!id || !initialData?.name || selectedFiles.length === 0) {
      toast.error("No product or files selected.");
      return;
    }
    setUploading(true);
    const productId = parseInt(id);
    const productName = initialData.name.replace(/\s+/g, "-").toLowerCase();
    const alreadyHasImages = productImages.length > 0;
    let primaryImageSet = alreadyHasImages && productImages.some(img => img.is_primary);

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
        const publicUrl = publicUrlData.publicUrl;

        // Fetch the current max sort_order correctly
        const { data: maxSortData, error: maxSortError } = await supabase
            .from("product_images")
            .select("sort_order")
            .eq("product_id", productId)
            .order("sort_order", { ascending: false })
            .limit(1)
            .maybeSingle(); // Use maybeSingle to handle 0 images case

        if (maxSortError) {
            console.error("Error fetching max sort order:", maxSortError);
            toast.error(`Error processing ${file.name}: Could not determine sort order.`);
            continue; // Skip this file if we can't get sort order
        }

        const newSortOrder = (maxSortData?.sort_order ?? -1) + 1; // Start from 0 if no images exist

        const isPrimary = !primaryImageSet && i === 0; // Set first uploaded image as primary ONLY if no primary exists yet

        const { error: dbError } = await supabase.from("product_images").insert({
            product_id: productId,
            image_url: publicUrl,
            is_primary: isPrimary,
            sort_order: newSortOrder
        });

        if (dbError) {
            toast.error(`Failed to save ${file.name} reference in database`);
            // Attempt to delete the uploaded file if DB insert fails? Consider this.
            continue;
        }

        // If this image was set as primary, update the product's main image field
        if (isPrimary) {
            const { error: productUpdateError } = await supabase
                .from("products")
                .update({ image: publicUrl })
                .eq("id", productId);

            if (productUpdateError) {
                toast.error("Failed to set product's main image field.");
                // DB entry exists, but product.image field failed - needs manual fix potentially
            }
             primaryImageSet = true; // Mark that a primary image now exists
        }
    }

    await fetchProductImages(productId); // Refresh the image list
    setSelectedFiles([]); // Clear selected files
    setUploading(false);
    toast.success(`${selectedFiles.length} image(s) uploaded successfully!`);
};


  const handleDeleteImage = async (imageId: number) => {
    const imageToDelete = productImages.find(img => img.id === imageId);
    if (!imageToDelete) return; // Should not happen

    // Check if it's the only image OR the only primary image
    const isOnlyImage = productImages.length === 1;
    const isPrimary = imageToDelete.is_primary;

    if (isPrimary && isOnlyImage) {
        toast.warn("Cannot delete the only image. Upload another first, then set it as primary.");
        return;
    }

    // Confirmation dialog
    if (!window.confirm("Are you sure you want to delete this image?")) {
        return;
    }

    // Extract file path from URL (needs adjustment based on your URL structure)
     // Example assumes URL like: .../storage/v1/object/public/product-detailed-images/product-name/image.jpg
     let filePath = '';
     try {
         const urlParts = imageToDelete.image_url.split('/product-detailed-images/');
         if (urlParts.length > 1) {
             filePath = urlParts[1]; // Gets "product-name/image.jpg"
         } else {
             throw new Error("Cannot extract file path from URL.");
         }
     } catch (e) {
         console.error("Error extracting file path:", e);
         toast.error("Could not determine the file path to delete from storage.");
         // Optionally proceed to delete DB record anyway? Or stop? Decided to stop.
         return;
     }


    // 1. Delete from Storage
    const { error: storageError } = await supabase.storage.from("product-detailed-images").remove([filePath]);
    if (storageError) {
        // Log the error but maybe allow DB deletion attempt anyway?
        console.error("Storage deletion error:", storageError);
        toast.warn(`Failed to delete file from storage, but will attempt to remove database record. Path: ${filePath}`);
         // If storage delete fails, maybe don't proceed? Or proceed with caution?
        // Let's proceed for now, but log it.
    }


    // 2. Delete from Database
    const { error: dbError } = await supabase.from("product_images").delete().eq("id", imageId);

    if (dbError) {
        toast.error("Failed to delete image record from database.");
        // If DB delete fails, what state are we in? Storage file might be gone.
        return; // Stop here if DB delete fails
    }

    toast.success("Image deleted successfully.");

    // 3. Handle Primary Image Status
     const remainingImages = productImages.filter((img) => img.id !== imageId);

    if (isPrimary) {
        // If the deleted image was primary, assign a new primary
        if (remainingImages.length > 0) {
            // Find the next image (e.g., the one with the lowest sort order)
            const nextPrimary = remainingImages.sort((a,b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
            await handleSetPrimary(nextPrimary.id, nextPrimary.image_url); // This function already updates product.image
        } else {
            // No images left, clear the product's main image
            await supabase.from("products").update({ image: null }).eq("id", id);
             setInitialData((prev: any) => ({ ...prev, image: null })); // Update local state too
        }
    }

    // Update local state - do this last after all operations succeed
    setProductImages(remainingImages);
};


  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return; // Dropped outside the list

    const reordered = Array.from(productImages);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    // Update local state immediately for smooth UI
    setProductImages(reordered);

    // Create batch updates for Supabase
    const updates = reordered.map((img, index) =>
      supabase
        .from("product_images")
        .update({ sort_order: index })
        .eq("id", img.id)
    );

    try {
        // Execute all updates in parallel
        const results = await Promise.all(updates);

        // Check for errors in results
        const errors = results.filter(res => res.error);
        if (errors.length > 0) {
            console.error("Error updating sort order:", errors);
            toast.error("Some image orders failed to update in the database.");
            // Optionally revert local state or refetch? For now, just notify.
             await fetchProductImages(parseInt(id!)); // Refetch on error
        } else {
            toast.success("Image order updated successfully!");
        }
    } catch (error) {
        console.error("Error during batch update:", error);
        toast.error("An unexpected error occurred while updating image order.");
         await fetchProductImages(parseInt(id!)); // Refetch on error
    }
};

  const handleSetPrimary = async (imageId: number, imageUrl: string) => {
      if (!id) return;
      const productId = parseInt(id);

      setLoading(true); // Indicate activity

      try {
          // Use a transaction to ensure atomicity
          // Note: Supabase JS client doesn't directly support multi-table transactions easily.
          // We'll perform operations sequentially and handle potential inconsistencies.

          // 1. Set all other images for this product to is_primary = false
          const { error: updateOthersError } = await supabase
              .from("product_images")
              .update({ is_primary: false })
              .eq("product_id", productId);
              // Optionally add .neq("id", imageId) if you want to be precise

          if (updateOthersError) {
              throw new Error(`Failed to unset other primary images: ${updateOthersError.message}`);
          }

          // 2. Set the selected image to is_primary = true
          const { error: setPrimaryError } = await supabase
              .from("product_images")
              .update({ is_primary: true })
              .eq("id", imageId);

          if (setPrimaryError) {
              throw new Error(`Failed to set new primary image: ${setPrimaryError.message}`);
          }

          // 3. Update the main image URL on the products table
          const { error: productUpdateError } = await supabase
              .from("products")
              .update({ image: imageUrl })
              .eq("id", productId);

          if (productUpdateError) {
              // Log this, but maybe the primary flag update was more critical?
              console.error("Failed to update product's main image field:", productUpdateError);
              toast.warn("Primary image set, but failed to update product's main image field.");
          }

          toast.success("Primary image updated successfully!");

           // Update local state AFTER successful DB updates
           setProductImages(prevImages =>
            prevImages.map(img => ({
                ...img,
                is_primary: img.id === imageId
            }))
           );
            setInitialData((prev: any) => ({ ...prev, image: imageUrl })); // Update local state too


      } catch (error: any) {
          console.error("Error setting primary image:", error);
          toast.error(`Failed to set primary image: ${error.message || 'Unknown error'}`);
          // Optionally refetch images to ensure consistency after error
          await fetchProductImages(productId);
      } finally {
          setLoading(false); // Stop indicating activity
      }
  };


  if (loading && id && !initialData) { // Show loading only when fetching existing product
      return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div></div>;
  }

  // --- JSX remains the same, no changes needed below this line ---

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
              {/* Render form only when initialData is ready (even if empty for new product) */}
              {initialData !== null && (
                 <ProductForm
                 initialData={initialData}
                 onSubmit={handleSubmit}
                 loading={loading || uploading} // Show loading state if saving form OR uploading images
                 productImageUrl={initialData?.image}
               />
              )}
            </div>
          </div>

          {/* Right Column: Image Management - Only show if editing an existing product */}
          {id && initialData && (
            <div className="lg:col-span-1 space-y-8">
              {/* Image Uploader Section */}
              <div className="p-6 rounded-xl bg-black/20 border border-yellow-400/20 shadow-lg">
                <h2 className="text-xl font-bold text-yellow-300 mb-4 border-b border-yellow-400/10 pb-2">Image Uploader</h2>

                {/* Custom File Dropzone */}
                 <div
                    className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-yellow-400 hover:bg-gray-800/30 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    // Add Drag and Drop handlers here if needed (requires more state/logic)
                >
                    <UploadCloud size={40} className="mx-auto text-gray-400 mb-2"/>
                    <p className="text-gray-400">Drag & drop files or click to browse</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP recommended</p>
                    <input
                        type="file"
                        multiple
                        accept="image/png, image/jpeg, image/webp" // Specify accepted types
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => setSelectedFiles(e.target.files ? Array.from(e.target.files) : [])}
                    />
                </div>

                {/* Pre-upload Previews & Upload Button */}
                 {selectedFiles.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-sm font-semibold text-gray-300 mb-2">Selected files ({selectedFiles.length}):</h3>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto mb-2 p-1 bg-gray-900/50 rounded">
                            {selectedFiles.map((file, index) => (
                                <div key={index} className="w-16 h-16 rounded-md overflow-hidden relative group border border-gray-700">
                                    <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                     {/* Optional: Show file name on hover */}
                                     <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs text-white text-center p-1 truncate">{file.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={handleUploadImages}
                            disabled={uploading}
                            className={`w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-semibold transition-colors ${uploading ? "bg-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
                        >
                            {uploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Uploading...
                                </>
                             ) : `Upload ${selectedFiles.length} Image(s)`}
                        </button>
                         <button
                            onClick={() => setSelectedFiles([])} // Clear selection
                            disabled={uploading}
                            className="w-full mt-2 text-center text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                        >
                            Clear Selection
                        </button>
                    </div>
                )}
              </div>

              {/* Image Gallery Section */}
               <div className="p-6 rounded-xl bg-black/20 border border-yellow-400/20 shadow-lg">
                <h2 className="text-xl font-bold text-yellow-300 mb-4 border-b border-yellow-400/10 pb-2">Image Gallery</h2>
                <p className="text-xs text-gray-400 mb-4">Drag <GripVertical size={12} className="inline text-gray-500"/> handle to reorder images. Star (<Star size={12} className="inline text-yellow-400"/>) indicates primary image.</p>

                 <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="images" direction="vertical">
                        {(provided) => (
                            <div className="space-y-3" ref={provided.innerRef} {...provided.droppableProps}>
                                {productImages.map((img, index) => (
                                    <Draggable key={img.id} draggableId={img.id.toString()} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                className={`flex items-center gap-3 p-2 rounded-lg border group transition-shadow ${snapshot.isDragging ? 'shadow-lg bg-gray-700 border-yellow-400' : 'bg-gray-800/50 border-gray-700'}`}
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                // Drag handle is applied conditionally below only to the Grip icon for better control
                                            >
                                                {/* Drag Handle */}
                                                <div {...provided.dragHandleProps} className="p-1 cursor-grab active:cursor-grabbing">
                                                    <GripVertical size={20} className="text-gray-500"/>
                                                </div>

                                                {/* Image Thumbnail */}
                                                <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border border-gray-600">
                                                    <img src={img.image_url} alt="product thumbnail" className="w-full h-full object-cover" />
                                                    {/* Primary Indicator */}
                                                    {img.is_primary && (
                                                        <div className="absolute top-1 left-1 p-1 bg-yellow-400/80 rounded-full" title="Primary Image">
                                                            <Star size={12} className="text-black"/>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* File Info (Optional) */}
                                                 <div className="flex-1 text-xs text-gray-400 truncate hidden sm:block" title={img.image_url.split('/').pop()}>
                                                    {img.image_url.split('/').pop()}
                                                </div>

                                                {/* Hover Actions */}
                                                <div className="flex items-center gap-2 ml-auto opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!img.is_primary && (
                                                        <button
                                                            onClick={() => handleSetPrimary(img.id, img.image_url)}
                                                            className="p-2 bg-blue-600/80 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Set as primary"
                                                             disabled={loading} // Disable during any loading operation
                                                        >
                                                            <Star size={14} className="text-white"/>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteImage(img.id)}
                                                        className="p-2 bg-red-600/80 rounded-full hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Delete image"
                                                        disabled={loading} // Disable during any loading operation
                                                    >
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

                {/* Empty State */}
                {productImages.length === 0 && (
                    <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-700 rounded-lg">
                        <ImageIcon size={30} className="mx-auto mb-2"/>
                        No images uploaded yet.
                    </div>
                )}
            </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminProductEdit;
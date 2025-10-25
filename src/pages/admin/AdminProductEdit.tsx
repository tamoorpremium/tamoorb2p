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

// Badge Master List (Keep as is)
const badgeMasterList = [
    { name: 'Popular', color: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
    { name: 'Fresh', color: 'bg-gradient-to-r from-orange-500 to-amber-500' },
    { name: 'Premium', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600' },
    { name: 'Limited', color: 'bg-gradient-to-r from-purple-500 to-fuchsia-500' },
    { name: 'Organic', color: 'bg-gradient-to-r from-lime-500 to-green-500' },
    { name: 'Best Seller', color: 'bg-gradient-to-r from-rose-500 to-red-500' }
];
const badgeMap: Record<string, { name: string, color: string }> =
  badgeMasterList.reduce((acc, badge) => {
    acc[badge.name.toLowerCase().trim()] = badge;
    return acc;
  }, {} as Record<string, { name: string, color: string }>);

const AdminProductEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formRef = useRef<HTMLFormElement>(null);

  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(false); // For form saving/loading product
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false); // Specifically for image uploads
  const [previewUrls, setPreviewUrls] = useState<string[]>([]); // State for preview URLs

  // --- Effect for creating/revoking preview URLs ---
  useEffect(() => {
    // Create new object URLs
    const newUrls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(newUrls);

    // Return cleanup function to revoke URLs
    return () => {
      newUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);
  // ------------------------------------------------

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Shift + S
      if (event.shiftKey && event.key === 'S') {
        event.preventDefault(); // Prevent browser's "Save As" dialog
        
        // Prevent submission if already loading
        if (loading || uploading) {
          toast.warn("Please wait, an operation is already in progress.");
          return;
        }

        // Find the form and trigger its submit event
        // .requestSubmit() is better than .submit() as it fires the 'submit' event
        formRef.current?.requestSubmit();
      }
    };

    // Add the event listener to the whole document
    document.addEventListener('keydown', handleKeyDown);

    // Clean up the listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [loading, uploading]); // Re-run if loading state changes

  // useEffect fetchProduct (Keep as is)
  // --- UPDATED: Effect to fetch Product AND its Categories ---
  useEffect(() => {
    // Renamed function for clarity
    const fetchProductAndCategories = async () => {
      if (!id) {
        // For a new product, initialize with an empty categories array
        setInitialData({ category_ids: [] });
        return;
      };

      setLoading(true);
      try {
        const productId = parseInt(id);

        // Fetch product details (no category_id anymore)
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("*") // Select all columns except the dropped category_id
          .eq("id", productId)
          .single();

        if (productError) {
          toast.error("Failed to load product.");
          throw productError; // Stop execution if product fails to load
        }

        // Fetch associated category IDs
        const { data: categoryLinks, error: categoryError } = await supabase
          .from("product_categories")
          .select("category_id")
          .eq("product_id", productId);

        if (categoryError) {
          // Log error but maybe continue, setting categories to empty
          console.error("Failed to load product categories:", categoryError);
          toast.warn("Could not load product categories.");
        }

        // Combine product data with category IDs into the initialData state
        const categoryIds = categoryLinks ? categoryLinks.map(link => link.category_id) : [];
        setInitialData({ ...productData, category_ids: categoryIds });

        // Fetch images (can run concurrently or after)
        await fetchProductImages(productId);

      } catch (err) {
        console.error("Error loading product/categories:", err);
        // Ensure initialData is at least an empty object if loading fails completely
        // Initialize with empty category_ids if creating new or if fetch fails
        setInitialData({ category_ids: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndCategories(); // Call the renamed function
  }, [id]); // Keep dependency on id

  // fetchProductImages (Keep as is)
  const fetchProductImages = async (productId: number) => {
    const { data, error } = await supabase
      .from("product_images").select("*").eq("product_id", productId).order("sort_order", { ascending: true });
    if (error) { console.error(error); toast.error("Failed to load product images."); }
      else { setProductImages(data || []); }
  };

  // handleSubmit with badge logic (Keep as is)
  // --- UPDATED: handleSubmit for Multi-Category ---
  const handleSubmit = async (formData: any) => {
    setLoading(true);

    // Separate category IDs from the rest of the product data
    // **ASSUMPTION**: Your ProductForm now passes selected categories as an array named `category_ids`
    const { category_ids, ...productData } = formData;
    const selectedCategoryIds: number[] = Array.isArray(category_ids) ? category_ids : []; // Ensure it's an array

    // --- Badge Logic (Keep your existing logic here) ---
    const badgeName = productData.badge || "";
    const normalizedBadge = badgeName.toLowerCase().trim();
    const matchedBadge = badgeMap[normalizedBadge];
    if (matchedBadge) {
        productData.badge = matchedBadge.name;
        productData.badge_color = matchedBadge.color;
    } else if (badgeName) {
        productData.badge = badgeName.trim();
        productData.badge_color = null;
    } else {
        productData.badge = null;
        productData.badge_color = null;
    }
    // --- End Badge Logic ---

    try {
      let productId: number;
      let operation: 'updated' | 'created';

      // 1. Save core product data (INSERT or UPDATE)
      if (id) {
        productId = parseInt(id);
        const { error: updateError } = await supabase
          .from("products").update(productData).eq("id", productId);
        if (updateError) throw updateError;
        operation = 'updated';
      } else {
        const { data: insertData, error: insertError } = await supabase
          .from("products").insert(productData).select("id").single();
        if (insertError || !insertData) throw insertError || new Error("Failed to retrieve new product ID.");
        productId = insertData.id;
        operation = 'created';
      }

      // --- 2. Update Category Links in `product_categories` ---
      const { error: deleteError } = await supabase
          .from("product_categories").delete().eq("product_id", productId);
      if (deleteError) {
          console.error("Failed to delete old category links:", deleteError);
          toast.warn("Could not clear old category associations."); // Warn but continue
      }

      if (selectedCategoryIds.length > 0) {
          const newLinks = selectedCategoryIds.map(catId => ({ product_id: productId, category_id: catId }));
          const { error: insertLinksError } = await supabase
              .from("product_categories").insert(newLinks);
          if (insertLinksError) {
              throw new Error(`Product saved, but failed to link categories: ${insertLinksError.message}`);
          }
      }
      // --- End Category Link Update ---

      // Success Navigation
      if (operation === 'updated') {
        toast.success("Product updated successfully!");
        navigate("/admin/products");
      } else { // operation === 'created'
        toast.success("Product created! You can now add images.");
        navigate(`/admin/products/${productId}`);
      }
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(`Failed to save product/categories: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // --- REFINED handleUploadImages ---
  const handleUploadImages = async () => {
    if (!id || !initialData?.name || selectedFiles.length === 0) {
      toast.error("No product or files selected.");
      return;
    }
    setUploading(true);
    const productId = parseInt(id);
    const productName = initialData.name.replace(/\s+/g, "-").toLowerCase();
    const failedFiles: string[] = []; // Track failed uploads

    // Fetch initial sort order once
    let currentSortOrder = -1;
    try {
        const { data: maxSortData, error: maxSortError } = await supabase
            .from("product_images").select("sort_order").eq("product_id", productId)
            .order("sort_order", { ascending: false }).limit(1).maybeSingle();
        if (maxSortError) { throw new Error(`Could not determine starting sort order: ${maxSortError.message}`); }
        currentSortOrder = maxSortData?.sort_order ?? -1;
    } catch (err: any) {
        toast.error(`Upload aborted: ${err.message}`); setUploading(false); return;
    }

    let primaryImageSet = productImages.some(img => img.is_primary);

    // Process files sequentially
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileExt = file.name.split(".").pop();
      const uniqueName = `${Date.now()}-${i}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${productName}/${uniqueName}`;

      try {
        const { error: uploadError } = await supabase.storage.from("product-detailed-images").upload(filePath, file);
        if (uploadError) { throw new Error(`Storage upload failed: ${uploadError.message}`); }

        const { data: publicUrlData } = supabase.storage.from("product-detailed-images").getPublicUrl(filePath);
        const publicUrl = publicUrlData.publicUrl;

        const newSortOrder = currentSortOrder + 1;
        const isPrimary = !primaryImageSet && newSortOrder === 0;

        const { error: dbError } = await supabase.from("product_images").insert({
          product_id: productId, image_url: publicUrl, is_primary: isPrimary, sort_order: newSortOrder, // file_path: filePath // Recommended addition
        });
        if (dbError) { await supabase.storage.from("product-detailed-images").remove([filePath]); throw new Error(`Database insert failed: ${dbError.message}`); }

        if (isPrimary) {
          const { error: productUpdateError } = await supabase.from("products").update({ image: publicUrl }).eq("id", productId);
          if (productUpdateError) { console.error("Failed to update product's main image field:", productUpdateError); toast.warn(`Primary image set, but failed to update product's main image field for ${file.name}.`); }
          primaryImageSet = true;
        }
        currentSortOrder = newSortOrder; // Increment only on success
      } catch (err: any) {
        console.error(`Error processing ${file.name}:`, err); toast.error(`Failed to process ${file.name}: ${err.message}`); failedFiles.push(file.name);
      }
    } // End loop

    await fetchProductImages(productId);
    setSelectedFiles([]); // This will trigger the useEffect cleanup for previewUrls
    setUploading(false);

    if (failedFiles.length === 0) {
      // Use a slightly different count here based on the initial selectedFiles array length
      const initialFileCount = selectedFiles.length; // Capture length before clearing
       toast.success(`${initialFileCount} image(s) intended for upload processed successfully!`);
    } else {
        const initialFileCount = selectedFiles.length; // Capture length before clearing
         toast.warn(`${initialFileCount - failedFiles.length} image(s) uploaded. ${failedFiles.length} failed: ${failedFiles.join(", ")}`);
    }
  };
  // --- END REFINED handleUploadImages ---


  // handleDeleteImage (Keep as is, but consider adding file_path logic mentioned in suggestions)
  const handleDeleteImage = async (imageId: number) => {
    const imageToDelete = productImages.find(img => img.id === imageId);
    if (!imageToDelete) return;
    const isOnlyImage = productImages.length === 1;
    const isPrimary = imageToDelete.is_primary;
    if (isPrimary && isOnlyImage) { toast.warn("Cannot delete the only image..."); return; }
    if (!window.confirm("Are you sure?")) { return; }
     let filePath = ''; // Needs file_path column logic ideally
     try {
         const urlParts = imageToDelete.image_url.split('/product-detailed-images/');
         if (urlParts.length > 1) { filePath = urlParts[1]; }
         else { throw new Error("Cannot extract file path."); }
     } catch (e) { console.error(e); toast.error("Could not determine file path."); return; }
    const { error: storageError } = await supabase.storage.from("product-detailed-images").remove([filePath]);
    if (storageError) { console.error(storageError); toast.warn(`Failed storage delete, proceeding with DB delete...`); }
    const { error: dbError } = await supabase.from("product_images").delete().eq("id", imageId);
    if (dbError) { toast.error("Failed DB delete."); return; }
    toast.success("Image deleted.");
    const remainingImages = productImages.filter((img) => img.id !== imageId);
    if (isPrimary) {
        if (remainingImages.length > 0) {
            const nextPrimary = remainingImages.sort((a,b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];
            await handleSetPrimary(nextPrimary.id, nextPrimary.image_url);
        } else {
            await supabase.from("products").update({ image: null }).eq("id", id);
             setInitialData((prev: any) => ({ ...prev, image: null }));
        }
    }
    setProductImages(remainingImages);
};

  // handleDragEnd (Keep as is)
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(productImages);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setProductImages(reordered);
    const updates = reordered.map((img, index) =>
      supabase.from("product_images").update({ sort_order: index }).eq("id", img.id)
    );
    try {
        const results = await Promise.all(updates);
        const errors = results.filter(res => res.error);
        if (errors.length > 0) { console.error(errors); toast.error("Some orders failed."); await fetchProductImages(parseInt(id!)); }
        else { toast.success("Image order updated!"); }
    } catch (error) { console.error(error); toast.error("Error updating order."); await fetchProductImages(parseInt(id!)); }
  };

  // handleSetPrimary (Keep as is)
  const handleSetPrimary = async (imageId: number, imageUrl: string) => {
      if (!id) return; const productId = parseInt(id); setLoading(true);
      try {
          const { error: e1 } = await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId); if (e1) throw e1;
          const { error: e2 } = await supabase.from("product_images").update({ is_primary: true }).eq("id", imageId); if (e2) throw e2;
          const { error: e3 } = await supabase.from("products").update({ image: imageUrl }).eq("id", productId); if (e3) toast.warn("Failed product image update.");
          toast.success("Primary image updated!");
           setProductImages(prev => prev.map(img => ({ ...img, is_primary: img.id === imageId })));
            setInitialData((prev: any) => ({ ...prev, image: imageUrl }));
      } catch (error: any) { console.error(error); toast.error(`Failed: ${error.message || 'Unknown error'}`); await fetchProductImages(productId); }
      finally { setLoading(false); }
  };

  // Loading state (Keep as is)
  if (loading && id && !initialData) {
      return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div></div>;
  }

  // --- JSX ---
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 sm:p-6 lg:p-8 font-sans text-gray-100">

        {/* Header */}
        <header className="flex items-center justify-between mb-6 pb-4 border-b border-yellow-400/20">
            {/* ... header content ... */}
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

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Form */}
          <div className="lg:col-span-2">
            <div className="p-6 rounded-xl bg-black/20 border border-yellow-400/20 shadow-lg">
              <h2 className="text-xl font-bold text-yellow-300 mb-4 border-b border-yellow-400/10 pb-2">Product Details</h2>
              {initialData !== null && (
                 <ProductForm
                 ref={formRef}
                 initialData={initialData}
                 onSubmit={handleSubmit}
                 loading={loading || uploading}
                 productImageUrl={initialData?.image}
               />
              )}
            </div>
          </div>

          {/* Right Column: Images (Only if editing) */}
          {id && initialData && (
            <div className="lg:col-span-1 space-y-8">
              {/* Uploader */}
              <div className="p-6 rounded-xl bg-black/20 border border-yellow-400/20 shadow-lg">
                <h2 className="text-xl font-bold text-yellow-300 mb-4 border-b border-yellow-400/10 pb-2">Image Uploader</h2>
                 <div /* Dropzone */
                    className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-yellow-400 hover:bg-gray-800/30 transition-colors"
                    onClick={() => fileInputRef.current?.click()} >
                    <UploadCloud size={40} className="mx-auto text-gray-400 mb-2"/>
                    <p className="text-gray-400">Click or Drag & drop files</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP recommended</p>
                    <input type="file" multiple accept="image/png, image/jpeg, image/webp" ref={fileInputRef} className="hidden"
                        onChange={(e) => setSelectedFiles(e.target.files ? Array.from(e.target.files) : [])} />
                </div>
                 {/* Previews & Upload Button */}
                 {selectedFiles.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-sm font-semibold text-gray-300 mb-2">Selected files ({selectedFiles.length}):</h3>
                        {/* --- Use previewUrls state here --- */}
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto mb-2 p-1 bg-gray-900/50 rounded">
                            {previewUrls.map((url, index) => (
                                <div key={index} className="w-16 h-16 rounded-md overflow-hidden relative group border border-gray-700">
                                    <img src={url} alt={`preview ${index}`} className="w-full h-full object-cover" />
                                    {/* Optional: Show file name (access from selectedFiles[index]) */}
                                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs text-white text-center p-1 truncate">{selectedFiles[index]?.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* ----------------------------------- */}
                         <button onClick={handleUploadImages} disabled={uploading} className={`w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-semibold transition-colors ${uploading ? "bg-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}>
                             {uploading ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Uploading...</>) : `Upload ${selectedFiles.length} Image(s)`}
                        </button>
                         <button onClick={() => setSelectedFiles([])} disabled={uploading} className="w-full mt-2 text-center text-xs text-red-400 hover:text-red-300 disabled:opacity-50"> Clear Selection </button>
                    </div>
                )}
              </div>

              {/* Gallery */}
               <div className="p-6 rounded-xl bg-black/20 border border-yellow-400/20 shadow-lg">
                <h2 className="text-xl font-bold text-yellow-300 mb-4 border-b border-yellow-400/10 pb-2">Image Gallery</h2>
                <p className="text-xs text-gray-400 mb-4">Drag <GripVertical size={12} className="inline text-gray-500"/> handle to reorder. Star (<Star size={12} className="inline text-yellow-400"/>) is primary.</p>
                 <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="images" direction="vertical">
                        {(provided) => (
                            <div className="space-y-3" ref={provided.innerRef} {...provided.droppableProps}>
                                {productImages.map((img, index) => (
                                    <Draggable key={img.id} draggableId={img.id.toString()} index={index}>
                                        {(provided, snapshot) => (
                                            <div ref={provided.innerRef} {...provided.draggableProps} className={`flex items-center gap-3 p-2 rounded-lg border group transition-shadow ${snapshot.isDragging ? 'shadow-lg bg-gray-700 border-yellow-400' : 'bg-gray-800/50 border-gray-700'}`}>
                                                <div {...provided.dragHandleProps} className="p-1 cursor-grab active:cursor-grabbing"><GripVertical size={20} className="text-gray-500"/></div>
                                                <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border border-gray-600">
                                                    <img src={img.image_url} alt="thumbnail" className="w-full h-full object-cover" />
                                                    {img.is_primary && (<div className="absolute top-1 left-1 p-1 bg-yellow-400/80 rounded-full" title="Primary"><Star size={12} className="text-black"/></div>)}
                                                </div>
                                                 <div className="flex-1 text-xs text-gray-400 truncate hidden sm:block" title={img.image_url.split('/').pop()}>{img.image_url.split('/').pop()}</div>
                                                <div className="flex items-center gap-2 ml-auto opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!img.is_primary && (<button onClick={() => handleSetPrimary(img.id, img.image_url)} className="p-2 bg-blue-600/80 rounded-full hover:bg-blue-600 disabled:opacity-50" title="Set primary" disabled={loading}><Star size={14} className="text-white"/></button>)}
                                                    <button onClick={() => handleDeleteImage(img.id)} className="p-2 bg-red-600/80 rounded-full hover:bg-red-600 disabled:opacity-50" title="Delete" disabled={loading}><Trash2 size={14} className="text-white"/></button>
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
                {productImages.length === 0 && (<div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-700 rounded-lg"><ImageIcon size={30} className="mx-auto mb-2"/> No images.</div>)}
            </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminProductEdit;
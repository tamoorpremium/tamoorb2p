import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { ShoppingCart, X, Star, Heart } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { createPortal } from 'react-dom';

interface Product {
  id: number;
  name: string;
  price: number;
  original_price?: number;
  rating?: number;
  reviews?: number;
  description?: string;
  measurement_unit: string;
  image: string;
  default_piece_weight?: string;
  badge?: string;
  badge_color?: string;
  category_id?: number;
}

interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  is_primary: boolean;
}

interface Review {
  id: number;
  product_id: number;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

const weightOptions = [
  { label: "200g", value: 200 },
  { label: "250g", value: 250 },
  { label: "500g", value: 500 },
  { label: "1 kg", value: 1000 },
];

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState<{ name: string; comment: string; rating: number }>({
    name: "",
    comment: "",
    rating: 5,
  });
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [selectedWeight, setSelectedWeight] = useState<number | "custom">(1000);
  const [customWeight, setCustomWeight] = useState(50);
  const [quantity, setQuantity] = useState(1);
  const [cartMessage, setCartMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);


  // Fetch product
  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
      if (error) console.error(error);
      else setProduct(data);
    };
    fetchProduct();
  }, [id]);

 

// Fetch images
// Fetch images
useEffect(() => {
  if (!id) return;
  const fetchImages = async () => {
    const { data, error } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", id);

    if (error) {
      console.error(error);
    } else if (data.length > 0) {
      // Sort by sort_order ascending
      const sortedImages = data.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

      // Prefer the primary image as default
      const primaryImage = sortedImages.find(img => img.is_primary) || sortedImages[0];
      setSelectedImage(primaryImage.image_url);

      // Set images state
      setImages(sortedImages);
    }
  };
  fetchImages();
}, [id]);


 // ✅ Wishlist states
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [wishlistMessage, setWishlistMessage] = useState<{ text: string; type: "success" | "remove" } | null>(null);

  useEffect(() => {
    const fetchProductAndWishlist = async () => {
      if (!id) return;

      // fetch product
      const { data: productData, error } = await supabase.from("products").select("*").eq("id", id).single();
      if (!error) setProduct(productData);

      // fetch wishlist if logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: wishlist } = await supabase
          .from("wishlists")
          .select("product_id")
          .eq("user_id", user.id);

        if (wishlist) {
          setWishlistIds(wishlist.map((w) => w.product_id));
        }
      }
    };

    fetchProductAndWishlist();
  }, [id]);

  // ✅ Toggle wishlist
  const toggleWishlist = async (productId: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/auth?message=loginRequired&redirect=/product/" + productId;
      return;
    }

    const isInWishlist = wishlistIds.includes(productId);

    if (isInWishlist) {
      await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", productId);
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
      setWishlistMessage({ text: "Item removed from wishlist ❌", type: "remove" });
    } else {
      const { error } = await supabase.from("wishlists").insert({
        user_id: user.id,
        product_id: productId,
      });
      if (!error) {
        setWishlistIds((prev) => [...prev, productId]);
        setWishlistMessage({ text: "Item added to wishlist ✅", type: "success" });
      }
    }

    setTimeout(() => setWishlistMessage(null), 3000);
  };

  // Fetch reviews
  useEffect(() => {
    if (!id) return;
    const fetchReviews = async () => {
      const { data, error } = await supabase.from("product_reviews").select("*").eq("product_id", id);
      if (error) console.error(error);
      else setReviews(data);
    };
    fetchReviews();
  }, [id]);

  // Fetch similar products
  useEffect(() => {
    if (!product?.category_id) return;
    const fetchSimilar = async () => {
      try {
        const { data: categoryData, error: categoryError } = await supabase
          .from("categories")
          .select("id, parent_id")
          .eq("id", product.category_id)
          .single();
        if (categoryError) throw categoryError;

        const categoryIdToUse = categoryData?.parent_id || product.category_id;

        let { data: parentProducts, error: parentError } = await supabase
          .from("products")
          .select("*")
          .eq("category_id", categoryIdToUse)
          .neq("id", product.id);
        if (parentError) throw parentError;

        let finalProducts: Product[] = [];
        if (parentProducts && parentProducts.length >= 10) {
          finalProducts = parentProducts.slice(0, 10);
        } else {
          const needed = 10 - (parentProducts?.length || 0);
          let { data: fallbackProducts, error: fallbackError } = await supabase
            .from("products")
            .select("*")
            .neq("id", product.id)
            .limit(20);
          if (fallbackError) throw fallbackError;

          const parentIds = (parentProducts || []).map((p) => p.id);
          fallbackProducts = (fallbackProducts || []).filter((p) => !parentIds.includes(p.id));
          finalProducts = [...(parentProducts || []), ...(fallbackProducts.slice(0, needed))];
        }
        setSimilarProducts(finalProducts);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSimilar();
  }, [product]);

   useEffect(() => {
          const isModalOpen = showQuantityModal || wishlistMessage || cartMessage;
          if (isModalOpen) {
              document.body.style.overflow = 'hidden';
          } else {
              document.body.style.overflow = 'auto';
          }
          // Cleanup function to ensure scroll is restored if component unmounts
          return () => {
              document.body.style.overflow = 'auto';
          };
      }, [showQuantityModal, wishlistMessage, cartMessage]);

  const reviewsToShow = showAllReviews ? reviews : reviews.slice(0, 5);

  const handleAddCart = async () => {
    if (!product) return;
    const qty = quantity > 0 ? quantity : 1;

    let weight: string;
    if (product.measurement_unit === "pieces") weight = product.default_piece_weight || "default";
    else if (selectedWeight === "custom") weight = customWeight.toString();
    else weight = selectedWeight.toString();

    const unitPrice =
      product.measurement_unit === "kilograms"
        ? Math.round((product.price / 1000) * (selectedWeight === "custom" ? customWeight : (selectedWeight as number)))
        : product.price;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      localStorage.setItem(
        "pendingProduct",
        JSON.stringify({ id: product.id, quantity: qty, weight, name: product.name, price: product.price, image: product.image })
      );
      window.location.href = "/auth?message=loginRequired&redirect=/products";
      return;
    }

    const { error } = await supabase.from("cart").upsert({
      user_id: user.id,
      product_id: product.id,
      quantity: qty,
      weight,
      unit_price: unitPrice,
    });

    if (error) setCartMessage({ text: "❌ Failed to add item to cart", type: "error" });
    else setCartMessage({ text: "✅ Item added to cart successfully!", type: "success" });

    setTimeout(() => setCartMessage(null), 3000);
    setShowQuantityModal(false);
    setSelectedWeight(1000);
    setCustomWeight(50);
    setQuantity(1);
  };

  const handleSubmitReview = async () => {
    if (!product) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Please log in to submit a review");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("product_reviews").insert({
      product_id: product.id,
      customer_name: newReview.name || "Anonymous",
      rating: newReview.rating,
      comment: newReview.comment,
    });

    if (error) alert("Failed to submit review");
    else {
      setReviews(prev => [...prev, { id: Math.random(), product_id: product.id, customer_name: newReview.name || "Anonymous", rating: newReview.rating, comment: newReview.comment, created_at: new Date().toISOString() }]);
      setNewReview({ name: "", comment: "", rating: 5 });
    }
    setSubmitting(false);
  };

  if (!product) return <div>Loading...</div>;

  const dynamicPrice =
    product.measurement_unit === "kilograms"
      ? Math.round((product.price / 1000) * (selectedWeight === "custom" ? customWeight : (selectedWeight as number)))
      : product.price;

  const avgRating = reviews.length > 0 ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 4.5;
  const ratingCounts: Record<number, number> = {5:0,4:0,3:0,2:0,1:0};
  reviews.forEach(r => ratingCounts[r.rating] = (ratingCounts[r.rating]||0)+1);
  const totalReviews = reviews.length;

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Main Section */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        {/* Images */}
        <div className="md:w-1/2 flex flex-col gap-2">
          {/* Main Image with Wishlist */}
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src={selectedImage || product.image}
              alt={product.name}
              className="w-full h-64 sm:h-96 object-cover rounded-2xl"
            />

            {/* Wishlist Button */}
            <button
              onClick={() => {
                toggleWishlist(product.id);
                if (wishlistIds.includes(product.id)) {
                  toast.info("Removed from Wishlist ❤️");
                } else {
                  toast.success("Added to Wishlist ❤️");
                }
              }}
              className="absolute top-4 right-4 p-3 bg-white/80 rounded-full shadow-md hover:bg-white transition"
            >
              <Heart
                className={`w-6 h-6 ${
                  wishlistIds.includes(product.id)
                    ? "text-red-500 fill-red-500"
                    : "text-neutral-600"
                }`}
              />
            </button>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img) => (
              <img
                key={img.id}
                src={img.image_url}
                alt={product.name}
                className={`w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg cursor-pointer border-2 ${
                  selectedImage === img.image_url ? "border-amber-500" : "border-transparent"
                }`}
                onClick={() => setSelectedImage(img.image_url)}
              />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 flex-wrap">
            {product.name}
            {product.badge && (
              <span className={`${product.badge_color || "bg-amber-500"} text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-lg`}>
                {product.badge}
              </span>
            )}
          </h1>
          <p className="text-neutral-600 text-sm sm:text-base">{product.description}</p>

          {/* Rating */}
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 sm:w-5 h-4 sm:h-5 ${i < Math.floor(avgRating) ? "text-amber-500 fill-current" : "text-neutral-300"}`} />
            ))}
            <span className="text-sm text-neutral-600">({reviews.length})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-lg sm:text-2xl font-display font-bold tamoor-gradient">
              ₹{dynamicPrice} / {product.measurement_unit === "kilograms" ? "kg" : "pcs"}
            </span>

            {product.original_price && product.original_price > product.price && (
              <>
                <span className="text-sm sm:text-lg text-neutral-400 line-through font-medium">
                  ₹{product.original_price}
                </span>
                <span className="text-xs sm:text-sm text-luxury-sage font-semibold bg-luxury-sage/10 px-2 py-1 rounded-full">
                  Save ₹{product.original_price - product.price}
                </span>
              </>
            )}
          </div>

          {/* Add to Cart */}
          <button
            onClick={() => product.measurement_unit === "kilograms" ? setShowQuantityModal(true) : handleAddCart()}
            className="btn-premium text-white px-6 py-3 rounded-full flex items-center justify-center gap-2 w-full sm:w-1/2"
          >
            <ShoppingCart /> Add to Cart
          </button>

          {/* Permanent Info Points */}
          <div className="mt-2 space-y-1 text-sm text-neutral-900 font-semibold">
            <p>MRP is Inclusive of all taxes</p>
            <p className="flex items-center gap-2 flex-nowrap whitespace-nowrap">
              Country of Origin: INDIA
              <span className="inline-block w-6 h-4 flex-shrink-0">
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg"
                  alt="India Flag"
                  className="w-full h-full object-cover rounded-sm"
                />
              </span>
            </p>
            <p className="flex items-center gap-2 flex-nowrap whitespace-nowrap">
              Make in INDIA initiative
              <span className="inline-block w-14 h-6 flex-shrink-0">
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/4/46/Make_In_India.png"
                  alt="tiger"
                  className="w-full h-full object-cover rounded-sm"
                />
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Quantity Modal (Updated with Portal & Scroll) */}
{showQuantityModal && product.measurement_unit === "kilograms" && createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {/* CHANGED: Added flexbox structure and height constraints */}
        <div className="glass rounded-3xl p-4 sm:p-8 max-w-md w-full animate-slide-up flex flex-col max-h-[90vh]">

            {/* NEW: Header Section (fixed) */}
            <div className="flex-shrink-0 flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-amber-500">Select Quantity</h3>
                <button onClick={() => setShowQuantityModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-all">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* NEW: Main Content Area (scrollable) */}
            <div className="flex-1 overflow-y-auto pr-2">
                <div className="mb-4">
                    <img src={selectedImage || product.image} alt={product.name} className="w-full h-32 sm:h-40 object-cover rounded-2xl mb-4" />
                    <h4 className="font-semibold text-lg text-luxury-gold-light">{product.name}</h4>
                    {/* CHANGED: Made description smaller to prevent overflow */}
                    <p className="text-sm text-lime-400">{product.description}</p>
                </div>

                {/* Weight Options */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {weightOptions.map(({ label, value }) => (
                            <button
                                key={value}
                                onClick={() => setSelectedWeight(value)}
                                className={`p-2 rounded-lg border-2 transition-all duration-300 text-sm ${selectedWeight === value ? "border-amber-500 bg-amber-100 text-amber-600" : "border-neutral-200 hover:border-amber-300"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                        <button
                            onClick={() => setSelectedWeight("custom")}
                            className={`p-2 rounded-lg border-2 transition-all duration-300 text-sm ${selectedWeight === "custom" ? "border-amber-500 bg-amber-100 text-amber-600" : "border-neutral-200 hover:border-amber-300"
                                }`}
                        >
                            Custom Weight
                        </button>
                    </div>

                    {selectedWeight === "custom" && (
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCustomWeight(Math.max(50, customWeight - 50))} className="p-2 glass rounded-lg hover:bg-white/20">-</button>
                            <input
                                type="number"
                                min={50}
                                value={customWeight}
                                onChange={(e) => setCustomWeight(Math.max(50, parseInt(e.target.value) || 50))}
                                className="flex-1 p-2 glass rounded-lg text-center"
                            />
                            <span className="text-sm">grams</span>
                            <button onClick={() => setCustomWeight(customWeight + 50)} className="p-2 glass rounded-lg hover:bg-white/20">+</button>
                        </div>
                    )}
                </div>
            </div>

            {/* NEW: Footer Section (fixed) */}
            <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t border-white/20 mt-4">
                <div className="text-2xl font-bold">₹{dynamicPrice}</div>
                <button onClick={handleAddCart} className="btn-premium text-white px-4 py-2 rounded-full flex items-center gap-2">
                    <ShoppingCart /> Add to Cart
                </button>
            </div>

        </div>
    </div>,
    document.getElementById('modal-root')!
)}


      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-3">You may also like</h2>
          <div className="overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-gray-100 px-2">
            <div className="flex gap-3 snap-x snap-mandatory">
              {similarProducts.map((sp) => (
                <div
                  key={sp.id}
                  onClick={() => navigate(`/product/${sp.id}`)}
                  className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] border rounded-xl p-2 flex flex-col items-center gap-1 sm:gap-2 hover:shadow-lg transition-shadow cursor-pointer snap-start"
                >
                  <img src={sp.image} alt={sp.name} className="w-full h-28 sm:h-32 md:h-36 object-cover rounded-lg" />
                  <h3 className="text-xs sm:text-sm font-semibold text-center line-clamp-2">{sp.name}</h3>
                  <div className="text-sm font-bold">₹{sp.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

     {/* Category-wise Rating Bars */}
      {/* Category-wise Rating Bars */}
      {reviews.length > 0 && (
        <div className="mt-6 space-y-1">
          {[5, 4, 3, 2, 1].map(star => (
            <div key={star} className="flex items-center gap-2">
              {/* Bigger stars */}
              <div className="flex gap-1 w-24">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-8 h-8 ${i < star ? "text-amber-500 fill-current" : "text-neutral-300"}`}
                  />
                ))}
              </div>

              {/* Shorter progress bar */}
              <div className="flex-1 max-w-[280px] h-2 bg-neutral-200 rounded overflow-hidden">
                <div
                  className="h-2 bg-amber-400"
                  style={{ width: `${(ratingCounts[star] / totalReviews) * 100 || 0}%` }}
                />
              </div>

              <span className="text-sm w-6 text-right">{ratingCounts[star]}</span>
            </div>
          ))}
        </div>
      )}



      {/* Reviews */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-2">Customer Reviews</h2>
        <div className="space-y-3">
          {reviewsToShow.map((r) => (
            <div key={r.id} className="border p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < r.rating ? "text-amber-500 fill-current" : "text-neutral-300"}`} />
                ))}
                <span className="text-sm font-semibold">{r.customer_name}</span>
              </div>
              <p className="text-sm text-neutral-600">{r.comment}</p>
            </div>
          ))}

          {reviews.length > 5 && (
            <button
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="text-amber-500 font-semibold mt-2"
            >
              {showAllReviews ? "See Less Reviews" : "See More Reviews"}
            </button>
          )}
        </div>

        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="btn-premium text-white px-4 py-2 rounded-full mt-4"
        >
          {showReviewForm ? "Hide Review Form" : "Write a Review"}
        </button>
        {showReviewForm && (
        <div className="mt-6 border-t pt-3 space-y-2">
          <h3 className="font-semibold">Add Your Review</h3>
          <input
            type="text"
            placeholder="Your Name"
            value={newReview.name}
            onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
            className="w-full p-2 rounded-lg border"
          />
          <textarea
            placeholder="Your Comment"
            value={newReview.comment}
            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
            className="w-full p-2 rounded-lg border"
          />
          <div className="flex items-center gap-2">
            <span>Rating:</span>
            <input
              type="number"
              min={1}
              max={5}
              value={newReview.rating}
              onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
              className="w-20 p-2 rounded-lg border"
            />
          </div>
          <button
            onClick={handleSubmitReview}
            className={`btn-premium px-4 py-2 rounded-full text-white ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}
      </div>

      {/* Cart Message */}
      {cartMessage && createPortal (
        <div className="fixed inset-0 flex items-start sm:items-start justify-center z-50">
          <div
            className={`mt-24 sm:mt-32 px-6 py-3 rounded-2xl shadow-xl text-lg font-semibold animate-slide-up transition-all duration-300 ${
              cartMessage.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white`}
          >
            {cartMessage.text}
          </div>
        </div>,
        document.getElementById('modal-root')!
      )}
    </div>
  );
};

export default ProductDetails;

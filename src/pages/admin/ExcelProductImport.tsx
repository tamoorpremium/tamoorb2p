import React, { useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "../../utils/supabaseClient";
import { toast, ToastContainer } from "react-toastify";
import { ArrowLeft, Upload, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import stringSimilarity from "string-similarity";

// Interface for fetched categories (matching existing)
interface Category {
  id: number;
  name: string;
}

const ExcelProductImport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Unit mapping (unchanged)
  const unitMap: Record<number, string> = {
    0: "kilograms",
    1: "pieces",
    2: "liters",
    3: "grams",
  };

  // Badge Master List (unchanged)
  const badgeMasterList = [
    { name: 'Popular', color: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
    { name: 'Fresh', color: 'bg-gradient-to-r from-orange-500 to-amber-500' },
    { name: 'Premium', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600' },
    { name: 'Limited', color: 'bg-gradient-to-r from-purple-500 to-fuchsia-500' },
    { name: 'Organic', color: 'bg-gradient-to-r from-lime-500 to-green-500' },
    { name: 'Best Seller', color: 'bg-gradient-to-r from-rose-500 to-red-500' }
  ];
   // --- Badge matching setup (unchanged) ---
   const badgeNames = badgeMasterList.map(b => b.name);
   const badgeMap: Record<string, { name: string, color: string }> =
     badgeMasterList.reduce((acc, badge) => {
       acc[badge.name.toLowerCase().trim()] = badge;
       return acc;
     }, {} as Record<string, { name: string, color: string }>);
   // ----------------------------


  // --- UPDATED Template Headers (no change needed here, handled in instructions/parsing) ---
  const templateHeaders = [
    "Product Name", // Required
    "Category",     // Required, comma-separated allowed
    "Our Price",    // Required
    "Original Price",
    "Measurement Unit", // Required (0=kg, 1=pcs, 2=ltr, 3=g)
    "Stock Unit",       // Required (0=kg, 1=pcs, 2=ltr, 3=g)
    "Stock Quantity", // Required
    "Description",
    "Badge",
    "Rating",
    "Reviews",
  ];

  // --- UPDATED: Generate downloadable Excel template ---
  const downloadTemplate = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([
      templateHeaders,
      [ // Example 1: Single Category
        "Almonds",                // Name
        "Premium Nuts",           // Category
        450,                      // Price
        500,                      // Original Price
        0,                        // Measurement Unit (kg)
        0,                        // Stock Unit (kg)
        100,                      // Stock Qty
        "Premium California Almonds", // Description
        "Best Seller",            // Badge
        5,                        // Rating
        200,                      // Reviews
      ],
      [ // Example 2: Multiple Categories + Fuzzy Match Badge
        "Lindt Excellence 70%",   // Name
        "Dark Chocolate, Imported Chocolates, Lindt", // <-- Multiple Categories, comma-separated
        350,                      // Price
        400,                      // Original Price
        1,                        // Measurement Unit (pcs)
        1,                        // Stock Unit (pcs)
        50,                       // Stock Qty
        "Rich dark chocolate bar.", // Description
        "PREMIUMM",               // Badge (fuzzy match example)
        4.9,                      // Rating
        150,                      // Reviews
      ],
       [ // Example 3: Fuzzy Match Category
        "Organic Apricot",        // Name
        "Dried fruit",            // Category (fuzzy match example)
        600,                      // Price
        null,                     // Original Price (empty)
        0,                        // Measurement Unit (kg)
        0,                        // Stock Unit (kg)
        30,                       // Stock Qty
        "Organic Turkish Apricots", // Description
        "Organic",                // Badge
        4.7,                      // Rating
        95,                       // Reviews
      ],
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products Template");
    XLSX.writeFile(workbook, "products_template.xlsx");
  };
  // --- END UPDATED Template ---

  // --- UPDATED: Handle Excel file upload ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setLoading(true);
    let successCount = 0;
    let errorCount = 0;
    let errorMessages: string[] = [];

    try {
      const file = e.target.files[0];
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: null }); // Use defval: null for empty cells

      if (!rows || rows.length === 0) {
        toast.error("Excel file is empty."); setLoading(false); return;
      }

      // --- Fetch Categories for matching ---
      const { data: categories, error: catError } = await supabase
        .from("categories").select("id, name");
      if (catError) throw new Error(`Failed to fetch categories: ${catError.message}`);
      if (!categories) throw new Error("No categories found in database.");

      const categoryMap: Record<string, number> = categories.reduce((acc, cat) => {
        acc[cat.name.toLowerCase().trim()] = cat.id; return acc;
      }, {} as Record<string, number>);
      const categoryNames = categories.map((c) => c.name);
      // ------------------------------------

      const normalize = (str: string | null | undefined) => (str || "").toString().toLowerCase().trim();

      // Process rows one by one for better error feedback
      for (const [index, row] of rows.entries()) {
          const rowNum = index + 2; // Excel row number (accounting for header)
          try {
              // --- 1. Parse and Match Categories ---
              const rawCategoryString = row["Category"] || "";
              const categoryNamesInput = rawCategoryString.toString().split(',').map((name: string) => name.trim()).filter(Boolean); // Split by comma, trim, remove empty
              const rowCategoryIds: number[] = [];
              let categoryMatchInfo = ''; // For logging/toast

              if (categoryNamesInput.length === 0) {
                  throw new Error(`Row ${rowNum}: Category column cannot be empty.`);
              }

              for (const nameInput of categoryNamesInput) {
                  let normalizedName = normalize(nameInput);
                  let categoryId = categoryMap[normalizedName];

                  if (!categoryId && nameInput) { // Try fuzzy match if exact failed
                      const { bestMatch } = stringSimilarity.findBestMatch(nameInput, categoryNames);
                      if (bestMatch.rating > 0.8) {
                          const matched = categories.find(c => c.name === bestMatch.target);
                          if (matched) {
                              categoryId = matched.id;
                              categoryMatchInfo += ` Auto-corrected "${nameInput}" → "${bestMatch.target}".`;
                          }
                      }
                  }

                  if (categoryId) {
                      if (!rowCategoryIds.includes(categoryId)) { // Avoid duplicates
                          rowCategoryIds.push(categoryId);
                      }
                  } else {
                      // Couldn't match this specific category name
                      errorMessages.push(`Row ${rowNum}: Could not find or match category "${nameInput}". Skipping this category for this product.`);
                      // Don't throw, just skip this one category for the product
                  }
              }

               if (rowCategoryIds.length === 0) {
                  // If after trying all names, none matched, we cannot proceed for this row.
                   throw new Error(`Row ${rowNum}: No valid categories found or matched for input "${rawCategoryString}".`);
               }
              if (categoryMatchInfo) toast.info(`Row ${rowNum}:${categoryMatchInfo}`, { autoClose: 4000 });
              // ----------------------------------------

              // --- 2. Prepare Product Data (excluding categories) ---
              const rawBadge = row["Badge"] || "";
              let normalizedBadge = normalize(rawBadge);
              let correctedBadgeName: string | null = rawBadge || null; // Default to original or null if empty
              let correspondingColor: string | null = null;
              const exactBadgeMatch = badgeMap[normalizedBadge];

              if (exactBadgeMatch) {
                  correctedBadgeName = exactBadgeMatch.name;
                  correspondingColor = exactBadgeMatch.color;
              } else if (normalizedBadge) {
                  const { bestMatch } = stringSimilarity.findBestMatch(rawBadge, badgeNames);
                  if (bestMatch.rating > 0.8) {
                      const matchedBadge = badgeMasterList.find(b => b.name === bestMatch.target);
                      if (matchedBadge) {
                          correctedBadgeName = matchedBadge.name;
                          correspondingColor = matchedBadge.color;
                          toast.info(`Row ${rowNum}: Auto-corrected badge "${rawBadge}" → "${matchedBadge.name}"`, { autoClose: 4000 });
                      }
                  }
                  // If no good match, correctedBadgeName remains rawBadge, color remains null
              } else {
                   correctedBadgeName = null; // Ensure null if empty
              }

              const productData = {
                  name: row["Product Name"]?.toString().trim() || null, // Allow null if empty, trim if exists
                  price: row["Our Price"] !== null ? Number(row["Our Price"]) : null, // Allow null
                  original_price: row["Original Price"] !== null ? Number(row["Original Price"]) : null, // Allow null
                  measurement_unit: unitMap[Number(row["Measurement Unit"])] || "kilograms",
                  stock_unit: unitMap[Number(row["Stock Unit"])] || "kilograms",
                  stock_quantity: row["Stock Quantity"] !== null ? Number(row["Stock Quantity"]) : 0, // Default to 0
                  description: row["Description"]?.toString() || null,
                  badge: correctedBadgeName,
                  badge_color: correspondingColor,
                  rating: row["Rating"] !== null ? Number(row["Rating"]) : null,
                  reviews: row["Reviews"] !== null ? Number(row["Reviews"]) : null,
                  // is_active: true, // Default to active? Add if needed
                  // is_in_stock: (row["Stock Quantity"] !== null ? Number(row["Stock Quantity"]) : 0) > 0, // Default based on qty?
              };

              // Basic Validation
              if (!productData.name) throw new Error(`Row ${rowNum}: Product Name is required.`);
              if (productData.price === null) throw new Error(`Row ${rowNum}: Our Price is required.`);
              // Add more validation as needed

              // --- 3. Upsert Product & Get ID ---
              // Upsert based on name might be risky if names change. Let's rely on insert/update.
              // For simplicity, we'll insert first. If it fails due to unique constraint (name?),
              // we could try updating. Or just let duplicates fail initially.
              // Let's assume name is unique for upsert. You might need a different unique key.
              const { data: upsertedProduct, error: upsertError } = await supabase
                  .from('products')
                  .upsert({ ...productData, name: productData.name }, { onConflict: 'name', ignoreDuplicates: false }) // Upsert based on name
                  .select('id')
                  .single();

               if (upsertError) throw new Error(`Row ${rowNum}: Failed to save product data for "${productData.name}": ${upsertError.message}`);
               if (!upsertedProduct) throw new Error(`Row ${rowNum}: Could not get product ID after saving "${productData.name}".`);

               const productId = upsertedProduct.id;

              // --- 4. Manage Categories ---
              // Delete existing links
              const { error: deleteError } = await supabase
                  .from("product_categories")
                  .delete()
                  .eq("product_id", productId);
              if (deleteError) {
                  // Log but continue, maybe old links remain but new ones will be added
                  console.error(`Row ${rowNum}: Failed to delete old category links for product ID ${productId}:`, deleteError);
                  errorMessages.push(`Row ${rowNum}: Failed to clear old categories for ${productData.name}.`);
              }

              // Insert new links
              const newLinks = rowCategoryIds.map(catId => ({ product_id: productId, category_id: catId }));
              const { error: insertLinksError } = await supabase
                  .from("product_categories")
                  .insert(newLinks);
              if (insertLinksError) {
                   // This is more critical
                  throw new Error(`Row ${rowNum}: Product "${productData.name}" saved, but failed to link categories: ${insertLinksError.message}`);
              }
              // --- End Category Management ---

              successCount++; // Increment success if all steps passed for this row

          } catch (rowError: any) {
              errorCount++;
              const message = rowError.message || 'Unknown error for this row.';
              errorMessages.push(message); // Collect specific row error
              console.error(`Error on row ${rowNum}:`, rowError);
          }
      } // End row loop

      // --- Final Feedback ---
      if (errorCount === 0 && successCount > 0) {
        toast.success(`${successCount} products imported successfully!`);
      } else if (successCount > 0) {
        toast.warn(`${successCount} products imported. ${errorCount} rows failed. Check console/notifications for details.`);
        // Optionally display collected errorMessages more prominently
        errorMessages.forEach((msg, i) => toast.error(`Error ${i+1}: ${msg}`, { autoClose: 10000 }));
      } else {
        toast.error(`Import failed. ${errorCount} rows had errors. Check console/notifications for details.`);
        errorMessages.forEach((msg, i) => toast.error(`Error ${i+1}: ${msg}`, { autoClose: 10000 }));
      }

    } catch (err: any) { // Catch errors outside the loop (e.g., fetching categories)
      toast.error(`Import failed: ${err.message}`);
      console.error("Import error:", err);
    } finally {
      setLoading(false);
      // Reset file input to allow re-uploading the same file
      if (e.target) e.target.value = '';
    }
  };
  // --- END UPDATED handleFileUpload ---

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900 p-6 md:p-10 text-gray-100 font-sans">
      <ToastContainer position="top-right" autoClose={5000} theme="dark" />

      {/* Header (adjusted spacing) */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-10">
        <div className="flex items-center gap-4 mb-4 sm:mb-0">
          <button
            onClick={() => navigate("/admin/products")}
            className="p-2 rounded-full bg-yellow-400/80 text-gray-900 shadow hover:bg-yellow-400 transition-colors flex items-center justify-center"
            title="Back to Products"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-wide text-yellow-400">
            Bulk Import Products
          </h1>
        </div>
      </div>

      {/* Card */}
      <div className="max-w-4xl mx-auto p-6 sm:p-8 lg:p-10 rounded-2xl backdrop-blur-xl bg-white/5 border border-yellow-400/30 shadow-lg">
        {/* UPDATED Instructions */}
        <div className="mb-6 space-y-3 text-sm sm:text-base text-yellow-100/90">
            <p>
                Import multiple products using an Excel sheet (.xlsx or .xls).
                <strong className="text-yellow-300"> Download the template</strong> below for the correct format.
            </p>
            <p>
                <strong className="text-yellow-300">Category Column:</strong> Enter one or more category names, <strong className="text-yellow-300">separated by commas</strong> (e.g., <code className="bg-gray-700 px-1 rounded text-yellow-200">Dry Fruits, Premium Nuts</code>). The importer will try to match names (case-insensitive) and auto-correct minor spelling errors. If a name cannot be matched, it will be skipped for that product. At least one valid category is required per product.
            </p>
             <p>
                <strong className="text-yellow-300">Measurement & Stock Units:</strong> Use numbers:
                <code className="ml-2 bg-gray-700 px-1 rounded text-yellow-200">0</code>=Kilograms,
                <code className="ml-1 bg-gray-700 px-1 rounded text-yellow-200">1</code>=Pieces,
                <code className="ml-1 bg-gray-700 px-1 rounded text-yellow-200">2</code>=Liters,
                <code className="ml-1 bg-gray-700 px-1 rounded text-yellow-200">3</code>=Grams.
             </p>
             <p>
                <strong className="text-yellow-300">Badges:</strong> Predefined badges (Popular, Fresh, Premium, Limited, Organic, Best Seller) will be auto-corrected for spelling and have colors applied. You can also enter custom badge text. Leave blank for no badge.
             </p>
             <p>
                 <strong className="text-yellow-300">Required Fields:</strong> Product Name, Category, Our Price, Measurement Unit, Stock Unit, Stock Quantity.
             </p>
        </div>


        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mt-8">
          {/* Download Template */}
          <button
            onClick={downloadTemplate}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-green-500 text-white font-semibold shadow hover:bg-green-600 transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Download Template
          </button>

          {/* Upload Excel */}
          <label className={`w-full sm:w-auto px-6 py-3 rounded-lg font-semibold shadow transition-all hover:scale-105 flex items-center justify-center gap-2 ${loading ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-yellow-400 text-gray-900 hover:shadow-yellow-500/50 cursor-pointer'}`}>
             <Upload size={18} />
             {loading ? "Importing..." : "Upload Excel File"}
            <input
              type="file"
              accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" // More specific MIME types
              onChange={handleFileUpload}
              className="hidden"
              disabled={loading}
            />
          </label>
        </div>
      </div>

    </div>
  );
};

export default ExcelProductImport;
// src/pages/admin/ExcelProductImport.tsx
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "../../utils/supabaseClient";
import { toast, ToastContainer } from "react-toastify";
import { ArrowLeft, Upload, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import stringSimilarity from "string-similarity";

const ExcelProductImport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Unit mapping
  const unitMap: Record<number, string> = {
    0: "kilograms",
    1: "pieces",
    2: "liters",
    3: "grams",
  };

  // --- Badge Master List ---
  // This is the single source of truth for badge names and colors
  const badgeMasterList = [
    { name: 'Popular', color: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
    { name: 'Fresh', color: 'bg-gradient-to-r from-orange-500 to-amber-500' },
    { name: 'Premium', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600' },
    { name: 'Limited', color: 'bg-gradient-to-r from-purple-500 to-fuchsia-500' },
    { name: 'Organic', color: 'bg-gradient-to-r from-lime-500 to-green-500' },
    { name: 'Best Seller', color: 'bg-gradient-to-r from-rose-500 to-red-500' }
  ];
  // -------------------------

  // Headers shown in Excel
  const templateHeaders = [
    "Product Name",
    "Category",
    "Our Price",
    "Original Price",
    "Measurement Unit", // <-- Fixed
    "Stock Unit",       // <-- Fixed
    "Stock Quantity",
    "Description",
    "Badge",
    "Rating",
    "Reviews",
  ];

  // Generate downloadable Excel template
  const downloadTemplate = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([
      templateHeaders,
      [
        "Almonds",
        "Dry Fruits",
        450,
        500,
        0, // Kilograms
        0, // Kilograms
        100,
        "Premium California Almonds",
        "Best Seller", // Example Badge
        5,
        200,
      ],
      [
        "Cashews",
        "Dry Fruits",
        800,
        900,
        0, // Kilograms
        0, // Kilograms
        50,
        "Premium Cashews",
        "popularr", // Example spelling mistake
        4.8,
        150,
      ],
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products Template");
    XLSX.writeFile(workbook, "products_template.xlsx");
  };

  // Handle Excel file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setLoading(true);

    try {
      const file = e.target.files[0];
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (!rows || rows.length === 0) {
        toast.error("Excel file is empty.");
        setLoading(false);
        return;
      }

      // --- Set up Category matching ---
      const { data: categories, error: catError } = await supabase
        .from("categories")
        .select("id, name");

      if (catError) throw catError;

      const categoryMap: Record<string, number> =
        categories?.reduce((acc, cat) => {
          acc[cat.name.toLowerCase().trim()] = cat.id;
          return acc;
        }, {} as Record<string, number>) || {};

      const categoryNames = categories?.map((c) => c.name) || [];

      // --- Set up Badge matching ---
      const badgeNames = badgeMasterList.map(b => b.name);
      const badgeMap: Record<string, { name: string, color: string }> =
        badgeMasterList.reduce((acc, badge) => {
          acc[badge.name.toLowerCase().trim()] = badge;
          return acc;
        }, {} as Record<string, { name: string, color: string }>);
      // ----------------------------

      const normalize = (str: string) => (str || "").toLowerCase().trim();

      const productsToInsert = rows.map((row) => {
        
        // --- Category Logic ---
        let rawCategory = normalize(row["Category"]);
        let categoryId = categoryMap[rawCategory];

        if (!categoryId && rawCategory) {
          const { bestMatch } = stringSimilarity.findBestMatch(
            row["Category"], // Use original string for better matching
            categoryNames
          );

          if (bestMatch.rating > 0.8) {
            const matched = categories.find(
              (c) => c.name === bestMatch.target
            );
            if (matched) {
              categoryId = matched.id;
              toast.info(
                `Auto-corrected category "${row["Category"]}" → "${bestMatch.target}"`,
                { autoClose: 4000 }
              );
            }
          }
        }

        // --- Badge Logic ---
        const rawBadge = row["Badge"] || "";
        let normalizedBadge = normalize(rawBadge);
        let correctedBadgeName: string | null = rawBadge;
        let correspondingColor: string | null = null;

        // 1. Try exact (case-insensitive) match
        const exactMatch = badgeMap[normalizedBadge];
        if (exactMatch) {
          correctedBadgeName = exactMatch.name;
          correspondingColor = exactMatch.color;
        } 
        // 2. If no exact match, try fuzzy match (if not empty)
        else if (normalizedBadge) {
          const { bestMatch } = stringSimilarity.findBestMatch(
            rawBadge, // Use original string for better matching
            badgeNames
          );

          // If similarity is high, auto-correct
          if (bestMatch.rating > 0.8) {
            const matchedBadge = badgeMasterList.find(
              (b) => b.name === bestMatch.target
            );
            if (matchedBadge) {
              correctedBadgeName = matchedBadge.name;
              correspondingColor = matchedBadge.color;
              toast.info(
                `Auto-corrected badge "${rawBadge}" → "${matchedBadge.name}"`,
                { autoClose: 4000 }
              );
            }
          } else {
            // No good match, keep original user input and set no color
            correctedBadgeName = rawBadge;
            correspondingColor = null;
          }
        } else {
           // Badge cell was empty
           correctedBadgeName = null;
           correspondingColor = null;
        }
        // ---------------------

        return {
          name: row["Product Name"] || "",
          price: row["Our Price"] ? Number(row["Our Price"]) : 0,
          original_price: row["Original Price"]
            ? Number(row["Original Price"])
            : 0,
          category_id: categoryId,
          measurement_unit:
            unitMap[Number(row["Measurement Unit"])] || "kilograms",
          stock_unit: unitMap[Number(row["Stock Unit"])] || "kilograms",
          stock_quantity: row["Stock Quantity"]
            ? Number(row["Stock Quantity"])
            : 0,
          description: row["Description"] || "",
          
          // --- Updated Badge Fields ---
          badge: correctedBadgeName,
          badge_color: correspondingColor,
          // ----------------------------

          rating: row["Rating"] ? Number(row["Rating"]) : 0,
          reviews: row["Reviews"] ? Number(row["Reviews"]) : 0,
        };
      });

      const { error } = await supabase.from("products").upsert(productsToInsert, {
        onConflict: "id", // Assumes you want to update if a product ID is matched
      });

      if (error) throw error;

      toast.success("Products imported successfully!");
    } catch (err: any) {
      toast.error(`Import failed: ${err.message}`);
      console.error("Import error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900 p-10 text-gray-100 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/products")}
            className="px-4 py-2 rounded-full bg-yellow-400 text-gray-900 shadow-md hover:shadow-yellow-500/75 transition-transform hover:scale-105 flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <h1 className="text-4xl font-extrabold tracking-wide drop-shadow-lg text-yellow-400">
            Bulk Import Products
          </h1>
        </div>
      </div>

      {/* Card */}
      <div className="max-w-3xl mx-auto p-10 rounded-3xl backdrop-blur-xl bg-white/5 border border-yellow-400/30 shadow-neumorphic">
        <p className="mb-6 text-lg text-yellow-200">
          Import multiple products at once using an Excel sheet. Use numbers for
          Measurement Unit & Stock Unit:
          <br />
          <span className="text-green-400 font-semibold">
            0 = Kilograms, 1 = Pieces, 2 = Liters, 3 = Grams
          </span>
        </p>
         <p className="mb-6 text-lg text-yellow-200">
          Badges (e.g., "Best Seller", "Premium" , "Fresh" , "Limited","Organic","Popular") will be auto-corrected and colors will be set automatically.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          {/* Download Template */}
          <button
            onClick={downloadTemplate}
            className="px-6 py-3 rounded-full bg-green-400 text-gray-900 font-semibold shadow-md hover:shadow-green-500/75 transition-transform hover:scale-105 flex items-center gap-2"
          >
            <Download size={20} />
            Download Template
          </button>

          {/* Upload Excel */}
          <label className="px-6 py-3 rounded-full bg-yellow-400 text-gray-900 font-semibold shadow-md hover:shadow-yellow-500/75 transition-transform hover:scale-105 flex items-center gap-2 cursor-pointer">
            <Upload size={20} />
            {loading ? "Importing..." : "Upload Excel"}
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              disabled={loading}
            />
          </label>
        </div>
      </div>

      <style>{`
        .shadow-neumorphic {
          box-shadow:
            8px 8px 15px #1f2937,
            -8px -8px 15px #323f50;
        }
      `}</style>
    </div>
  );
};

export default ExcelProductImport;
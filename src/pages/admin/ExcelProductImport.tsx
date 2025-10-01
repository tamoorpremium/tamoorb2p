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

  // Headers shown in Excel
  const templateHeaders = [
    "Product Name",
    "Category",
    "Our Price",
    "Original Price",
    "Measurement Unit (0=Kg,1=Pieces,2=Liters,3=Grams)",
    "Stock Unit (0=Kg,1=Pieces,2=Liters,3=Grams)",
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
        "Best Seller",
        5,
        200,
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

      // Fetch categories once
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

      const normalize = (str: string) => (str || "").toLowerCase().trim();

      const productsToInsert = rows.map((row) => {
        let rawCategory = normalize(row["Category"]);
        let categoryId = categoryMap[rawCategory];

        // If no exact match → fuzzy match
        if (!categoryId && rawCategory) {
          const { bestMatch } = stringSimilarity.findBestMatch(
            row["Category"],
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
              console.log(
                `Auto-corrected category "${row["Category"]}" → "${bestMatch.target}"`
              );
            }
          }
        }

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
          badge: row["Badge"] || "",
          rating: row["Rating"] ? Number(row["Rating"]) : 0,
          reviews: row["Reviews"] ? Number(row["Reviews"]) : 0,
        };
      });

      const { error } = await supabase.from("products").upsert(productsToInsert, {
        onConflict: "id",
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

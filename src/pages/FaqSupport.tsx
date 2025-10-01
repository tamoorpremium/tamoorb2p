// src/pages/FaqSupport.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

type Faq = {
  id: number;
  category: string;
  subcategory: string;
  question: string;
  answer: string;
  tags: string[];
  updated_at?: string;
};

const FaqSupport: React.FC = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<Faq[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("All");
  const [openFaqs, setOpenFaqs] = useState<number[]>([]);

  const fetchFaqs = async () => {
    const { data, error } = await supabase.from("faqs").select("*").order("id");
    if (error) console.error(error);
    else {
      setFaqs(data);
      setFilteredFaqs(data);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const categories = ["All", ...Array.from(new Set(faqs.map((f) => f.category || "Others")))];
  const subcategories = ["All", ...Array.from(new Set(faqs.map((f) => f.subcategory || "Others")))];

  useEffect(() => {
    let result = faqs;
    if (selectedCategory !== "All") result = result.filter((f) => f.category === selectedCategory);
    if (selectedSubcategory !== "All") result = result.filter((f) => f.subcategory === selectedSubcategory);
    if (search.trim()) {
      result = result.filter(
        (f) =>
          f.question.toLowerCase().includes(search.toLowerCase()) ||
          f.answer.toLowerCase().includes(search.toLowerCase()) ||
          f.tags?.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }
    setFilteredFaqs(result);
  }, [search, selectedCategory, selectedSubcategory, faqs]);

  const groupedFaqs = filteredFaqs.reduce((acc: Record<string, Faq[]>, faq) => {
    const key = faq.category || "Others";
    if (!acc[key]) acc[key] = [];
    acc[key].push(faq);
    return acc;
  }, {});

  const toggleFaq = (id: number) => {
    setOpenFaqs((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-yellow-500 text-center md:text-left">
          FAQ & Support
        </h1>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row md:space-x-4 mb-6 space-y-3 md:space-y-0">
          <input
            type="text"
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-3 rounded-lg bg-gray-800 border border-gray-800 placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-3 rounded-lg bg-gray-800 border border-gray-800"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            className="p-3 rounded-lg bg-gray-800 border border-gray-800"
          >
            {subcategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        {/* FAQ Accordion */}
        {Object.entries(groupedFaqs).map(([category, faqsInCategory]) => (
          <div key={category} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-yellow-400">{category}</h2>
            <div className="space-y-3">
              {faqsInCategory.map((faq) => {
                const isOpen = openFaqs.includes(faq.id);
                return (
                  <div
                    key={faq.id}
                    className={`backdrop-blur-md bg-gray-800/70 rounded-2xl shadow-lg border transition-all 
                    ${isOpen ? "border-yellow-500" : "border-gray-700"}`}
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full text-left px-4 py-4 font-medium text-white flex justify-between 
                      items-center focus:outline-none text-lg"
                    >
                      {faq.question}
                      <span
                        className={`ml-2 text-2xl transition-transform ${
                          isOpen ? "rotate-180 text-yellow-500" : "text-yellow-400"
                        }`}
                      >
                        ▼
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-4 py-3 text-gray-300 border-t border-gray-700">
                        <p>{faq.answer}</p>
                        {faq.updated_at && (
                          <p className="text-xs text-gray-500 mt-2">
                            Last updated: {new Date(faq.updated_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Support Section */}
        <div className="mt-12 backdrop-blur-md bg-gray-800/70 p-6 rounded-2xl shadow-xl border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-yellow-400">Need More Help?</h2>
          <p className="text-gray-300 mb-3">
            If you can’t find an answer here, contact our support team:
          </p>
          <ul className="space-y-2 text-gray-300">
            <li>
              📧 Email:{" "}
              <a href="mailto:support@tamoor.in" className="text-yellow-500 underline">
                support@tamoor.in
              </a>
            </li>
            <li>📱 Phone/WhatsApp: +91 9900 999786 </li>
            <li>💬 Live Chat: Available on our website</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FaqSupport;

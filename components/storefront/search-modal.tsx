"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Re-use dummy products for search results
const PRODUCTS = [
  { id: "1", slug: "classic-white-tee", title: "Classic White Tee", price: 45, category: "Clothing", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=200&auto=format&fit=crop" },
  { id: "2", slug: "raw-denim-jacket", title: "Raw Denim Jacket", price: 180, category: "Outerwear", image: "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?q=80&w=200&auto=format&fit=crop" },
  { id: "3", slug: "linen-summer-shirt", title: "Linen Summer Shirt", price: 85, category: "Clothing", image: "https://images.unsplash.com/photo-1596755094514-f87e32f85e23?q=80&w=200&auto=format&fit=crop" },
];

export function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsSearching(true);
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = debouncedQuery 
    ? PRODUCTS.filter(p => p.title.toLowerCase().includes(debouncedQuery.toLowerCase()) || p.category.toLowerCase().includes(debouncedQuery.toLowerCase()))
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 md:pt-32 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden z-10"
          >
            <div className="flex items-center px-6 py-4 border-b border-gray-100">
              <Search className="h-5 w-5 text-gray-400 shrink-0" />
              <input 
                autoFocus
                type="text" 
                placeholder="Search products, categories..." 
                className="w-full bg-transparent border-none px-4 text-lg text-foreground focus:outline-none focus:ring-0 placeholder:text-gray-300"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button 
                onClick={onClose}
                className="p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-foreground transition-colors shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4">
              {query === "" ? (
                <div className="px-2 py-8 text-center">
                  <p className="text-foreground-secondary text-sm">Popular Searches</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {["T-Shirts", "Jackets", "Summer Collection", "Accessories"].map(term => (
                      <button 
                        key={term}
                        onClick={() => setQuery(term)}
                        className="px-4 py-2 rounded-full border border-gray-200 text-sm text-foreground hover:border-accent hover:text-accent transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : isSearching ? (
                <div className="py-12 flex justify-center">
                  <div className="h-6 w-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              ) : results.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <p className="px-2 text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-2">Products</p>
                  {results.map((product) => (
                    <Link 
                      href={`/products/${product.slug}`} 
                      key={product.id}
                      onClick={onClose}
                      className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="relative h-16 w-16 overflow-hidden rounded-md bg-gray-100 shrink-0">
                        <Image src={product.image} alt={product.title} fill className="object-cover" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="font-medium text-foreground group-hover:text-accent transition-colors">{product.title}</span>
                        <span className="text-xs text-foreground-secondary">{product.category}</span>
                      </div>
                      <div className="flex items-center gap-4 text-foreground-secondary group-hover:text-foreground">
                        <span className="font-medium text-sm">${product.price}</span>
                        <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </div>
                    </Link>
                  ))}
                  
                  <Link 
                    href={`/products?q=${query}`}
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 p-4 mt-2 text-sm font-medium text-accent hover:underline"
                  >
                    View all results for "{query}"
                  </Link>
                </div>
              ) : (
                <div className="py-12 text-center flex flex-col items-center">
                  <Search className="h-10 w-10 text-gray-200 mb-4" />
                  <p className="text-foreground font-medium">No results found for "{query}"</p>
                  <p className="text-foreground-secondary text-sm mt-1">Try checking for typos or using different keywords.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/storefront/product-card";
import { Filter, ChevronDown, Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  slug: string;
  title: string;
  price: number;
  sale_price?: number;
  primaryImage: string;
  secondaryImage?: string;
  category?: string;
  category_id?: string;
  created_at?: string;
};

type Category = { id: string; name: string; slug: string };

function ProductsContent() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOption, setSortOption] = useState("Recommended");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Load categories from DB
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("name");
      setCategories(data ?? []);
    };
    fetchCategories();
  }, []);

  // Set category from URL param
  useEffect(() => {
    if (!urlCategory || categories.length === 0) {
      if (!urlCategory) { setSelectedCategory("All"); setSelectedCategoryId(null); }
      return;
    }
    const match = categories.find(
      c => c.slug.toLowerCase() === urlCategory.toLowerCase() || c.name.toLowerCase() === urlCategory.toLowerCase()
    );
    if (match) {
      setSelectedCategory(match.name);
      setSelectedCategoryId(match.id);
    } else {
      setSelectedCategory("All");
      setSelectedCategoryId(null);
    }
  }, [urlCategory, categories]);

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      let query = supabase
        .from("products")
        .select("id, title, slug, price, sale_price, category_id, created_at, product_images(image_url, sort_order)")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (selectedCategoryId) {
        query = query.eq("category_id", selectedCategoryId);
      }

      const { data, error } = await query;

      if (error) { console.error("Error fetching products:", error); setLoading(false); return; }

      const mapped: Product[] = (data ?? []).map((p: any) => {
        const images: { image_url: string; sort_order: number }[] =
          (p.product_images ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order);
        return {
          id: p.id,
          slug: p.slug,
          title: p.title,
          price: Number(p.price),
          sale_price: p.sale_price ? Number(p.sale_price) : undefined,
          primaryImage: images[0]?.image_url ?? "",
          secondaryImage: images[1]?.image_url,
          category_id: p.category_id,
          created_at: p.created_at,
        };
      });

      setProducts(mapped);
      setLoading(false);
    };

    fetchProducts();
  }, [selectedCategoryId]);

  const getActivePrice = (p: Product) => p.sale_price ?? p.price;

  const sortedProducts = [...products].sort((a, b) => {
    if (sortOption === "Price: Low to High") return getActivePrice(a) - getActivePrice(b);
    if (sortOption === "Price: High to Low") return getActivePrice(b) - getActivePrice(a);
    if (sortOption === "Newest") return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
    return 0;
  });

  const allCategories = [{ id: "", name: "All", slug: "all" }, ...categories];

  return (
    <div className="mx-auto max-w-[1440px] px-6 md:px-16 py-12">
      <div className="flex flex-col gap-8 md:gap-12">
        {/* Page Header */}
        <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto mb-6">
          <h1 className="font-serif text-3xl md:text-5xl font-light uppercase tracking-[0.2em] text-foreground mb-4">
            {selectedCategory === "All" ? "All Products" : selectedCategory}
          </h1>
          <p className="text-foreground-secondary text-[11px] font-sans tracking-widest uppercase">
            Explore our complete collection of premium essentials.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center py-4 border-y border-card-border sticky top-[65px] z-30 bg-background/95 backdrop-blur-sm transition-all duration-300">
          <button
            className="md:hidden flex items-center gap-2 text-[10px] font-sans uppercase tracking-widest text-foreground"
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          >
            <Filter className="h-3.5 w-3.5" /> Filters
          </button>

          <div className="hidden md:flex items-center gap-2 text-[10px] font-sans uppercase tracking-widest text-foreground-secondary">
            {loading ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              <span>Showing {sortedProducts.length} Result{sortedProducts.length !== 1 ? "s" : ""}</span>
            )}
          </div>

          <div className="relative">
            <button
              className="flex items-center gap-2 text-[10px] font-sans uppercase tracking-widest text-foreground"
              onClick={() => setSortOpen(!sortOpen)}
            >
              Sort by: {sortOption} <ChevronDown className={`h-3.5 w-3.5 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-52 border border-card-border py-2 z-40 bg-background shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                >
                  {["Recommended", "Price: Low to High", "Price: High to Low", "Newest"].map(opt => (
                    <button
                      key={opt}
                      onClick={() => { setSortOption(opt); setSortOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-[10px] font-sans uppercase tracking-widest hover:bg-background-secondary flex items-center justify-between text-foreground"
                    >
                      {opt}
                      {sortOption === opt && <Check className="h-3.5 w-3.5 text-accent" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex gap-16">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-56 shrink-0">
            <div className="sticky top-[160px] flex flex-col gap-8">
              <div>
                <h3 className="font-semibold text-foreground mb-4 uppercase text-[10px] tracking-[0.25em]">Category</h3>
                <ul className="flex flex-col gap-3">
                  {allCategories.map(cat => (
                    <li key={cat.id || "all"}>
                      <button
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          setSelectedCategoryId(cat.id || null);
                        }}
                        className={`text-[10px] font-sans uppercase tracking-widest transition-colors hover:text-foreground text-left ${
                          selectedCategory === cat.name ? "text-accent font-semibold" : "text-foreground-secondary"
                        }`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Mobile filter overlay */}
          <AnimatePresence>
            {isMobileFiltersOpen && (
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.25 }}
                className="fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-card-border p-8 flex flex-col gap-8 overflow-y-auto"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground uppercase text-[10px] tracking-[0.25em]">Filters</h3>
                  <button onClick={() => setIsMobileFiltersOpen(false)} className="text-foreground-secondary hover:text-foreground">✕</button>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-4 uppercase text-[10px] tracking-[0.25em]">Category</h4>
                  <ul className="flex flex-col gap-3">
                    {allCategories.map(cat => (
                      <li key={cat.id || "all"}>
                        <button
                          onClick={() => {
                            setSelectedCategory(cat.name);
                            setSelectedCategoryId(cat.id || null);
                            setIsMobileFiltersOpen(false);
                          }}
                          className={`text-[10px] font-sans uppercase tracking-widest transition-colors hover:text-foreground text-left ${
                            selectedCategory === cat.name ? "text-accent font-semibold" : "text-foreground-secondary"
                          }`}
                        >
                          {cat.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-16">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-4">
                    <div className="aspect-[3/4] bg-background-secondary animate-pulse" />
                    <div className="h-4 w-3/4 bg-background-secondary animate-pulse" />
                    <div className="h-3 w-1/3 bg-background-secondary animate-pulse" />
                  </div>
                ))}
              </div>
            ) : sortedProducts.length > 0 ? (
              <motion.div
                key={`${selectedCategory}-${sortOption}`}
                className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-16"
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
              >
                {sortedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-card-border gap-4">
                <ShoppingBag className="h-10 w-10 text-foreground-secondary/30" />
                <div>
                  <h3 className="font-serif text-xl font-medium text-foreground mb-2">No products found</h3>
                  <p className="text-foreground-secondary text-xs">
                    {selectedCategory === "All"
                      ? "No active products in the store yet."
                      : `No products in the "${selectedCategory}" category yet.`}
                  </p>
                </div>
                {selectedCategory !== "All" && (
                  <Button variant="outline" onClick={() => { setSelectedCategory("All"); setSelectedCategoryId(null); }}>
                    View All Products
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-[1440px] px-6 md:px-16 py-32">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="aspect-[3/4] bg-background-secondary animate-pulse" />
              <div className="h-4 w-3/4 bg-background-secondary animate-pulse" />
              <div className="h-3 w-1/3 bg-background-secondary animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}

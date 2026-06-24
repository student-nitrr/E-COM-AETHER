import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/product-card";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default async function Home() {
  // Fetch actual categories from Supabase
  const { data: dbCategories } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(4);

  // Fetch newest active products with their images
  const { data: dbProducts } = await supabase
    .from('products')
    .select('id, title, slug, price, sale_price, product_images(image_url, sort_order)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(4);

  const newArrivals = (dbProducts ?? []).map((p: any) => {
    const imgs = (p.product_images ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order);
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      price: Number(p.price),
      sale_price: p.sale_price ? Number(p.sale_price) : undefined,
      primaryImage: imgs[0]?.image_url ?? "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=800&auto=format&fit=crop",
      secondaryImage: imgs[1]?.image_url,
    };
  });

  const categoriesToDisplay = dbCategories && dbCategories.length > 0 ? dbCategories : [];


  return (
    <div className="flex flex-col w-full pb-16">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] w-full bg-gray-950 flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2000&auto=format&fit=crop"
          alt="Hero background"
          fill
          className="object-cover opacity-50 scale-105 hover:scale-100 transition-transform duration-[4000ms] ease-out"
          priority
        />
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-3xl">
          <h1 className="text-white font-serif text-4xl md:text-6xl font-light uppercase tracking-[0.2em] leading-tight mb-6">
            Elevate Your Everyday
          </h1>
          <p className="text-white/80 font-sans text-xs uppercase tracking-[0.2em] mb-10 max-w-md">
            Discover our new collection of premium essentials designed for modern living.
          </p>
          <Link href="/products?category=new">
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black transition-colors px-10 !h-12 text-[10px]">
              SHOP NEW ARRIVALS
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-28 px-6 md:px-16 mx-auto max-w-[1440px] w-full">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="font-serif text-2xl uppercase tracking-[0.25em] text-foreground">Featured Categories</h2>
          <div className="h-0.5 w-12 bg-accent mt-4"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {categoriesToDisplay.length > 0 ? categoriesToDisplay.map((cat) => (
            <Link key={cat.id} href={`/products?category=${cat.slug}`} className="group flex flex-col gap-4">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-background-secondary border border-card-border/10">
                {cat.image_url ? (
                  <img 
                    src={cat.image_url} 
                    alt={cat.name} 
                    className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-foreground-secondary text-xs uppercase tracking-widest">
                    No Image
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
              </div>
              <div className="flex justify-between items-center px-1">
                <h3 className="font-serif text-base font-medium tracking-wide text-foreground">{cat.name}</h3>
                <span className="text-[9px] font-sans font-medium uppercase tracking-[0.2em] text-accent group-hover:text-foreground transition-colors">
                  Explore &rarr;
                </span>
              </div>
            </Link>
          )) : (
            <div className="col-span-full py-16 text-center text-foreground-secondary border border-card-border bg-background-secondary rounded-none">
              <span className="text-xs uppercase tracking-widest">No categories found in registry.</span>
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-24 px-6 md:px-16 mx-auto max-w-[1440px] w-full border-t border-card-border/50">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="font-serif text-2xl uppercase tracking-[0.25em] text-foreground">New Arrivals</h2>
          <p className="text-foreground-secondary text-[10px] uppercase tracking-widest mt-3">The latest additions to our curated collection.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {newArrivals.length > 0 ? (
            newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-foreground-secondary border border-card-border bg-background-secondary">
              <span className="text-xs uppercase tracking-widest">No products available yet.</span>
            </div>
          )}
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="py-24 w-full bg-background-secondary border-y border-card-border/50">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-serif text-2xl uppercase tracking-[0.2em] text-foreground mb-4">Join The Club</h2>
          <p className="text-foreground-secondary text-xs uppercase tracking-widest mb-8 max-w-md mx-auto">
            Subscribe to our newsletter for exclusive collections, campaign releases, and private member events.
          </p>
          <form className="flex flex-col sm:flex-row gap-0 mt-4 border border-foreground/20 rounded-none bg-background focus-within:border-foreground transition-colors duration-300 overflow-hidden max-w-md mx-auto" suppressHydrationWarning>
            <input
              type="email"
              placeholder="ENTER EMAIL ADDRESS"
              className="flex-1 bg-transparent px-4 py-3 text-[10px] tracking-widest focus:outline-none"
              required
            />
            <Button variant="primary" size="lg" className="w-full sm:w-auto shrink-0 !h-12 border-none rounded-none text-[10px] tracking-widest px-8">
              SUBSCRIBE
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}

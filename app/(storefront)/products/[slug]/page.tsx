"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Star, ChevronRight, Truck, RefreshCw, Shield } from "lucide-react";
import Link from "next/link";
import { use } from "react";

// Placeholder data
const PRODUCT = {
  id: "1",
  slug: "classic-white-tee",
  title: "Classic White Tee",
  price: 45,
  description: "The perfect everyday t-shirt. Crafted from mid-weight organic cotton, it features a relaxed fit and a classic ribbed crew neckline. Durable, soft, and designed to get better with every wash.",
  images: [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop"
  ],
  sizes: ["S", "M", "L", "XL"],
  colors: ["White", "Black", "Navy"],
};

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { addItem } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("White");
  const [quantity, setQuantity] = useState(1);

  // In a real app, we'd fetch product based on resolvedParams.slug
  const product = PRODUCT;

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity,
      image: product.images[0],
      variant: `Size: ${selectedSize}, Color: ${selectedColor}`,
    });
  };

  return (
    <div className="mx-auto max-w-[1440px] px-6 md:px-16 py-12 md:py-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-foreground-secondary/70 mb-12">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/products" className="hover:text-foreground transition-colors">Clothing</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground/90 font-semibold">{product.title}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
        {/* Product Images */}
        <div className="lg:w-1/2 flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-3 overflow-x-auto md:w-20 shrink-0 scrollbar-hide">
            {product.images.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveImage(idx)}
                className={`relative aspect-[3/4] w-16 md:w-full overflow-hidden rounded-none bg-background-secondary border transition-colors ${activeImage === idx ? 'border-foreground' : 'border-card-border/40'}`}
              >
                <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover animate-fade-in" sizes="80px" />
              </button>
            ))}
          </div>
          <div className="relative aspect-[3/4] flex-1 overflow-hidden rounded-none bg-background-secondary border border-card-border/10 group cursor-crosshair">
            <Image 
              src={product.images[activeImage]} 
              alt={product.title} 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-110" 
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:w-1/2 flex flex-col pt-2">
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-light uppercase tracking-[0.15em] text-foreground mb-4 leading-tight">{product.title}</h1>
            <div className="flex items-center gap-6 mb-6">
              <span className="text-xl font-sans font-medium text-accent tracking-widest">{formatCurrency(product.price)}</span>
              <div className="flex items-center gap-0.5 text-accent">
                <Star className="h-3.5 w-3.5 fill-current" />
                <Star className="h-3.5 w-3.5 fill-current" />
                <Star className="h-3.5 w-3.5 fill-current" />
                <Star className="h-3.5 w-3.5 fill-current" />
                <Star className="h-3.5 w-3.5 fill-current opacity-30" />
                <span className="text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-foreground-secondary/80 ml-3">(124 REVIEWS)</span>
              </div>
            </div>
            <p className="text-foreground-secondary font-sans text-xs leading-relaxed max-w-lg">
              {product.description}
            </p>
          </div>

          <div className="h-px w-full bg-card-border/40 my-8" />

          {/* Variants */}
          <div className="flex flex-col gap-8 mb-10">
            {/* Color */}
            <div>
              <div className="flex justify-between mb-4">
                <span className="font-sans font-medium text-foreground text-[10px] uppercase tracking-[0.25em]">Color: <span className="text-foreground-secondary ml-1">{selectedColor}</span></span>
              </div>
              <div className="flex gap-4">
                {product.colors.map(color => (
                  <button 
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`h-8 w-8 rounded-full border border-card-border/40 transition-all flex items-center justify-center ${selectedColor === color ? 'ring-1 ring-offset-2 ring-foreground scale-95' : 'hover:scale-95'}`}
                    style={{ backgroundColor: color.toLowerCase() === 'white' ? '#FCFCFB' : color.toLowerCase() === 'navy' ? '#1A2942' : color.toLowerCase() }}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <div className="flex justify-between mb-4">
                <span className="font-sans font-medium text-foreground text-[10px] uppercase tracking-[0.25em]">Size: <span className="text-foreground-secondary ml-1">{selectedSize}</span></span>
                <button className="text-[10px] font-sans uppercase tracking-widest text-foreground-secondary/70 hover:text-foreground underline">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-11 w-16 rounded-none border text-[10px] font-sans tracking-widest transition-all duration-300 flex items-center justify-center ${selectedSize === size ? 'border-foreground bg-foreground text-background' : 'border-card-border text-foreground hover:border-foreground'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Add to Cart Action */}
          <div className="flex gap-4 mb-10">
            <div className="flex items-center border border-card-border rounded-none shrink-0 h-13 bg-background">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 h-full text-foreground-secondary hover:text-foreground transition-colors text-xs">-</button>
              <span className="w-6 text-center font-sans text-xs font-semibold">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-4 h-full text-foreground-secondary hover:text-foreground transition-colors text-xs">+</button>
            </div>
            <Button variant="primary" size="lg" className="flex-1 h-13 text-xs tracking-[0.2em] font-sans font-semibold uppercase rounded-none" onClick={handleAddToCart}>
              ADD TO BAG - {formatCurrency(product.price * quantity)}
            </Button>
          </div>

          {/* Luxury Accordion Details */}
          <div className="border-t border-card-border/50 mt-4">
            {["Product details", "Materials & Care", "Shipping & Returns"].map((section) => (
              <div key={section} className="border-b border-card-border/50 py-4 flex justify-between items-center group cursor-pointer">
                <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-foreground/80 group-hover:text-foreground transition-colors">{section}</span>
                <span className="text-[10px] font-sans text-foreground-secondary group-hover:text-foreground transition-colors">+</span>
              </div>
            ))}
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-card-border/30 pt-10 mt-8">
            <div className="flex flex-col gap-1 items-center text-center">
              <Truck className="h-4 w-4 text-foreground/80" />
              <span className="text-[9px] font-sans uppercase tracking-widest text-foreground mt-2">Free Delivery</span>
            </div>
            <div className="flex flex-col gap-1 items-center text-center">
              <RefreshCw className="h-4 w-4 text-foreground/80" />
              <span className="text-[9px] font-sans uppercase tracking-widest text-foreground mt-2">Complimentary returns</span>
            </div>
            <div className="flex flex-col gap-1 items-center text-center">
              <Shield className="h-4 w-4 text-foreground/80" />
              <span className="text-[9px] font-sans uppercase tracking-widest text-foreground mt-2">Lifetime warranty</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

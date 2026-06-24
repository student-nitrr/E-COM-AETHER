"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "../ui/button";
import { formatCurrency } from "@/lib/utils";

import { useCart } from "@/lib/cart-context";

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    title: string;
    price: number;
    sale_price?: number;
    primaryImage: string;
    secondaryImage?: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCart();

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      productId: product.id,
      title: product.title,
      price: product.sale_price || product.price,
      quantity: 1,
      image: product.primaryImage,
    });
  };

  return (
    <motion.div
      className="group relative flex flex-col gap-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <Link href={`/products/${product.slug}`} className="block relative aspect-[3/4] w-full overflow-hidden rounded-none bg-background-secondary border border-card-border/10">
        <div
          className="absolute inset-0 h-full w-full transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
        >
          <Image
            src={product.primaryImage}
            alt={product.title}
            fill
            className={`object-cover transition-opacity duration-700 ${isHovered && product.secondaryImage ? "opacity-0" : "opacity-100"}`}
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          {product.secondaryImage && (
            <Image
              src={product.secondaryImage}
              alt={`${product.title} lifestyle`}
              fill
              className={`object-cover transition-opacity duration-700 ${isHovered ? "opacity-100" : "opacity-0"}`}
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          )}
        </div>
        
        <div className="absolute bottom-0 left-0 w-full overflow-hidden z-20">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: isHovered ? 0 : 50, opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Button variant="primary" className="w-full !h-11 bg-foreground text-background hover:bg-accent hover:text-foreground border-none rounded-none text-[9px] tracking-[0.2em] font-sans font-medium" onClick={handleQuickAdd}>
              QUICK ADD
            </Button>
          </motion.div>
        </div>
      </Link>
 
      <div className="flex flex-col gap-1.5 px-1">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-serif text-sm font-medium tracking-wide text-foreground transition-colors hover:text-accent">{product.title}</h3>
        </Link>
        <div className="flex items-center gap-2 text-xs font-sans tracking-widest uppercase">
          {product.sale_price ? (
            <>
              <span className="font-semibold text-accent">{formatCurrency(product.sale_price)}</span>
              <span className="text-foreground-secondary line-through text-[10px] opacity-60">{formatCurrency(product.price)}</span>
            </>
          ) : (
            <span className="text-foreground-secondary font-medium">{formatCurrency(product.price)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

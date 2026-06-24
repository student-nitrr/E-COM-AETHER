"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import Link from "next/link";

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, cartTotal } = useCart();

  const onClose = () => setIsCartOpen(false);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background border-l border-card-border shadow-[0_0_24px_rgba(0,0,0,0.03)]"
          >
            <div className="flex items-center justify-between border-b border-card-border/60 p-6">
              <h2 className="font-serif text-lg font-light uppercase tracking-[0.2em] text-foreground flex items-center gap-3">
                <ShoppingBag className="h-4 w-4" /> SHOPPING BAG
              </h2>
              <button
                onClick={onClose}
                className="p-2 transition-colors hover:bg-background-secondary text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {items.length > 0 ? (
                <div className="flex flex-col gap-8">
                  {items.map((item) => (
                    <motion.div 
                      key={item.id} 
                      className="flex gap-4"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="relative h-24 w-18 overflow-hidden rounded-none bg-background-secondary border border-card-border/10 shrink-0">
                        <Image src={item.image} alt={item.title} fill className="object-cover animate-fade-in" sizes="80px" />
                      </div>
                      <div className="flex flex-1 flex-col justify-between py-0.5">
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-serif text-xs font-semibold uppercase tracking-wider text-foreground leading-tight">{item.title}</h3>
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="text-foreground-secondary hover:text-foreground transition-colors shrink-0"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {item.variant && <p className="text-[10px] font-sans uppercase tracking-widest text-foreground-secondary/85">{item.variant}</p>}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-card-border rounded-none bg-background">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-0.5 text-xs text-foreground-secondary hover:text-foreground"
                            >-</button>
                            <span className="px-2 text-xs font-semibold w-6 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-0.5 text-xs text-foreground-secondary hover:text-foreground"
                            >+</button>
                          </div>
                          <p className="text-xs font-sans tracking-widest text-foreground">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center py-12">
                  <ShoppingBag className="h-10 w-10 text-foreground-secondary/40 stroke-[1.25]" />
                  <p className="text-foreground-secondary text-xs uppercase tracking-[0.15em] mt-2">Your shopping bag is empty.</p>
                  <Button variant="outline" onClick={onClose} className="mt-4 px-8 text-[10px]">
                    CONTINUE SHOPPING
                  </Button>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-card-border/80 p-6 bg-background-secondary">
                <div className="flex justify-between mb-4">
                  <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-foreground-secondary">Subtotal</span>
                  <span className="text-xs font-sans tracking-widest text-foreground">{formatCurrency(cartTotal)}</span>
                </div>
                <p className="text-[9px] font-sans uppercase tracking-widest text-foreground-secondary/70 mb-6 text-center">
                  Shipping and taxes calculated at checkout.
                </p>
                <Link href="/checkout" className="block w-full">
                  <Button variant="primary" className="w-full !h-12 text-[10px] rounded-none tracking-[0.2em] font-sans font-semibold uppercase" onClick={onClose}>
                    PROCEED TO CHECKOUT
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

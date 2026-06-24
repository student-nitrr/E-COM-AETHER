"use client";

import Link from "next/link";
import { useSettings } from "@/lib/settings-context";

export function Footer() {
  const { settings } = useSettings();
  return (
    <footer className="bg-background-secondary pt-24 pb-12 border-t border-card-border">
      <div className="mx-auto max-w-[1440px] px-6 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="flex flex-col gap-6">
            <Link href="/" className="font-serif text-xl font-bold tracking-[0.25em] text-foreground flex items-center gap-2 uppercase">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt={settings.site_name} className="h-8 w-auto object-contain" />
              ) : (
                settings.site_name
              )}
            </Link>
            <p className="text-foreground-secondary text-[11px] font-sans leading-relaxed max-w-xs">
              Premium clothing and accessories crafted with uncompromising quality, clean geometric styling, and sustainable materials.
            </p>
            <div className="flex gap-4 text-foreground-secondary">
              <span className="text-[10px] uppercase tracking-widest">Follow us on social media</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <h4 className="font-sans font-medium text-foreground uppercase tracking-[0.2em] text-[10px] mb-4">Shop</h4>
            <Link href="/products?category=new" className="text-[10px] font-sans uppercase tracking-widest text-foreground-secondary hover:text-foreground transition-colors">New Arrivals</Link>
            <Link href="/products?category=best-sellers" className="text-[10px] font-sans uppercase tracking-widest text-foreground-secondary hover:text-foreground transition-colors">Best Sellers</Link>
            <Link href="/products?category=clothing" className="text-[10px] font-sans uppercase tracking-widest text-foreground-secondary hover:text-foreground transition-colors">Clothing</Link>
            <Link href="/products?category=accessories" className="text-[10px] font-sans uppercase tracking-widest text-foreground-secondary hover:text-foreground transition-colors">Accessories</Link>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-sans font-medium text-foreground uppercase tracking-[0.2em] text-[10px] mb-4">Help</h4>
            <Link href="/faq" className="text-[10px] font-sans uppercase tracking-widest text-foreground-secondary hover:text-foreground transition-colors">FAQ</Link>
            <Link href="/policies/shipping" className="text-[10px] font-sans uppercase tracking-widest text-foreground-secondary hover:text-foreground transition-colors">Shipping & Returns</Link>
            <Link href="/contact" className="text-[10px] font-sans uppercase tracking-widest text-foreground-secondary hover:text-foreground transition-colors">Contact Us</Link>
            <Link href="/track-order" className="text-[10px] font-sans uppercase tracking-widest text-foreground-secondary hover:text-foreground transition-colors">Track Order</Link>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-sans font-medium text-foreground uppercase tracking-[0.2em] text-[10px] mb-4">Newsletter</h4>
            <p className="text-foreground-secondary text-[11px] font-sans leading-relaxed">Subscribe to receive updates, access to exclusive deals, and collections updates.</p>
            <form className="flex mt-2 border border-foreground/20 rounded-none bg-background focus-within:border-foreground transition-colors duration-300 overflow-hidden" suppressHydrationWarning>
              <input 
                type="email" 
                placeholder="ENTER EMAIL" 
                className="w-full bg-transparent px-3 py-2 text-[10px] tracking-widest focus:outline-none"
                suppressHydrationWarning
              />
              <button 
                className="bg-foreground text-background px-4 py-2 text-[10px] font-sans font-medium uppercase tracking-widest hover:bg-accent hover:text-foreground transition-all duration-300 whitespace-nowrap"
                suppressHydrationWarning
              >
                SUBMIT
              </button>
            </form>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-card-border gap-4 text-[9px] font-sans uppercase tracking-widest text-foreground-secondary">
          <p>© {new Date().getFullYear()} {settings.site_name}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/policies/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/policies/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

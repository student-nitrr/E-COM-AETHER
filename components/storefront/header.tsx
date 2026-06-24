"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ShoppingBag, Search, Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import { CartDrawer } from "./cart-drawer";
import { SearchModal } from "./search-modal";
import { useCart } from "@/lib/cart-context";
import { useSettings } from "@/lib/settings-context";
import { supabase } from "@/lib/supabase";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { cartCount, setIsCartOpen } = useCart();
  const { settings } = useSettings();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch current session and listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setUserMenuOpen(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#user-menu-container")) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
  };

  const getDisplayName = () => {
    const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name;
    if (fullName) return fullName.split(" ")[0]; // first name only
    return user?.email?.split("@")[0] ?? "";
  };

  const getInitials = () => {
    const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name;
    if (fullName) {
      const parts = fullName.trim().split(" ");
      return parts.length > 1
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : parts[0][0].toUpperCase();
    }
    return (user?.email?.[0] ?? "U").toUpperCase();
  };

  const navLinks = [
    { name: "New Arrivals", href: "/products?category=new" },
    { name: "Best Sellers", href: "/products?category=best-sellers" },
    { name: "Clothing", href: "/products?category=clothing" },
    { name: "Accessories", href: "/products?category=accessories" },
  ];

  return (
    <>
      {settings.announcement_bar_active && settings.announcement_bar_text && (
        <div 
          className="h-[36px] text-white text-center text-[10px] font-sans font-medium uppercase tracking-[0.2em] flex items-center justify-center fixed top-0 left-0 right-0 z-50 transition-all duration-300"
          style={{ backgroundColor: settings.announcement_bar_color }}
        >
          {settings.announcement_bar_text}
        </div>
      )}

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className={`fixed left-0 right-0 z-40 transition-all duration-300 ${
          settings.announcement_bar_active && settings.announcement_bar_text ? "top-[36px]" : "top-0"
        } ${
          isScrolled
            ? "h-[65px] bg-background/95 backdrop-blur-md border-b border-card-border shadow-[0_1px_3px_rgba(0,0,0,0.01)]"
            : "h-[85px] bg-transparent border-b border-card-border/10"
        }`}
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 md:px-16">
          <button
            className="md:hidden p-2 -ml-2 text-foreground"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="font-serif text-xl font-bold tracking-[0.25em] text-foreground flex items-center gap-2 uppercase">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt={settings.site_name} className="h-8 w-auto object-contain" />
            ) : (
              settings.site_name
            )}
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-foreground/80 hover:text-foreground hover:border-b hover:border-foreground/50 transition-all pb-1"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-4 text-foreground">
            <button 
              className="p-2 hover:text-accent transition-colors hidden md:block"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
            </button>

            {/* User section */}
            {user ? (
              <div id="user-menu-container" className="relative hidden sm:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 hover:text-accent transition-colors group"
                  aria-label="Account menu"
                >
                  {/* Initials avatar */}
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background text-[9px] font-sans font-bold tracking-wider group-hover:bg-accent transition-colors">
                    {getInitials()}
                  </span>
                  <span className="hidden lg:block text-[10px] font-sans font-medium uppercase tracking-[0.15em] text-foreground group-hover:text-accent transition-colors max-w-[80px] truncate">
                    {getDisplayName()}
                  </span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
                      className="absolute right-0 top-full mt-3 w-52 bg-background border border-card-border shadow-[0_8px_30px_rgba(0,0,0,0.06)] z-50 overflow-hidden"
                    >
                      {/* Header strip */}
                      <div className="px-4 py-3 border-b border-card-border bg-background-secondary">
                        <p className="text-[9px] font-sans uppercase tracking-[0.2em] text-foreground-secondary">Signed in as</p>
                        <p className="text-[11px] font-sans font-semibold text-foreground truncate mt-0.5">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/account"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-[10px] font-sans uppercase tracking-[0.15em] text-foreground hover:bg-background-secondary hover:text-accent transition-colors"
                        >
                          <User className="h-3.5 w-3.5 shrink-0" />
                          My Account
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-sans uppercase tracking-[0.15em] text-foreground hover:bg-background-secondary hover:text-accent transition-colors border-t border-card-border/40"
                        >
                          <LogOut className="h-3.5 w-3.5 shrink-0" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/auth" className="p-2 hover:text-accent transition-colors hidden sm:flex items-center gap-1.5 group">
                <User className="h-4 w-4" />
                <span className="hidden lg:block text-[10px] font-sans uppercase tracking-[0.15em] group-hover:text-accent transition-colors">Sign In</span>
              </Link>
            )}

            <button 
              className="p-2 hover:text-accent transition-colors relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[8px] font-sans font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </motion.header>

      <CartDrawer />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white"
          >
            <div className="flex items-center justify-between px-6 h-[80px] border-b border-gray-100">
              <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-foreground flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                {settings.logo_url ? (
                  <img src={settings.logo_url} alt={settings.site_name} className="h-8 w-auto object-contain" />
                ) : (
                  settings.site_name
                )}
              </Link>
              <button className="p-2 -mr-2 text-foreground" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col px-6 pt-8 gap-6">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className="text-2xl font-medium text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: navLinks.length * 0.1 }}
                className="mt-8 flex flex-col gap-6 border-t border-gray-100 pt-8"
              >
                {user ? (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background text-[10px] font-bold">
                        {getInitials()}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{getDisplayName()}</p>
                        <p className="text-xs text-foreground-secondary">{user.email}</p>
                      </div>
                    </div>
                    <Link href="/account" className="flex items-center gap-3 text-lg font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>
                      <User className="h-5 w-5" /> My Account
                    </Link>
                    <button
                      onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 text-lg font-medium text-foreground text-left"
                    >
                      <LogOut className="h-5 w-5" /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link href="/auth" className="flex items-center gap-3 text-lg font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>
                    <User className="h-5 w-5" /> Sign In
                  </Link>
                )}
                <button className="flex items-center gap-3 text-lg font-medium text-foreground text-left" onClick={() => { setMobileMenuOpen(false); setSearchOpen(true); }}>
                  <Search className="h-5 w-5" /> Search
                </button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, MapPin, Heart, LogOut, Settings } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const navItems = [
    { name: "Dashboard", href: "/account", icon: User },
    { name: "Orders", href: "/account/orders", icon: Package },
    { name: "Addresses", href: "/account/addresses", icon: MapPin },
    { name: "Wishlist", href: "/account/wishlist", icon: Heart },
    { name: "Settings", href: "/account/settings", icon: Settings },
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-6 md:px-16 py-16">
      <h1 className="font-serif text-3xl font-light uppercase tracking-[0.2em] text-foreground mb-12">My Account</h1>
      
      <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
        {/* Mobile Tab Bar / Desktop Sidebar */}
        <aside className="md:w-60 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-none border border-card-border/10 transition-all whitespace-nowrap text-[10px] font-sans uppercase tracking-widest ${
                    isActive 
                      ? "bg-background-secondary text-foreground font-semibold border-l-2 border-l-foreground border border-card-border" 
                      : "text-foreground-secondary/70 hover:bg-background-secondary/50 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3.5 rounded-none border border-transparent text-destructive/80 hover:text-destructive hover:bg-red-50/50 transition-colors whitespace-nowrap text-left text-[10px] font-sans uppercase tracking-widest mt-2 md:mt-10"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </nav>
        </aside>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

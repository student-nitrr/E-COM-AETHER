"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut, Loader2, Users, Ticket, Image as ImageIcon, Globe } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      // Check role in profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push("/");
      } else {
        setLoading(false);
      }
    };
    checkAdmin();
  }, [router]);

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Categories", href: "/admin/categories", icon: Package },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Coupons", href: "/admin/coupons", icon: Ticket },
    { name: "Media", href: "/admin/media", icon: ImageIcon },
    { name: "SEO", href: "/admin/seo", icon: Globe },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>;
  }

  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* Sidebar */}
      <aside className="w-60 bg-[#0D0D0D] border-r border-card-border/10 hidden md:flex flex-col text-white">
        <div className="h-16 flex items-center px-6 border-b border-card-border/10 shrink-0">
          <Link href="/admin" className="font-serif text-base font-bold tracking-[0.2em] text-white uppercase">
            AETHER <span className="text-[10px] font-sans font-normal text-accent ml-1 uppercase tracking-widest">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-none transition-all text-[10px] uppercase font-sans tracking-widest ${
                  isActive 
                    ? "bg-[#1A1A1A] text-accent border-l-2 border-accent font-semibold" 
                    : "text-foreground-secondary/80 hover:bg-[#121212] hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-card-border/10 shrink-0">
          <button 
            onClick={async () => { await supabase.auth.signOut(); router.push("/auth"); }}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-none text-foreground-secondary/80 hover:bg-red-950/20 hover:text-destructive transition-colors text-[10px] uppercase font-sans tracking-widest text-left"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 bg-[#0D0D0D] border-b border-card-border/10 flex items-center justify-between px-6 md:hidden shrink-0 text-white">
          <Link href="/admin" className="font-serif text-base font-bold tracking-[0.2em] text-white uppercase">
            AETHER Admin
          </Link>
        </header>
        <div className="flex-1 overflow-auto p-6 lg:p-8 bg-background">
          {children}
        </div>
      </main>
    </div>
  );
}

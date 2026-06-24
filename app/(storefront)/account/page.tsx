"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { Package, MapPin, ShoppingBag, ArrowRight, CheckCircle2, Clock, Truck, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Order = {
  id: string;
  order_number: string;
  total: number;
  payment_status: string;
  fulfillment_status: string;
  created_at: string;
  order_items: { title: string; quantity: number }[];
};

type Address = {
  id: string;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  zip: string;
  country: string;
  phone?: string;
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:    { label: "Pending",    color: "bg-amber-50 border-amber-200 text-amber-700",  icon: <Clock className="h-3 w-3" /> },
  processing: { label: "Processing", color: "bg-blue-50 border-blue-200 text-blue-700",     icon: <Clock className="h-3 w-3" /> },
  shipped:    { label: "Shipped",    color: "bg-indigo-50 border-indigo-200 text-indigo-700", icon: <Truck className="h-3 w-3" /> },
  delivered:  { label: "Delivered",  color: "bg-green-50 border-green-200 text-green-700",  icon: <CheckCircle2 className="h-3 w-3" /> },
  cancelled:  { label: "Cancelled",  color: "bg-red-50 border-red-200 text-red-700",        icon: <XCircle className="h-3 w-3" /> },
};

export default function AccountDashboard() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) { setLoading(false); return; }

      // Fetch last 3 orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, order_number, total, payment_status, fulfillment_status, created_at, order_items(title, quantity)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      setOrders(ordersData ?? []);

      // Fetch default address
      const { data: addrData } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_default", true)
        .single();

      setDefaultAddress(addrData ?? null);
      setLoading(false);
    };
    fetchData();
  }, []);

  const getFirstName = () => {
    const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name;
    return fullName ? fullName.split(" ")[0] : user?.email?.split("@")[0] ?? "";
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner */}
      <div className="bg-background-secondary border border-card-border p-8">
        <h2 className="font-serif text-xl font-light uppercase tracking-[0.15em] text-foreground mb-2">
          Welcome back{user && `, ${getFirstName()}`}!
        </h2>
        <p className="text-foreground-secondary text-[10px] font-sans uppercase tracking-[0.15em] leading-relaxed">
          View your orders, manage your shipping addresses, and update your settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-background border border-card-border p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-4 border-b border-card-border/60">
            <div className="flex items-center gap-3 text-foreground text-[10px] font-sans font-semibold uppercase tracking-[0.2em]">
              <Package className="h-4 w-4" /> Recent Orders
            </div>
            {orders.length > 0 && (
              <Link href="/account/orders" className="text-[9px] font-sans uppercase tracking-widest text-accent hover:text-foreground transition-colors flex items-center gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-14 bg-background-secondary animate-pulse" />
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="flex flex-col divide-y divide-card-border/40">
              {orders.map(order => {
                const status = statusConfig[order.fulfillment_status] ?? statusConfig["pending"];
                return (
                  <Link key={order.id} href={`/account/orders`} className="flex items-center justify-between py-4 hover:bg-background-secondary/50 -mx-2 px-2 transition-colors group">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-foreground">
                        #{order.order_number}
                      </span>
                      <span className="text-[9px] font-sans uppercase tracking-widest text-foreground-secondary">
                        {formatDate(order.created_at)} · {order.order_items?.length ?? 0} item{(order.order_items?.length ?? 0) !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[11px] font-sans font-semibold text-foreground">
                        {formatCurrency(order.total)}
                      </span>
                      <span className={`flex items-center gap-1 text-[8px] font-sans font-semibold uppercase tracking-widest px-2 py-0.5 border ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <>
              <div className="flex-1 flex flex-col items-center justify-center py-10 gap-3 text-center">
                <ShoppingBag className="h-8 w-8 text-foreground-secondary/30" />
                <p className="text-foreground-secondary/70 text-[10px] font-sans uppercase tracking-widest">
                  You haven't placed any orders yet.
                </p>
              </div>
              <Link href="/products?category=new" className="mt-auto w-full">
                <Button variant="outline" className="w-full rounded-none text-[9px] tracking-widest uppercase">
                  Start Shopping
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Default Address */}
        <div className="bg-background border border-card-border p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-4 border-b border-card-border/60">
            <div className="flex items-center gap-3 text-foreground text-[10px] font-sans font-semibold uppercase tracking-[0.2em]">
              <MapPin className="h-4 w-4" /> Default Address
            </div>
            <Link href="/account/addresses" className="text-[9px] font-sans uppercase tracking-widest text-accent hover:text-foreground transition-colors flex items-center gap-1">
              Manage <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col gap-2">
              {[1,2,3].map(i => <div key={i} className="h-4 bg-background-secondary animate-pulse" />)}
            </div>
          ) : defaultAddress ? (
            <div className="flex-1 flex flex-col gap-1.5 py-2">
              <p className="text-[11px] font-sans font-semibold text-foreground uppercase tracking-wide">
                {defaultAddress.full_name}
              </p>
              <p className="text-[10px] font-sans text-foreground-secondary leading-relaxed">
                {defaultAddress.address_line1}
                {defaultAddress.address_line2 && `, ${defaultAddress.address_line2}`}
              </p>
              <p className="text-[10px] font-sans text-foreground-secondary">
                {defaultAddress.city}{defaultAddress.state ? `, ${defaultAddress.state}` : ""} – {defaultAddress.zip}
              </p>
              <p className="text-[10px] font-sans text-foreground-secondary uppercase tracking-wide">
                {defaultAddress.country}
              </p>
              {defaultAddress.phone && (
                <p className="text-[10px] font-sans text-foreground-secondary mt-1">
                  📞 {defaultAddress.phone}
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="flex-1 flex flex-col items-center justify-center py-10 gap-3 text-center">
                <MapPin className="h-8 w-8 text-foreground-secondary/30" />
                <p className="text-foreground-secondary/70 text-[10px] font-sans uppercase tracking-widest">
                  No default address set.
                </p>
              </div>
              <Link href="/account/addresses" className="mt-auto w-full">
                <Button variant="outline" className="w-full rounded-none text-[9px] tracking-widest uppercase">
                  Add Address
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

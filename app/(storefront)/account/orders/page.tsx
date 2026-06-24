"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { Package, ShoppingBag, CheckCircle2, Clock, Truck, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type OrderItem = { title: string; quantity: number; unit_price: number; line_total: number };
type Order = {
  id: string;
  order_number: string;
  total: number;
  subtotal: number;
  payment_status: string;
  fulfillment_status: string;
  created_at: string;
  order_items: OrderItem[];
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:    { label: "Pending",    color: "bg-amber-50 border-amber-200 text-amber-700",    icon: <Clock className="h-3 w-3" /> },
  processing: { label: "Processing", color: "bg-blue-50 border-blue-200 text-blue-700",       icon: <Clock className="h-3 w-3" /> },
  shipped:    { label: "Shipped",    color: "bg-indigo-50 border-indigo-200 text-indigo-700", icon: <Truck className="h-3 w-3" /> },
  delivered:  { label: "Delivered",  color: "bg-green-50 border-green-200 text-green-700",    icon: <CheckCircle2 className="h-3 w-3" /> },
  cancelled:  { label: "Cancelled",  color: "bg-red-50 border-red-200 text-red-700",          icon: <XCircle className="h-3 w-3" /> },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("orders")
        .select("id, order_number, total, subtotal, payment_status, fulfillment_status, created_at, order_items(title, quantity, unit_price, line_total)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setOrders(data ?? []);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-card-border pb-4">
        <h2 className="font-serif text-xl font-light uppercase tracking-[0.2em] text-foreground">Order History</h2>
        <p className="text-foreground-secondary text-[10px] font-sans uppercase tracking-widest mt-1">
          All your past and active orders.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-32 bg-background-secondary animate-pulse border border-card-border" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 border border-dashed border-card-border text-center">
          <ShoppingBag className="h-10 w-10 text-foreground-secondary/30" />
          <div>
            <p className="text-foreground text-sm font-serif mb-1">No orders yet</p>
            <p className="text-foreground-secondary text-[10px] font-sans uppercase tracking-widest">
              Once you place an order, it will appear here.
            </p>
          </div>
          <Link href="/products">
            <Button variant="outline" className="rounded-none text-[9px] tracking-widest uppercase mt-2">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map(order => {
            const fStatus = statusConfig[order.fulfillment_status] ?? statusConfig["pending"];
            const pStatus = order.payment_status === "paid"
              ? { label: "Paid", color: "text-green-700" }
              : order.payment_status === "pending"
              ? { label: "Awaiting Payment", color: "text-amber-700" }
              : { label: order.payment_status, color: "text-foreground-secondary" };

            return (
              <div key={order.id} className="border border-card-border bg-background">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 bg-background-secondary border-b border-card-border">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <Package className="h-3.5 w-3.5 text-foreground-secondary" />
                      <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-foreground">
                        Order #{order.order_number}
                      </span>
                    </div>
                    <span className="text-[9px] font-sans uppercase tracking-widest text-foreground-secondary ml-5">
                      Placed {formatDate(order.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1 text-[8px] font-sans font-bold uppercase tracking-widest px-2.5 py-1 border ${fStatus.color}`}>
                      {fStatus.icon} {fStatus.label}
                    </span>
                    <span className={`text-[9px] font-sans font-semibold uppercase tracking-widest ${pStatus.color}`}>
                      {pStatus.label}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-4 flex flex-col divide-y divide-card-border/30">
                  {order.order_items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-sans font-medium text-foreground uppercase tracking-wide">
                          {item.title}
                        </span>
                        <span className="text-[9px] font-sans text-foreground-secondary uppercase tracking-widest">
                          Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                        </span>
                      </div>
                      <span className="text-[10px] font-sans font-semibold text-foreground">
                        {formatCurrency(item.line_total)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="flex items-center justify-end gap-6 px-6 py-4 border-t border-card-border bg-background-secondary/50">
                  <span className="text-[9px] font-sans uppercase tracking-widest text-foreground-secondary">
                    Order Total
                  </span>
                  <span className="text-sm font-sans font-bold text-foreground tracking-wider">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

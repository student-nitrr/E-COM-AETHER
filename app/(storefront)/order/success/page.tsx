"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <>
      <CheckCircle2 className="h-16 w-16 text-accent mb-8 stroke-[1.25]" />
      <h1 className="font-serif text-3xl md:text-4xl font-light uppercase tracking-[0.2em] text-foreground mb-4">
        Thank you for your order!
      </h1>
      <p className="text-foreground-secondary text-[11px] font-sans uppercase tracking-[0.15em] mb-4">
        Your payment was successful and your order is being processed.
      </p>
      {orderId && (
        <p className="text-foreground text-[10px] font-sans uppercase tracking-widest mb-10 bg-background-secondary border border-card-border px-6 py-3 rounded-none inline-block">
          Order ID: {orderId}
        </p>
      )}
      
      <div className="flex gap-4 mt-4">
        <Link href="/account">
          <Button variant="outline" size="lg" className="rounded-none text-[10px] tracking-widest px-8">VIEW STATUS</Button>
        </Link>
        <Link href="/products">
          <Button variant="primary" size="lg" className="rounded-none text-[10px] tracking-widest px-8">CONTINUE SHOPPING</Button>
        </Link>
      </div>
    </>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20">
      <Suspense fallback={<div className="h-32 w-32 animate-pulse bg-gray-200 rounded-full" />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}

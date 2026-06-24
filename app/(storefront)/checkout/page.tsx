"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      router.push("/products");
    }
  }, [items, router]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await loadRazorpayScript();
    
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setLoading(false);
      return;
    }

    try {
      const result = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: cartTotal }),
      });
      const data = await result.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "dummy_key", 
        amount: data.amount,
        currency: data.currency,
        name: "AETHER Store",
        description: "Test Transaction",
        order_id: data.id,
        handler: async function (response: any) {
          clearCart();
          router.push(`/order/success?order_id=${response.razorpay_order_id}`);
        },
        prefill: {
          name: `${firstName} ${lastName}`,
          email: email,
        },
        theme: {
          color: "#000000",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="mx-auto max-w-[1440px] px-6 md:px-16 py-16 flex flex-col md:flex-row gap-16 lg:gap-24">
      {/* Checkout Form */}
      <div className="flex-1">
        <h1 className="font-serif text-3xl font-light uppercase tracking-[0.2em] text-foreground mb-10">Checkout</h1>
        
        {/* Steps Tracker */}
        <div className="flex items-center gap-4 mb-8 text-[10px] font-sans font-medium uppercase tracking-[0.2em]">
          <button className={`transition-colors ${step === 1 ? 'text-foreground font-semibold' : 'text-foreground-secondary/70'}`} onClick={() => setStep(1)}>1. Information</button>
          <span className="text-card-border">/</span>
          <button className={`transition-colors ${step === 2 ? 'text-foreground font-semibold' : 'text-foreground-secondary/70'}`} onClick={() => {if (firstName && email) setStep(2)}}>2. Shipping & Payment</button>
        </div>

        <form onSubmit={step === 2 ? handlePayment : (e) => { e.preventDefault(); setStep(2); }}>
          {step === 1 && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <h2 className="font-serif text-lg font-light uppercase tracking-wider text-foreground mb-2">Contact Information</h2>
              <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="ENTER YOUR EMAIL" />
              
              <h2 className="font-serif text-lg font-light uppercase tracking-wider text-foreground mt-6 mb-2">Shipping Address</h2>
              <div className="flex gap-4">
                <Input label="First Name" className="flex-1" value={firstName} onChange={e => setFirstName(e.target.value)} required placeholder="FIRST NAME" />
                <Input label="Last Name" className="flex-1" value={lastName} onChange={e => setLastName(e.target.value)} required placeholder="LAST NAME" />
              </div>
              <Input label="Address" value={address} onChange={e => setAddress(e.target.value)} required placeholder="SHIPPING ADDRESS" />
              <Input label="City" value={city} onChange={e => setCity(e.target.value)} required placeholder="CITY" />
              
              <Button type="submit" variant="primary" size="lg" className="mt-6 w-full rounded-none text-xs tracking-widest uppercase">
                Continue to Payment
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div className="border border-card-border bg-background p-5 flex flex-col gap-4 text-[10px] font-sans uppercase tracking-[0.15em] text-foreground">
                <div className="flex justify-between pb-4 border-b border-card-border/60">
                  <span className="text-foreground-secondary">Contact</span>
                  <span className="font-medium text-foreground">{email}</span>
                  <button type="button" onClick={() => setStep(1)} className="text-accent underline font-semibold">Change</button>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-secondary">Ship to</span>
                  <span className="font-medium text-foreground">{address}, {city}</span>
                  <button type="button" onClick={() => setStep(1)} className="text-accent underline font-semibold">Change</button>
                </div>
              </div>

              <h2 className="font-serif text-lg font-light uppercase tracking-wider text-foreground mt-6 mb-2">Payment</h2>
              <p className="text-foreground-secondary text-xs uppercase tracking-widest mb-4">All transactions are secure and encrypted.</p>
              
              <div className="border border-card-border p-6 bg-background-secondary flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-sans font-medium uppercase tracking-widest text-foreground">Razorpay Secure Checkout</span>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-6">
                <button type="button" onClick={() => setStep(1)} className="text-foreground-secondary text-[10px] font-sans uppercase tracking-widest underline hover:text-foreground">
                  Return to Information
                </button>
                <Button type="submit" variant="primary" size="lg" className="flex-1 rounded-none text-xs tracking-widest uppercase" disabled={loading}>
                  {loading ? "Processing..." : "Pay Now"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Order Summary */}
      <div className="md:w-[400px] bg-background-secondary p-6 md:p-8 border border-card-border h-fit sticky top-[120px]">
        <h2 className="font-serif text-lg font-light uppercase tracking-widest text-foreground mb-8">Order Summary</h2>
        <div className="flex flex-col gap-6 mb-8">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="relative h-16 w-14 overflow-hidden rounded-none bg-background border border-card-border shrink-0">
                <Image src={item.image} alt={item.title} fill className="object-cover" />
                <span className="absolute -top-1.5 -right-1.5 bg-foreground text-background text-[9px] font-sans font-bold h-4.5 w-4.5 flex items-center justify-center border border-card-border">
                  {item.quantity}
                </span>
              </div>
              <div className="flex flex-col flex-1 justify-center">
                <span className="font-serif text-xs font-semibold uppercase tracking-wider text-foreground">{item.title}</span>
                {item.variant && <span className="text-[9px] font-sans uppercase tracking-widest text-foreground-secondary mt-1">{item.variant}</span>}
              </div>
              <div className="flex items-center justify-end text-xs font-sans tracking-widest">
                {formatCurrency(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-card-border/80 pt-6 flex flex-col gap-4 text-[10px] font-sans uppercase tracking-[0.15em] text-foreground-secondary">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-foreground tracking-widest">{formatCurrency(cartTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="text-foreground tracking-widest">Complimentary</span>
          </div>
          <div className="border-t border-card-border/80 pt-6 flex justify-between items-center mt-2">
            <span className="font-medium text-foreground tracking-[0.2em] text-xs">Total</span>
            <span className="font-serif text-2xl font-light text-accent tracking-wider">{formatCurrency(cartTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

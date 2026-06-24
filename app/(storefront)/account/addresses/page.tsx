"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MapPin, Plus, Trash2, Star, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Address = {
  id: string;
  full_name: string;
  phone?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  zip: string;
  country: string;
  is_default: boolean;
};

const emptyForm = {
  full_name: "", phone: "", address_line1: "", address_line2: "",
  city: "", state: "", zip: "", country: "India",
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAddresses = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      const { data } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });

      setAddresses(data ?? []);
      setLoading(false);
    };
    fetchAddresses();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);

    const isFirst = addresses.length === 0;

    const { data, error: err } = await supabase.from("addresses").insert([
      { ...form, user_id: userId, is_default: isFirst }
    ]).select().single();

    if (err) { setError(err.message); setSaving(false); return; }

    setAddresses(prev => isFirst ? [data] : [...prev, data]);
    setForm(emptyForm);
    setShowForm(false);
    setSaving(false);
  };

  const handleSetDefault = async (id: string) => {
    if (!userId) return;
    // Unset all, then set this one
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })));
  };

  const handleDelete = async (id: string) => {
    await supabase.from("addresses").delete().eq("id", id);
    setAddresses(prev => {
      const remaining = prev.filter(a => a.id !== id);
      // If we deleted the default, set first remaining as default
      if (prev.find(a => a.id === id)?.is_default && remaining.length > 0) {
        supabase.from("addresses").update({ is_default: true }).eq("id", remaining[0].id);
        return remaining.map((a, i) => ({ ...a, is_default: i === 0 }));
      }
      return remaining;
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-card-border pb-4">
        <div>
          <h2 className="font-serif text-xl font-light uppercase tracking-[0.2em] text-foreground">
            Saved Addresses
          </h2>
          <p className="text-foreground-secondary text-[10px] font-sans uppercase tracking-widest mt-1">
            Manage your shipping addresses.
          </p>
        </div>
        {!showForm && (
          <Button
            variant="primary"
            className="rounded-none text-[9px] tracking-widest uppercase flex items-center gap-2"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-3.5 w-3.5" /> Add New
          </Button>
        )}
      </div>

      {/* Add Address Form */}
      {showForm && (
        <form onSubmit={handleSave} className="border border-card-border bg-background-secondary p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-foreground">
              New Address
            </h3>
            <button type="button" onClick={() => { setShowForm(false); setError(""); }} className="text-foreground-secondary hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-sans uppercase tracking-widest text-foreground-secondary">Full Name *</label>
              <Input name="full_name" value={form.full_name} onChange={handleInput} required placeholder="John Doe" className="rounded-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-sans uppercase tracking-widest text-foreground-secondary">Phone</label>
              <Input name="phone" value={form.phone} onChange={handleInput} placeholder="+91 9876543210" className="rounded-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-sans uppercase tracking-widest text-foreground-secondary">Address Line 1 *</label>
            <Input name="address_line1" value={form.address_line1} onChange={handleInput} required placeholder="House No, Street, Area" className="rounded-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-sans uppercase tracking-widest text-foreground-secondary">Address Line 2</label>
            <Input name="address_line2" value={form.address_line2} onChange={handleInput} placeholder="Landmark, Colony (optional)" className="rounded-none" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-[9px] font-sans uppercase tracking-widest text-foreground-secondary">City *</label>
              <Input name="city" value={form.city} onChange={handleInput} required placeholder="Mumbai" className="rounded-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-sans uppercase tracking-widest text-foreground-secondary">State</label>
              <Input name="state" value={form.state} onChange={handleInput} placeholder="Maharashtra" className="rounded-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-sans uppercase tracking-widest text-foreground-secondary">PIN *</label>
              <Input name="zip" value={form.zip} onChange={handleInput} required placeholder="400001" className="rounded-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-sans uppercase tracking-widest text-foreground-secondary">Country *</label>
            <Input name="country" value={form.country} onChange={handleInput} required placeholder="India" className="rounded-none" />
          </div>

          {error && (
            <p className="text-[10px] font-sans text-red-600 uppercase tracking-widest">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" disabled={saving} className="rounded-none text-[9px] tracking-widest uppercase flex items-center gap-2">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              {saving ? "Saving..." : "Save Address"}
            </Button>
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setError(""); }} className="rounded-none text-[9px] tracking-widest uppercase">
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Address Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1,2].map(i => <div key={i} className="h-40 bg-background-secondary animate-pulse border border-card-border" />)}
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 border border-dashed border-card-border text-center">
          <MapPin className="h-10 w-10 text-foreground-secondary/30" />
          <div>
            <p className="text-foreground text-sm font-serif mb-1">No addresses saved</p>
            <p className="text-foreground-secondary text-[10px] font-sans uppercase tracking-widest">
              Add a shipping address to speed up checkout.
            </p>
          </div>
          <Button variant="outline" className="rounded-none text-[9px] tracking-widest uppercase mt-2 flex items-center gap-2" onClick={() => setShowForm(true)}>
            <Plus className="h-3.5 w-3.5" /> Add Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div key={addr.id} className={`border p-5 flex flex-col gap-3 relative ${addr.is_default ? "border-foreground bg-background" : "border-card-border bg-background"}`}>
              {addr.is_default && (
                <span className="absolute top-3 right-3 flex items-center gap-1 text-[8px] font-sans font-bold uppercase tracking-widest text-accent">
                  <Star className="h-3 w-3 fill-accent" /> Default
                </span>
              )}

              <div className="flex flex-col gap-1 pr-16">
                <p className="text-[11px] font-sans font-bold text-foreground uppercase tracking-wide">
                  {addr.full_name}
                </p>
                <p className="text-[10px] font-sans text-foreground-secondary leading-relaxed">
                  {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""}
                </p>
                <p className="text-[10px] font-sans text-foreground-secondary">
                  {addr.city}{addr.state ? `, ${addr.state}` : ""} – {addr.zip}
                </p>
                <p className="text-[10px] font-sans text-foreground-secondary uppercase">{addr.country}</p>
                {addr.phone && <p className="text-[10px] font-sans text-foreground-secondary mt-0.5">{addr.phone}</p>}
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-card-border/40">
                {!addr.is_default && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-[9px] font-sans uppercase tracking-widest text-foreground-secondary hover:text-accent transition-colors flex items-center gap-1"
                  >
                    <Star className="h-3 w-3" /> Set Default
                  </button>
                )}
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="ml-auto text-[9px] font-sans uppercase tracking-widest text-foreground-secondary hover:text-destructive transition-colors flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

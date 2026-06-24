"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/toast";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    is_active: true,
  });

  const fetchCoupons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast("Error fetching coupons", "error");
    } else {
      setCoupons(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      code: newCoupon.code.toUpperCase(),
      discount_type: newCoupon.discount_type,
      discount_value: parseFloat(newCoupon.discount_value),
      is_active: newCoupon.is_active,
    };

    const { error } = await supabase
      .from('coupons')
      .insert([payload]);
      
    if (error) {
      toast(error.message, "error");
    } else {
      toast("Coupon created successfully", "success");
      setIsAdding(false);
      setNewCoupon({ code: "", discount_type: "percentage", discount_value: "", is_active: true });
      fetchCoupons();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) {
      toast("Failed to delete coupon", "error");
    } else {
      toast("Coupon deleted successfully", "success");
      fetchCoupons();
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('coupons').update({ is_active: !currentStatus }).eq('id', id);
    if (error) {
      toast("Failed to update status", "error");
    } else {
      toast("Status updated", "success");
      fetchCoupons();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Coupons</h1>
          <p className="text-foreground-secondary mt-1">Manage discount codes and promotions.</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2" onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? "Cancel" : <><Plus className="h-4 w-4" /> Add Coupon</>}
        </Button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-4">
          <h2 className="text-lg font-bold text-foreground mb-4">Create New Coupon</h2>
          <form onSubmit={handleAddCoupon} className="flex flex-col gap-4 max-w-xl">
            <Input 
              label="Coupon Code" 
              required 
              value={newCoupon.code} 
              onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value})} 
              placeholder="e.g. SUMMER20"
            />
            
            <div className="flex gap-4">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Discount Type</label>
                <select 
                  className="border border-gray-200 rounded-md px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-accent w-full text-sm h-10"
                  value={newCoupon.discount_type}
                  onChange={(e) => setNewCoupon({...newCoupon, discount_type: e.target.value})}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
              <div className="flex-1">
                <Input 
                  label="Discount Value" 
                  type="number"
                  required 
                  value={newCoupon.discount_value} 
                  onChange={(e) => setNewCoupon({...newCoupon, discount_value: e.target.value})} 
                  placeholder={newCoupon.discount_type === 'percentage' ? "e.g. 20" : "e.g. 50"}
                />
              </div>
            </div>

            <Button variant="primary" type="submit" disabled={loading} className="w-fit mt-2">
              Save Coupon
            </Button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-foreground-secondary uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Code</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Value</th>
                <th className="px-6 py-4 font-medium">Times Used</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && !isAdding ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-foreground-secondary">
                    Loading coupons...
                  </td>
                </tr>
              ) : coupons.length > 0 ? (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <Ticket className="h-4 w-4 text-foreground-secondary" />
                        {coupon.code}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground-secondary capitalize">{coupon.discount_type}</td>
                    <td className="px-6 py-4 font-medium">
                      {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}
                    </td>
                    <td className="px-6 py-4 text-foreground-secondary">{coupon.times_used || 0}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleStatus(coupon.id, coupon.is_active)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                          coupon.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {coupon.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors mx-auto block"
                        onClick={() => handleDelete(coupon.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-foreground-secondary">
                    No coupons found. Click "Add Coupon" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

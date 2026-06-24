"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save, Upload, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    price: "",
    sale_price: "",
    stock_quantity: "0",
    category_id: "",
    image_url: "",
  });

  const [options, setOptions] = useState<{name: string, values: string}[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) {
        console.error("Error fetching categories:", error);
      } else {
        setCategories(data || []);
        if (data && data.length > 0) {
          setFormData((prev) => ({ ...prev, category_id: data[0].id }));
        }
      }
    };
    fetchCategories();
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    setFormData({ ...formData, title, slug });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const formPayload = new FormData();
    formPayload.append('file', file);
    formPayload.append('bucket', 'product-images');
    formPayload.append('path', filePath);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formPayload,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await res.json();
      setFormData({ ...formData, image_url: data.url });
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const addOption = () => setOptions([...options, { name: '', values: '' }]);
  
  const updateOption = (index: number, field: 'name' | 'values', value: string) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };
  
  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData, options })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save product");
      }

      toast("Product created successfully!", "success");
      router.push("/admin/products");
    } catch (error: any) {
      toast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-md transition-colors">
          <ArrowLeft className="h-5 w-5 text-foreground-secondary" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Add New Product</h1>
          <p className="text-foreground-secondary mt-1">Create a new product listing in your store.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-6">
          <h2 className="text-lg font-bold text-foreground">Basic Details</h2>
          
          <Input 
            label="Product Title" 
            required 
            value={formData.title} 
            onChange={handleTitleChange} 
            placeholder="e.g. Classic White Tee"
          />
          
          <Input 
            label="URL Slug" 
            required 
            value={formData.slug} 
            onChange={(e) => setFormData({...formData, slug: e.target.value})} 
          />
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea 
              className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your product..."
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-6">
          <h2 className="text-lg font-bold text-foreground">Pricing & Inventory</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input 
              label="Base Price ($)" 
              type="number" 
              step="0.01" 
              required 
              value={formData.price} 
              onChange={(e) => setFormData({...formData, price: e.target.value})} 
            />
            <Input 
              label="Sale Price ($) (Optional)" 
              type="number" 
              step="0.01" 
              value={formData.sale_price} 
              onChange={(e) => setFormData({...formData, sale_price: e.target.value})} 
            />
            <Input 
              label="Total Stock Quantity" 
              type="number" 
              required 
              value={formData.stock_quantity} 
              onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})} 
            />
          </div>
        </div>

        {/* Options & Variants */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-foreground">Options & Variants</h2>
              <p className="text-xs text-foreground-secondary mt-1">Add options like Size or Color to automatically generate variants.</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addOption} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Option
            </Button>
          </div>
          
          {options.length > 0 ? (
            <div className="flex flex-col gap-4">
              {options.map((opt, index) => (
                <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1 flex flex-col gap-4">
                    <Input 
                      label="Option Name" 
                      placeholder="e.g. Size or Color" 
                      value={opt.name} 
                      onChange={(e) => updateOption(index, 'name', e.target.value)} 
                    />
                    <Input 
                      label="Values (comma separated)" 
                      placeholder="e.g. Small, Medium, Large" 
                      value={opt.values} 
                      onChange={(e) => updateOption(index, 'values', e.target.value)} 
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeOption(index)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors mt-6"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-foreground-secondary bg-gray-50 p-4 rounded-md text-center border border-dashed border-gray-200">
              No options added. This product will not have any variants.
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-6">
          <h2 className="text-lg font-bold text-foreground">Organization & Media</h2>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Category</label>
            {categories.length > 0 ? (
              <select 
                className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                value={formData.category_id}
                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            ) : (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                No categories found in the database. Please add some to the "categories" table first. Product will be uncategorized.
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Product Image</label>
            <div className="flex gap-4 items-center">
              {formData.image_url ? (
                <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Error'; }}
                  />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0">
                  <ImageIcon className="h-6 w-6 text-gray-400" />
                </div>
              )}
              <div className="flex flex-col gap-2 flex-1">
                <Input 
                  value={formData.image_url} 
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})} 
                  placeholder="https://..."
                />
                <div className="relative w-fit">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  <Button type="button" variant="outline" size="sm" className="flex items-center gap-2 pointer-events-none" disabled={uploading}>
                    <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload File"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <Link href="/admin/products">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button variant="primary" type="submit" disabled={loading || uploading} className="flex items-center gap-2">
            <Save className="h-4 w-4" /> {loading ? "Saving..." : "Save Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}

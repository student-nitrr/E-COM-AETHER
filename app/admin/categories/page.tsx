"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit, ImageIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/toast";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
  });

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast("Error fetching categories", "error");
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    setNewCategory({ ...newCategory, name, slug });
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewCategory({ name: "", slug: "", description: "", image_url: "" });
  };

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    setNewCategory({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      image_url: category.image_url || "",
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `categories/${fileName}`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', 'media-library');
    formData.append('path', filePath);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await res.json();
      setNewCategory({ ...newCategory, image_url: data.url });
    } catch (err: any) {
      toast(err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (editingId) {
      const { error } = await supabase
        .from('categories')
        .update(newCategory)
        .eq('id', editingId);
        
      if (error) {
        toast(error.message, "error");
      } else {
        toast("Category updated successfully", "success");
        resetForm();
        fetchCategories();
      }
    } else {
      const { error } = await supabase
        .from('categories')
        .insert([newCategory]);
        
      if (error) {
        toast(error.message, "error");
      } else {
        toast("Category created successfully", "success");
        resetForm();
        fetchCategories();
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category? Products using this category might be affected.")) return;
    
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      toast("Failed to delete category", "error");
    } else {
      toast("Category deleted successfully", "success");
      fetchCategories();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Categories</h1>
          <p className="text-foreground-secondary mt-1">Manage product categories for your store.</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2" onClick={() => isAdding ? resetForm() : setIsAdding(true)}>
          <Plus className="h-4 w-4" /> {isAdding ? "Cancel" : "Add Category"}
        </Button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-4">
          <h2 className="text-lg font-bold text-foreground mb-4">{editingId ? "Edit Category" : "Create New Category"}</h2>
          <form onSubmit={handleAddCategory} className="flex flex-col gap-4 max-w-xl">
            <Input 
              label="Category Name" 
              required 
              value={newCategory.name} 
              onChange={handleNameChange} 
              placeholder="e.g. Footwear"
            />
            <Input 
              label="URL Slug" 
              required 
              value={newCategory.slug} 
              onChange={(e) => setNewCategory({...newCategory, slug: e.target.value})} 
            />
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Category Image</label>
              <div className="flex gap-4 items-center">
                {newCategory.image_url ? (
                  <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                    <img 
                      src={newCategory.image_url} 
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
                    value={newCategory.image_url} 
                    onChange={(e) => setNewCategory({...newCategory, image_url: e.target.value})} 
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

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Description (Optional)</label>
              <textarea 
                className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                value={newCategory.description}
                onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
              />
            </div>
            <Button variant="primary" type="submit" disabled={loading || uploading} className="w-fit mt-2">
              {editingId ? "Update Category" : "Save Category"}
            </Button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-foreground-secondary uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Image</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Slug</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && !isAdding && categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-foreground-secondary">
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      {category.image_url ? (
                        <div className="h-10 w-10 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                          <img 
                            src={category.image_url} 
                            alt={category.name} 
                            className="w-full h-full object-cover" 
                            onError={(e) => { 
                              (e.target as HTMLImageElement).src = 'https://placehold.co/40x40?text=!'; 
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center border border-gray-200">
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">{category.name}</td>
                    <td className="px-6 py-4 text-foreground-secondary">/{category.slug}</td>
                    <td className="px-6 py-4 text-foreground-secondary truncate max-w-[200px]">{category.description || "-"}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          className="p-1 text-gray-400 hover:text-accent transition-colors"
                          onClick={() => handleEdit(category)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          onClick={() => handleDelete(category.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-foreground-secondary">
                    No categories found. Click "Add Category" to create one.
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

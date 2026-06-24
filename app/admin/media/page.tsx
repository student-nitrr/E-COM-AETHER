"use client";

import { useState, useEffect } from "react";
import { Upload, Copy, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/toast";
import Image from "next/image";

export default function AdminMediaPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMedia = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast("Error fetching media", "error");
    } else {
      setMedia(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast("URL copied to clipboard", "success");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this file? If it is used in a product, it will break the image link.")) return;
    
    const { error } = await supabase.from('media').delete().eq('id', id);
    if (error) {
      toast("Failed to delete media", "error");
    } else {
      toast("Media deleted successfully", "success");
      fetchMedia();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Media Library</h1>
          <p className="text-foreground-secondary mt-1">Manage product images and assets.</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2">
          <Upload className="h-4 w-4" /> Upload File
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6">
        {loading ? (
          <div className="py-12 text-center text-foreground-secondary">
            Loading media...
          </div>
        ) : media.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {media.map((item) => (
              <div key={item.id} className="group relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50 aspect-square flex flex-col items-center justify-center">
                {item.file_type?.startsWith('image/') || item.file_url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                  <img 
                    src={item.file_url} 
                    alt={item.file_name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-10 w-10 text-gray-300" />
                )}
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    onClick={() => copyToClipboard(item.file_url)}
                    className="h-8 w-8 bg-white text-foreground rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                    title="Copy URL"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="h-8 w-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm text-xs p-2 truncate">
                  {item.file_name}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-xl">
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="font-medium text-lg text-foreground mb-1">No media files found</h3>
            <p className="text-foreground-secondary text-sm max-w-sm mb-6">
              Upload images here to use them in your products, categories, and site settings.
            </p>
            <Button variant="primary">Browse Files</Button>
          </div>
        )}
      </div>
    </div>
  );
}

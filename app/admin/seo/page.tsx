"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Globe } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/toast";

export default function AdminSEOPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    meta_title_template: "{Page Title} | {Site Name}",
    default_meta_description: "",
    ga_tracking_id: "",
    fb_pixel_id: "",
    robots_txt: "User-agent: *\nAllow: /",
  });

  useEffect(() => {
    const fetchSEO = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('seo_settings').select('*').limit(1).single();
      if (data) {
        setSettingsId(data.id);
        setFormData({
          meta_title_template: data.meta_title_template || "{Page Title} | {Site Name}",
          default_meta_description: data.default_meta_description || "",
          ga_tracking_id: data.ga_tracking_id || "",
          fb_pixel_id: data.fb_pixel_id || "",
          robots_txt: data.robots_txt || "User-agent: *\nAllow: /",
        });
      }
      setLoading(false);
    };
    fetchSEO();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    let error;
    if (settingsId) {
      const res = await supabase.from('seo_settings').update(formData).eq('id', settingsId);
      error = res.error;
    } else {
      const res = await supabase.from('seo_settings').insert([formData]).select().single();
      if (res.data) setSettingsId(res.data.id);
      error = res.error;
    }

    if (error) {
      toast("Error saving SEO settings", "error");
    } else {
      toast("SEO settings saved successfully", "success");
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-foreground-secondary">Loading SEO settings...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">SEO Management</h1>
        <p className="text-foreground-secondary mt-1">Configure global search engine optimization settings.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6">
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-xl font-medium text-foreground mb-4">Meta Defaults</h2>
            <div className="flex flex-col gap-4 max-w-lg">
              <Input 
                label="Meta Title Template" 
                value={formData.meta_title_template} 
                onChange={(e) => setFormData({...formData, meta_title_template: e.target.value})} 
                placeholder="{Page Title} | {Site Name}"
              />
              <p className="text-xs text-foreground-secondary -mt-2 mb-2">Use {'{Page Title}'} and {'{Site Name}'} as variables.</p>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Default Meta Description</label>
                <textarea 
                  className="border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent min-h-[100px] resize-none"
                  placeholder="Discover our premium collection of everyday essentials..."
                  value={formData.default_meta_description}
                  onChange={(e) => setFormData({...formData, default_meta_description: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          <div>
            <h2 className="text-xl font-medium text-foreground mb-4">Tracking Scripts</h2>
            <div className="flex flex-col gap-4 max-w-lg">
              <Input 
                label="Google Analytics ID (GA4)" 
                value={formData.ga_tracking_id} 
                onChange={(e) => setFormData({...formData, ga_tracking_id: e.target.value})} 
                placeholder="G-XXXXXXXXXX"
              />
              <Input 
                label="Facebook Pixel ID" 
                value={formData.fb_pixel_id} 
                onChange={(e) => setFormData({...formData, fb_pixel_id: e.target.value})} 
                placeholder="00000000000000"
              />
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          <div>
            <h2 className="text-xl font-medium text-foreground mb-4">Advanced</h2>
            <div className="flex flex-col gap-4 max-w-lg">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">robots.txt</label>
                <textarea 
                  className="border border-gray-200 rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent min-h-[120px] font-mono"
                  value={formData.robots_txt}
                  onChange={(e) => setFormData({...formData, robots_txt: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <Button variant="primary" onClick={handleSave} disabled={saving} className="flex items-center gap-2">
              <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save SEO Settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

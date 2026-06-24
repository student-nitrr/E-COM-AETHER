"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Store, CreditCard, Bell, Settings } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/toast";
import { useSettings } from "@/lib/settings-context";
import { setGlobalCurrency } from "@/lib/utils";

export default function AdminSettingsPage() {
  const { refreshSettings } = useSettings();
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    site_name: "AETHER",
    tagline: "",
    contact_email: "",
    contact_phone: "",
    currency_code: "USD",
    logo_url: "",
    social_instagram: "",
    social_twitter: "",
    announcement_bar_active: false,
    announcement_bar_text: "",
  });

  const TABS = [
    { id: "general", label: "General & Brand", icon: Store },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('site_settings').select('*').limit(1).single();
      if (data) {
        setSettingsId(data.id);
        setFormData({
          site_name: data.site_name || "",
          tagline: data.tagline || "",
          contact_email: data.contact_email || "",
          contact_phone: data.contact_phone || "",
          currency_code: data.currency_code || "USD",
          logo_url: data.logo_url || "",
          social_instagram: data.social_instagram || "",
          social_twitter: data.social_twitter || "",
          announcement_bar_active: data.announcement_bar_active || false,
          announcement_bar_text: data.announcement_bar_text || "",
        });
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    let error;
    if (settingsId) {
      const res = await supabase.from('site_settings').update(formData).eq('id', settingsId);
      error = res.error;
    } else {
      const res = await supabase.from('site_settings').insert([formData]).select().single();
      if (res.data) setSettingsId(res.data.id);
      error = res.error;
    }

    if (error) {
      toast("Error saving settings", "error");
    } else {
      toast("Settings saved successfully", "success");
      setGlobalCurrency(formData.currency_code);
      await refreshSettings();
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-foreground-secondary">Loading settings...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Store Settings</h1>
        <p className="text-foreground-secondary mt-1">Manage your brand preferences and store details.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-4">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-left ${
                  activeTab === tab.id ? "bg-white border border-gray-200 shadow-sm font-medium text-foreground" : "text-foreground-secondary hover:bg-gray-100/50 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {activeTab === "general" && (
            <div className="flex flex-col gap-8 animate-in fade-in">
              <div>
                <h2 className="text-xl font-medium text-foreground mb-4">Store Details</h2>
                <div className="flex flex-col gap-4 max-w-md">
                  <Input label="Store Name" value={formData.site_name} onChange={(e) => setFormData({...formData, site_name: e.target.value})} />
                  <Input label="Tagline" value={formData.tagline} onChange={(e) => setFormData({...formData, tagline: e.target.value})} />
                  <Input label="Contact Email" type="email" value={formData.contact_email} onChange={(e) => setFormData({...formData, contact_email: e.target.value})} />
                  <Input label="Support Phone" value={formData.contact_phone} onChange={(e) => setFormData({...formData, contact_phone: e.target.value})} />
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div>
                <h2 className="text-xl font-medium text-foreground mb-4">Brand & Media</h2>
                <div className="flex flex-col gap-4 max-w-md">
                  <Input label="Logo URL" value={formData.logo_url} onChange={(e) => setFormData({...formData, logo_url: e.target.value})} placeholder="https://..." />
                  <Input label="Instagram URL" value={formData.social_instagram} onChange={(e) => setFormData({...formData, social_instagram: e.target.value})} />
                  <Input label="Twitter URL" value={formData.social_twitter} onChange={(e) => setFormData({...formData, social_twitter: e.target.value})} />
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div>
                <h2 className="text-xl font-medium text-foreground mb-4">Announcement Bar</h2>
                <div className="flex flex-col gap-4 max-w-md">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.announcement_bar_active} 
                      onChange={(e) => setFormData({...formData, announcement_bar_active: e.target.checked})}
                      className="rounded text-accent focus:ring-accent"
                    />
                    Enable Announcement Bar
                  </label>
                  {formData.announcement_bar_active && (
                    <Input label="Announcement Text" value={formData.announcement_bar_text} onChange={(e) => setFormData({...formData, announcement_bar_text: e.target.value})} />
                  )}
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div>
                <h2 className="text-xl font-medium text-foreground mb-4">Standards & Formats</h2>
                <div className="flex flex-col gap-4 max-w-md">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Store Currency</label>
                    <select 
                      value={formData.currency_code} 
                      onChange={(e) => setFormData({...formData, currency_code: e.target.value})}
                      className="border border-gray-200 rounded-md px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-accent w-full text-sm"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button variant="primary" onClick={handleSave} disabled={saving} className="flex items-center gap-2">
                  <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}

          {activeTab !== "general" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Settings className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="font-medium text-lg text-foreground mb-2">Coming Soon</h3>
              <p className="text-foreground-secondary text-sm">This settings pane is currently under construction.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

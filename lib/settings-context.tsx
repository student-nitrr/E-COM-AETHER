"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";
import { setGlobalCurrency } from "./utils";

interface Settings {
  site_name: string;
  tagline: string;
  contact_email: string;
  contact_phone: string;
  currency_code: string;
  logo_url: string;
  social_instagram: string;
  social_twitter: string;
  announcement_bar_active: boolean;
  announcement_bar_text: string;
  announcement_bar_color: string;
}

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: Settings = {
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
  announcement_bar_color: "#000000",
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from("site_settings").select("*").limit(1);
      if (data && data.length > 0) {
        const currency = data[0].currency_code || "USD";
        setGlobalCurrency(currency);
        setSettings({
          site_name: data[0].site_name || "AETHER",
          tagline: data[0].tagline || "",
          contact_email: data[0].contact_email || "",
          contact_phone: data[0].contact_phone || "",
          currency_code: currency,
          logo_url: data[0].logo_url || "",
          social_instagram: data[0].social_instagram || "",
          social_twitter: data[0].social_twitter || "",
          announcement_bar_active: data[0].announcement_bar_active || false,
          announcement_bar_text: data[0].announcement_bar_text || "",
          announcement_bar_color: data[0].announcement_bar_color || "#000000",
        });
      }
    } catch (err) {
      console.error("Failed to fetch site settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

"use client";

import { CartProvider } from "@/lib/cart-context";
import { SettingsProvider } from "@/lib/settings-context";

export function StorefrontProviders({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </SettingsProvider>
  );
}

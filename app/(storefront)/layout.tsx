import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { StorefrontProviders } from "@/components/storefront/providers";
import { supabase } from "@/lib/supabase";
import { setGlobalCurrency } from "@/lib/utils";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data } = await supabase.from('site_settings').select('announcement_bar_active, announcement_bar_text, currency_code').limit(1).single();
  const hasAnnouncement = data?.announcement_bar_active && data?.announcement_bar_text;
  
  if (data?.currency_code) {
    setGlobalCurrency(data.currency_code);
  }

  return (
    <StorefrontProviders>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className={`flex-1 transition-all duration-300 ${hasAnnouncement ? "pt-[116px]" : "pt-[80px]"}`}>
          {children}
        </main>
        <Footer />
      </div>
    </StorefrontProviders>
  );
}


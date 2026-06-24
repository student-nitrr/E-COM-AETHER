const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://vathleqimtthmldvhwbq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhdGhsZXFpbXR0aG1sZHZod2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NTA4MzAsImV4cCI6MjA2NTIyNjgzMH0.V5bGqGFG4J0LUuFGt8JxfMONQNMkKIUAoKkfnolLUxA"
);

async function checkProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("id, title, price, status, product_images(image_url)")
    .order("created_at", { ascending: false });

  if (error) { console.error("Error:", error); return; }

  console.log(`\nTotal products: ${data.length}`);
  data.forEach(p => {
    console.log(`  [${p.status}] ${p.title} — $${p.price} — images: ${p.product_images?.length ?? 0}`);
  });

  const active = data.filter(p => p.status === "active");
  const draft  = data.filter(p => p.status === "draft");
  console.log(`\nActive: ${active.length} | Draft: ${draft.length}`);
}

checkProducts();

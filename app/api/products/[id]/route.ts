import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    if (!productId) throw new Error("Product ID is required");

    const payload = await request.json();
    const { formData, options } = payload;
    
    // 1. Update Product
    const updatePayload = {
      title: formData.title,
      slug: formData.slug,
      description: formData.description,
      price: parseFloat(formData.price),
      sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
      stock_quantity: parseInt(formData.stock_quantity),
      category_id: formData.category_id || null,
      status: "active",
      updated_at: new Date().toISOString()
    };

    let { error: productError } = await supabaseAdmin
      .from("products")
      .update(updatePayload)
      .eq('id', productId);

    if (productError && productError.message.includes("unique constraint") && productError.message.includes("slug")) {
      const fallbackSlug = `${formData.slug}-${Math.random().toString(36).substring(2, 6)}`;
      const retryResult = await supabaseAdmin
        .from("products")
        .update({ ...updatePayload, slug: fallbackSlug })
        .eq('id', productId);
        
      productError = retryResult.error;
    }

    if (productError) {
      if (productError.message.includes("unique constraint") && productError.message.includes("slug")) {
        return NextResponse.json({ error: "This product name/slug is already taken. Please modify the URL Slug manually." }, { status: 400 });
      }
      throw productError;
    }

    // 2. Replace Image (delete old, insert new)
    if (formData.image_url) {
      // First, attempt to delete existing images to keep it simple (1 image per product for now)
      await supabaseAdmin.from("product_images").delete().eq('product_id', productId);
      
      const { error: imageError } = await supabaseAdmin
        .from("product_images")
        .insert({
          product_id: productId,
          image_url: formData.image_url,
          sort_order: 0,
        });
      
      if (imageError) throw imageError;
    }

    // 3. Replace Options and Variants
    // As agreed in the implementation plan, we drop and recreate to ensure clean sync.
    // product_option_values will cascade from product_options.
    await supabaseAdmin.from("product_options").delete().eq('product_id', productId);
    await supabaseAdmin.from("product_variants").delete().eq('product_id', productId);

    const validOptions = options?.filter((o: any) => o.name.trim() && o.values.trim()) || [];
    
    if (validOptions.length > 0) {
      for (const opt of validOptions) {
        const { data: optionData, error: optError } = await supabaseAdmin
          .from("product_options")
          .insert({ product_id: productId, name: opt.name.trim() })
          .select()
          .single();
          
        if (!optError && optionData) {
          const vals = opt.values.split(',').map((v: string) => v.trim()).filter((v: string) => v);
          for (const val of vals) {
            await supabaseAdmin
              .from("product_option_values")
              .insert({ option_id: optionData.id, value: val });
          }
        }
      }
      
      const generateCombinations = (optionsArray: typeof validOptions): any[] => {
        if (optionsArray.length === 0) return [[]];
        const result = [];
        const rest = generateCombinations(optionsArray.slice(1));
        const currentOption = optionsArray[0];
        const values = currentOption.values.split(',').map((v: string) => v.trim()).filter((v: string) => v);
        
        for (const val of values) {
          for (const r of rest) {
            result.push([{ [currentOption.name.trim()]: val }, ...r]);
          }
        }
        return result;
      };

      const combinations = generateCombinations(validOptions);
      
      for (const combo of combinations) {
         const optionValuesObj = combo.reduce((acc: any, curr: any) => ({...acc, ...curr}), {});
         await supabaseAdmin
           .from("product_variants")
           .insert({
              product_id: productId,
              price: parseFloat(formData.price),
              stock_quantity: 0,
              option_values: optionValuesObj
           });
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Product update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupBuckets() {
  const bucketsToCreate = [
    { id: 'media-library', name: 'media-library', public: true },
    { id: 'product-images', name: 'product-images', public: true },
    { id: 'brand-assets', name: 'brand-assets', public: true }
  ];

  for (const bucket of bucketsToCreate) {
    console.log(`Checking bucket: ${bucket.id}...`);
    
    // Check if bucket exists
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError.message);
      continue;
    }

    const exists = existingBuckets.some(b => b.id === bucket.id);

    if (!exists) {
      console.log(`Creating bucket ${bucket.id}...`);
      const { data, error } = await supabase.storage.createBucket(bucket.id, {
        public: bucket.public,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'],
        fileSizeLimit: 10485760 // 10MB
      });

      if (error) {
        console.error(`Failed to create ${bucket.id}:`, error.message);
      } else {
        console.log(`Successfully created bucket: ${bucket.id}`);
      }
    } else {
      console.log(`Bucket ${bucket.id} already exists.`);
      
      // Ensure it is public
      if (bucket.public) {
         await supabase.storage.updateBucket(bucket.id, {
           public: true
         });
         console.log(`Ensured bucket ${bucket.id} is public.`);
      }
    }
  }

  console.log("Done checking/creating storage buckets.");
}

setupBuckets();

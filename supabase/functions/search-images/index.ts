import { corsHeaders } from '@supabase/supabase-js/cors'

const SERPAPI_BASE = 'https://serpapi.com/search.json';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SERPAPI_API_KEY = Deno.env.get('SERPAPI_API_KEY');
    if (!SERPAPI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'SERPAPI_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { products } = await req.json();

    if (!Array.isArray(products) || products.length === 0) {
      return new Response(
        JSON.stringify({ error: 'products array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Batch: fetch images for multiple products
    const results: Record<string, string> = {};

    // Process up to 16 products, 4 at a time to avoid rate limits
    const batch = products.slice(0, 16);
    
    for (let i = 0; i < batch.length; i += 4) {
      const chunk = batch.slice(i, i + 4);
      const promises = chunk.map(async (product: { id: string; name: string; unit: string }) => {
        try {
          const query = `${product.name} ${product.unit} grocery India product`;
          const url = new URL(SERPAPI_BASE);
          url.searchParams.set('api_key', SERPAPI_API_KEY);
          url.searchParams.set('engine', 'google_images');
          url.searchParams.set('q', query);
          url.searchParams.set('gl', 'in');
          url.searchParams.set('hl', 'en');
          url.searchParams.set('num', '3');
          url.searchParams.set('safe', 'active');

          const response = await fetch(url.toString());
          if (!response.ok) {
            await response.text();
            return;
          }

          const data = await response.json();
          const images = data.images_results || [];
          
          // Pick the first reasonable image (skip tiny ones)
          const img = images.find((r: any) => 
            r.thumbnail && r.original && 
            (r.width || 100) >= 80 && (r.height || 100) >= 80
          );

          if (img) {
            results[product.id] = img.thumbnail || img.original;
          }
        } catch {
          // Skip failed individual product
        }
      });
      await Promise.all(promises);
    }

    return new Response(
      JSON.stringify({ images: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in search-images:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

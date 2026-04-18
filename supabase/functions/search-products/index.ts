const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SERPAPI_BASE = 'https://serpapi.com/search.json';

interface ShoppingResult {
  title: string;
  price?: string;
  extracted_price?: number;
  source?: string;
  link?: string;
  thumbnail?: string;
  rating?: number;
  product_id?: string;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

function guessUnit(title: string): string {
  const m = title.match(/(\d+(?:\.\d+)?)\s?(kg|g|l|ml|pcs|pack|pieces?)\b/i);
  if (m) return `${m[1]} ${m[2].toLowerCase()}`;
  return '1 pack';
}

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

    const { query, category, location = 'Mumbai, India', limit = 12 } = await req.json();

    const searchTerm = (query && query.trim()) || (category && category.trim()) || 'best selling grocery';
    const fullQuery = `${searchTerm} grocery India`;

    const url = new URL(SERPAPI_BASE);
    url.searchParams.set('api_key', SERPAPI_API_KEY);
    url.searchParams.set('engine', 'google_shopping');
    url.searchParams.set('q', fullQuery);
    url.searchParams.set('location', location);
    url.searchParams.set('gl', 'in');
    url.searchParams.set('hl', 'en');
    url.searchParams.set('num', String(Math.min(limit * 2, 40)));

    const response = await fetch(url.toString());
    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`SerpAPI request failed [${response.status}]: ${errBody}`);
    }

    const data = await response.json();
    const shopping: ShoppingResult[] = data.shopping_results || [];

    // Deduplicate by normalized title
    const seen = new Set<string>();
    const products = shopping
      .filter((r) => r.title && r.thumbnail)
      .map((r) => {
        const id = r.product_id ? `live-${r.product_id}` : `live-${slugify(r.title)}`;
        return {
          id,
          name: r.title,
          nameHi: r.title, // SerpAPI doesn't provide Hindi; reuse English
          category: category || 'Grocery',
          categoryHi: category || 'किराना',
          image: r.thumbnail || '🛒',
          imageUrl: r.thumbnail,
          unit: guessUnit(r.title),
          price: r.extracted_price || 0,
          priceFormatted: r.price || '',
          source: r.source || '',
          link: r.link || '',
          rating: r.rating || null,
        };
      })
      .filter((p) => {
        const key = p.name.toLowerCase().slice(0, 50);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, limit);

    return new Response(
      JSON.stringify({ products, total: products.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in search-products:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

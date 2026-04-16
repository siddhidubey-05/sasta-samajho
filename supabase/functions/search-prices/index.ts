const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SERPAPI_BASE = 'https://serpapi.com/search.json';

interface SerpApiShoppingResult {
  title: string;
  price: string;
  extracted_price: number;
  source: string;
  link: string;
  thumbnail?: string;
  rating?: number;
  delivery?: string;
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

    const { query, location = 'Mumbai, India' } = await req.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search across our target platforms using Google Shopping
    const platforms = ['DMart', 'Blinkit', 'JioMart', 'Swiggy Instamart'];
    
    // Do a Google Shopping search for the grocery item in India
    const searchQuery = `${query.trim()} grocery price India`;
    const url = new URL(SERPAPI_BASE);
    url.searchParams.set('api_key', SERPAPI_API_KEY);
    url.searchParams.set('engine', 'google_shopping');
    url.searchParams.set('q', searchQuery);
    url.searchParams.set('location', location);
    url.searchParams.set('gl', 'in');
    url.searchParams.set('hl', 'en');
    url.searchParams.set('num', '20');

    const response = await fetch(url.toString());
    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`SerpAPI request failed [${response.status}]: ${errBody}`);
    }

    const data = await response.json();
    const shoppingResults: SerpApiShoppingResult[] = data.shopping_results || [];

    // Also do a regular Google search for platform-specific pricing
    const regularUrl = new URL(SERPAPI_BASE);
    regularUrl.searchParams.set('api_key', SERPAPI_API_KEY);
    regularUrl.searchParams.set('engine', 'google');
    regularUrl.searchParams.set('q', `${query.trim()} price DMart Blinkit JioMart Instamart`);
    regularUrl.searchParams.set('location', location);
    regularUrl.searchParams.set('gl', 'in');
    regularUrl.searchParams.set('hl', 'en');
    regularUrl.searchParams.set('num', '10');

    const regularResponse = await fetch(regularUrl.toString());
    let organicResults: any[] = [];
    if (regularResponse.ok) {
      const regularData = await regularResponse.json();
      organicResults = regularData.organic_results || [];
    } else {
      await regularResponse.text(); // consume body
    }

    // Process and categorize results by platform
    const platformResults = platforms.map((platform) => {
      const platformLower = platform.toLowerCase();
      const matchingProducts = shoppingResults.filter((r) => {
        const sourceLower = (r.source || '').toLowerCase();
        return sourceLower.includes(platformLower.split(' ')[0]);
      });

      return {
        platform,
        products: matchingProducts.map((r) => ({
          title: r.title,
          price: r.extracted_price || parseFloat(r.price?.replace(/[^\d.]/g, '') || '0'),
          priceFormatted: r.price,
          source: r.source,
          link: r.link,
          thumbnail: r.thumbnail || null,
          rating: r.rating || null,
          delivery: r.delivery || null,
        })),
      };
    });

    // Also return all shopping results for general comparison
    const allResults = shoppingResults.map((r) => ({
      title: r.title,
      price: r.extracted_price || parseFloat(r.price?.replace(/[^\d.]/g, '') || '0'),
      priceFormatted: r.price,
      source: r.source,
      link: r.link,
      thumbnail: r.thumbnail || null,
      rating: r.rating || null,
      delivery: r.delivery || null,
    }));

    // Extract price snippets from organic results
    const priceSnippets = organicResults
      .filter((r: any) => r.snippet)
      .map((r: any) => ({
        title: r.title,
        snippet: r.snippet,
        link: r.link,
        source: r.displayed_link || r.link,
      }))
      .slice(0, 5);

    return new Response(
      JSON.stringify({
        query: query.trim(),
        location,
        platformResults,
        allResults,
        priceSnippets,
        totalResults: allResults.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in search-prices:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LiveProduct {
  title: string;
  price: number;
  priceFormatted: string;
  source: string;
  link: string;
  thumbnail: string | null;
  rating: number | null;
  delivery: string | null;
}

export interface PlatformResult {
  platform: string;
  products: LiveProduct[];
}

export interface PriceSnippet {
  title: string;
  snippet: string;
  link: string;
  source: string;
}

export interface LivePriceData {
  query: string;
  location: string;
  platformResults: PlatformResult[];
  allResults: LiveProduct[];
  priceSnippets: PriceSnippet[];
  totalResults: number;
}

export function useLivePrices(query: string, location: string = 'Mumbai, India') {
  return useQuery<LivePriceData>({
    queryKey: ['live-prices', query, location],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('search-prices', {
        body: { query, location },
      });
      if (error) throw error;
      return data as LivePriceData;
    },
    enabled: query.trim().length >= 2,
    staleTime: 5 * 60 * 1000, // 5 min cache
    retry: 1,
  });
}

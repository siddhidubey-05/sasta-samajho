import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LiveProduct {
  id: string;
  name: string;
  nameHi: string;
  category: string;
  categoryHi: string;
  image: string;
  imageUrl?: string;
  unit: string;
  price: number;
  priceFormatted: string;
  source: string;
  link: string;
  rating: number | null;
}

interface Params {
  query?: string;
  category?: string;
  limit?: number;
}

export function useLiveProducts({ query = '', category = '', limit = 12 }: Params) {
  return useQuery<{ products: LiveProduct[]; total: number }>({
    queryKey: ['live-products', query, category, limit],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('search-products', {
        body: { query, category, limit },
      });
      if (error) throw error;
      return data as { products: LiveProduct[]; total: number };
    },
    enabled: query.trim().length >= 2 || category.trim().length > 0,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

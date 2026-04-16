import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { products } from '@/data/mockData';

export function useProductImages() {
  return useQuery<Record<string, string>>({
    queryKey: ['product-images'],
    queryFn: async () => {
      // Check localStorage cache first
      const cached = localStorage.getItem('product-images-cache');
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          // Cache for 24 hours
          if (Date.now() - timestamp < 24 * 60 * 60 * 1000 && Object.keys(data).length > 0) {
            return data as Record<string, string>;
          }
        } catch {
          // ignore parse errors
        }
      }

      const productList = products.map((p) => ({
        id: p.id,
        name: p.name,
        unit: p.unit,
      }));

      const { data, error } = await supabase.functions.invoke('search-images', {
        body: { products: productList },
      });

      if (error) throw error;

      const images = (data as { images: Record<string, string> }).images || {};

      // Cache in localStorage
      localStorage.setItem(
        'product-images-cache',
        JSON.stringify({ data: images, timestamp: Date.now() })
      );

      return images;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24h
    retry: 1,
  });
}

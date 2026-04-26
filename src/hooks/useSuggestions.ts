import { useMemo } from 'react';
import { products } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';
import type { Product } from '@/types';

export interface SuggestionReason {
  type: 'popular' | 'category' | 'budget' | 'trending' | 'personalized';
  label: string;
}

export interface SuggestedProduct extends Product {
  reason: SuggestionReason;
  relevanceScore: number;
}

export function useSuggestions(): SuggestedProduct[] {
  const { cart, language, selectedCity } = useAppStore();
  const isHi = language === 'hi';

  return useMemo(() => {
    // Get categories from current cart
    const cartCategories = new Set(cart.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product?.category;
    }));

    const suggestions: SuggestedProduct[] = [];
    const seen = new Set<string>();

    // 1. Personalized: Suggest related items from same categories as cart
    if (cart.length > 0) {
      products.forEach((product) => {
        if (cartCategories.has(product.category) && !cart.some((c) => c.productId === product.id)) {
          if (!seen.has(product.id)) {
            suggestions.push({
              ...product,
              reason: {
                type: 'personalized',
                label: isHi ? '👤 आपके लिए सुझाव' : '👤 For You',
              },
              relevanceScore: 0.9,
            });
            seen.add(product.id);
          }
        }
      });
    }

    // 2. Popular items (most common grocery staples)
    const popularIds = ['milk-1l', 'atta-5kg', 'rice-5kg', 'oil-1l', 'salt', 'sugar'];
    popularIds.forEach((id) => {
      const product = products.find((p) => p.id === id);
      if (product && !seen.has(id)) {
        suggestions.push({
          ...product,
          reason: {
            type: 'popular',
            label: isHi ? '⭐ लोकप्रिय' : '⭐ Popular',
          },
          relevanceScore: 0.8,
        });
        seen.add(id);
      }
    });

    // 3. Budget-friendly items (typically lower price items)
    const budgetItems = products.filter((p) => !seen.has(p.id)).slice(0, 4);
    budgetItems.forEach((product) => {
      suggestions.push({
        ...product,
        reason: {
          type: 'budget',
          label: isHi ? '💰 किफायती' : '💰 Budget-Friendly',
        },
        relevanceScore: 0.75,
      });
      seen.add(product.id);
    });

    // 4. Category-based: Fill remaining from different categories
    const allCategories = [...new Set(products.map((p) => p.category))];
    allCategories.forEach((category) => {
      const categoryProducts = products.filter((p) => p.category === category && !seen.has(p.id));
      if (categoryProducts.length > 0 && suggestions.length < 12) {
        const product = categoryProducts[0];
        suggestions.push({
          ...product,
          reason: {
            type: 'category',
            label: isHi ? `📦 ${product.categoryHi}` : `📦 ${product.category}`,
          },
          relevanceScore: 0.7,
        });
        seen.add(product.id);
      }
    });

    return suggestions.slice(0, 8).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [cart, language, selectedCity]);
}

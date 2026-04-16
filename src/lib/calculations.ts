import { CartItem, PlatformCartSummary, PlatformId } from '@/types';
import { platforms, products, platformPrices } from '@/data/mockData';

export function calculatePlatformCart(cart: CartItem[], platformId: PlatformId): PlatformCartSummary {
  const platform = platforms.find((p) => p.id === platformId)!;

  const items = cart.map((cartItem) => {
    const product = products.find((p) => p.id === cartItem.productId)!;
    const price = platformPrices.find((pp) => pp.productId === cartItem.productId && pp.platformId === platformId);

    if (!price || !price.available) {
      return {
        productId: cartItem.productId,
        name: product.name,
        brand: '-',
        packSize: '-',
        basePrice: 0,
        quantity: cartItem.quantity,
        subtotal: 0,
        gst: 0,
        cgst: 0,
        sgst: 0,
        discount: 0,
        couponSavings: 0,
        available: false,
        alternativeProduct: false,
        packSizeMismatch: false,
      };
    }

    const subtotal = price.basePrice * cartItem.quantity;
    const gstAmount = (subtotal * price.gstPercent) / 100;
    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;
    const discount = price.discount * cartItem.quantity;
    const couponSavings = (price.couponDiscount || 0) * cartItem.quantity;

    return {
      productId: cartItem.productId,
      name: product.name,
      brand: price.brand,
      packSize: price.packSize,
      basePrice: price.basePrice,
      quantity: cartItem.quantity,
      subtotal,
      gst: gstAmount,
      cgst,
      sgst,
      discount,
      couponSavings,
      available: true,
      alternativeProduct: price.alternativeProduct,
      packSizeMismatch: price.packSizeMismatch,
    };
  });

  const availableItems = items.filter((i) => i.available);
  const itemsSubtotal = availableItems.reduce((s, i) => s + i.subtotal, 0);
  const totalGst = availableItems.reduce((s, i) => s + i.gst, 0);
  const totalCgst = availableItems.reduce((s, i) => s + i.cgst, 0);
  const totalSgst = availableItems.reduce((s, i) => s + i.sgst, 0);
  const totalDiscount = availableItems.reduce((s, i) => s + i.discount, 0);
  const totalCouponSavings = availableItems.reduce((s, i) => s + i.couponSavings, 0);

  const deliveryFee = itemsSubtotal >= platform.deliveryThreshold ? 0 : platform.baseDeliveryFee;
  const handlingFee = platform.handlingFee;
  const platformFee = platform.platformFee;

  const finalTotal = itemsSubtotal + totalGst + deliveryFee + handlingFee + platformFee - totalDiscount - totalCouponSavings;

  return {
    platformId,
    items,
    itemsSubtotal,
    totalGst,
    totalCgst,
    totalSgst,
    deliveryFee,
    handlingFee,
    platformFee,
    totalDiscount,
    totalCouponSavings,
    finalTotal: Math.max(0, finalTotal),
    unavailableCount: items.filter((i) => !i.available).length,
  };
}

export function calculateAllPlatforms(cart: CartItem[]): PlatformCartSummary[] {
  return platforms.map((p) => calculatePlatformCart(cart, p.id));
}

export function findCheapest(summaries: PlatformCartSummary[]): PlatformCartSummary | null {
  const available = summaries.filter((s) => s.unavailableCount === 0);
  if (available.length === 0) {
    return summaries.reduce((min, s) => s.finalTotal < min.finalTotal ? s : min, summaries[0]);
  }
  return available.reduce((min, s) => s.finalTotal < min.finalTotal ? s : min, available[0]);
}

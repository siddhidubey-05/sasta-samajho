import { PlatformCartSummary } from '@/types';
import { platforms } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

interface ComparisonCardProps {
  summary: PlatformCartSummary;
  isCheapest: boolean;
  savingsVsMax: number;
}

const ComparisonCard = ({ summary, isCheapest, savingsVsMax }: ComparisonCardProps) => {
  const platform = platforms.find((p) => p.id === summary.platformId)!;
  const { language } = useAppStore();
  const isHi = language === 'hi';

  return (
    <div
      className={`relative rounded-xl border-2 bg-card p-5 shadow-card transition-all ${
        isCheapest ? 'border-savings ring-2 ring-savings/20' : 'border-border'
      }`}
    >
      {isCheapest && (
        <div className="absolute -top-3 left-4 rounded-full gradient-savings px-3 py-0.5 text-xs font-bold text-savings-foreground">
          {isHi ? '🏆 सबसे सस्ता!' : '🏆 Cheapest!'}
        </div>
      )}

      <div className="mb-4 flex items-center gap-3">
        <span className="text-2xl">{platform.logo}</span>
        <div>
          <h3 className="font-bold">{platform.name}</h3>
          {summary.unavailableCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-expensive">
              <XCircle className="h-3 w-3" />
              {summary.unavailableCount} {isHi ? 'आइटम उपलब्ध नहीं' : 'items unavailable'}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <Row label={isHi ? 'सामान का मूल्य' : 'Items Subtotal'} value={summary.itemsSubtotal} />
        {summary.totalGst > 0 && <Row label="GST (CGST + SGST)" value={summary.totalGst} muted />}
        <Row label={isHi ? 'डिलीवरी शुल्क' : 'Delivery Fee'} value={summary.deliveryFee} muted free={summary.deliveryFee === 0} />
        {(summary.handlingFee > 0 || summary.platformFee > 0) && (
          <Row label={isHi ? 'हैंडलिंग / प्लेटफ़ॉर्म शुल्क' : 'Handling / Platform Fee'} value={summary.handlingFee + summary.platformFee} muted />
        )}
        {summary.totalDiscount > 0 && <Row label={isHi ? 'छूट' : 'Discount'} value={-summary.totalDiscount} green />}
        {summary.totalCouponSavings > 0 && <Row label={isHi ? 'कूपन बचत' : 'Coupon Savings'} value={-summary.totalCouponSavings} green />}

        <div className="my-2 border-t border-border" />
        <div className="flex items-center justify-between">
          <span className="font-bold">{isHi ? 'कुल भुगतान' : 'Total Payable'}</span>
          <span className={`text-xl font-extrabold ${isCheapest ? 'text-savings' : 'text-foreground'}`}>
            ₹{summary.finalTotal.toFixed(0)}
          </span>
        </div>

        {isCheapest && savingsVsMax > 0 && (
          <div className="mt-3 rounded-lg bg-savings/10 p-3 text-center">
            <p className="text-sm font-bold text-savings">
              {isHi
                ? `🎉 आप ₹${savingsVsMax.toFixed(0)} बचा सकते हैं!`
                : `🎉 You save ₹${savingsVsMax.toFixed(0)}!`}
            </p>
          </div>
        )}
      </div>

      {/* Item-level warnings */}
      {summary.items.some((i) => i.alternativeProduct || i.packSizeMismatch) && (
        <div className="mt-3 space-y-1">
          {summary.items.filter((i) => i.alternativeProduct).map((i) => (
            <div key={i.productId} className="flex items-center gap-1 text-[10px] text-warning-foreground">
              <Info className="h-3 w-3 text-warning" />
              {i.name}: {isHi ? 'वैकल्पिक ब्रांड' : 'Alternative brand'} ({i.brand})
            </div>
          ))}
          {summary.items.filter((i) => i.packSizeMismatch).map((i) => (
            <div key={i.productId} className="flex items-center gap-1 text-[10px] text-warning-foreground">
              <AlertTriangle className="h-3 w-3 text-warning" />
              {i.name}: {isHi ? 'पैक साइज़ अलग है' : 'Pack size mismatch'} ({i.packSize})
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Row = ({ label, value, muted, green, free }: { label: string; value: number; muted?: boolean; green?: boolean; free?: boolean }) => (
  <div className="flex items-center justify-between">
    <span className={muted ? 'text-muted-foreground' : ''}>{label}</span>
    <span className={green ? 'font-semibold text-savings' : muted ? 'text-muted-foreground' : 'font-medium'}>
      {free ? (
        <span className="text-savings">FREE</span>
      ) : (
        `${value < 0 ? '-' : ''}₹${Math.abs(value).toFixed(0)}`
      )}
    </span>
  </div>
);

export default ComparisonCard;

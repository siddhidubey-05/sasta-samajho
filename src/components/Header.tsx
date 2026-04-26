
import { Link, useLocation, NavLink } from 'react-router-dom';
import { ShoppingCart, Search, MapPin, Globe, Radio } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cities } from '@/data/mockData';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { cart, liveCart, language, selectedCity, setLanguage, setCity } = useAppStore();
  const location = useLocation();
  const cartCount =
    cart.reduce((s, i) => s + i.quantity, 0) +
    liveCart.reduce((s, i) => s + i.quantity, 0);
  const isHi = language === 'hi';

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🛒</span>
          <span className="text-lg font-bold text-gradient-primary">
            {isHi ? 'सस्ता कार्ट' : 'SastaCart'}
          </span>
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          <MapPin className="h-4 w-4 text-primary" />
          <select
            value={selectedCity}
            onChange={(e) => setCity(e.target.value)}
            className="bg-transparent text-sm font-medium text-foreground focus:outline-none"
          >
            {cities.map((c) => (
              <option key={c.name} value={c.name}>
                {isHi ? c.nameHi : c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
  {/* NEW: Budget Planner Button */}
  <Link to="/budget-planner">
    <Button variant="ghost" size="sm" className="gap-1 text-xs hover:text-green-600">
      💰 Budget
    </Button>
  </Link>
  
  {/* NEW: Price Alerts Button */}
  <Link to="/price-alerts">
    <Button variant="ghost" size="sm" className="gap-1 text-xs hover:text-orange-600">
      🔔 Alerts
    </Button>
  </Link>

  {/* NEW: Kirana Comparison Button */}
  <Link to="/kirana">
    <Button variant="ghost" size="sm" className="gap-1 text-xs hover:text-emerald-600">
      🏪 Kirana
    </Button>
  </Link>

  {/* EXISTING Language Button */}
  <Button
    variant="ghost"
    size="sm"
    onClick={() => setLanguage(isHi ? 'en' : 'hi')}
    className="gap-1 text-xs"
  >
    <Globe className="h-3.5 w-3.5" />
    {isHi ? 'EN' : 'हिं'}
  </Button>

  {/* REST OF EXISTING BUTTONS */}
  <Link to="/live-prices">
    <Button variant="ghost" size="sm" className="relative gap-1 text-xs text-destructive">
      <Radio className="h-3.5 w-3.5" />
      Live
    </Button>
  </Link>

  <Link to="/search">
    <Button variant="ghost" size="icon" className="relative">
      <Search className="h-5 w-5" />
    </Button>
  </Link>


        <Link to="/cart">
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Button>
        </Link>
      </div>
    </div>
  </header>
);
};

export default Header;


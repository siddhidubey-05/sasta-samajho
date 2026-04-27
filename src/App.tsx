import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import SearchPage from "./pages/SearchPage";
import LivePricesPage from "./pages/LivePricesPage";
import CartPage from "./pages/CartPage";
import NotFound from "./pages/NotFound";
import BudgetPlanner from "./pages/BudgetPlanner";
import PriceAlertsPage from "./pages/PriceAlertsPage";
import KiranaComparisonPage from "./pages/KiranaComparisonPage";
import ShoppingListPage from "./pages/ShoppingListPage";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/live-prices" element={<LivePricesPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/shopping-list" element={<ShoppingListPage />} />
          <Route path="/budget-planner" element={<BudgetPlanner />} />
          <Route path="/kirana-comparison" element={<KiranaComparisonPage />} />
          <Route path="/price-alerts" element={<PriceAlertsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

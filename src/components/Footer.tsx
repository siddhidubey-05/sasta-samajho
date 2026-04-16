import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="border-t border-border bg-card py-8">
    <div className="container">
      <div className="grid gap-8 sm:grid-cols-3">
        <div>
          <h4 className="mb-2 text-sm font-bold">🛒 SastaCart</h4>
          <p className="text-xs text-muted-foreground">
            Compare grocery prices across DMart, Blinkit, JioMart & Instamart. Save money on every order.
          </p>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-bold">Links</h4>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <Link to="/search" className="hover:text-primary">Search</Link>
            <Link to="/cart" className="hover:text-primary">Cart</Link>
          </div>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-bold">Disclaimer</h4>
          <p className="text-[10px] text-muted-foreground">
            Prices shown are indicative and may vary by location, time, and stock availability. SastaCart is not affiliated with any platform.
          </p>
        </div>
      </div>
      <div className="mt-6 border-t border-border pt-4 text-center text-[10px] text-muted-foreground">
        © 2026 SastaCart. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;

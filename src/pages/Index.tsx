import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, TrendingDown, ShieldCheck, Zap, IndianRupee, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { products } from '@/data/mockData';
import { useSuggestions } from '@/hooks/useSuggestions';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { language } = useAppStore();
  const isHi = language === 'hi';
  const popularProducts = products.slice(0, 8);
  const suggestions = useSuggestions();
  const categories = [...new Set(products.map((p) => isHi ? p.categoryHi : p.category))];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Hero */}
      <section className="gradient-hero py-12 sm:py-20">
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
              {isHi ? '🇮🇳 भारत का स्मार्ट ग्रॉसरी कम्पेयर' : '🇮🇳 India\'s Smart Grocery Comparer'}
            </span>
            <h1 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl">
              {isHi ? (
                <>ग्रॉसरी पर <span className="text-gradient-primary">सबसे सस्ता दाम</span> पाएं</>
              ) : (
                <>Find the <span className="text-gradient-primary">Cheapest Price</span> on Groceries</>
              )}
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground sm:text-base">
              {isHi
                ? 'DMart, Blinkit, JioMart और Instamart पर कीमतों की तुलना करें। सभी छुपे हुए चार्ज देखें — GST, डिलीवरी, प्लेटफ़ॉर्म फ़ीस — और पैसे बचाएं!'
                : 'Compare prices across DMart, Blinkit, JioMart & Instamart. See all hidden charges — GST, delivery, platform fees — and save money!'
              }
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link to="/search">
                <Button size="lg" className="gap-2 gradient-primary text-primary-foreground px-8">
                  <Search className="h-4 w-4" />
                  {isHi ? 'सामान खोजें' : 'Search Items'}
                </Button>
              </Link>
              <Link to="/cart">
                <Button variant="outline" size="lg" className="gap-2">
                  {isHi ? 'कार्ट कम्पेयर करें' : 'Compare Cart'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Platform logos */}
          <div className="mt-10 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span>🏪 DMart</span>
            <span>⚡ Blinkit</span>
            <span>🛒 JioMart</span>
            <span>🚀 Instamart</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12">
        <div className="container">
          <h2 className="mb-8 text-center text-2xl font-bold">
            {isHi ? 'कैसे काम करता है?' : 'How it Works'}
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: Search, title: isHi ? 'सामान खोजें' : 'Search Items', desc: isHi ? 'दूध, आटा, चावल — कुछ भी खोजें' : 'Search for milk, atta, rice — anything' },
              { icon: IndianRupee, title: isHi ? 'कीमतें देखें' : 'Compare Prices', desc: isHi ? '4 प्लेटफ़ॉर्म पर सभी चार्ज सहित' : 'Across 4 platforms with all charges' },
              { icon: TrendingDown, title: isHi ? 'पैसे बचाएं' : 'Save Money', desc: isHi ? 'सबसे सस्ता विकल्प चुनें' : 'Pick the cheapest option' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className="rounded-xl border border-border bg-card p-6 text-center shadow-card"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full gradient-primary text-primary-foreground">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1 font-bold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="bg-muted/50 py-12">
        <div className="container">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">{isHi ? 'लोकप्रिय सामान' : 'Popular Items'}</h2>
            <Link to="/search" className="text-sm font-semibold text-primary hover:underline">
              {isHi ? 'सभी देखें →' : 'View All →'}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {popularProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Smart Suggestions - Personalized Recommendations */}
      {suggestions.length > 0 && (
        <section className="py-12">
          <div className="container">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">{isHi ? '✨ आपके लिए सुझाव' : '✨ Personalized for You'}</h2>
              </div>
              <Link to="/search" className="text-sm font-semibold text-primary hover:underline">
                {isHi ? 'और देखें →' : 'Explore More →'}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {suggestions.map((suggestion, i) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="relative">
                    <ProductCard product={suggestion} />
                    <div className="absolute -top-2 -right-2 inline-block bg-gradient-to-r from-yellow-400 to-orange-400 text-xs font-bold text-white px-2 py-1 rounded-full shadow-lg">
                      {suggestion.reason.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Best deal banner */}
      <section className="py-10">
        <div className="container">
          <div className="rounded-2xl gradient-savings p-8 text-center text-savings-foreground">
            <h2 className="text-2xl font-extrabold">
              {isHi ? '🎉 आज का बेस्ट कार्ट डील' : '🎉 Today\'s Best Cart Deal'}
            </h2>
            <p className="mt-2 text-sm opacity-90">
              {isHi
                ? 'अपने कार्ट में सामान डालें और चेकआउट से पहले कम्पेयर करें — हर महीने ₹500+ बचाएं!'
                : 'Add items to cart and compare before checkout — save ₹500+ every month!'}
            </p>
            <Link to="/search">
              <Button size="lg" className="mt-4 bg-card text-foreground hover:bg-card/90">
                {isHi ? 'अभी कम्पेयर करें' : 'Compare Now'} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-10">
        <div className="container">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: '💰', text: isHi ? 'हर ऑर्डर पर बचत' : 'Save on Every Order' },
              { icon: '📊', text: isHi ? 'सभी चार्ज पारदर्शी' : 'All Charges Transparent' },
              { icon: '🔒', text: isHi ? 'सुरक्षित और भरोसेमंद' : 'Safe & Trustworthy' },
              { icon: '⚡', text: isHi ? 'रियल-टाइम कीमतें' : 'Real-time Prices' },
            ].map((item, i) => (
              <div key={i} className="rounded-lg bg-muted/50 p-4 text-center">
                <span className="text-2xl">{item.icon}</span>
                <p className="mt-1 text-xs font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/50 py-12">
        <div className="container max-w-2xl">
          <h2 className="mb-6 text-center text-2xl font-bold">
            {isHi ? 'अक्सर पूछे जाने वाले सवाल' : 'FAQ'}
          </h2>
          {[
            { q: isHi ? 'क्या कीमतें सही हैं?' : 'Are prices accurate?', a: isHi ? 'हम रेगुलरली कीमतें अपडेट करते हैं, लेकिन ये स्टॉक और लोकेशन के हिसाब से बदल सकती हैं।' : 'We update prices regularly, but they may vary by stock and location.' },
            { q: isHi ? 'क्या ये फ्री है?' : 'Is this free?', a: isHi ? 'हाँ, बिल्कुल फ्री है! कोई हिडन चार्ज नहीं।' : 'Yes, completely free! No hidden charges.' },
            { q: isHi ? 'कौन-कौन से प्लेटफ़ॉर्म सपोर्ट हैं?' : 'Which platforms are supported?', a: isHi ? 'DMart Ready, Blinkit, JioMart, और Swiggy Instamart।' : 'DMart Ready, Blinkit, JioMart, and Swiggy Instamart.' },
          ].map((faq, i) => (
            <div key={i} className="mb-4 rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold">{faq.q}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

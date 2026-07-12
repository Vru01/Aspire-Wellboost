import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { api } from '../../utils/api'; 
import { EXTENDED_PRODUCT_DETAILS, getCombinedProductData } from '../data/extendedProductDetails';
import { ShieldCheck, Zap, Layers, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';

export default function Home({ searchFilter = '', userId, triggerCartRefresh }) {
  const navigate = useNavigate();
  const [liveProducts, setLiveProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const response = await api.products.getAllProducts();
        const records = response && response.length > 0 ? response : Object.values(EXTENDED_PRODUCT_DETAILS);
        setLiveProducts(records);
      } catch (err) {
        console.warn("Using local product catalog fallback configurations.");
        setLiveProducts(Object.values(EXTENDED_PRODUCT_DETAILS));
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const scrollToGrid = () => {
    document.getElementById('formulation-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Live filter computation based on Navbar input query strings
  const filteredProducts = liveProducts.filter(prod => {
    const combined = getCombinedProductData(prod, EXTENDED_PRODUCT_DETAILS);
    return combined?.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
           combined?.category?.toLowerCase().includes(searchFilter.toLowerCase());
  });

  return (
    <div className="bg-white text-[#0B1F1A] min-h-screen font-sans scroll-smooth overflow-x-hidden">

      {/* Local keyframes for the signature motion language */}
      <style>{`
        @keyframes orbitSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes orbitSpinReverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes floatBlob { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(20px, -15px) scale(1.05); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseDot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.4); } }
        .orbit-ring-slow { animation: orbitSpin 22s linear infinite; }
        .orbit-ring-fast { animation: orbitSpinReverse 14s linear infinite; }
        .blob-float { animation: floatBlob 9s ease-in-out infinite; }
        .fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .pulse-dot { animation: pulseDot 2s ease-in-out infinite; }
      `}</style>

      {/* Hero Header Space */}
      <header className="relative py-24 sm:py-32 px-6 overflow-hidden bg-gradient-to-b from-[#F1FFF9] via-white to-white text-center border-b border-[#00D9A0]/10">

        <div className="absolute top-10 left-1/4 w-72 h-72 bg-[#00D9A0]/20 blur-[90px] rounded-full pointer-events-none blob-float" />
        <div className="absolute top-24 right-1/4 w-64 h-64 bg-[#FF5C8A]/15 blur-[90px] rounded-full pointer-events-none blob-float" style={{ animationDelay: '2.5s' }} />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none hidden sm:block">
          <div className="w-[520px] h-[520px] rounded-full border border-[#00D9A0]/20 orbit-ring-slow relative">
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#00D9A0]" />
          </div>
          <div className="absolute inset-0 m-auto w-[380px] h-[380px] rounded-full border border-dashed border-[#FF5C8A]/25 orbit-ring-fast">
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#FF5C8A]" />
          </div>
        </div>

        <div className="max-w-3xl mx-auto relative z-10 space-y-6 fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00D9A0]/30 bg-white text-[#00A87D] text-xs font-bold tracking-wide uppercase shadow-sm shadow-[#00D9A0]/10">
            <span className="relative flex h-2 w-2">
              <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-[#00D9A0]" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D9A0]" />
            </span>
            Made With Real, Clean Ingredients
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#0B1F1A] leading-[1.05] font-serif">
            Feel Better, <br />
            <span className="bg-gradient-to-r from-[#00D9A0] via-[#00C2C2] to-[#FF5C8A] bg-clip-text text-transparent">
              One Day at a Time
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
            Simple, effective supplements made from real ingredients — no confusing labels, no shortcuts, just products that actually work.
          </p>

          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={scrollToGrid}
              className="group inline-flex items-center gap-2 bg-[#0B1F1A] text-white px-7 py-3.5 rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-[#0B1F1A]/20 hover:shadow-xl hover:shadow-[#0B1F1A]/25 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 transition-all duration-300"
            >
              Shop Now
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={scrollToGrid}
              className="inline-flex items-center gap-2 bg-white text-[#0B1F1A] px-7 py-3.5 rounded-2xl font-bold text-sm tracking-wide border border-slate-200 hover:border-[#00D9A0]/40 hover:bg-[#F1FFF9] active:scale-95 transition-all duration-300"
            >
              Learn More
            </button>
          </div>
        </div>
      </header>

      {/* Brand Value Propositions */}
      <section className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 lg:grid-cols-4 gap-4 -mt-8 relative z-20">
        {[
          { icon: <ShieldCheck className="text-[#00A87D]" />, t: "100% Natural", d: "Nothing artificial", ring: "hover:border-[#00D9A0]/40 hover:shadow-[#00D9A0]/10" },
          { icon: <Zap className="text-[#FF5C8A]" />, t: "Fast Results", d: "Feel the difference", ring: "hover:border-[#FF5C8A]/40 hover:shadow-[#FF5C8A]/10" },
          { icon: <Layers className="text-[#00A87D]" />, t: "Clean Ingredients", d: "No hidden nasties", ring: "hover:border-[#00D9A0]/40 hover:shadow-[#00D9A0]/10" },
          { icon: <RefreshCw className="text-[#FF5C8A]" />, t: "Trusted Quality", d: "Made to last", ring: "hover:border-[#FF5C8A]/40 hover:shadow-[#FF5C8A]/10" }
        ].map((item, idx) => (
          <div
            key={idx}
            className={`fade-up flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default ${item.ring}`}
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 shrink-0">{item.icon}</div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">{item.t}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{item.d}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Main Grid Deck Window */}
      <main id="formulation-grid" className="max-w-6xl mx-auto px-6 py-16 sm:py-20">
        <div className="flex items-end justify-between mb-10 fade-up">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-[#00A87D] mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              Our Products
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B1F1A] tracking-tight font-serif">
              Pick what's right for you
            </h2>
          </div>
          {!loading && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-full">
              {filteredProducts.length} products found
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-50 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-3 w-2/3 bg-slate-100 rounded-full animate-pulse" />
                  <div className="h-3 w-1/3 bg-slate-100 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200 fade-up">
            <p className="text-sm text-slate-500 font-medium">No natural products match your active search filter parameters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((prod, idx) => {
              const combined = getCombinedProductData(prod, EXTENDED_PRODUCT_DETAILS);
              return (
                <div
                  key={`home-grid-${combined.id || combined.slug}-${idx}`}
                  onClick={() => navigate(`/product/${combined.slug}`)}
                  className="fade-up transition-all duration-300 transform"
                  style={{ animationDelay: `${Math.min(idx, 8) * 60}ms` }}
                >
                  <ProductCard 
                    product={combined} 
                    userId={userId} 
                    triggerCartRefresh={triggerCartRefresh} 
                  />
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
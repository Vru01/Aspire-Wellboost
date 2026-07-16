import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingBag, ShieldCheck, Heart,
  Check, CreditCard, Maximize2, X,
  Activity, Sparkles, Smile, ShieldAlert, Star, ChevronDown
} from 'lucide-react';
import { api } from '../../utils/api'; 
import { EXTENDED_PRODUCT_DETAILS, getCombinedProductData } from '../data/extendedProductDetails';

export default function ProductDetails({ userId, triggerCartRefresh }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [activeImg, setActiveImg] = useState("/placeholder.jpg");
  const [openAccordion, setOpenAccordion] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [backendProductId, setBackendProductId] = useState(null);
  const [backendPrice, setBackendPrice] = useState(null);
  const [backendDiscountPrice, setBackendDiscountPrice] = useState(null);
  const [priceError, setPriceError] = useState(null);

  const product = getCombinedProductData({ slug }, EXTENDED_PRODUCT_DETAILS);
  const displayPrice = backendPrice ?? product.price;
  const displayDiscountPrice = backendDiscountPrice ?? product.discountPrice;

  // 🟢 FIX 1: Instantly reset scroll view back to the top when this page is loaded
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [slug]);

  useEffect(() => {
    const loadPrice = async () => {
      setPriceError(null);
      try {
        const fetched = await api.products.getProductBySlug(slug);
        setBackendProductId(fetched._id);
        setBackendPrice(fetched.price);
        setBackendDiscountPrice(fetched.discountPrice);
      } catch (err) {
        setPriceError(err.message || 'Could not load pricing information.');
      }
    };

    if (slug) loadPrice();
  }, [slug]);

  useEffect(() => {
    if (product?.imageGallery?.length > 0) {
      setActiveImg(product.imageGallery[0]);
    }
  }, [product]);

  if (priceError) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center p-6 text-slate-600 text-lg font-medium">
        {priceError}
        <button onClick={() => navigate('/')} className="text-[#00A87D] underline ml-1 font-bold">Return to home</button>
      </div>
    );
  }

  const discountPercentage = displayPrice > 0 ? Math.round(((displayPrice - displayDiscountPrice) / displayPrice) * 100) : 0;

  const handleAddToCart = async () => {
    if (!userId) return alert("Please log in to add items to your cart.");
    setLoading(true);
    try {
      const targetUserId = typeof userId === 'object' ? (userId._id || userId.id) : userId;
      const targetProductId = backendProductId || product._id || product.id;

      if (!targetProductId) {
        throw new Error('Unable to add this product to cart because the product ID is missing.');
      }

      await api.cart.addToCart(targetUserId, targetProductId);
      setSuccess(true);
      if (triggerCartRefresh) triggerCartRefresh();
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      alert(err.message || "Could not update your cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExpressCheckout = async () => {
    if (!userId) return alert("Please log in to finish your order.");
    setLoading(true);
    try {
      const targetUserId = typeof userId === 'object' ? (userId._id || userId.id) : userId;
      const targetProductId = product._id || product.id;

      const orderPayload = [{ productId: targetProductId, quantity: 1, discountPrice: product.discountPrice }];
      const razorpayOrder = await api.orders.createRazorpayOrder(orderPayload);

      const options = {
        key: "rzp_test_YOUR_KEY_HERE", 
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Aspire Wellboost",
        description: `Order: ${product.name}`,
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            await api.orders.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: targetUserId,
              address: "Customer Delivery Location",
              cartItems: orderPayload
            });
            alert("Order placed successfully! Welcome to the family.");
          } catch (vErr) {
            alert("Verification timed out. Please check your order history.");
          }
        },
        theme: { color: "#00A87D" }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();
    } catch (err) {
      alert("Failed to start checkout. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen py-10 px-4 sm:px-6 antialiased font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation Action */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => navigate('/')} 
            className="inline-flex items-center gap-2 text-base font-bold text-slate-500 hover:text-[#00A87D] transition-colors group"
          >
            <ArrowLeft size={18} className="transform group-hover:-translate-x-1 transition-transform" /> 
            Back to Wellness Shop
          </button>
          
          <div className="flex items-center gap-1 text-sm font-black text-amber-750 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200">
            <Star size={14} fill="currentColor" className="text-amber-500" /> Premium Customer Choice
          </div>
        </div>

        {/* Master Content Platform Split */}
        {/* 🟢 FIX 2: Removed "order-2" class to keep image panel on TOP for mobile layout, ordering naturally below */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start bg-white p-6 sm:p-12 rounded-3xl shadow-sm border border-slate-200/60">
          
          {/* IMAGE WORK PANEL CONTAINER */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
            <div 
              onClick={() => setIsLightboxOpen(true)}
              className="relative aspect-square bg-slate-50 rounded-2xl border border-slate-200 p-6 flex items-center justify-center overflow-hidden cursor-zoom-in group transition-all duration-300 hover:shadow-md"
            >
              <img 
                src={activeImg} 
                alt={product.name} 
                className="object-contain max-h-full max-w-full transform transition-all duration-500 group-hover:scale-102 filter drop-shadow-sm" 
              />
              <div className="absolute bottom-4 right-4 bg-white/90 border border-slate-200 shadow-sm rounded-lg p-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Maximize2 size={14} className="text-slate-500" />
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {product.imageGallery?.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImg(img)} 
                  className={`aspect-square bg-slate-50 rounded-xl border p-2 flex items-center justify-center transition-all ${
                    activeImg === img ? 'border-[#00A87D] bg-emerald-50/30 ring-2 ring-[#00A87D]/10' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="object-contain max-h-full" />
                </button>
              ))}
            </div>
          </div>

          {/* DYNAMIC VERTICAL STACK DECK */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* Title Section */}
            <div className="space-y-3">
              <span className="text-xs font-extrabold tracking-widest text-[#00A87D] bg-[#00D9A0]/10 border border-[#00D9A0]/20 px-4 py-1.5 rounded-full uppercase">
                {product.badge || "100% Natural Choice"}
              </span>
              
              <div className="flex justify-between items-start gap-4 pt-1">
                <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight font-serif">
                  {product.name}
                </h1>
                <button 
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`p-3 rounded-xl border transition-all shrink-0 ${
                    isWishlisted ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                </button>
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{product.category}</p>
            </div>

            {/* Pricing Section Container */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl shadow-sm">
              <div className="flex items-baseline gap-4">
                <span className="text-4xl sm:text-5xl font-black text-[#0B1F1A] tracking-tight">₹{displayDiscountPrice || displayPrice}</span>
                {displayDiscountPrice && <span className="text-xl text-slate-400 line-through">₹displayPrice</span>}
                {discountPercentage > 0 && (
                  <span className="text-xs sm:text-sm font-black bg-emerald-100 border border-emerald-200 text-emerald-800 px-3 py-1 rounded">
                    Save {discountPercentage}% Now
                  </span>
                )}
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleAddToCart} 
                  disabled={loading} 
                  className={`flex-1 font-extrabold py-4 rounded-xl transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 border shadow-sm ${
                    success 
                      ? 'bg-[#00A87D] text-white border-[#00A87D]' 
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {success ? <Check size={16} /> : <ShoppingBag size={16} />} 
                  {success ? 'Added to Cart!' : 'Add to Shopping Cart'}
                </button>
                <button 
                  onClick={handleExpressCheckout} 
                  disabled={loading} 
                  className="flex-1 bg-gradient-to-r from-[#00D9A0] to-[#00A87D] text-white font-extrabold py-4 rounded-xl transition-all shadow-sm shadow-emerald-600/10 uppercase text-sm tracking-wider flex items-center justify-center gap-2.5"
                >
                  <CreditCard size={16} /> Buy Instantly Now
                </button>
              </div>
            </div>

            {/* Value Check Strip */}
            <div className="grid grid-cols-3 gap-3 py-3 text-center text-xs font-bold text-slate-500 border-t border-b border-slate-100 bg-slate-50/40 rounded-xl px-2">
              <div className="flex flex-col items-center gap-1.5"><ShieldCheck size={18} className="text-[#00A87D]" /><span>100% Safe & Pure</span></div>
              <div className="flex flex-col items-center gap-1.5"><Activity size={18} className="text-teal-600" /><span>Easy to Absorb</span></div>
              <div className="flex flex-col items-center gap-1.5"><Smile size={18} className="text-[#00A87D]" /><span>Natural Elements</span></div>
            </div>

            {/* BLOCK 1: Product Summary */}
            <div className="space-y-4 pt-2">
              <h3 className="text-lg font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 intent-headline font-serif">
                <div className="w-2 h-2 bg-[#00A87D] rounded-full" /> About The Product
              </h3>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed bg-slate-50/50 border border-slate-200 p-5 rounded-xl shadow-xs">
                {product.summary}
              </p>
            </div>

            {/* BLOCK 2: Detailed Benefits */}
            {product.sections?.map((sec, idx) => (
              <div key={idx} className="space-y-4 pt-2">
                <h3 className="text-lg font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 font-serif">
                  <div className="w-2 h-2 bg-[#00A87D] rounded-full" /> {sec.title}
                </h3>
                <div className="grid gap-3">
                  {sec.points?.map((pt, pIdx) => (
                    <div key={pIdx} className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs text-base text-slate-600 leading-relaxed flex items-start gap-3">
                      <Check size={16} className="text-[#00A87D] mt-1 shrink-0" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* BLOCK 3: Daily Directions */}
            <div className="space-y-4 pt-2">
              <h3 className="text-lg font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 font-serif">
                <div className="w-2 h-2 bg-[#00A87D] rounded-full" /> How to Use Daily
              </h3>
              <div className="bg-emerald-50/40 border border-emerald-100 p-5 rounded-xl text-base text-emerald-950 leading-relaxed shadow-xs font-medium">
                {product.suggestedUsage}
              </div>
            </div>

            {/* BLOCK 4: Accordion Components */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <h3 className="text-lg font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 font-serif">
                  <div className="w-2 h-2 bg-[#00A87D] rounded-full" /> Transparent Ingredients List
                </h3>
                <p className="text-sm font-medium text-slate-400">Click on any group below to check the natural items inside:</p>
                
                <div className="space-y-3">
                  {product.highlights.map((hl, idx) => {
                    const isAccordionOpen = openAccordion === idx;
                    return (
                      <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                        <button 
                          onClick={() => setOpenAccordion(isAccordionOpen ? null : idx)}
                          className="w-full bg-slate-50/60 hover:bg-slate-50 px-5 py-4 flex justify-between items-center font-extrabold text-xs sm:text-sm text-slate-700 uppercase tracking-wide"
                        >
                          <span>{hl.title}</span>
                          <ChevronDown size={16} className={`text-slate-400 transform transition-transform duration-350 ${isAccordionOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isAccordionOpen && (
                          <div className="p-5 bg-white border-t border-slate-100 flex flex-wrap gap-2 animate-fadeIn">
                            {hl.items?.map((item, iIdx) => (
                              <span key={iIdx} className="text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-600 px-3.5 py-1.5 rounded-lg font-bold">
                                {item}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* BLOCK 5: Safety Advisories */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4 items-start shadow-xs">
              <ShieldAlert size={22} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-extrabold text-amber-900 uppercase tracking-wide">Important Safety Advice</h4>
                <p className="text-xs sm:text-base text-amber-700/90 mt-1.5 leading-relaxed">
                  These natural wellness supplements are built to support healthy daily balance. They are not intended to replace prescription medicine or clinical treatments if you are taking medication for a serious condition. Please read packaging instructions carefully.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* LIGHTBOX SLIDE VIEW PORTAL */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300">
          <button 
            onClick={() => setIsLightboxOpen(false)} 
            className="absolute top-6 right-6 p-2.5 bg-white text-slate-800 rounded-full shadow-md hover:scale-105 transition-all"
          >
            <X size={22} />
          </button>
          <div className="max-w-3xl w-full max-h-[80vh] flex items-center justify-center bg-white p-4 rounded-2xl shadow-xl overflow-hidden">
            <img 
              src={activeImg} 
              alt={product.name} 
              className="object-contain max-w-full max-h-[75vh] rounded-lg" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
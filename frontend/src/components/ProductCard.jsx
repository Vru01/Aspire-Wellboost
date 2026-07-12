import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowUpRight, Sparkles } from 'lucide-react';
import { api } from '../../utils/api';

export default function ProductCard({ product, userId, triggerCartRefresh }) {
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  const handleAddToCartDirectly = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!userId) {
      alert("Please log in to add items to your cart.");
      return;
    }

    try {
      // 🟢 FIX: Prioritize the raw Mongoose MongoDB ObjectId hex string (`_id`) 
      // over any local descriptive dictionary string (`id`) to prevent 404 validation failures.
      const cleanProductId = product._id || product.id;
      const cleanUserId = typeof userId === 'object' ? (userId._id || userId.id) : userId;

      await api.cart.addToCart(cleanUserId, cleanProductId);
      alert(`${product.name} added to your cart!`);
      if (triggerCartRefresh) {
        triggerCartRefresh();
      }
    } catch (err) {
      console.error("Direct add-to-cart error:", err);
      alert("Could not update your cart. Please try again.");
    }
  };

  return (
    <div className="group relative bg-white rounded-3xl border border-slate-250/70 overflow-hidden transition-all duration-300 flex flex-col justify-between h-full hover:shadow-md">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#00D9A0]/5 via-transparent to-[#FF5C8A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div>
        {/* Image Display Window */}
        <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-slate-50 to-white p-6 flex items-center justify-center">
          <img
            src={product.imageGallery?.[0] || "/placeholder.jpg"}
            alt={product.name}
            className="object-contain w-full h-full transform group-hover:scale-103 transition-transform duration-500 drop-shadow-[0_8px_16px_rgba(15,23,42,0.06)]"
          />

          {/* Discount Ribbon Tag */}
          {hasDiscount && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-[#FF5C8A] to-[#FFB020] text-white text-xs font-black px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
              <Sparkles size={12} /> SAVE {discountPercentage}%
            </div>
          )}

          {/* Category label */}
          <div className="absolute bottom-3 right-4 bg-white/95 text-slate-500 border border-slate-200 text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-md shadow-sm">
            {product.category}
          </div>
        </div>

        {/* Text Details & Context */}
        <div className="p-5">
          <span className="text-xs font-bold text-[#00A87D] tracking-wide bg-[#00D9A0]/10 border border-[#00D9A0]/20 px-2.5 py-1 rounded-md">
            {product.badge || 'Customer Favorite'}
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-3 group-hover:text-[#00A87D] transition-colors line-clamp-1 font-serif">
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {product.summary}
          </p>
        </div>
      </div>

      {/* Pricing and CTA Interaction Strip */}
      <div className="p-5 pt-0 border-t border-slate-100 mt-auto">
        <div className="flex items-baseline gap-2.5 mt-4">
          <span className="text-2xl font-black text-slate-900">₹{product.discountPrice || product.price}</span>
          {hasDiscount && <span className="text-sm text-slate-400 line-through">₹{product.price}</span>}
        </div>

        <div className="grid grid-cols-5 gap-2.5 mt-4">
          <Link
            to={`/product/${product.slug}`}
            className="col-span-4 bg-[#0B1F1A] hover:bg-slate-800 text-white text-xs font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group/btn"
          >
            View Details
            <ArrowUpRight size={14} className="transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </Link>

          <button
            onClick={handleAddToCartDirectly}
            aria-label="Add to cart"
            className="col-span-1 bg-gradient-to-br from-[#00D9A0] to-[#00A87D] hover:from-[#00E8AC] hover:to-[#00B889] text-white rounded-xl flex items-center justify-center transition-all shadow-md shadow-[#00D9A0]/20 active:scale-90"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
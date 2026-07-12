import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { X, Plus, Minus, Trash2, ShoppingBag, CreditCard, Loader2 } from 'lucide-react';

export default function CartDrawer({ isOpen, onClose, userId }) {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const syncCartState = async () => {
    if (!userId || !isOpen) return;
    try {
      // 🟢 Normalize the incoming userId parameter to a clean string format
      const cleanUserId = typeof userId === 'object' ? (userId._id || userId.id) : userId;
      const data = await api.cart.getCart(cleanUserId);
      setCartData(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      console.error("Couldn't load your cart. Please try again.");
    }
  };

  useEffect(() => { syncCartState(); }, [isOpen, userId]);

  const modifyQty = async (pId, type) => {
    try {
      const cleanUserId = typeof userId === 'object' ? (userId._id || userId.id) : userId;
      if (type === 'add') await api.cart.addToCart(cleanUserId, pId);
      if (type === 'less') await api.cart.decreaseQty(cleanUserId, pId);
      if (type === 'rem') await api.cart.removeItem(cleanUserId, pId);
      syncCartState();
    } catch (err) {
      alert("Something went wrong updating your cart. Please try again.");
    }
  };

  if (!isOpen) return null;

  const itemsArray = Array.isArray(cartData) ? cartData : [];
  
  const totalPrice = itemsArray.reduce((acc, curr) => {
    const price = curr.productId?.discountPrice || curr.productId?.price || 0;
    return acc + (price * curr.quantity);
  }, 0);

  const handleCartCheckout = () => {
    if (itemsArray.length === 0) return;
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="w-full max-w-md bg-white h-full flex flex-col relative z-10 shadow-2xl">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-black text-[#0B1F1A] flex items-center gap-2">
            <ShoppingBag size={18} className="text-[#00A87D]" /> Your Cart
          </h3>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-full transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {itemsArray.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 gap-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <ShoppingBag size={28} className="text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-500">Your cart is empty</p>
              <p className="text-xs text-slate-400">Add a few products to get started</p>
            </div>
          ) : (
            itemsArray.map((item, idx) => {
              if (!item.productId) return null;
              
              const productInfo = item.productId;
              const targetProductId = productInfo._id || productInfo.id || productInfo;

              return (
                <div key={item._id || idx} className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between gap-4 transition-all duration-300 hover:border-[#00D9A0]/30 hover:shadow-sm">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{productInfo.name || "Wellness Product"}</h4>
                    <p className="text-sm text-[#00A87D] font-extrabold mt-1">₹{productInfo.discountPrice || productInfo.price || 0}</p>
                  </div>
                  <div className="flex items-center gap-2.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <button
                      onClick={() => modifyQty(targetProductId, 'less')}
                      className="text-slate-500 hover:text-slate-900 transition-colors active:scale-90"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="text-sm font-bold text-slate-700 px-1 min-w-[1rem] text-center">{item.quantity}</span>
                    <button
                      onClick={() => modifyQty(targetProductId, 'add')}
                      className="text-slate-500 hover:text-slate-900 transition-colors active:scale-90"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <button
                    onClick={() => modifyQty(targetProductId, 'rem')}
                    aria-label="Remove item"
                    className="text-rose-400 hover:text-rose-500 transition-colors active:scale-90"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {itemsArray.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/60 space-y-4">
            <div className="flex justify-between text-sm font-bold text-slate-600">
              <span>Subtotal</span>
              <span className="text-slate-900 text-lg">₹{totalPrice}</span>
            </div>
            <button
              onClick={handleCartCheckout}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#00D9A0] to-[#00A87D] hover:from-[#00E8AC] hover:to-[#00B889] text-white font-bold py-4 rounded-xl transition-all duration-300 text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00D9A0]/20 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
              {loading ? 'Placing your order...' : 'Checkout'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
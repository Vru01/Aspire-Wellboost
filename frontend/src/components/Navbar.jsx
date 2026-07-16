import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Search, LogOut } from 'lucide-react';  

export default function Navbar({ 
  cartCount = 0, 
  onOpenCart, 
  currentUser, 
  onLogout, 
  searchQuery = '', 
  onSearchChange 
}) {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 cursor-pointer group shrink-0">
          <img
            src="/logo.jpeg"
            alt="Aspire Wellboost logo"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-[#00D9A0]/20 shadow-sm"
          />
          <span className="text-xl sm:text-2xl font-black tracking-tight text-[#0B1F1A] font-serif">
            Aspire Wellboost
          </span>
        </Link>

        <div className="hidden md:flex min-w-0 items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 w-96 transition-all duration-300 focus-within:border-[#00D9A0]/50 focus-within:bg-white focus-within:shadow-sm">
          <Search size={18} className="text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              if (onSearchChange) onSearchChange(e.target.value);
              navigate('/');
            }}
            placeholder="Search healthy products..."
            className="bg-transparent text-slate-700 placeholder-slate-400 outline-none w-full text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 shrink-0">
          <button
            aria-label="Wishlist"
            className="p-2.5 rounded-full text-slate-500 hover:text-[#FF5C8A] hover:bg-[#FF5C8A]/10 transition-all duration-300 active:scale-90"
          >
            <Heart size={20} />
          </button>

          <button
            onClick={onOpenCart}
            aria-label="Cart"
            className="relative p-2.5 bg-[#0B1F1A] hover:bg-slate-800 rounded-full transition-all duration-300 active:scale-90 shadow-sm"
          >
            <ShoppingBag size={20} className="text-white" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-[#FF5C8A] to-[#FF3D6E] text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white animate-fadeIn">
                {cartCount}
              </span>
            )}
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2 border-l border-slate-250 pl-2 sm:pl-3 ml-1">
              <div className="hidden lg:flex flex-col text-right text-xs">
                <span className="font-bold text-slate-800 line-clamp-1">{currentUser.name || 'Profile'}</span>
              </div>
              <button
                onClick={onLogout}
                title="Log Out"
                className="p-2 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-300"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="bg-white text-[#0B1F1A] border border-slate-200 hover:border-[#00D9A0]/40 hover:bg-[#F1FFF9] text-xs font-extrabold px-3 py-2.5 rounded-xl transition-all whitespace-nowrap"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-[#00D9A0] to-[#00A87D] hover:from-[#00E8AC] hover:to-[#00B889] text-white text-xs font-extrabold px-3 py-2.5 rounded-xl transition-all shadow-sm shadow-[#00D9A0]/20 whitespace-nowrap"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
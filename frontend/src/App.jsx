import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import Auth from './pages/Auth';

function App() {
  const [searchFilter, setSearchFilter] = useState('');
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return null;
    const parsedUser = JSON.parse(storedUser);
    return {
      ...parsedUser,
      id: parsedUser.id || parsedUser._id,
      _id: parsedUser._id || parsedUser.id,
    };
  });
  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        id: currentUser.id || currentUser._id,
        _id: currentUser._id || currentUser.id,
      }));
    } else {
      localStorage.removeItem('user');
    }
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const handleOpenCart = () => {
    setIsCartOpen(true);
  };

  const handleCloseCart = () => {
    setIsCartOpen(false);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar
          cartCount={cartCount}
          onOpenCart={handleOpenCart}
          currentUser={currentUser}
          onLogout={handleLogout}
          searchQuery={searchFilter}
          onSearchChange={setSearchFilter}
        />

        <div className="flex-1">
          <Routes>
          <Route path="/" element={<Home searchFilter={searchFilter} />} />
          <Route path="/login" element={<Auth mode="login" onAuthSuccess={setCurrentUser} />} />
          <Route path="/signup" element={<Auth mode="signup" onAuthSuccess={setCurrentUser} />} />
          <Route path="/auth" element={<Navigate to="/login" replace />} />
          <Route
            path="/product/:slug"
            element={<ProductDetails userId={currentUser?.id} triggerCartRefresh={() => setCartCount((count) => count + 1)} />}
          />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </div>

        <Footer />
        <CartDrawer isOpen={isCartOpen} onClose={handleCloseCart} userId={currentUser} />
      </div>
    </BrowserRouter>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu as MenuIcon,
  X,
  ShoppingBag,
  Phone,
  Flame,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount, openOrderModal, settings } = useRestaurant();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Secret keyboard shortcut (Ctrl+Shift+A or Cmd+Shift+A) to quickly access admin portal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        navigate('/admin/login');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Close mobile menu on page change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Menu', path: '/menu' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-stone-200/80 py-3'
            : 'bg-white border-b border-stone-100 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-[#C62828] flex items-center justify-center text-white shadow-md shadow-red-900/20 group-hover:scale-105 transition-transform">
                <Flame className="w-6 h-6 text-[#F57C00] fill-[#F57C00]" />
              </div>
              <div className="flex flex-col">
                <span className="font-['Poppins'] font-bold text-xl sm:text-2xl text-[#171717] tracking-tight leading-none">
                  Jales <span className="text-[#C62828]">Kitchen</span>
                </span>
                <span className="text-[11px] font-medium tracking-wider uppercase text-[#F57C00]">
                  Authentic Ghanaian Food
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-semibold transition-colors relative py-1 ${
                    isActive(link.path)
                      ? 'text-[#C62828]'
                      : 'text-stone-700 hover:text-[#C62828]'
                  }`}
                >
                  {link.name}
                  {isActive(link.path) && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C62828] rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              {/* WhatsApp Quick Link */}
              <a
                href={`https://wa.me/${settings.whatsappInternational}?text=${encodeURIComponent(
                  'Hello Jales Kitchen, I would like to enquire about your meals!'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-green-700 bg-stone-50 hover:bg-green-50 px-3 py-1.5 rounded-full border border-stone-200 transition-colors"
                title="Chat on WhatsApp"
              >
                <Phone className="w-3.5 h-3.5 text-green-600" />
                <span>{settings.phone}</span>
              </a>

              {/* Order / Cart Button */}
              <button
                onClick={() => openOrderModal()}
                className="relative flex items-center gap-2 bg-[#C62828] hover:bg-[#b02222] text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-medium text-sm shadow-sm transition-all hover:shadow-md cursor-pointer active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="font-semibold">Order Now</span>
                {cartCount > 0 && (
                  <span className="bg-[#F57C00] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center -mr-1">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-stone-700 hover:bg-stone-100 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/50 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-6 shadow-2xl border-t border-stone-100 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#C62828] flex items-center justify-center text-white">
                  <Flame className="w-5 h-5 text-[#F57C00] fill-[#F57C00]" />
                </div>
                <span className="font-['Poppins'] font-bold text-lg text-[#171717]">
                  Jales Kitchen
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-semibold transition-colors flex items-center justify-between ${
                    isActive(link.path)
                      ? 'bg-red-50 text-[#C62828]'
                      : 'text-stone-800 hover:bg-stone-50'
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive(link.path) && (
                    <span className="w-2 h-2 rounded-full bg-[#C62828]" />
                  )}
                </Link>
              ))}
            </div>

            <div className="pt-4 border-t border-stone-100 flex flex-col gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openOrderModal();
                }}
                className="w-full bg-[#C62828] text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-sm"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Place Order {cartCount > 0 ? `(${cartCount} items)` : ''}</span>
              </button>

              <a
                href={`https://wa.me/${settings.whatsappInternational}?text=${encodeURIComponent(
                  'Hello Jales Kitchen, I would like to place an order!'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                <span>WhatsApp: {settings.whatsapp}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

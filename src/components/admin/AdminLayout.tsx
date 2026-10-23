import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Mail,
  Settings,
  LogOut,
  Flame,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRestaurant } from '../../context/RestaurantContext';

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { orders, messages } = useRestaurant();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    navigate('/admin/login');
    return null;
  }

  const unreadMessagesCount = messages.filter((m) => !m.is_read).length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Menu Items', path: '/admin/menu', icon: UtensilsCrossed },
    {
      name: 'Orders',
      path: '/admin/orders',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : undefined,
    },
    {
      name: 'Messages',
      path: '/admin/messages',
      icon: Mail,
      badge: unreadMessagesCount > 0 ? `${unreadMessagesCount}` : undefined,
    },
    { name: 'Settings & Security', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row font-['Inter',sans-serif]">

      {/* Mobile Admin Header */}
      <div className="md:hidden bg-[#171717] text-white p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#C62828] flex items-center justify-center text-white">
            <Flame className="w-5 h-5 text-[#F57C00] fill-[#F57C00]" />
          </div>
          <span className="font-['Poppins'] font-bold text-base text-white">
            Jales Admin
          </span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 text-stone-300 hover:text-white"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop & Mobile Sidebar */}
      <aside
        className={`w-full md:w-64 bg-[#171717] text-white shrink-0 flex flex-col justify-between transition-all ${
          mobileSidebarOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        <div className="p-6">
          {/* Brand & Badge */}
          <div className="flex items-center gap-2.5 pb-6 border-b border-stone-800">
            <div className="w-10 h-10 rounded-xl bg-[#C62828] flex items-center justify-center text-white shadow-md">
              <Flame className="w-6 h-6 text-[#F57C00] fill-[#F57C00]" />
            </div>
            <div>
              <span className="font-['Poppins'] font-bold text-lg text-white block leading-none">
                Jales Kitchen
              </span>
              <span className="text-[10px] font-semibold text-[#F57C00] uppercase tracking-wider">
                Management Portal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-[#C62828] text-white shadow-xs'
                      : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        active ? 'bg-white text-[#C62828]' : 'bg-[#F57C00] text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with user info & logout */}
        <div className="p-6 border-t border-stone-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <div>
              <p className="font-semibold text-stone-200 truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[11px] text-stone-400 truncate">{user?.email}</p>
            </div>
            <Link
              to="/admin/settings?tab=security"
              className="text-[#F57C00] hover:underline text-[11px] font-semibold cursor-pointer"
              title="Change Password in Settings"
            >
              Password
            </Link>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/"
              target="_blank"
              className="flex items-center justify-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content View */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  CheckCircle,
  XCircle,
  ShoppingBag,
  Mail,
  ArrowRight,
  Clock,
  Database,
  ExternalLink,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

export const AdminOverviewPage: React.FC = () => {
  const { menuItems, orders, messages, isDbConnected } = useRestaurant();

  // Real stats
  const totalMenuItems = menuItems.length;
  const availableItems = menuItems.filter((i) => i.is_available).length;
  const unavailableItems = totalMenuItems - availableItems;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const unreadMessages = messages.filter((m) => !m.is_read).length;

  const recentOrders = orders.slice(0, 5);
  const recentMessages = messages.slice(0, 5);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Poppins'] font-bold text-2xl sm:text-3xl text-[#171717]">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Real-time status of Jales Kitchen menu, customer orders, and inquiries.
          </p>
        </div>

        {/* Database Status indicator pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 border ${
              isDbConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-stone-50 text-stone-600 border-stone-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>
              {isDbConnected ? 'Supabase Live Connected' : 'Local Storage Mode'}
            </span>
          </div>
          <Link
            to="/admin/settings"
            className="text-xs text-[#C62828] hover:underline font-semibold"
          >
            Config
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Menu Items */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Total Dishes</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-[#C62828] flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <div className="font-['Poppins'] font-bold text-2xl sm:text-3xl text-[#171717]">
            {totalMenuItems}
          </div>
          <div className="text-[11px] text-stone-400">Listed on restaurant menu</div>
        </div>

        {/* Available Items */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Available</span>
            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="font-['Poppins'] font-bold text-2xl sm:text-3xl text-green-600">
            {availableItems}
          </div>
          <div className="text-[11px] text-stone-400">Ready for order today</div>
        </div>

        {/* Unavailable Items */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Unavailable</span>
            <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="font-['Poppins'] font-bold text-2xl sm:text-3xl text-stone-700">
            {unavailableItems}
          </div>
          <div className="text-[11px] text-stone-400">Marked as sold out</div>
        </div>

        {/* Recorded Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Recorded Orders</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#F57C00] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-['Poppins'] font-bold text-2xl sm:text-3xl text-[#171717]">
            {totalOrders}
          </div>
          <div className="text-[11px] text-[#F57C00] font-medium">
            {pendingOrders} awaiting confirmation
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Recent Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-['Poppins'] font-bold text-lg text-[#171717]">
                Recent Orders
              </h2>
              <p className="text-xs text-stone-400">Latest customer meal orders</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-[#C62828] hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No orders recorded yet.</p>
              <p className="mt-1">Customer WhatsApp orders will appear here automatically.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#C62828]">{order.order_number}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.status === 'Completed'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'Cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="font-semibold text-stone-800 text-sm">{order.customer_name}</p>
                    <p className="text-stone-500">
                      {order.items.length} items • {order.delivery_method === 'delivery' ? 'Delivery' : 'Pickup'}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-['Poppins'] font-bold text-sm text-[#171717]">
                      GH₵{order.total.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-stone-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Contact Inquiries */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-['Poppins'] font-bold text-lg text-[#171717]">
                Customer Inquiries
              </h2>
              <p className="text-xs text-stone-400">
                {unreadMessages} unread message{unreadMessages === 1 ? '' : 's'}
              </p>
            </div>
            <Link
              to="/admin/messages"
              className="text-xs font-bold text-[#C62828] hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentMessages.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              <Mail className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No messages received yet.</p>
              <p className="mt-1">Inquiries submitted via the Contact page will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-colors ${
                    msg.is_read
                      ? 'bg-stone-50 border-stone-200/70 text-stone-600'
                      : 'bg-red-50/50 border-red-200 text-stone-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{msg.full_name}</span>
                    <span className="text-[10px] text-stone-400">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="font-semibold text-stone-800 truncate">{msg.subject}</p>
                  <p className="text-stone-500 line-clamp-2 text-[11px]">{msg.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

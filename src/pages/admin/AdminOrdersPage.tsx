import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle,
  Phone,
  MapPin,
  Clock,
  Calendar,
  Eye,
  X,
  MessageCircle,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Order, OrderStatus } from '../../types';

export const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, settings } = useRestaurant();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const statuses: OrderStatus[] = [
    'Pending',
    'Confirmed',
    'Preparing',
    'Ready for pickup',
    'Out for delivery',
    'Completed',
    'Cancelled',
  ];

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const query = search.trim().toLowerCase();
    const matchesQuery =
      query === '' ||
      o.order_number.toLowerCase().includes(query) ||
      o.customer_name.toLowerCase().includes(query) ||
      o.customer_phone.toLowerCase().includes(query);
    return matchesStatus && matchesQuery;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Preparing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Out for delivery':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Confirmed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Ready for pickup':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Poppins'] font-bold text-2xl sm:text-3xl text-[#171717]">
            Recorded Orders
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Track customer meal requests, status updates, and delivery addresses.
          </p>
        </div>

        <div className="text-xs bg-amber-50 text-amber-800 p-2.5 rounded-xl border border-amber-200 max-w-xs">
          Notice: Statuses are for internal kitchen workflow tracking.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ref, name, or phone..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#C62828]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-stone-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700 focus:outline-hidden focus:border-[#C62828] cursor-pointer"
          >
            <option value="all">All Statuses ({orders.length})</option>
            {statuses.map((st) => (
              <option key={st} value={st}>
                {st} ({orders.filter((o) => o.status === st).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Ref Number</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Type & Area</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-stone-400">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>No orders matching filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                    {/* Order Reference */}
                    <td className="py-3.5 px-4 font-bold text-[#C62828] whitespace-nowrap">
                      {order.order_number}
                    </td>

                    {/* Customer Info */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-bold text-stone-900">{order.customer_name}</p>
                      <a
                        href={`tel:${order.customer_phone}`}
                        className="text-[11px] text-stone-500 hover:text-stone-900 flex items-center gap-1 mt-0.5"
                      >
                        <Phone className="w-3 h-3 text-[#F57C00]" />
                        <span>{order.customer_phone}</span>
                      </a>
                    </td>

                    {/* Delivery Method & Area */}
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-stone-800 capitalize">
                        {order.delivery_method}
                      </span>
                      {order.delivery_area && (
                        <p className="text-[11px] text-stone-400 truncate max-w-xs">
                          {order.delivery_area}
                        </p>
                      )}
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-stone-800">
                        {order.items.reduce((sum, it) => sum + it.quantity, 0)} meals
                      </span>
                      <p className="text-[11px] text-stone-400 line-clamp-1 max-w-xs">
                        {order.items.map((it) => `${it.item_name} (x${it.quantity})`).join(', ')}
                      </p>
                    </td>

                    {/* Total in GH₵ */}
                    <td className="py-3.5 px-4 font-bold text-stone-900 whitespace-nowrap">
                      GH₵{order.total.toFixed(2)}
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value as OrderStatus)
                        }
                        className={`text-xs font-bold py-1 px-2.5 rounded-lg border cursor-pointer focus:outline-hidden ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {statuses.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* View Button */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 text-stone-500 hover:text-[#C62828] hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                        title="View Full Order Breakdown"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <div>
                <span className="text-xs font-bold text-[#C62828] uppercase">
                  Order Breakdown
                </span>
                <h2 className="font-['Poppins'] font-bold text-xl text-[#171717]">
                  {selectedOrder.order_number}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              {/* Customer Box */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/80 space-y-1">
                <p className="font-bold text-stone-900 text-base">
                  {selectedOrder.customer_name}
                </p>
                <div className="flex items-center gap-2 text-stone-600">
                  <Phone className="w-3.5 h-3.5 text-[#F57C00]" />
                  <span>{selectedOrder.customer_phone}</span>
                  <a
                    href={`https://wa.me/${selectedOrder.customer_phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline font-semibold ml-2 flex items-center gap-1"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="space-y-1 text-stone-600">
                <p className="font-semibold text-stone-900">
                  Method: <span className="capitalize">{selectedOrder.delivery_method}</span>
                </p>
                {selectedOrder.delivery_method === 'delivery' && (
                  <>
                    <p>
                      <strong>Area:</strong> {selectedOrder.delivery_area}
                    </p>
                    <p>
                      <strong>Address:</strong> {selectedOrder.delivery_address}
                    </p>
                    {selectedOrder.location_link && (
                      <p>
                        <strong>Location/Directions:</strong>{' '}
                        <a
                          href={selectedOrder.location_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#C62828] underline break-all"
                        >
                          {selectedOrder.location_link}
                        </a>
                      </p>
                    )}
                  </>
                )}
                {selectedOrder.preferred_time && (
                  <p>
                    <strong>Preferred Time:</strong> {selectedOrder.preferred_time}
                  </p>
                )}
                {selectedOrder.payment_preference && (
                  <p>
                    <strong>Payment Preference:</strong> {selectedOrder.payment_preference}
                  </p>
                )}
                {selectedOrder.additional_instructions && (
                  <p className="bg-orange-50/60 p-2 rounded-lg border border-orange-100 text-orange-950">
                    <strong>Instructions:</strong> {selectedOrder.additional_instructions}
                  </p>
                )}
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-bold text-stone-900 mb-2">Dishes Ordered:</h4>
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-stone-800">{it.item_name}</span>
                        <span className="text-stone-400 ml-2">x {it.quantity}</span>
                      </div>
                      <span className="font-semibold text-stone-900">
                        GH₵{it.line_total.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-stone-50 p-3.5 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Subtotal</span>
                  <span className="font-semibold text-stone-800">
                    GH₵{selectedOrder.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Delivery Fee</span>
                  <span className="font-semibold text-stone-800">
                    GH₵{selectedOrder.delivery_fee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#171717] pt-1 border-t border-stone-200">
                  <span>Grand Total</span>
                  <span className="text-[#C62828] font-extrabold text-base">
                    GH₵{selectedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Status Update */}
              <div className="pt-2 flex items-center justify-between">
                <span className="font-semibold text-stone-700">Kitchen Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)
                  }
                  className={`text-xs font-bold py-1.5 px-3 rounded-xl border cursor-pointer ${getStatusBadge(
                    selectedOrder.status
                  )}`}
                >
                  {statuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

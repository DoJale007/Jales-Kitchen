import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Bike,
  Store,
  Phone,
  User,
  MapPin,
  Clock,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  MessageCircle,
  Info,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { OrderItem } from '../../types';

export const OrderModal: React.FC = () => {
  const {
    isOrderModalOpen,
    closeOrderModal,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    menuItems,
    settings,
    createOrder,
  } = useRestaurant();

  // Form Fields State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryArea, setDeliveryArea] = useState('');
  const [locationLink, setLocationLink] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [paymentPreference, setPaymentPreference] = useState('Cash on Delivery');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  // UI status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [lastOrderDetails, setLastOrderDetails] = useState<{
    orderNumber: string;
    waUrl: string;
    savedToDb: boolean;
  } | null>(null);

  if (!isOrderModalOpen) return null;

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const deliveryFee = deliveryMethod === 'delivery' ? settings.deliveryFee : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleAddItemFromDropdown = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    const found = menuItems.find((m) => m.id === selectedId);
    if (found) {
      addToCart(found, 1);
    }
    e.target.value = '';
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);

    // Validation
    if (cart.length === 0) {
      setErrorNotice('Please select at least one food item for your order.');
      return;
    }
    if (!fullName.trim()) {
      setErrorNotice('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setErrorNotice('Please provide your phone number so we can reach you.');
      return;
    }
    if (deliveryMethod === 'delivery') {
      if (!deliveryAddress.trim()) {
        setErrorNotice('Please provide your delivery address or landmark.');
        return;
      }
      if (!deliveryArea.trim()) {
        setErrorNotice('Please provide your neighbourhood/area (e.g. East Legon, Spintex, Osu).');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Map items to snapshot order items
      const orderItemsData: OrderItem[] = cart.map((c) => ({
        menu_item_id: c.menuItem.id,
        item_name: c.menuItem.name,
        unit_price: c.menuItem.price,
        quantity: c.quantity,
        line_total: c.menuItem.price * c.quantity,
      }));

      // Call createOrder
      const result = await createOrder({
        customer_name: fullName.trim(),
        customer_phone: phone.trim(),
        delivery_method: deliveryMethod,
        delivery_address: deliveryMethod === 'delivery' ? deliveryAddress.trim() : undefined,
        delivery_area: deliveryMethod === 'delivery' ? deliveryArea.trim() : undefined,
        location_link: locationLink.trim() || undefined,
        preferred_date: preferredDate || undefined,
        preferred_time: preferredTime.trim() || undefined,
        payment_preference: paymentPreference,
        subtotal,
        delivery_fee: deliveryFee,
        total: grandTotal,
        additional_instructions: additionalInstructions.trim() || undefined,
        items: orderItemsData,
      });

      const orderNumber = result.order?.order_number || `JK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Construct formatted WhatsApp message per Section 9 specification
      const formattedItemsList = orderItemsData
        .map(
          (item, index) =>
            `${index + 1}. ${item.item_name} x ${item.quantity} — GH₵${item.line_total.toFixed(2)}`
        )
        .join('\n');

      const messageParts = [
        'Hello Jales Kitchen! I would like to place an order.',
        '',
        'ORDER DETAILS',
        `Order reference: ${orderNumber}`,
        '',
        'CUSTOMER DETAILS',
        `Name: ${fullName.trim()}`,
        `Phone: ${phone.trim()}`,
        '',
        'ITEMS',
        formattedItemsList,
        '',
        `Subtotal: GH₵${subtotal.toFixed(2)}`,
        `Delivery fee: GH₵${deliveryFee.toFixed(2)}`,
        `Total: GH₵${grandTotal.toFixed(2)}`,
        '',
        `Order type: ${deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}`,
        deliveryMethod === 'delivery' ? `Location: ${deliveryAddress.trim()}` : null,
        deliveryMethod === 'delivery' ? `Area: ${deliveryArea.trim()}` : null,
        locationLink.trim() ? `Maps link/Directions: ${locationLink.trim()}` : null,
        preferredDate ? `Preferred date: ${preferredDate}` : null,
        preferredTime.trim() ? `Preferred time: ${preferredTime.trim()}` : null,
        `Payment preference: ${paymentPreference}`,
        additionalInstructions.trim() ? `Additional instructions: ${additionalInstructions.trim()}` : null,
        '',
        'Please confirm availability and delivery arrangements. Thank you!',
      ].filter((line) => line !== null);

      const fullMessageText = messageParts.join('\n');
      const whatsappUrl = `https://wa.me/${settings.whatsappInternational}?text=${encodeURIComponent(
        fullMessageText
      )}`;

      setLastOrderDetails({
        orderNumber,
        waUrl: whatsappUrl,
        savedToDb: result.savedToDb,
      });

      // Clear cart once order is formulated
      clearCart();
    } catch (err: any) {
      console.error('Order placement failed:', err);
      setErrorNotice(err.message || 'Something went wrong while preparing your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#C62828] to-[#b02222] text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-200">
              Jales Kitchen Express Order
            </span>
            <h2 className="font-['Poppins'] font-bold text-xl sm:text-2xl text-white">
              {lastOrderDetails ? 'Order Prepared!' : 'Complete Your Order'}
            </h2>
          </div>
          <button
            onClick={closeOrderModal}
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Post-submission Success Screen */}
          {lastOrderDetails ? (
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-semibold px-3 py-1 bg-stone-100 rounded-full text-stone-700">
                  Ref: <span className="text-[#C62828] font-bold">{lastOrderDetails.orderNumber}</span>
                </span>
                <h3 className="font-['Poppins'] font-bold text-2xl text-[#171717]">
                  Ready to Send on WhatsApp
                </h3>
                <p className="text-stone-600 text-sm max-w-md mx-auto leading-relaxed">
                  Your order details and reference have been compiled. Tap the button below to open
                  WhatsApp and press <strong className="text-stone-900">Send</strong> to deliver your
                  order to Jales Kitchen.
                </p>
              </div>

              {!lastOrderDetails.savedToDb && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2 text-left max-w-md mx-auto">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Database is currently running in local mode. Your order will still go directly to
                    our WhatsApp kitchen chat with all items and calculations intact!
                  </span>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <a
                  href={lastOrderDetails.waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 text-base"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Open WhatsApp to Send</span>
                </a>
                <button
                  onClick={() => {
                    setLastOrderDetails(null);
                    closeOrderModal();
                  }}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold py-3.5 px-5 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Error Banner */}
              {errorNotice && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-[#C62828] shrink-0 mt-0.5" />
                  <span>{errorNotice}</span>
                </div>
              )}

              {/* SECTION 1: Selected Meals */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-['Poppins'] font-bold text-base text-[#171717] flex items-center gap-2">
                    <span>1. Selected Meals</span>
                    <span className="text-xs font-normal text-stone-500">
                      ({cart.length} {cart.length === 1 ? 'item' : 'items'})
                    </span>
                  </h3>
                  {cart.length > 0 && (
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-xs text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear all</span>
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="p-6 bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-center">
                    <p className="text-sm text-stone-600 mb-3">Your order tray is currently empty.</p>
                    <p className="text-xs text-stone-500 mb-4">
                      Choose a meal from the menu below or close this window to browse.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div
                        key={item.menuItem.id}
                        className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200/80 hover:border-stone-300 transition-colors"
                      >
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="font-semibold text-sm text-[#171717] truncate">
                            {item.menuItem.name}
                          </p>
                          <p className="text-xs text-stone-500">
                            GH₵{item.menuItem.price.toFixed(2)} each
                          </p>
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-white rounded-lg border border-stone-200 shadow-2xs">
                            <button
                              type="button"
                              onClick={() =>
                                updateCartQuantity(item.menuItem.id, item.quantity - 1)
                              }
                              className="p-1.5 text-stone-600 hover:text-black hover:bg-stone-100 rounded-l-lg transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-stone-800">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateCartQuantity(item.menuItem.id, item.quantity + 1)
                              }
                              className="p-1.5 text-stone-600 hover:text-black hover:bg-stone-100 rounded-r-lg transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="font-bold text-sm text-[#171717] min-w-16 text-right">
                            GH₵{(item.menuItem.price * item.quantity).toFixed(2)}
                          </span>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.menuItem.id)}
                            className="p-1 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Add Another Dish Selector */}
                <div className="mt-3">
                  <select
                    onChange={handleAddItemFromDropdown}
                    defaultValue=""
                    className="w-full text-xs sm:text-sm bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-700 focus:outline-hidden focus:border-[#C62828] cursor-pointer"
                  >
                    <option value="" disabled>
                      + Add another dish or drink to this order...
                    </option>
                    {menuItems
                      .filter((m) => m.is_available)
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} — GH₵{m.price.toFixed(2)}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* SECTION 2: Customer Contact Information */}
              <div>
                <h3 className="font-['Poppins'] font-bold text-base text-[#171717] mb-3 flex items-center gap-2">
                  <span>2. Customer Details</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Full Name <span className="text-[#C62828]">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Kwame Mensah"
                        className="w-full pl-9 pr-3 py-2.5 text-base sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#C62828] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Phone Number (WhatsApp) <span className="text-[#C62828]">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 0244123456"
                        className="w-full pl-9 pr-3 py-2.5 text-base sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#C62828] transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Delivery or Pickup */}
              <div>
                <h3 className="font-['Poppins'] font-bold text-base text-[#171717] mb-3">
                  3. Delivery Method
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('delivery')}
                    className={`py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      deliveryMethod === 'delivery'
                        ? 'border-[#C62828] bg-red-50 text-[#C62828] shadow-xs'
                        : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <Bike className="w-4 h-4" />
                    <span>Home/Office Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      deliveryMethod === 'pickup'
                        ? 'border-[#C62828] bg-red-50 text-[#C62828] shadow-xs'
                        : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>Restaurant Pickup</span>
                  </button>
                </div>

                {deliveryMethod === 'delivery' ? (
                  <div className="space-y-3 bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Area / Neighbourhood <span className="text-[#C62828]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={deliveryArea}
                          onChange={(e) => setDeliveryArea(e.target.value)}
                          placeholder="e.g. East Legon, Spintex, Osu"
                          className="w-full px-3 py-2 text-base sm:text-sm bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#C62828]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Delivery Address / Landmark <span className="text-[#C62828]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Street name, house number or prominent landmark"
                          className="w-full px-3 py-2 text-base sm:text-sm bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#C62828]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Google Maps Location link or Directions (optional)
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={locationLink}
                          onChange={(e) => setLocationLink(e.target.value)}
                          placeholder="Paste Google Maps link or special gate instructions"
                          className="w-full pl-9 pr-3 py-2 text-base sm:text-sm bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#C62828]"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#F57C00] shrink-0" />
                    <span>
                      Pickup at Jales Kitchen in Accra. We will have your meal hot and packed ready
                      for collection!
                    </span>
                  </div>
                )}
              </div>

              {/* SECTION 4: Time and Payment Preference */}
              <div>
                <h3 className="font-['Poppins'] font-bold text-base text-[#171717] mb-3">
                  4. Time & Preferences
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>Preferred Date</span>
                    </label>
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3 py-2 text-base sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#C62828]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>Preferred Time</span>
                    </label>
                    <input
                      type="text"
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      placeholder="e.g. ASAP / 1:30 PM"
                      className="w-full px-3 py-2 text-base sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#C62828]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-stone-400" />
                      <span>Payment Preference</span>
                    </label>
                    <select
                      value={paymentPreference}
                      onChange={(e) => setPaymentPreference(e.target.value)}
                      className="w-full px-3 py-2 text-base sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#C62828] cursor-pointer"
                    >
                      <option value="Cash on Delivery">Cash on Delivery</option>
                      <option value="Mobile Money (MoMo) on Delivery">Mobile Money (MoMo)</option>
                      <option value="Payment on Pickup">Payment on Pickup</option>
                      <option value="Confirm with restaurant">Confirm with restaurant</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Special Cooking / Delivery Instructions (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={additionalInstructions}
                    onChange={(e) => setAdditionalInstructions(e.target.value)}
                    placeholder="e.g. Mild pepper please, extra shito on the side, pack separately..."
                    className="w-full px-3 py-2 text-base sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#C62828]"
                  />
                </div>
              </div>

              {/* Order Summary & Pricing Box */}
              <div className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200/90 space-y-2.5">
                <div className="flex justify-between text-sm text-stone-600">
                  <span>Food Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} items)</span>
                  <span className="font-semibold text-stone-900">GH₵{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-stone-600">
                  <span className="flex items-center gap-1">
                    <span>Delivery Fee</span>
                    {deliveryMethod === 'pickup' && (
                      <span className="text-xs text-green-600 font-medium">(Pickup Free)</span>
                    )}
                  </span>
                  <span className="font-semibold text-stone-900">
                    GH₵{deliveryFee.toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
                  <span className="font-['Poppins'] font-bold text-base text-[#171717]">
                    Total Amount
                  </span>
                  <div className="text-right">
                    <span className="font-['Poppins'] font-extrabold text-xl sm:text-2xl text-[#C62828]">
                      GH₵{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 pt-1 leading-relaxed">
                  * Note: Delivery fees and real-time kitchen availability will be confirmed directly
                  with you via WhatsApp upon message receipt. No advance payment is charged here.
                </p>
              </div>

              {/* Form Submission Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full bg-[#C62828] hover:bg-[#b02222] text-white py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-red-900/20 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 text-white" />
                  <span>
                    {isSubmitting ? 'Preparing Order...' : 'Place Order on WhatsApp'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

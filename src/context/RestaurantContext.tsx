import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  MenuItem,
  Category,
  Order,
  OrderStatus,
  ContactMessage,
  RestaurantSettings,
  CartItem,
} from '../types';
import { initialCategories, initialMenuItems, initialSettings } from '../data/initialData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface RestaurantContextType {
  categories: Category[];
  menuItems: MenuItem[];
  settings: RestaurantSettings;
  orders: Order[];
  messages: ContactMessage[];
  cart: CartItem[];
  cartTotal: number;
  cartCount: number;
  isOrderModalOpen: boolean;
  selectedItemForOrder: MenuItem | null;
  isDbConnected: boolean;
  dbError: string | null;
  isLoading: boolean;
  
  // Cart Actions
  addToCart: (item: MenuItem, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  openOrderModal: (item?: MenuItem) => void;
  closeOrderModal: () => void;
  
  // Order Actions
  createOrder: (
    orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'status'>
  ) => Promise<{ success: boolean; order?: Order; error?: string; savedToDb: boolean }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  
  // Message Actions
  sendContactMessage: (
    messageData: Omit<ContactMessage, 'id' | 'created_at' | 'is_read'>
  ) => Promise<{ success: boolean; error?: string; savedToDb: boolean }>;
  markMessageAsRead: (id: string) => Promise<boolean>;
  deleteMessage: (id: string) => Promise<boolean>;
  
  // Menu Item Admin Actions
  addMenuItem: (
    item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<{ success: boolean; item?: MenuItem; error?: string }>;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<{ success: boolean; error?: string }>;
  deleteMenuItem: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleItemAvailability: (id: string) => Promise<boolean>;
  toggleItemFeatured: (id: string) => Promise<boolean>;
  
  // Settings Actions
  updateSettings: (newSettings: Partial<RestaurantSettings>) => Promise<boolean>;
  resetToDefaultData: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CATEGORIES: 'jales_kitchen_categories',
  MENU_ITEMS: 'jales_kitchen_menu_items',
  SETTINGS: 'jales_kitchen_settings',
  ORDERS: 'jales_kitchen_orders',
  MESSAGES: 'jales_kitchen_messages',
  CART: 'jales_kitchen_cart',
};

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
    return saved ? JSON.parse(saved) : initialMenuItems;
  });

  const [settings, setSettings] = useState<RestaurantSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : [];
  });

  const [messages, setMessages] = useState<ContactMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return saved ? JSON.parse(saved) : [];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CART);
    return saved ? JSON.parse(saved) : [];
  });

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedItemForOrder, setSelectedItemForOrder] = useState<MenuItem | null>(null);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  // Initial load from Supabase if configured
  useEffect(() => {
    const fetchSupabaseData = async () => {
      if (!isSupabaseConfigured() || !supabase) {
        setIsDbConnected(false);
        setIsLoading(false);
        return;
      }

      try {
        // Fetch categories
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });

        if (catError) throw catError;
        if (catData && catData.length > 0) {
          setCategories(catData);
        }

        // Fetch menu items
        const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select('*')
          .is('deleted_at', null)
          .order('sort_order', { ascending: true });

        if (menuError) throw menuError;
        if (menuData && menuData.length > 0) {
          setMenuItems(menuData);
        }

        // Fetch settings
        const { data: settData } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'restaurant_info')
          .single();

        if (settData?.value) {
          setSettings((prev) => ({ ...prev, ...settData.value }));
        }

        // Fetch orders if accessible
        const { data: orderData } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false });

        if (orderData && orderData.length > 0) {
          const formattedOrders: Order[] = orderData.map((o: any) => ({
            id: o.id,
            order_number: o.order_number,
            customer_name: o.customer_name,
            customer_phone: o.customer_phone,
            delivery_method: o.delivery_method,
            delivery_address: o.delivery_address,
            delivery_area: o.delivery_area,
            location_link: o.location_link,
            preferred_date: o.preferred_date,
            preferred_time: o.preferred_time,
            payment_preference: o.payment_preference,
            subtotal: Number(o.subtotal),
            delivery_fee: Number(o.delivery_fee),
            total: Number(o.total),
            additional_instructions: o.additional_instructions,
            status: o.status,
            created_at: o.created_at,
            items: (o.order_items || []).map((it: any) => ({
              id: it.id,
              order_id: it.order_id,
              menu_item_id: it.menu_item_id,
              item_name: it.item_name,
              unit_price: Number(it.unit_price),
              quantity: Number(it.quantity),
              line_total: Number(it.line_total),
            })),
          }));
          setOrders(formattedOrders);
        }

        setIsDbConnected(true);
        setDbError(null);
      } catch (err: any) {
        console.warn('Supabase initial fetch failed or credentials not yet active, falling back to local store:', err);
        setDbError(err.message || 'Could not connect to Supabase');
        setIsDbConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupabaseData();
  }, []);

  // Cart helpers
  const cartTotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const addToCart = (item: MenuItem, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItem.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItem.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { menuItem: item, quantity }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.menuItem.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.menuItem.id === itemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setCart([]);

  const openOrderModal = (item?: MenuItem) => {
    if (item) {
      setSelectedItemForOrder(item);
      // If not already in cart, add it
      const inCart = cart.find((i) => i.menuItem.id === item.id);
      if (!inCart) {
        addToCart(item, 1);
      }
    } else {
      setSelectedItemForOrder(null);
    }
    setIsOrderModalOpen(true);
  };

  const closeOrderModal = () => {
    setIsOrderModalOpen(false);
    setSelectedItemForOrder(null);
  };

  // Helper to generate dynamic order reference JK-XXXXXX
  const generateOrderReference = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `JK-${code}`;
  };

  // Create Order
  const createOrder = async (
    orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'status'>
  ) => {
    const orderNumber = generateOrderReference();
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      order_number: orderNumber,
      status: 'Pending',
      created_at: new Date().toISOString(),
    };

    let savedToDb = false;
    let errorMsg: string | undefined;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: orderRes, error: orderErr } = await supabase
          .from('orders')
          .insert({
            order_number: newOrder.order_number,
            customer_name: newOrder.customer_name,
            customer_phone: newOrder.customer_phone,
            delivery_method: newOrder.delivery_method,
            delivery_address: newOrder.delivery_address || null,
            delivery_area: newOrder.delivery_area || null,
            location_link: newOrder.location_link || null,
            preferred_date: newOrder.preferred_date || null,
            preferred_time: newOrder.preferred_time || null,
            payment_preference: newOrder.payment_preference || null,
            subtotal: newOrder.subtotal,
            delivery_fee: newOrder.delivery_fee,
            total: newOrder.total,
            additional_instructions: newOrder.additional_instructions || null,
            status: 'Pending',
          })
          .select()
          .single();

        if (orderErr) throw orderErr;

        if (orderRes && newOrder.items.length > 0) {
          const itemsToInsert = newOrder.items.map((item) => ({
            order_id: orderRes.id,
            menu_item_id: item.menu_item_id || null,
            item_name: item.item_name,
            unit_price: item.unit_price,
            quantity: item.quantity,
            line_total: item.line_total,
          }));

          const { error: itemErr } = await supabase.from('order_items').insert(itemsToInsert);
          if (itemErr) console.warn('Order items insert warning:', itemErr);
        }

        savedToDb = true;
      } catch (err: any) {
        console.warn('Failed to save order to Supabase:', err);
        errorMsg = err.message || 'Could not record order to database';
      }
    }

    // Always keep state updated locally so customer or admin sees order records
    setOrders((prev) => [newOrder, ...prev]);

    return {
      success: true,
      order: newOrder,
      savedToDb,
      error: errorMsg,
    };
  };

  // Update Order Status
  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('orders').update({ status }).eq('id', orderId);
      } catch (err) {
        console.warn('Supabase status update failed:', err);
      }
    }
    return true;
  };

  // Contact messages
  const sendContactMessage = async (
    msg: Omit<ContactMessage, 'id' | 'created_at' | 'is_read'>
  ) => {
    const newMsg: ContactMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    let savedToDb = false;
    let errorMsg: string | undefined;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.from('contact_messages').insert({
          full_name: newMsg.full_name,
          phone: newMsg.phone,
          email: newMsg.email || null,
          subject: newMsg.subject,
          message: newMsg.message,
          is_read: false,
        });
        if (error) throw error;
        savedToDb = true;
      } catch (err: any) {
        console.warn('Failed to save message to Supabase:', err);
        errorMsg = err.message;
      }
    }

    setMessages((prev) => [newMsg, ...prev]);
    return { success: true, savedToDb, error: errorMsg };
  };

  const markMessageAsRead = async (id: string): Promise<boolean> => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_read: true } : m))
    );
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
      } catch (e) {
        console.warn(e);
      }
    }
    return true;
  };

  const deleteMessage = async (id: string): Promise<boolean> => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('contact_messages').delete().eq('id', id);
      } catch (e) {
        console.warn(e);
      }
    }
    return true;
  };

  // Menu Admin Operations
  const addMenuItem = async (
    item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ success: boolean; item?: MenuItem; error?: string }> => {
    const newItem: MenuItem = {
      ...item,
      id: `item-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .insert({
            name: newItem.name,
            slug: newItem.slug,
            description: newItem.description,
            price: newItem.price,
            image_url: newItem.image_url,
            category_id: newItem.category_id || null,
            is_available: newItem.is_available,
            is_featured: newItem.is_featured,
            sort_order: newItem.sort_order,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          newItem.id = data.id;
        }
      } catch (err: any) {
        console.warn('Supabase addMenuItem error:', err);
        return { success: false, error: err.message };
      }
    }

    setMenuItems((prev) => [newItem, ...prev]);
    return { success: true, item: newItem };
  };

  const updateMenuItem = async (
    id: string,
    updates: Partial<MenuItem>
  ): Promise<{ success: boolean; error?: string }> => {
    const updatedTime = new Date().toISOString();
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, updated_at: updatedTime } : item))
    );

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('menu_items')
          .update({
            ...updates,
            updated_at: updatedTime,
          })
          .eq('id', id);
        if (error) throw error;
      } catch (err: any) {
        console.warn('Supabase updateMenuItem error:', err);
        return { success: false, error: err.message };
      }
    }

    return { success: true };
  };

  const deleteMenuItem = async (id: string): Promise<{ success: boolean; error?: string }> => {
    // Soft deletion to protect historical order records
    const now = new Date().toISOString();
    setMenuItems((prev) => prev.filter((item) => item.id !== id));

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('menu_items')
          .update({ deleted_at: now, is_available: false })
          .eq('id', id);
        if (error) throw error;
      } catch (err: any) {
        console.warn('Supabase deleteMenuItem error:', err);
        return { success: false, error: err.message };
      }
    }

    return { success: true };
  };

  const toggleItemAvailability = async (id: string): Promise<boolean> => {
    const target = menuItems.find((i) => i.id === id);
    if (!target) return false;
    const newStatus = !target.is_available;
    await updateMenuItem(id, { is_available: newStatus });
    return true;
  };

  const toggleItemFeatured = async (id: string): Promise<boolean> => {
    const target = menuItems.find((i) => i.id === id);
    if (!target) return false;
    const newStatus = !target.is_featured;
    await updateMenuItem(id, { is_featured: newStatus });
    return true;
  };

  const updateSettings = async (newSettings: Partial<RestaurantSettings>): Promise<boolean> => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      return merged;
    });

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('site_settings')
          .upsert({
            key: 'restaurant_info',
            value: { ...settings, ...newSettings },
            updated_at: new Date().toISOString(),
          });
      } catch (err) {
        console.warn('Failed to update Supabase site_settings:', err);
      }
    }

    return true;
  };

  const resetToDefaultData = () => {
    setCategories(initialCategories);
    setMenuItems(initialMenuItems);
    setSettings(initialSettings);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.MENU_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  };

  return (
    <RestaurantContext.Provider
      value={{
        categories,
        menuItems,
        settings,
        orders,
        messages,
        cart,
        cartTotal,
        cartCount,
        isOrderModalOpen,
        selectedItemForOrder,
        isDbConnected,
        dbError,
        isLoading,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        openOrderModal,
        closeOrderModal,
        createOrder,
        updateOrderStatus,
        sendContactMessage,
        markMessageAsRead,
        deleteMessage,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        toggleItemFeatured,
        updateSettings,
        resetToDefaultData,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};

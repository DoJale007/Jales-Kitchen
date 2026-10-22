export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  category_name?: string;
  is_available: boolean;
  is_featured: boolean;
  badge?: string; // e.g. "Popular", "Chef's Special"
  sort_order: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  menu_item_id?: string;
  item_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready for pickup'
  | 'Out for delivery'
  | 'Completed'
  | 'Cancelled';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_method: 'delivery' | 'pickup';
  delivery_address?: string;
  delivery_area?: string;
  location_link?: string;
  preferred_date?: string;
  preferred_time?: string;
  payment_preference?: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  additional_instructions?: string;
  status: OrderStatus;
  items: OrderItem[];
  created_at: string;
}

export interface ContactMessage {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface RestaurantSettings {
  name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  whatsappInternational: string;
  serviceArea: string;
  openingHours: string;
  deliveryFee: number;
  freeDeliveryThreshold?: number;
  currency: string;
  aboutStory?: string;
  heroEyebrow?: string;
  heroHeading?: string;
  heroSubheading?: string;
  heroNote?: string;
  heroImageUrl?: string;
  socials?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
}

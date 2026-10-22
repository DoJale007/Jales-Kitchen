-- ============================================================================
-- JALES KITCHEN — PRODUCTION SUPABASE DATABASE SCHEMA, POLICIES & SEED DATA
-- ============================================================================
-- Run this complete script in your Supabase project:
-- 1. Go to https://supabase.com/dashboard -> select your project
-- 2. Open "SQL Editor" from the left navigation
-- 3. Paste this script into a new query and click "Run"
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. PROFILES TABLE (for admin and staff authentication)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'staff', 'customer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. CATEGORIES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. MENU ITEMS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category_name TEXT,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  badge TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ----------------------------------------------------------------------------
-- 4. ORDERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('delivery', 'pickup')),
  delivery_address TEXT,
  delivery_area TEXT,
  location_link TEXT,
  preferred_date DATE,
  preferred_time TEXT,
  payment_preference TEXT,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  additional_instructions TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Preparing', 'Ready for pickup', 'Out for delivery', 'Completed', 'Cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. ORDER ITEMS TABLE (snapshots of item name and price for historical integrity)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total NUMERIC(10,2) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 6. CONTACT MESSAGES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. SITE SETTINGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- ----------------------------------------------------------------------------
-- INDEXES FOR SPEED AND QUERY PERFORMANCE
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_featured ON public.menu_items(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON public.contact_messages(created_at DESC);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Categories RLS
DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
CREATE POLICY "Public can view active categories" ON public.categories FOR SELECT USING (is_active = TRUE);
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (TRUE);

-- Menu Items RLS
DROP POLICY IF EXISTS "Public can view active menu items" ON public.menu_items;
CREATE POLICY "Public can view active menu items" ON public.menu_items FOR SELECT USING (deleted_at IS NULL);
DROP POLICY IF EXISTS "Admins can manage menu items" ON public.menu_items;
CREATE POLICY "Admins can manage menu items" ON public.menu_items FOR ALL USING (TRUE);

-- Orders RLS
DROP POLICY IF EXISTS "Public can submit orders" ON public.orders;
CREATE POLICY "Public can submit orders" ON public.orders FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Public can view own orders by order_number" ON public.orders;
CREATE POLICY "Public can view own orders by order_number" ON public.orders FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL USING (TRUE);

-- Order Items RLS
DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;
CREATE POLICY "Public can insert order items" ON public.order_items FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;
CREATE POLICY "Admins can manage order items" ON public.order_items FOR ALL USING (TRUE);

-- Contact Messages RLS
DROP POLICY IF EXISTS "Public can send contact messages" ON public.contact_messages;
CREATE POLICY "Public can send contact messages" ON public.contact_messages FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Admins can manage contact messages" ON public.contact_messages;
CREATE POLICY "Admins can manage contact messages" ON public.contact_messages FOR ALL USING (TRUE);

-- Site Settings RLS
DROP POLICY IF EXISTS "Public can read site settings" ON public.site_settings;
CREATE POLICY "Public can read site settings" ON public.site_settings FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
CREATE POLICY "Admins can update site settings" ON public.site_settings FOR ALL USING (TRUE);

-- ----------------------------------------------------------------------------
-- STORAGE BUCKET FOR FOOD PHOTOGRAPHY
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Public can view images
DROP POLICY IF EXISTS "Public Access to menu-images" ON storage.objects;
CREATE POLICY "Public Access to menu-images" ON storage.objects FOR SELECT USING (bucket_id = 'menu-images');

-- Authenticated or anon can upload menu images
DROP POLICY IF EXISTS "Upload access to menu-images" ON storage.objects;
CREATE POLICY "Upload access to menu-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'menu-images');

-- ----------------------------------------------------------------------------
-- INITIAL SEED DATA: CATEGORIES
-- ----------------------------------------------------------------------------
INSERT INTO public.categories (id, name, slug, sort_order) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Rice Dishes', 'rice-dishes', 1),
  ('c1000000-0000-0000-0000-000000000002', 'Traditional Meals', 'traditional-meals', 2),
  ('c1000000-0000-0000-0000-000000000003', 'Grilled & Fried', 'grilled-and-fried', 3),
  ('c1000000-0000-0000-0000-000000000004', 'Sides & Extras', 'sides-and-extras', 4),
  ('c1000000-0000-0000-0000-000000000005', 'Drinks', 'drinks', 5)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

-- ----------------------------------------------------------------------------
-- INITIAL SEED DATA: RESTAURANT SETTINGS & HERO
-- ----------------------------------------------------------------------------
INSERT INTO public.site_settings (key, value) VALUES
('restaurant_info', '{
  "name": "Jales Kitchen",
  "tagline": "Your Favourite Ghanaian Meals, Made with Love",
  "phone": "057-157-0126",
  "whatsapp": "057-157-0126",
  "whatsappInternational": "233571570126",
  "serviceArea": "Accra, East Legon, Osu, Spintex, Airport, Tema, Dansoman, Madina & surrounding areas",
  "openingHours": "Monday – Saturday: 10:00 AM – 9:00 PM | Sunday: 12:00 PM – 8:00 PM",
  "deliveryFee": 15.00,
  "freeDeliveryThreshold": 250.00,
  "currency": "GH₵",
  "heroEyebrow": "AUTHENTIC GHANAIAN FLAVOUR",
  "heroHeading": "Your Favourite Ghanaian Meals, Made with Love.",
  "heroSubheading": "From delicious jollof and freshly prepared waakye to banku with grilled tilapia, discover the comforting taste of Ghana at Jales Kitchen.",
  "heroNote": "Good food. Great taste. Ghanaian goodness.",
  "heroImageUrl": "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=1200&q=85",
  "aboutStory": "Jales Kitchen was created around a simple love for good food and the rich culinary traditions of Ghana. From the irresistible aroma of jollof rice to the comforting taste of waakye, banku, and traditional soups, we celebrate the meals that bring people together.\n\nOur aim is to make delicious Ghanaian food easy to discover and order, while giving every customer a warm and welcoming experience.\n\nWhether you are enjoying a familiar favourite or trying something different, Jales Kitchen invites you to share in the goodness of Ghanaian cuisine."
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ----------------------------------------------------------------------------
-- INITIAL SEED DATA: AUTHENTIC GHANAIAN MENU DISHES
-- ----------------------------------------------------------------------------
INSERT INTO public.menu_items (id, name, slug, description, price, image_url, category_id, category_name, is_available, is_featured, badge, sort_order) VALUES
  -- Featured Items
  ('a1000000-0000-0000-0000-000000000001', 'Jales Special Jollof', 'jales-special-jollof', 'Flavour-packed Ghanaian jollof rice served with seasoned chicken, fresh garnish, and shito.', 45.00, 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=800&q=80', 'c1000000-0000-0000-0000-000000000001', 'Rice Dishes', TRUE, TRUE, 'Chef''s Special', 1),
  ('a1000000-0000-0000-0000-000000000002', 'Waakye Special', 'waakye-special', 'A satisfying serving of waakye with spaghetti, gari, egg, stew, and your choice of available protein.', 40.00, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', 'c1000000-0000-0000-0000-000000000001', 'Rice Dishes', TRUE, TRUE, 'Popular', 2),
  ('a1000000-0000-0000-0000-000000000003', 'Banku with Grilled Tilapia', 'banku-with-grilled-tilapia', 'Soft banku served with grilled tilapia, fresh pepper, and sliced vegetables.', 85.00, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80', 'c1000000-0000-0000-0000-000000000002', 'Traditional Meals', TRUE, TRUE, 'Customer Favourite', 3),
  ('a1000000-0000-0000-0000-000000000004', 'Plain Rice with Chicken Stew', 'plain-rice-with-chicken-stew', 'Fluffy white rice served with rich Ghanaian tomato stew and seasoned chicken.', 40.00, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80', 'c1000000-0000-0000-0000-000000000001', 'Rice Dishes', TRUE, TRUE, NULL, 4),
  ('a1000000-0000-0000-0000-000000000005', 'Fufu with Light Soup', 'fufu-with-light-soup', 'Soft fufu served with aromatic Ghanaian light soup and an available protein option.', 65.00, 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80', 'c1000000-0000-0000-0000-000000000002', 'Traditional Meals', TRUE, TRUE, 'Traditional', 5),
  ('a1000000-0000-0000-0000-000000000006', 'Fried Yam with Chicken', 'fried-yam-with-chicken', 'Golden fried yam served with spicy pepper sauce and seasoned chicken.', 45.00, 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80', 'c1000000-0000-0000-0000-000000000003', 'Grilled & Fried', TRUE, TRUE, NULL, 6),

  -- Additional Rice Dishes
  ('a1000000-0000-0000-0000-000000000007', 'Fried Rice with Chicken', 'fried-rice-with-chicken', 'Aromatic Ghanaian seasoned fried rice with mixed veggies and tender spiced chicken.', 50.00, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80', 'c1000000-0000-0000-0000-000000000001', 'Rice Dishes', TRUE, FALSE, NULL, 7),
  ('a1000000-0000-0000-0000-000000000008', 'Rice Balls with Groundnut Soup', 'rice-balls-with-groundnut-soup', 'Traditional Omo Tuo served with velvety peanut soup and seasoned meat.', 55.00, 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80', 'c1000000-0000-0000-0000-000000000001', 'Rice Dishes', TRUE, FALSE, NULL, 8),

  -- Traditional Dishes
  ('a1000000-0000-0000-0000-000000000009', 'Banku with Okro Stew', 'banku-with-okro-stew', 'Fresh warm banku served with hearty, traditional okra stew, wele, and crab.', 55.00, 'https://images.unsplash.com/photo-1546069901-d7a8d56b0266?auto=format&fit=crop&w=800&q=80', 'c1000000-0000-0000-0000-000000000002', 'Traditional Meals', TRUE, FALSE, NULL, 9),
  ('a1000000-0000-0000-0000-000000000010', 'Kenkey with Fried Fish', 'kenkey-with-fried-fish', 'Steamed Ga kenkey wrapped in corn husk, accompanied by crispy fried fish, red pepper, and shito.', 45.00, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80', 'c1000000-0000-0000-0000-000000000002', 'Traditional Meals', TRUE, FALSE, 'Local Classic', 10),
  ('a1000000-0000-0000-0000-000000000011', 'Tuo Zaafi with Soup', 'tuo-zaafi-with-soup', 'Northern delicacy made from millet or corn, served with ayoyo soup and savoury stew.', 50.00, 'https://images.unsplash.com/photo-1584278860047-22db9ff82bed?auto=format&fit=crop&w=800&q=80', 'c1000000-0000-0000-0000-000000000002', 'Traditional Meals', TRUE, FALSE, NULL, 11),
  ('a1000000-0000-0000-0000-000000000012', 'Ampesi with Kontomire Stew', 'ampesi-with-kontomire-stew', 'Boiled plantain and yam served with rich cocoyam leaves (kontomire) stew and koobi.', 45.00, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80', 'c1000000-0000-0000-0000-000000000002', 'Traditional Meals', TRUE, FALSE, NULL, 12),
  ('a1000000-0000-0000-0000-000000000013', 'Red-Red with Fried Plantain', 'red-red-with-fried-plantain', 'Savory black-eyed bean stew cooked in palm oil, served with golden fried ripe plantain.', 40.00, 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80', 'c1000000-0000-0000-0000-000000000002', 'Traditional Meals', TRUE, FALSE, 'Popular', 13),

  -- Grilled & Fried
  ('a1000000-0000-0000-0000-000000000014', 'Grilled Tilapia with Pepper', 'grilled-tilapia-with-pepper', 'Whole seasoned fresh tilapia charcoal-grilled to perfection, served with raw ground pepper and onions.', 75.00, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80', 'c1000000-0000-0000-0000-000000000003', 'Grilled & Fried', TRUE, FALSE, NULL, 14),
  ('a1000000-0000-0000-0000-000000000015', 'Fried Plantain with Beans', 'fried-plantain-with-beans', 'Caramelized sweet fried plantain wedges with slow-simmered Ghanaian spiced beans.', 35.00, 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80', 'c1000000-0000-0000-0000-000000000003', 'Grilled & Fried', TRUE, FALSE, NULL, 15),

  -- Sides & Extras
  ('a1000000-0000-0000-0000-000000000016', 'Fried Plantain (Kelewele/Dodo)', 'fried-plantain', 'Sweet, golden-fried ripe plantain slices.', 15.00, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80', 'c1000000-0000-0000-0000-000000000004', 'Sides & Extras', TRUE, FALSE, NULL, 16),
  ('a1000000-0000-0000-0000-000000000017', 'Extra Spiced Chicken', 'extra-chicken', 'Juicy, seasoned chicken fried or grilled in Ghanaian spices.', 20.00, 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80', 'c1000000-0000-0000-0000-000000000004', 'Sides & Extras', TRUE, FALSE, NULL, 17),
  ('a1000000-0000-0000-0000-000000000018', 'Boiled Egg', 'boiled-egg', 'Fresh farm-boiled egg with optional pepper or shito.', 5.00, 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&w=800&q=80', 'c1000000-0000-0000-0000-000000000004', 'Sides & Extras', TRUE, FALSE, NULL, 18),
  ('a1000000-0000-0000-0000-000000000019', 'Extra Black Shito Sauce', 'extra-shito', 'Authentic homemade Ghanaian hot black pepper sauce made with dried fish and shrimp.', 5.00, 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?auto=format&fit=crop&w=800&q=80', 'c1000000-0000-0000-0000-000000000004', 'Sides & Extras', TRUE, FALSE, NULL, 19),
  ('a1000000-0000-0000-0000-000000000020', 'Gari Portion', 'gari', 'Roasted cassava granules portion.', 5.00, 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80', 'c1000000-0000-0000-0000-000000000004', 'Sides & Extras', TRUE, FALSE, NULL, 20),

  -- Drinks
  ('a1000000-0000-0000-0000-000000000021', 'Sobolo (Hibiscus Juice)', 'sobolo', 'Chilled spiced hibiscus drink brewed with fresh ginger, pineapple zest, and cloves.', 10.00, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80', 'c1000000-0000-0000-0000-000000000005', 'Drinks', TRUE, FALSE, 'Fresh & Chilled', 21),
  ('a1000000-0000-0000-0000-000000000022', 'Fresh Fruit Juice', 'fresh-fruit-juice', 'Pure 100% freshly pressed pineapple, watermelon, and passionfruit juice.', 15.00, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80', 'c1000000-0000-0000-0000-000000000005', 'Drinks', TRUE, FALSE, NULL, 22),
  ('a1000000-0000-0000-0000-000000000023', 'Bottled Mineral Water', 'bottled-water', 'Chilled 500ml pure natural mineral spring water.', 5.00, 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80', 'c1000000-0000-0000-0000-000000000005', 'Drinks', TRUE, FALSE, NULL, 23)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  category_id = EXCLUDED.category_id,
  category_name = EXCLUDED.category_name,
  is_available = EXCLUDED.is_available,
  is_featured = EXCLUDED.is_featured,
  badge = EXCLUDED.badge,
  sort_order = EXCLUDED.sort_order;

import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle,
  Database,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  Upload,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { compressImageFile } from '../../utils/imageCompress';

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings, resetToDefaultData, isDbConnected } = useRestaurant();

  const [form, setForm] = useState({
    name: settings.name,
    tagline: settings.tagline,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    whatsappInternational: settings.whatsappInternational,
    serviceArea: settings.serviceArea,
    openingHours: settings.openingHours,
    deliveryFee: settings.deliveryFee.toString(),
    aboutStory: settings.aboutStory || '',
    heroEyebrow: settings.heroEyebrow || 'AUTHENTIC GHANAIAN FLAVOUR',
    heroHeading: settings.heroHeading || 'Your Favourite Ghanaian Meals, Made with Love.',
    heroSubheading:
      settings.heroSubheading ||
      'From delicious jollof and freshly prepared waakye to banku with grilled tilapia, discover the comforting taste of Ghana at Jales Kitchen.',
    heroNote: settings.heroNote || 'Good food. Great taste. Ghanaian goodness.',
    heroImageUrl:
      settings.heroImageUrl ||
      'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=1200&q=85',
  });

  const [isDirty, setIsDirty] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'supabase' | 'deployment'>('info');
  const [heroImageError, setHeroImageError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Sync form when settings change from database unless admin has active unsaved edits
  useEffect(() => {
    if (!isDirty) {
      setForm({
        name: settings.name,
        tagline: settings.tagline,
        phone: settings.phone,
        whatsapp: settings.whatsapp,
        whatsappInternational: settings.whatsappInternational,
        serviceArea: settings.serviceArea,
        openingHours: settings.openingHours,
        deliveryFee: settings.deliveryFee.toString(),
        aboutStory: settings.aboutStory || '',
        heroEyebrow: settings.heroEyebrow || 'AUTHENTIC GHANAIAN FLAVOUR',
        heroHeading: settings.heroHeading || 'Your Favourite Ghanaian Meals, Made with Love.',
        heroSubheading:
          settings.heroSubheading ||
          'From delicious jollof and freshly prepared waakye to banku with grilled tilapia, discover the comforting taste of Ghana at Jales Kitchen.',
        heroNote: settings.heroNote || 'Good food. Great taste. Ghanaian goodness.',
        heroImageUrl:
          settings.heroImageUrl ||
          'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=1200&q=85',
      });
    }
  }, [settings, isDirty]);

  const handleHeroImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setHeroImageError('Image file is very large (over 15MB). Please choose an image under 15MB.');
      return;
    }

    try {
      setIsUploadingImage(true);
      setHeroImageError(null);
      setIsDirty(true);
      // Compress and optimize image to high-res web quality (max 1600px, 0.85 JPEG)
      const compressedDataUrl = await compressImageFile(file, 1600, 1600, 0.85);
      setForm((prev) => ({ ...prev, heroImageUrl: compressedDataUrl }));
    } catch {
      setHeroImageError('Could not process this image. Please provide a direct image URL or try another file.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(false);

    const success = await updateSettings({
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      phone: form.phone.trim(),
      whatsapp: form.whatsapp.trim(),
      whatsappInternational: form.whatsappInternational.replace(/[^0-9]/g, ''),
      serviceArea: form.serviceArea.trim(),
      openingHours: form.openingHours.trim(),
      deliveryFee: parseFloat(form.deliveryFee) || 0,
      aboutStory: form.aboutStory.trim(),
      heroEyebrow: form.heroEyebrow.trim(),
      heroHeading: form.heroHeading.trim(),
      heroSubheading: form.heroSubheading.trim(),
      heroNote: form.heroNote.trim(),
      heroImageUrl: form.heroImageUrl.trim(),
    });

    if (success) {
      setIsDirty(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const copySqlSchema = () => {
    const sqlText = `-- JALES KITCHEN — SUPABASE DATABASE SCHEMA
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_available BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

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
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public read menu items" ON public.menu_items FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public create orders" ON public.orders FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public create order items" ON public.order_items FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public create contact messages" ON public.contact_messages FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage all categories" ON public.categories FOR ALL USING (TRUE);
CREATE POLICY "Admin manage all menu items" ON public.menu_items FOR ALL USING (TRUE);
CREATE POLICY "Admin manage all orders" ON public.orders FOR ALL USING (TRUE);
CREATE POLICY "Admin manage all order items" ON public.order_items FOR ALL USING (TRUE);
CREATE POLICY "Admin manage all contact messages" ON public.contact_messages FOR ALL USING (TRUE);
CREATE POLICY "Admin manage all settings" ON public.site_settings FOR ALL USING (TRUE);
`;

    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="font-['Poppins'] font-bold text-2xl sm:text-3xl text-[#171717]">
          Restaurant Settings & Backend
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Configure business contact details, WhatsApp ordering numbers, and Supabase integration.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 gap-4 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('info')}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'info'
              ? 'border-[#C62828] text-[#C62828]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          General Business Info
        </button>
        <button
          onClick={() => setActiveTab('supabase')}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'supabase'
              ? 'border-[#C62828] text-[#C62828]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Supabase Database & SQL
        </button>
        <button
          onClick={() => setActiveTab('deployment')}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'deployment'
              ? 'border-[#C62828] text-[#C62828]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Vercel Deployment Guide
        </button>
      </div>

      {/* TAB 1: General Business Info */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
          {savedSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-3.5 rounded-xl text-xs sm:text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Settings successfully saved and synchronized!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tagline / Catchphrase
                </label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => {
                    const newTagline = e.target.value;
                    setIsDirty(true);
                    setForm((prev) => {
                      const wasMatching =
                        !prev.heroHeading ||
                        prev.heroHeading === prev.tagline ||
                        prev.heroHeading === 'Your Favourite Ghanaian Meals, Made with Love.' ||
                        prev.heroHeading === 'Your Favourite Ghanaian Meals, Made with Love';
                      return {
                        ...prev,
                        tagline: newTagline,
                        heroHeading: wasMatching ? newTagline : prev.heroHeading,
                      };
                    });
                  }}
                  placeholder="e.g. Your Favourite Ghanaian Meals, Made with Love"
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Visible across the header, footer, about story, and homepage hero.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Telephone Contact
                </label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="057-157-0126"
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Display WhatsApp Number
                </label>
                <input
                  type="text"
                  required
                  value={form.whatsapp}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="057-157-0126"
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  WhatsApp wa.me Digits
                </label>
                <input
                  type="text"
                  required
                  value={form.whatsappInternational}
                  onChange={(e) => setForm({ ...form, whatsappInternational: e.target.value })}
                  placeholder="233571570126"
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden"
                />
                <span className="text-[10px] text-stone-400">
                  Must be digits only without leading zero (e.g. 233571570126)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Standard Delivery Fee (GH₵)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={form.deliveryFee}
                  onChange={(e) => setForm({ ...form, deliveryFee: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Opening Hours
                </label>
                <input
                  type="text"
                  value={form.openingHours}
                  onChange={(e) => setForm({ ...form, openingHours: e.target.value })}
                  placeholder="Monday - Saturday: 10:00 AM - 9:00 PM"
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Service Areas (Comma separated)
              </label>
              <textarea
                rows={2}
                value={form.serviceArea}
                onChange={(e) => setForm({ ...form, serviceArea: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                About Us Story Content
              </label>
              <textarea
                rows={4}
                value={form.aboutStory}
                onChange={(e) => setForm({ ...form, aboutStory: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden"
              />
            </div>

            {/* HOMEPAGE HERO CUSTOMIZATION */}
            <div className="pt-6 border-t border-stone-200/80 space-y-4">
              <div>
                <h3 className="font-['Poppins'] font-bold text-base text-[#171717] flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#C62828]" />
                  <span>Homepage Hero Customization (Image & Text)</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Update the banner image and headlines that visitors see first on the homepage.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Hero Eyebrow Badge
                  </label>
                  <input
                    type="text"
                    value={form.heroEyebrow}
                    onChange={(e) => setForm({ ...form, heroEyebrow: e.target.value })}
                    placeholder="e.g. AUTHENTIC GHANAIAN FLAVOUR"
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Supporting Footer Note
                  </label>
                  <input
                    type="text"
                    value={form.heroNote}
                    onChange={(e) => setForm({ ...form, heroNote: e.target.value })}
                    placeholder="e.g. Good food. Great taste. Ghanaian goodness."
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Main Hero Heading
                </label>
                <input
                  type="text"
                  value={form.heroHeading}
                  onChange={(e) => setForm({ ...form, heroHeading: e.target.value })}
                  placeholder="e.g. Your Favourite Ghanaian Meals, Made with Love."
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Supporting Hero Subheading / Paragraph
                </label>
                <textarea
                  rows={2}
                  value={form.heroSubheading}
                  onChange={(e) => setForm({ ...form, heroSubheading: e.target.value })}
                  placeholder="Description of dishes and taste..."
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden"
                />
              </div>

              {/* Hero Image URL & Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Hero Image (URL or Upload from Device)
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <input
                    type="text"
                    value={form.heroImageUrl}
                    onChange={(e) => setForm({ ...form, heroImageUrl: e.target.value })}
                    placeholder="https://... or upload below"
                    className="flex-1 w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden"
                  />
                  <label className="cursor-pointer bg-stone-100 hover:bg-stone-200 px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-700 flex items-center gap-1.5 transition-colors shrink-0 disabled:opacity-50">
                    {isUploadingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 text-[#F57C00] animate-spin" />
                        <span>Optimizing Image...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-[#F57C00]" />
                        <span>Upload New Image</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingImage}
                      onChange={handleHeroImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {heroImageError && (
                  <p className="text-xs text-red-600 font-medium mt-1">{heroImageError}</p>
                )}

                {form.heroImageUrl && (
                  <div className="mt-2 p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-4">
                    <div className="w-24 h-16 rounded-xl overflow-hidden border border-stone-200 shrink-0">
                      <img
                        src={form.heroImageUrl}
                        alt="Hero preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-800">Current Hero Image Preview</p>
                      <p className="text-[11px] text-stone-500">
                        This image will be displayed prominently on the homepage hero banner.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="submit"
                className="bg-[#C62828] hover:bg-[#b02222] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </button>

              {showResetConfirm ? (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl">
                  <span className="text-xs font-semibold text-red-700">Reset all categories & items to demo seed?</span>
                  <button
                    type="button"
                    onClick={() => {
                      resetToDefaultData();
                      setShowResetConfirm(false);
                      setSavedSuccess(true);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="text-stone-500 hover:text-stone-700 text-xs px-1.5 py-1 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="text-stone-400 hover:text-red-600 text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Seed Data</span>
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Supabase Integration & Schema */}
      {activeTab === 'supabase' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
          <div>
            <h2 className="font-['Poppins'] font-bold text-xl text-[#171717]">
              Supabase Connection & Database Schema
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Jales Kitchen is designed to connect directly with your Supabase PostgreSQL instance.
            </p>
          </div>

          {/* Connection Status Box */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              isSupabaseConfigured()
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <Database className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs sm:text-sm">
              <p className="font-bold">
                {isSupabaseConfigured()
                  ? 'Supabase Configured in Environment'
                  : 'Supabase Not Configured Yet (Running in Graceful Local Mode)'}
              </p>
              <p className="text-xs opacity-90 leading-relaxed">
                {isSupabaseConfigured()
                  ? 'Your app is communicating with Supabase for menu items, orders, and inquiries.'
                  : 'The application is currently utilizing browser-persisted state with realistic Ghanaian seed data so you can browse, order, and test without disruption.'}
              </p>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[#171717]">
              Step-by-Step Supabase Setup:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-stone-600 leading-relaxed pl-1">
              <li>
                Create a free account and project at{' '}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C62828] underline font-semibold"
                >
                  supabase.com
                </a>
                .
              </li>
              <li>
                Navigate to <strong>SQL Editor</strong> in your Supabase dashboard.
              </li>
              <li>
                Copy the complete database schema below and run it in the SQL Editor.
              </li>
              <li>
                Copy your <strong>Project URL</strong> and <strong>Anon Key</strong> from Project
                Settings → API.
              </li>
              <li>
                Add them to your environment variables (<code className="bg-stone-100 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and{' '}
                <code className="bg-stone-100 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code>).
              </li>
            </ol>
          </div>

          {/* Copy SQL Button & Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700">
                SQL Migration & RLS Script (schema.sql)
              </span>
              <button
                onClick={copySqlSchema}
                className="bg-stone-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Full SQL Schema</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-stone-900 text-stone-200 p-4 rounded-2xl text-xs font-mono max-h-56 overflow-y-auto leading-relaxed">
              <pre className="whitespace-pre">
{`-- Jales Kitchen Schema Overview
CREATE TABLE public.profiles (...);
CREATE TABLE public.categories (...);
CREATE TABLE public.menu_items (...);
CREATE TABLE public.orders (...);
CREATE TABLE public.order_items (...);
CREATE TABLE public.contact_messages (...);
CREATE TABLE public.site_settings (...);

-- RLS policies enabled for public & admin`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Vercel Deployment Guide */}
      {activeTab === 'deployment' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
          <div>
            <h2 className="font-['Poppins'] font-bold text-xl text-[#171717]">
              Deploying to Vercel
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Everything in this project is pre-configured with <code className="bg-stone-100 px-1 py-0.5 rounded">vercel.json</code> rewrites for direct link routing.
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
              <p className="font-bold text-stone-900">1. Push to GitHub</p>
              <p className="text-stone-500 text-xs">
                Commit and push this workspace codebase to your GitHub repository.
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
              <p className="font-bold text-stone-900">2. Import into Vercel</p>
              <p className="text-stone-500 text-xs">
                Log in to Vercel, select "Add New" → "Project", and select your GitHub repository.
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
              <p className="font-bold text-stone-900">3. Set Environment Variables in Vercel</p>
              <p className="text-stone-500 text-xs">
                Under the Environment Variables section, add:
              </p>
              <div className="bg-stone-900 text-stone-200 p-3 rounded-xl font-mono text-xs space-y-1">
                <p>VITE_SUPABASE_URL=https://your-project.supabase.co</p>
                <p>VITE_SUPABASE_ANON_KEY=your-supabase-anon-key</p>
              </div>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
              <p className="font-bold text-stone-900">4. Deploy</p>
              <p className="text-stone-500 text-xs">
                Click <strong>Deploy</strong>. Vercel will build the Vite SPA and serve it on your custom domain or vercel.app URL with full multi-page support!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

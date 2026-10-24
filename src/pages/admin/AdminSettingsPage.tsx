import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Save,
  CheckCircle,
  Database,
  Copy,
  Check,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  Loader2,
  Lock,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Shield,
  Users,
  UserPlus,
  Trash2,
  Key,
  X,
  UserCheck,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { compressImageFile } from '../../utils/imageCompress';

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings, resetToDefaultData } = useRestaurant();
  const {
    user,
    changePassword,
    isCustomPassword,
    adminTeam,
    addAdminAccount,
    removeAdminAccount,
    updateAdminTeamMemberPassword,
  } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabQuery = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'supabase' | 'deployment'>(
    tabQuery === 'security' ? 'security' : 'info'
  );

  // Sync tab with URL query parameter
  useEffect(() => {
    if (tabQuery === 'security') {
      setActiveTab('security');
    }
  }, [tabQuery]);

  const handleTabChange = (tab: 'info' | 'security' | 'supabase' | 'deployment') => {
    setActiveTab(tab);
    if (tab === 'security') {
      setSearchParams({ tab: 'security' });
    } else {
      setSearchParams({});
    }
  };

  // Password update form state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  // Multi-admin team management states
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('Store Manager');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [showNewAdminPass, setShowNewAdminPass] = useState(false);
  const [addAdminError, setAddAdminError] = useState<string | null>(null);
  const [addAdminSuccess, setAddAdminSuccess] = useState<string | null>(null);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  // Reset member password modal state
  const [editingMember, setEditingMember] = useState<{ id: string; name: string; email: string } | null>(null);
  const [memberNewPass, setMemberNewPass] = useState('');
  const [memberPassError, setMemberPassError] = useState<string | null>(null);
  const [memberPassSuccess, setMemberPassSuccess] = useState<string | null>(null);
  const [isUpdatingMemberPass, setIsUpdatingMemberPass] = useState(false);

  // Member deletion confirm
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPass.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('The new passwords do not match. Please verify and re-type.');
      return;
    }

    setIsUpdatingPass(true);
    try {
      const res = await changePassword(newPass, currentPass ? currentPass : undefined);
      if (res.success) {
        setPassSuccess('Admin password updated successfully! Please use this new password on your subsequent sign-ins.');
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
      } else {
        setPassError(res.error || 'Failed to update administrator password.');
      }
    } catch (err: any) {
      setPassError(err.message || 'An error occurred while updating the password.');
    } finally {
      setIsUpdatingPass(false);
    }
  };

  const handleAddAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddAdminError(null);
    setAddAdminSuccess(null);
    setIsAddingAdmin(true);

    try {
      const res = await addAdminAccount({
        name: newAdminName,
        email: newAdminEmail,
        role: newAdminRole,
        password: newAdminPass,
      });

      if (res.success) {
        setAddAdminSuccess(`Administrator "${newAdminName}" successfully added! They can now log into the admin portal with ${newAdminEmail}.`);
        setNewAdminName('');
        setNewAdminEmail('');
        setNewAdminPass('');
        setNewAdminRole('Store Manager');
        setTimeout(() => setShowAddAdminModal(false), 2000);
      } else {
        setAddAdminError(res.error || 'Failed to add administrator.');
      }
    } catch (err: any) {
      setAddAdminError(err.message || 'An error occurred while creating admin account.');
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleUpdateMemberPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setMemberPassError(null);
    setMemberPassSuccess(null);
    setIsUpdatingMemberPass(true);

    try {
      const res = await updateAdminTeamMemberPassword(editingMember.id, memberNewPass);
      if (res.success) {
        setMemberPassSuccess(`Password for ${editingMember.name} updated successfully!`);
        setMemberNewPass('');
        setTimeout(() => {
          setEditingMember(null);
          setMemberPassSuccess(null);
        }, 1800);
      } else {
        setMemberPassError(res.error || 'Failed to update password.');
      }
    } catch (err: any) {
      setMemberPassError(err.message || 'An error occurred.');
    } finally {
      setIsUpdatingMemberPass(false);
    }
  };

  const handleRemoveMember = async (id: string) => {
    try {
      const res = await removeAdminAccount(id);
      if (res.success) {
        setDeletingMemberId(null);
      } else {
        alert(res.error || 'Failed to remove administrator.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to remove administrator.');
    }
  };

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
      <div className="flex border-b border-stone-200 gap-4 text-xs sm:text-sm font-semibold overflow-x-auto pb-0.5">
        <button
          onClick={() => handleTabChange('info')}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'info'
              ? 'border-[#C62828] text-[#C62828]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          General Business Info
        </button>
        <button
          onClick={() => handleTabChange('security')}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === 'security'
              ? 'border-[#C62828] text-[#C62828]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Admin Password & Team Access</span>
        </button>
        <button
          onClick={() => handleTabChange('supabase')}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'supabase'
              ? 'border-[#C62828] text-[#C62828]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          Supabase Database & SQL
        </button>
        <button
          onClick={() => handleTabChange('deployment')}
          className={`pb-3 px-1 border-b-2 transition-colors cursor-pointer shrink-0 ${
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

      {/* TAB 2: Admin Password & Security */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#C62828] flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h2 className="font-['Poppins'] font-bold text-xl text-[#171717]">
                  Admin Password & Security
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Manage your credentials for accessing the Jales Kitchen administration portal.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                  isCustomPassword
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isCustomPassword ? 'Custom Password Active' : 'Default Bootstrap Password Active'}</span>
              </span>
            </div>
          </div>

          {/* Account Overview Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200/80 text-xs text-stone-600">
            <div>
              <span className="text-[11px] font-semibold text-stone-400 block uppercase tracking-wider">
                Admin Account Email
              </span>
              <span className="text-sm font-bold text-stone-900 mt-0.5 block">
                {user?.email || 'admin@jaleskitchen.com'}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-stone-400 block uppercase tracking-wider">
                Password Status
              </span>
              <span className="text-xs text-stone-600 mt-0.5 block font-mono">
                {isCustomPassword ? 'Custom secret password configured' : 'Using initial bootstrap (Cocane@007)'}
              </span>
            </div>
          </div>

          {/* Alerts */}
          {passError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#C62828] shrink-0 mt-0.5" />
              <span>{passError}</span>
            </div>
          )}

          {passSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-2xl text-xs sm:text-sm flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Password Successfully Updated!</p>
                <p className="text-xs text-green-700 mt-0.5">{passSuccess}</p>
              </div>
            </div>
          )}

          {/* Password Update Form */}
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Current Password <span className="text-stone-400 font-normal">(Optional if default)</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                New Admin Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Enter new password (at least 6 characters)"
                  className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isUpdatingPass}
                className="bg-[#C62828] hover:bg-[#b02222] text-white px-7 py-3 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
              >
                {isUpdatingPass ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Update Admin Password</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security Guidance */}
          <div className="mt-8 pt-6 border-t border-stone-100 space-y-2">
            <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#C62828]" />
              <span>How your personal password works</span>
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              When updated, your new password takes effect immediately and is synchronized across browser sessions and your connected database. 
              Subsequent logins to <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">/admin/login</code> will require this new password.
            </p>
          </div>

          {/* ADMIN TEAM & MULTI-USER ACCESS SECTION */}
          <div className="mt-10 pt-8 border-t-2 border-stone-100 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#F57C00] flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <h3 className="font-['Poppins'] font-bold text-lg text-stone-900">
                    Admin Team & Authorized Accounts
                  </h3>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Grant access to trusted co-owners, managers, or kitchen dispatchers so multiple people can update menu items, track orders, and manage the site.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAddAdminError(null);
                  setAddAdminSuccess(null);
                  setShowAddAdminModal(true);
                }}
                className="bg-[#C62828] hover:bg-[#b02222] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-98 shrink-0 self-start sm:self-auto"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Administrator</span>
              </button>
            </div>

            {/* Admin accounts list */}
            <div className="space-y-3">
              {adminTeam.map((member) => {
                const isCurrentLoggedIn = user?.email.toLowerCase() === member.email.toLowerCase();
                const isSuperAdmin = member.isPrimary || member.role === 'Super Admin';

                return (
                  <div
                    key={member.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#C62828] to-[#F57C00] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-stone-900">{member.name}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isSuperAdmin
                                ? 'bg-red-50 text-[#C62828] border-red-200'
                                : member.role.includes('Manager')
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {member.role}
                          </span>
                          {isCurrentLoggedIn && (
                            <span className="text-[10px] bg-stone-200 text-stone-700 font-medium px-2 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 font-mono mt-0.5">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {member.isPrimary || member.id === 'primary-owner' ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 text-stone-500 text-xs font-semibold">
                          <Lock className="w-3.5 h-3.5 text-stone-400" />
                          <span>Primary Owner</span>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMember({ id: member.id, name: member.name, email: member.email });
                              setMemberNewPass('');
                              setMemberPassError(null);
                              setMemberPassSuccess(null);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                            title="Reset password for this administrator"
                          >
                            <Key className="w-3.5 h-3.5 text-stone-400" />
                            <span>Reset Password</span>
                          </button>

                          {deletingMemberId === member.id ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(member.id)}
                                className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingMemberId(null)}
                                className="px-2 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs transition-colors cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeletingMemberId(member.id)}
                              className="p-2 rounded-lg bg-white hover:bg-red-50 hover:text-red-600 border border-stone-200 text-stone-400 text-xs cursor-pointer transition-colors"
                              title="Revoke admin access"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Multi-Admin Info Note */}
            <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl flex items-start gap-3">
              <UserCheck className="w-4 h-4 text-[#F57C00] shrink-0 mt-0.5" />
              <div className="text-xs text-stone-600 space-y-1">
                <p className="font-bold text-stone-800">
                  How Multi-Admin Access Operates
                </p>
                <p className="leading-relaxed">
                  Each administrator added above can sign into <code className="bg-white px-1.5 py-0.5 rounded border border-amber-200 text-stone-800 font-mono">/admin/login</code> with their own email address and assigned password.
                  Their updates to menu items, order statuses, and website settings are synchronized across all connected devices and your Supabase database.
                </p>
              </div>
            </div>
          </div>

          {/* MODAL: ADD NEW ADMINISTRATOR */}
          {showAddAdminModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-red-50 text-[#C62828] flex items-center justify-center">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <h3 className="font-['Poppins'] font-bold text-lg text-stone-900">
                      Add New Administrator
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddAdminModal(false)}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {addAdminError && (
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#C62828]" />
                    <span>{addAdminError}</span>
                  </div>
                )}

                {addAdminSuccess && (
                  <div className="mt-4 bg-green-50 border border-green-200 text-green-800 p-3 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0 text-green-600" />
                    <span>{addAdminSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleAddAdminSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      placeholder="e.g. Kwame Mensah"
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Login Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="manager@jaleskitchen.com"
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Role / Position
                    </label>
                    <select
                      value={newAdminRole}
                      onChange={(e) => setNewAdminRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden cursor-pointer"
                    >
                      <option value="Store Manager">Store Manager (Full Admin)</option>
                      <option value="Co-Administrator">Co-Administrator (Owner Access)</option>
                      <option value="Kitchen Admin">Kitchen Admin (Menu & Orders)</option>
                      <option value="Order Dispatcher">Order Dispatcher (Orders & Messages)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Initial Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewAdminPass ? 'text' : 'password'}
                        required
                        value={newAdminPass}
                        onChange={(e) => setNewAdminPass(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewAdminPass(!showNewAdminPass)}
                        className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showNewAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddAdminModal(false)}
                      className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50 cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isAddingAdmin}
                      className="bg-[#C62828] hover:bg-[#b02222] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                    >
                      {isAddingAdmin ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Save & Create Admin</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL: RESET MEMBER PASSWORD */}
          {editingMember && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#F57C00] flex items-center justify-center">
                      <Key className="w-4 h-4" />
                    </div>
                    <h3 className="font-['Poppins'] font-bold text-base text-stone-900">
                      Reset Password for {editingMember.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs text-stone-500 mt-2">
                  Enter a new login password for <span className="font-bold text-stone-800">{editingMember.email}</span>.
                </p>

                {memberPassError && (
                  <div className="mt-3 bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#C62828]" />
                    <span>{memberPassError}</span>
                  </div>
                )}

                {memberPassSuccess && (
                  <div className="mt-3 bg-green-50 border border-green-200 text-green-800 p-2.5 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0 text-green-600" />
                    <span>{memberPassSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateMemberPasswordSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={memberNewPass}
                      onChange={(e) => setMemberNewPass(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C62828] outline-hidden font-mono"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingMember(null)}
                      className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50 cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingMemberPass}
                      className="bg-[#C62828] hover:bg-[#b02222] text-white px-5 py-2 rounded-xl font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                    >
                      {isUpdatingMemberPass ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Save New Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
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

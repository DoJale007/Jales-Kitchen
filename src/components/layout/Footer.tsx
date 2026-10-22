import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Phone, Clock, MapPin, MessageCircle } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

export const Footer: React.FC = () => {
  const { settings } = useRestaurant();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#171717] text-white pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#C62828] flex items-center justify-center text-white">
                <Flame className="w-6 h-6 text-[#F57C00] fill-[#F57C00]" />
              </div>
              <span className="font-['Poppins'] font-bold text-2xl tracking-tight text-white">
                Jales <span className="text-[#F57C00]">Kitchen</span>
              </span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed">
              Serving authentic, freshly prepared Ghanaian meals with the true flavours of home.
              Good food, great taste, and warm Ghanaian hospitality.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href={`https://wa.me/${settings.whatsappInternational}?text=${encodeURIComponent(
                  'Hello Jales Kitchen!'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-['Poppins'] font-semibold text-white text-base mb-4 tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <Link to="/" className="hover:text-[#F57C00] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#F57C00] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-[#F57C00] transition-colors">
                  Our Menu & Specials
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#F57C00] transition-colors">
                  Contact & Location
                </Link>
              </li>
            </ul>
          </div>

          {/* Service Area & Hours */}
          <div className="space-y-4">
            <h4 className="font-['Poppins'] font-semibold text-white text-base mb-4 tracking-wide">
              Service Details
            </h4>
            <div className="flex items-start gap-3 text-sm text-stone-400">
              <Clock className="w-4 h-4 text-[#F57C00] shrink-0 mt-1" />
              <div>
                <p className="font-medium text-stone-200">Opening Hours</p>
                <p className="text-xs text-stone-400 leading-relaxed mt-0.5">
                  {settings.openingHours}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm text-stone-400">
              <MapPin className="w-4 h-4 text-[#C62828] shrink-0 mt-1" />
              <div>
                <p className="font-medium text-stone-200">Service Areas</p>
                <p className="text-xs text-stone-400 leading-relaxed mt-0.5">
                  {settings.serviceArea}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Direct */}
          <div>
            <h4 className="font-['Poppins'] font-semibold text-white text-base mb-4 tracking-wide">
              Contact Us
            </h4>
            <div className="space-y-3 text-sm text-stone-400">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#F57C00] shrink-0" />
                <a
                  href={`tel:${settings.phone.replace(/[^0-9]/g, '')}`}
                  className="hover:text-white transition-colors"
                >
                  {settings.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-green-500 shrink-0" />
                <a
                  href={`https://wa.me/${settings.whatsappInternational}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp: {settings.whatsapp}
                </a>
              </div>
              <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 text-xs text-stone-400 mt-2">
                <p className="text-stone-300 font-medium mb-1">Easy WhatsApp Ordering</p>
                <p className="text-[11px] text-stone-400">
                  Select your dishes online, click submit, and your complete order is sent directly to our kitchen!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {currentYear} Jales Kitchen. All rights reserved. Authentic Ghanaian Cuisine.</p>
          <div className="flex items-center gap-6">
            <span>Good food. Great taste. Ghanaian goodness.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

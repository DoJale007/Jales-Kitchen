import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  MessageCircle,
  UtensilsCrossed,
  Sparkles,
  Clock,
  HeartHandshake,
  Flame,
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { FoodCard } from '../components/food/FoodCard';
import { ImageWithFallback } from '../components/common/ImageWithFallback';

export const HomePage: React.FC = () => {
  const { menuItems, openOrderModal, settings } = useRestaurant();

  // Pick the 6 featured items
  const featuredItems = menuItems.filter((item) => item.is_featured).slice(0, 6);


  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-6 sm:pt-10 lg:pt-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-[#F57C00] text-xs font-bold tracking-widest uppercase shadow-2xs">
                <Flame className="w-3.5 h-3.5 fill-[#F57C00]" />
                <span>{settings.heroEyebrow || 'AUTHENTIC GHANAIAN FLAVOUR'}</span>
              </div>

              {/* Main Heading */}
              <h1 className="font-['Poppins'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#171717] tracking-tight leading-[1.15]">
                {settings.heroHeading || settings.tagline ? (
                  settings.heroHeading || settings.tagline
                ) : (
                  <>
                    Your Favourite Ghanaian Meals,{' '}
                    <span className="text-[#C62828] relative inline-block">
                      Made with Love.
                      <svg
                        className="absolute -bottom-2 left-0 w-full text-[#F57C00] opacity-80"
                        viewBox="0 0 250 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 9C60 3 190 2 247 9"
                          stroke="currentColor"
                          strokeWidth="5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </>
                )}
              </h1>

              {/* Tagline / Catchphrase Highlight if distinct from heading */}
              {settings.tagline &&
                settings.heroHeading &&
                settings.tagline.trim() !== settings.heroHeading.trim() && (
                  <p className="text-sm sm:text-base font-bold text-[#C62828] tracking-wide">
                    "{settings.tagline}"
                  </p>
                )}

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {settings.heroSubheading ||
                  'From delicious jollof and freshly prepared waakye to banku with grilled tilapia, discover the comforting taste of Ghana at Jales Kitchen.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/menu"
                  className="w-full sm:w-auto bg-[#C62828] hover:bg-[#b02222] text-white px-8 py-4 rounded-full font-bold text-base shadow-lg shadow-red-900/20 flex items-center justify-center gap-2.5 transition-all hover:scale-102 active:scale-98 cursor-pointer"
                >
                  <UtensilsCrossed className="w-5 h-5" />
                  <span>Explore Our Menu</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={`https://wa.me/${settings.whatsappInternational}?text=${encodeURIComponent(
                    'Hello Jales Kitchen! I would like to place an order.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-7 py-4 rounded-full font-bold text-base shadow-lg shadow-green-900/15 flex items-center justify-center gap-2.5 transition-all hover:scale-102 active:scale-98"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Order on WhatsApp</span>
                </a>
              </div>

              {/* Supporting Note */}
              <div className="pt-2 flex items-center justify-center lg:justify-start gap-2 text-xs sm:text-sm font-medium text-stone-500">
                <Sparkles className="w-4 h-4 text-[#F57C00]" />
                <span>{settings.heroNote || 'Good food. Great taste. Ghanaian goodness.'}</span>
              </div>
            </div>

            {/* Right Column: High-Res Food Photography Spread */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative background glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-red-200 to-orange-200 rounded-3xl blur-2xl opacity-50 -z-10" />

                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-4/3 sm:aspect-square">
                  <ImageWithFallback
                    priority={true}
                    width={900}
                    quality={78}
                    src={
                      settings.heroImageUrl ||
                      'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=1200&q=85'
                    }
                    alt="Authentic Ghanaian Food at Jales Kitchen"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Floating Highlight Tag */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#C62828]">
                        Customer Choice
                      </span>
                      <h4 className="font-['Poppins'] font-bold text-base text-[#171717]">
                        Ghanaian Jollof Special
                      </h4>
                      <p className="text-xs text-stone-500">Served with seasoned chicken & shito</p>
                    </div>
                    <button
                      onClick={() => openOrderModal()}
                      className="bg-[#C62828] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs hover:bg-[#b02222] transition-colors cursor-pointer"
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED FOOD SECTION: "A Taste of Ghana" */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-[#C62828] text-xs font-bold uppercase tracking-wider mb-2">
            <span>Special Selection</span>
          </div>
          <h2 className="font-['Poppins'] text-3xl sm:text-4xl font-extrabold text-[#171717] tracking-tight">
            A Taste of Ghana
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-2">
            Discover some of the delicious meals waiting for you. Prepared fresh on order.
          </p>
        </div>

        {/* 6 Featured Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredItems.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>

        {/* View Full Menu CTA */}
        <div className="text-center pt-10 sm:pt-12">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 bg-stone-900 hover:bg-black text-white px-8 py-3.5 rounded-full font-bold text-sm sm:text-base transition-all hover:scale-102 shadow-md cursor-pointer"
          >
            <span>View Full Menu & Drinks</span>
            <ArrowRight className="w-4 h-4 text-[#F57C00]" />
          </Link>
        </div>
      </section>

      {/* 3. WHY CHOOSE JALES KITCHEN? */}
      <section className="bg-white py-16 border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-['Poppins'] text-2xl sm:text-3xl font-extrabold text-[#171717]">
              Why Choose Jales Kitchen?
            </h2>
            <p className="text-stone-500 text-sm mt-1.5">
              Committed to serving good food with the real flavours of home.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Benefit 1 */}
            <div className="p-6 rounded-2xl bg-[#FFF8F2] border border-orange-100/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#C62828] text-white flex items-center justify-center shadow-xs">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <h3 className="font-['Poppins'] font-bold text-base text-[#171717]">
                Authentic Ghanaian Flavours
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                Familiar, comforting meals prepared with genuine local spices and timeless cooking methods.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="p-6 rounded-2xl bg-[#FFF8F2] border border-orange-100/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#F57C00] text-white flex items-center justify-center shadow-xs">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-['Poppins'] font-bold text-base text-[#171717]">
                Freshly Prepared
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                A strong dedication to freshness, satisfying portions, and mouth-watering taste in every order.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="p-6 rounded-2xl bg-[#FFF8F2] border border-orange-100/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-green-600 text-white flex items-center justify-center shadow-xs">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="font-['Poppins'] font-bold text-base text-[#171717]">
                Easy Ordering
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                Select your food easily online and send your order straight to our kitchen on WhatsApp in seconds.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="p-6 rounded-2xl bg-[#FFF8F2] border border-orange-100/80 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#171717] text-white flex items-center justify-center shadow-xs">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-['Poppins'] font-bold text-base text-[#171717]">
                Friendly Service
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                A welcoming Ghanaian hospitality experience from meal selection to pickup or delivery.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* 5. CALL TO ACTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#171717] via-stone-900 to-[#262626] rounded-3xl p-8 sm:p-12 lg:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          {/* Subtle warm glow decorative circles */}
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-[#C62828]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-[#F57C00]/20 blur-3xl pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#F57C00]">
              Hot & Fresh In Accra
            </span>
            <h2 className="font-['Poppins'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Craving Something Delicious?
            </h2>
            <p className="text-stone-300 text-base sm:text-lg leading-relaxed">
              Your next favourite Ghanaian meal is just a few clicks away.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/menu"
                className="w-full sm:w-auto bg-[#C62828] hover:bg-[#b02222] text-white px-8 py-4 rounded-full font-bold text-base shadow-lg transition-all hover:scale-102 cursor-pointer"
              >
                Browse Menu
              </Link>
              <a
                href={`https://wa.me/${settings.whatsappInternational}?text=${encodeURIComponent(
                  'Hello Jales Kitchen! I would like to chat about today\'s meals.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-bold text-base shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-102"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Chat with Us ({settings.whatsapp})</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

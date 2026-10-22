import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Flame, Heart, Smile, Utensils, ArrowRight } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { ImageWithFallback } from '../components/common/ImageWithFallback';

export const AboutPage: React.FC = () => {
  const { settings } = useRestaurant();

  const galleryImages = [
    {
      title: 'Ghanaian Jollof Rice with Spiced Chicken',
      src: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Waakye with Accompaniments',
      src: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Charcoal Grilled Fresh Tilapia',
      src: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Aromatic Ghanaian Light Soup',
      src: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Fried Yam and Pepper Chicken',
      src: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Sweet Fried Plantain (Kelewele)',
      src: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-b from-orange-50/60 to-transparent pt-10 sm:pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-100 text-[#C62828] text-xs font-bold tracking-widest uppercase mb-4">
            <Flame className="w-3.5 h-3.5" />
            <span>AUTHENTIC GHANAIAN HOSPITALITY</span>
          </div>
          <h1 className="font-['Poppins'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#171717] tracking-tight leading-tight">
            Our Story, Our Food, Our Ghanaian Roots
          </h1>
          <p className="text-base sm:text-lg text-stone-600 mt-4 leading-relaxed">
            At Jales Kitchen, we celebrate the rich flavours and comforting meals that make Ghanaian food special.
          </p>
        </div>
      </section>

      {/* 2. OUR STORY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Food Photography */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white aspect-4/3 sm:aspect-square">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80"
                alt="Jales Kitchen food preparation"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-300">
                  Accra, Ghana
                </span>
                <p className="font-['Poppins'] font-bold text-base">
                  Fresh Ingredients. Pure Ghanaian Heart.
                </p>
              </div>
            </div>
          </div>

          {/* Story Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#F57C00]">
              <span>About Jales Kitchen</span>
            </div>
            <h2 className="font-['Poppins'] text-2xl sm:text-3xl font-extrabold text-[#171717]">
              Bringing People Together Around Good Food
            </h2>
            <div className="text-stone-600 text-sm sm:text-base space-y-4 leading-relaxed">
              <p>
                Jales Kitchen was created around a simple love for good food and the rich culinary
                traditions of Ghana. From the irresistible aroma of jollof rice to the comforting taste
                of waakye, banku, and traditional soups, we celebrate the meals that bring people
                together.
              </p>
              <p>
                Our aim is to make delicious Ghanaian food easy to discover and order, while giving
                every customer a warm and welcoming experience.
              </p>
              <p>
                Whether you are enjoying a familiar favourite or trying something different, Jales
                Kitchen invites you to share in the goodness of Ghanaian cuisine.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-4">
              <Link
                to="/menu"
                className="bg-[#C62828] hover:bg-[#b02222] text-white px-7 py-3 rounded-full font-bold text-sm shadow-md transition-all hover:scale-102"
              >
                Explore Menu
              </Link>
              <Link
                to="/contact"
                className="text-stone-700 hover:text-[#C62828] font-semibold text-sm transition-colors"
              >
                Get in Touch →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR VALUES */}
      <section className="bg-white py-16 border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C62828]">
              What We Stand For
            </span>
            <h2 className="font-['Poppins'] text-2xl sm:text-3xl font-extrabold text-[#171717] mt-1">
              Our Core Values
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#FFF8F2] border border-orange-100 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#C62828] text-white flex items-center justify-center shadow-xs">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="font-['Poppins'] font-bold text-base text-[#171717]">
                Taste and Quality
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                Only genuine seasonings, aromatic local herbs, and quality ingredients in every meal.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFF8F2] border border-orange-100 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#F57C00] text-white flex items-center justify-center shadow-xs">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="font-['Poppins'] font-bold text-base text-[#171717]">
                Careful Preparation
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                Cooked with patience, hygiene, and the attention to detail that authentic dishes deserve.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFF8F2] border border-orange-100 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#171717] text-white flex items-center justify-center shadow-xs">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-['Poppins'] font-bold text-base text-[#171717]">
                Ghanaian Food Culture
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                Preserving and celebrating the beloved cooking styles from across Ghana's rich heritage.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFF8F2] border border-orange-100 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-green-600 text-white flex items-center justify-center shadow-xs">
                <Smile className="w-6 h-6" />
              </div>
              <h3 className="font-['Poppins'] font-bold text-base text-[#171717]">
                Customer Satisfaction
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                Ensuring that every order leaves you happy, full, and eager for your next meal with us.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOOD GALLERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F57C00]">
            From Our Kitchen
          </span>
          <h2 className="font-['Poppins'] text-2xl sm:text-3xl font-extrabold text-[#171717] mt-1">
            A Glimpse of the Feast
          </h2>
          <p className="text-stone-500 text-sm mt-1.5">
            Every dish is prepared fresh to order with authentic Ghanaian seasoning.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {galleryImages.map((img, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl overflow-hidden aspect-square bg-stone-100 shadow-xs border border-stone-200/80"
            >
              <ImageWithFallback
                src={img.src}
                alt={img.title}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <p className="text-white text-xs sm:text-sm font-semibold">{img.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#171717] rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl relative overflow-hidden">
          <div className="max-w-xl mx-auto space-y-4">
            <h2 className="font-['Poppins'] text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
              Come and Enjoy the Taste of Ghana.
            </h2>
            <p className="text-stone-300 text-sm sm:text-base">
              Ready for lunch, dinner, or a family feast? Explore our full menu now.
            </p>
            <div className="pt-2">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 bg-[#C62828] hover:bg-[#b02222] text-white px-8 py-3.5 rounded-full font-bold text-base shadow-lg transition-all hover:scale-102"
              >
                <span>Explore Our Menu</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

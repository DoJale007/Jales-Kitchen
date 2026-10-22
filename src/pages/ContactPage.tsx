import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  Clock,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';

export const ContactPage: React.FC = () => {
  const { settings, sendContactMessage } = useRestaurant();

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successStatus, setSuccessStatus] = useState<string | null>(null);
  const [submittedWaUrl, setSubmittedWaUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessStatus(null);

    if (!fullName.trim() || !phone.trim() || !subject.trim() || !message.trim()) {
      setErrorMessage('Please fill in all required fields (Name, Phone, Subject, and Message).');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await sendContactMessage({
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        subject: subject.trim(),
        message: message.trim(),
      });

      // Construct formatted WhatsApp message
      const whatsappText = [
        'Hello Jales Kitchen! I have an inquiry from your website.',
        '',
        'CUSTOMER DETAILS',
        `Name: ${fullName.trim()}`,
        `Phone: ${phone.trim()}`,
        email.trim() ? `Email: ${email.trim()}` : null,
        '',
        `Subject: ${subject.trim()}`,
        '',
        'Message:',
        message.trim(),
      ]
        .filter((line) => line !== null)
        .join('\n');

      const whatsappUrl = `https://wa.me/${settings.whatsappInternational}?text=${encodeURIComponent(
        whatsappText
      )}`;

      setSubmittedWaUrl(whatsappUrl);
      setSuccessStatus(
        'Medase! Your message has been prepared. Click the button below to send it to us via WhatsApp.'
      );
      setFullName('');
      setPhone('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while preparing your message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-b from-orange-50/70 to-transparent pt-10 sm:pt-14 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-100 text-[#C62828] text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>GET IN TOUCH</span>
          </div>
          <h1 className="font-['Poppins'] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#171717] tracking-tight">
            We Would Love to Hear From You
          </h1>
          <p className="text-base sm:text-lg text-stone-600 mt-3 leading-relaxed">
            Have a question about our meals, want to place an order, or need help choosing your favourite dish? Get in touch with Jales Kitchen.
          </p>
        </div>
      </section>

      {/* 2. CONTACT DETAILS & FORM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Direct Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
              <h2 className="font-['Poppins'] font-bold text-xl text-[#171717]">
                Contact Information
              </h2>

              <div className="space-y-5">
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-[#C62828] flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Call Us
                    </p>
                    <a
                      href={`tel:${settings.phone.replace(/[^0-9]/g, '')}`}
                      className="font-bold text-base sm:text-lg text-[#171717] hover:text-[#C62828] transition-colors"
                    >
                      {settings.phone}
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      WhatsApp Orders & Support
                    </p>
                    <a
                      href={`https://wa.me/${settings.whatsappInternational}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-base sm:text-lg text-green-700 hover:underline transition-colors block"
                    >
                      {settings.whatsapp}
                    </a>
                    <span className="text-xs text-stone-500">Fast replies during kitchen hours</span>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="flex items-start gap-4 pt-2 border-t border-stone-100">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#F57C00] flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Opening Hours
                    </p>
                    <p className="font-semibold text-sm text-[#171717] mt-0.5">
                      {settings.openingHours}
                    </p>
                  </div>
                </div>

                {/* Service Area */}
                <div className="flex items-start gap-4 pt-2 border-t border-stone-100">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                      Service Area
                    </p>
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mt-0.5">
                      {settings.serviceArea}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-xs">
              <h2 className="font-['Poppins'] font-bold text-xl text-[#171717] mb-2">
                Send Us a Message
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mb-6">
                Fill out the form below and we will get back to you right away.
              </p>

              {successStatus && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-800 p-4 rounded-2xl space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm">Message Ready!</p>
                      <p className="text-xs text-green-700 mt-0.5">{successStatus}</p>
                    </div>
                  </div>
                  {submittedWaUrl && (
                    <div className="pt-2 border-t border-green-200/70 flex justify-end">
                      <a
                        href={submittedWaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Open in WhatsApp</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {errorMessage && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#C62828] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">Could Not Send</p>
                    <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Full Name <span className="text-[#C62828]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ama Osei"
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#C62828] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Phone Number <span className="text-[#C62828]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 057-157-0126"
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#C62828] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Email Address (optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@example.com"
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#C62828] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Subject <span className="text-[#C62828]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Food Delivery Inquiry / Catering"
                      className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#C62828] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Message <span className="text-[#C62828]">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you need or how we can help you..."
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#C62828] transition-colors"
                  />
                </div>

                <div className="pt-4 flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-9 py-3.5 rounded-2xl font-bold text-sm sm:text-base shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    <MessageCircle className="w-5 h-5 text-white" />
                    <span>{isSubmitting ? 'Submitting...' : 'Submit via WhatsApp'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

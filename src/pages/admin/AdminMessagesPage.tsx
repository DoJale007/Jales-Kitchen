import React, { useState } from 'react';
import { Mail, Check, Trash2, Phone, Calendar, User, Search, Eye } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { ContactMessage } from '../../types';

export const AdminMessagesPage: React.FC = () => {
  const { messages, markMessageAsRead, deleteMessage } = useRestaurant();
  const [search, setSearch] = useState('');
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);

  const filtered = messages.filter((m) => {
    const q = search.trim().toLowerCase();
    return (
      q === '' ||
      m.full_name.toLowerCase().includes(q) ||
      m.phone.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q)
    );
  });

  const handleOpenMessage = (msg: ContactMessage) => {
    setSelectedMsg(msg);
    if (!msg.is_read) {
      markMessageAsRead(msg.id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Poppins'] font-bold text-2xl sm:text-3xl text-[#171717]">
            Customer Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Review messages submitted through the restaurant's Contact page.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inquiries..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#C62828]"
          />
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-stone-400 text-xs sm:text-sm">
            <Mail className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>No customer messages found.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filtered.map((msg) => (
              <div
                key={msg.id}
                onClick={() => handleOpenMessage(msg)}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors ${
                  msg.is_read ? 'hover:bg-stone-50' : 'bg-red-50/40 hover:bg-red-50/70'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      msg.is_read
                        ? 'bg-stone-100 text-stone-500'
                        : 'bg-[#C62828] text-white shadow-xs'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-900 truncate">
                        {msg.full_name}
                      </span>
                      {!msg.is_read && (
                        <span className="bg-[#C62828] text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
                          New
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-xs text-stone-800 truncate">
                      {msg.subject}
                    </p>
                    <p className="text-xs text-stone-500 line-clamp-1">
                      {msg.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span className="text-[11px] text-stone-400">
                    {new Date(msg.created_at).toLocaleDateString()}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMessage(msg.id);
                      if (selectedMsg?.id === msg.id) setSelectedMsg(null);
                    }}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Viewer Modal */}
      {selectedMsg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-xs font-semibold text-[#F57C00]">Customer Message</span>
                <h3 className="font-['Poppins'] font-bold text-lg text-stone-900">
                  {selectedMsg.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMsg(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/80 space-y-1.5 text-xs">
              <p>
                <strong>From:</strong> {selectedMsg.full_name}
              </p>
              <p className="flex items-center gap-1.5">
                <strong>Phone:</strong>
                <a
                  href={`tel:${selectedMsg.phone}`}
                  className="text-[#C62828] font-semibold hover:underline"
                >
                  {selectedMsg.phone}
                </a>
              </p>
              {selectedMsg.email && (
                <p>
                  <strong>Email:</strong> {selectedMsg.email}
                </p>
              )}
              <p className="text-stone-400 text-[11px]">
                Received on: {new Date(selectedMsg.created_at).toLocaleString()}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Message Body:
              </h4>
              <div className="bg-stone-50/70 p-4 rounded-xl border border-stone-200 text-stone-800 text-xs sm:text-sm whitespace-pre-line leading-relaxed">
                {selectedMsg.message}
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <a
                href={`https://wa.me/${selectedMsg.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Reply on WhatsApp</span>
              </a>

              <button
                onClick={() => setSelectedMsg(null)}
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

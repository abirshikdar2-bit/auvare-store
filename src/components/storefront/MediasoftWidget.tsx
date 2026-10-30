'use client';

import React, { useState, useEffect } from 'react';
import { X, Headphones, Mail, Phone, MessageSquare } from 'lucide-react';

interface ChannelItem {
  id: string;
  text: string;
  img: string;
}

const BACKGROUNDS: ChannelItem[] = [
  {
    "id": "whatsapp",
    "text": "WhatsApp",
    "img": "data:image/png;base64,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"
  },
  {
    "id": "ticket",
    "text": "Support",
    "img": "data:image/png;base64,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"
  },
  {
    "id": "fmsn",
    "text": "Messenger",
    "img": "data:image/png;base64,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"
  },
  {
    "id": "email",
    "text": "Email",
    "img": "data:image/png;base64,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"
  },
  {
    "id": "call",
    "text": "Call",
    "img": "data:image/png;base64,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"
  }
];
const CLOSE_PNG = "data:image/png;base64,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";

interface MediasoftWidgetProps {
  onOpenSupportModal?: () => void;
  phone?: string;
  email?: string;
  whatsappNumber?: string;
}

export function MediasoftWidget({
  onOpenSupportModal,
  phone = '+8801734018155',
  email = 'auvare.official@gmail.com',
  whatsappNumber = '8801734018155',
}: MediasoftWidgetProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Rotate icons every 2 seconds when closed
  useEffect(() => {
    if (isOpen) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % BACKGROUNDS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleItemClick = (id: string) => {
    if (id === 'whatsapp') {
      window.open(
        `https://wa.me/${whatsappNumber}?text=Hi%20AUVARE,%20I%20am%20browsing%20your%20website%20and%20need%20assistance.`,
        '_blank'
      );
    } else if (id === 'ticket') {
      if (onOpenSupportModal) {
        onOpenSupportModal();
      } else {
        setIsSupportModalOpen(true);
      }
    } else if (id === 'fmsn') {
      window.open('https://m.me/auvare_official', '_blank');
    } else if (id === 'email') {
      window.location.href = `mailto:${email}?subject=AUVARE%20Store%20Inquiry`;
    } else if (id === 'call') {
      window.location.href = `tel:${phone}`;
    } else if (id === 'minimize') {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mediasoft BD Multichannel Floating Widget Container (Bottom-Left) */}
      <div
        id="ms_widget"
        className="fixed bottom-[30px] left-[20px] z-[999999] flex flex-col items-start font-sans"
        style={{ pointerEvents: 'auto' }}
      >
        {/* Main Floating Shifting Button (Slow-Mo Smooth Expansion) */}
        {!isOpen && (
          <button
            type="button"
            id="ms_widget_button_main"
            title="Help"
            onClick={() => setIsOpen(true)}
            className="ms-widget-btn"
          >
            <div className="ms-widget-gradient" />
            <img
              id="ms_widget_change_img"
              src={BACKGROUNDS[currentIdx]?.img}
              alt="Help"
              width={60}
              height={60}
              className="ms-widget-icon"
            />
            <span className="ms-widget-text">
              Help
            </span>
          </button>
        )}

        {/* Expandable Options List (Stacked vertically, aligned left) */}
        {isOpen && (
          <ul
            id="ms_widget_list"
            className="list-none m-0 p-0 flex flex-col items-start gap-[6px] animate-in fade-in duration-300"
          >
            {BACKGROUNDS.map((item) => (
              <li key={item.id} className="list-none m-0 p-0 flex justify-start">
                <button
                  type="button"
                  title={item.text}
                  onClick={() => handleItemClick(item.id)}
                  className="ms-widget-btn"
                >
                  <div className="ms-widget-gradient" />
                  <img
                    id={item.id}
                    src={item.img}
                    alt={item.text}
                    width={60}
                    height={60}
                    className="ms-widget-icon"
                  />
                  <span className="ms-widget-text">
                    {item.text}
                  </span>
                </button>
              </li>
            ))}

            {/* Minimize Item */}
            <li className="list-none m-0 p-0 flex justify-start">
              <button
                type="button"
                title="Minimize"
                onClick={() => handleItemClick('minimize')}
                className="ms-widget-btn"
              >
                <div className="ms-widget-gradient" />
                <img
                  id="ms_widget_Close"
                  src={CLOSE_PNG}
                  alt="Minimize"
                  width={60}
                  height={60}
                  className="ms-widget-icon"
                />
                <span className="ms-widget-text">
                  Minimize
                </span>
              </button>
            </li>
          </ul>
        )}
      </div>

      {/* Customer Support & Concierge Modal */}
      {isSupportModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-[100005] flex items-center justify-center p-5 animate-in fade-in duration-200"
          onClick={() => setIsSupportModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0b1a13] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Headphones className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-base tracking-wide m-0">AUVARE Support Desk</h3>
                  <p className="text-[11px] text-emerald-300 font-medium m-0">Live Concierge Assistance</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSupportModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <p className="text-xs text-slate-600 mb-4 font-medium leading-relaxed">
                Need sizing guidance, custom lot delivery status, or bKash order assistance? Reach out directly via our verified channels:
              </p>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${whatsappNumber}?text=Hi%20AUVARE,%20I%20need%20support%20with%20an%20order.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition group"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                  WA
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 m-0 group-hover:text-emerald-700">WhatsApp Instant Chat</p>
                  <p className="text-[11px] text-slate-500 m-0">Available 9:00 AM - 11:00 PM</p>
                </div>
              </a>

              {/* Call Hotline */}
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 m-0 group-hover:text-blue-700">Customer Helpline</p>
                  <p className="text-[11px] text-slate-500 m-0">{phone}</p>
                </div>
              </a>

              {/* Email */}
              <a
                href={`mailto:${email}?subject=AUVARE%20Store%20Inquiry`}
                className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 transition group"
              >
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 m-0 group-hover:text-sky-700">Official Email</p>
                  <p className="text-[11px] text-slate-500 m-0">{email}</p>
                </div>
              </a>

              {/* Messenger */}
              <a
                href="https://m.me/auvare_official"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition group"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 m-0 group-hover:text-indigo-700">Facebook Messenger</p>
                  <p className="text-[11px] text-slate-500 m-0">@auvare_official</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

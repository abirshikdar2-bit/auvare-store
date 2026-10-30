'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatBDT } from '@/lib/utils';
import { Product, ProductVariant, GarmentSize, CartItem } from '@/types';
import { ShieldCheck, Lock, Copy, Check, ChevronDown, ChevronUp, ArrowLeft, Truck } from 'lucide-react';

interface ShopifyCheckoutScreenProps {
  items: CartItem[];
  deliveryZone: 'inside' | 'outside';
  setDeliveryZone: (zone: 'inside' | 'outside') => void;
  onClose: () => void;
  onOrderSuccess: (data: { orderId: string; total: number; waText: string }) => void;
}

export function ShopifyCheckoutScreen({
  items,
  deliveryZone,
  setDeliveryZone,
  onClose,
  onOrderSuccess,
}: ShopifyCheckoutScreenProps) {
  // Contact & Delivery state
  const [contactEmailOrPhone, setContactEmailOrPhone] = useState('');
  const [emailOffers, setEmailOffers] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [saveInfo, setSaveInfo] = useState(true);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'rocket'>('cod');
  const [senderPhone, setSenderPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copiedMfs, setCopiedMfs] = useState(false);


  // Discount code state
  const [discountCode, setDiscountCode] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);

  // Mobile order summary toggle
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = deliveryZone === 'inside' ? 70 : 130;
  const total = subtotal + deliveryCharge;

  // Copy helper
  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedMfs(true);
    setTimeout(() => setCopiedMfs(false), 2500);
  };

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountCode.trim()) return;
    if (discountCode.trim().toUpperCase() === 'AUVARE10' || discountCode.trim().toUpperCase() === 'VINTAGE') {
      setDiscountApplied(true);
      setDiscountError('');
    } else {
      setDiscountError('Enter a valid discount code or gift card');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMessage('Your bag is empty.');
      return;
    }

    if (!lastName.trim() && !firstName.trim()) {
      setErrorMessage('Please provide your name.');
      return;
    }

    if (!address1.trim()) {
      setErrorMessage('Please enter your delivery address.');
      return;
    }

    const contactPhone = phone.trim() || (contactEmailOrPhone.match(/^[0-9+]+$/) ? contactEmailOrPhone.trim() : '');
    if (!contactPhone) {
      setErrorMessage('Please enter a valid mobile phone number for delivery.');
      return;
    }

    if (paymentMethod !== 'cod' && !senderPhone.trim()) {
      setErrorMessage(`Please enter your ${paymentMethod.toUpperCase()} sender phone number.`);
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    const customerName = `${firstName.trim()} ${lastName.trim()}`.trim() || 'Valued Customer';
    const customerPhone = contactPhone;
    const fullDeliveryAddress = [
      address1.trim(),
      address2.trim(),
      city.trim(),
      postalCode.trim() ? `Postal: ${postalCode.trim()}` : '',
    ]
      .filter(Boolean)
      .join(', ');

    const orderId = `AUV-${Math.floor(100000 + Math.random() * 900000)}`;

    const itemListText = items
      .map(
        (c) =>
          `• ${c.title}${c.selectedVariantName ? ` [${c.selectedVariantName}]` : ''} (Size: ${c.selectedSize}, TK ${c.price} x${c.quantity})`
      )
      .join('\n');

    const waText = encodeURIComponent(
      `*NEW ORDER CONFIRMED!* [Order #${orderId}]\n\n` +
        `*Customer Details:*\n` +
        `• Name: ${customerName}\n` +
        `• Phone: ${customerPhone}\n` +
        `• Address: ${fullDeliveryAddress}\n` +
        `• Zone: ${deliveryZone === 'inside' ? 'Inside Dhaka (TK 70)' : 'Outside Dhaka (TK 130)'}\n\n` +
        `*Ordered Items:*\n${itemListText}\n\n` +
        `*Payment Method:* ${paymentMethod.toUpperCase()}\n` +
        (senderPhone ? `*Sender Phone:* ${senderPhone}\n` : '') +
        (trxId ? `*Transaction ID:* ${trxId}\n` : '') +
        `*Total Bill:* TK ${total}\n\n` +
        `Please confirm drop dispatch!`
    );

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          deliveryAddress: fullDeliveryAddress,
          deliveryZone,
          notes: contactEmailOrPhone.includes('@') ? `Email: ${contactEmailOrPhone}` : undefined,
          paymentMethod,
          paymentSenderNumber: senderPhone || null,
          transactionId: trxId || null,
          items: items.map((item) => ({
            productId: item.id,
            size: item.selectedSize,
            variantId: item.variants?.find((v) => v.name === item.selectedVariantName)?.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to place order');
      }

      onOrderSuccess({ orderId, total, waText });
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100050] bg-white overflow-y-auto font-sans antialiased text-[#333333]">
      {/* Top Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/images/logo.jpg"
              alt="AUVARE Crest Logo"
              className="w-10 h-10 object-contain rounded-full shadow-sm"
            />
            <div>
              <span className="font-serif text-lg font-bold tracking-widest text-[#0b1a13] block leading-tight">
                AUVARE
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-gray-500 font-semibold block">
                Curated Archive
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1.5 transition-colors py-1.5 px-3 rounded-md hover:bg-gray-100 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to bag</span>
          </button>
        </div>
      </header>

      {/* Mobile Order Summary Dropdown Bar (Shopify / Top Ten Style) */}
      <div className="lg:hidden border-b border-gray-200 bg-[#f9fafb]">
        <button
          type="button"
          onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-xs font-semibold text-gray-700 cursor-pointer"
        >
          <div className="flex items-center gap-2 text-[#105036]">
            <span>{isMobileSummaryOpen ? 'Hide order summary' : 'Show order summary'}</span>
            {isMobileSummaryOpen ? (
              <ChevronUp className="w-4 h-4 text-[#105036]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#105036]" />
            )}
          </div>
          <div className="text-base font-bold text-gray-900">
            TK {formatBDT(total)}
          </div>
        </button>

        {isMobileSummaryOpen && (
          <div className="px-4 pb-6 pt-2 border-t border-gray-200 bg-[#f9fafb]">
            {/* Mobile items */}
            <div className="space-y-4 mb-5">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-lg bg-white border border-gray-200 overflow-visible flex-shrink-0">
                    <img
                      src={item.image || item.images?.[0] || '/assets/images/logo.jpg'}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate m-0">{item.title}</p>
                    <p className="text-[11px] text-gray-500 m-0">
                      Size: {item.selectedSize}
                      {item.selectedVariantName ? ` • ${item.selectedVariantName}` : ''}
                    </p>
                  </div>
                  <div className="text-xs font-bold text-gray-900 flex-shrink-0">
                    TK {formatBDT(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Cost summary */}
            <div className="border-t border-gray-200 pt-3 space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">TK {formatBDT(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-gray-900">TK {formatBDT(deliveryCharge)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#0b1a13] pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>TK {formatBDT(total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row">
        {/* Left Column: Form & Payment (approx 58%) */}
        <div className="w-full lg:w-[58%] px-4 sm:px-8 lg:px-12 py-8 bg-white">
          <form onSubmit={handleSubmit} className="max-w-[580px] ml-auto mr-auto lg:mr-0 space-y-7">
            {errorMessage && (
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            {/* 1. Contact Section */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 m-0">Contact</h2>
                <span className="text-xs text-gray-500">Fast guest checkout</span>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  placeholder="Email or mobile phone number"
                  value={contactEmailOrPhone}
                  onChange={(e) => setContactEmailOrPhone(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-lg border border-gray-300 text-sm focus:border-[#105036] focus:ring-1 focus:ring-[#105036] outline-none transition-all placeholder:text-gray-400"
                />
                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={emailOffers}
                    onChange={(e) => setEmailOffers(e.target.checked)}
                    className="w-4 h-4 rounded text-[#105036] focus:ring-[#105036] border-gray-300"
                  />
                  <span>Email me with curated drops and secret archive updates</span>
                </label>
              </div>
            </div>

            {/* 2. Delivery Section (No country dropdown as requested) */}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2.5">Delivery</h2>
              <div className="space-y-3">
                {/* Name Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="First name (optional)"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-lg border border-gray-300 text-sm focus:border-[#105036] focus:ring-1 focus:ring-[#105036] outline-none transition-all placeholder:text-gray-400"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-lg border border-gray-300 text-sm focus:border-[#105036] focus:ring-1 focus:ring-[#105036] outline-none transition-all placeholder:text-gray-400"
                  />
                </div>

                {/* Street Address */}
                <input
                  type="text"
                  required
                  placeholder="Address (House, Road, Area)"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-lg border border-gray-300 text-sm focus:border-[#105036] focus:ring-1 focus:ring-[#105036] outline-none transition-all placeholder:text-gray-400"
                />

                {/* Apartment */}
                <input
                  type="text"
                  placeholder="Apartment, suite, etc. (optional)"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-lg border border-gray-300 text-sm focus:border-[#105036] focus:ring-1 focus:ring-[#105036] outline-none transition-all placeholder:text-gray-400"
                />

                {/* City & Postal Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="City (e.g. Dhaka)"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-lg border border-gray-300 text-sm focus:border-[#105036] focus:ring-1 focus:ring-[#105036] outline-none transition-all placeholder:text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Postal code (optional)"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-lg border border-gray-300 text-sm focus:border-[#105036] focus:ring-1 focus:ring-[#105036] outline-none transition-all placeholder:text-gray-400"
                  />
                </div>

                {/* Phone */}
                <input
                  type="tel"
                  required
                  placeholder="Phone (for courier delivery)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-lg border border-gray-300 text-sm focus:border-[#105036] focus:ring-1 focus:ring-[#105036] outline-none transition-all placeholder:text-gray-400"
                />

                <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={saveInfo}
                    onChange={(e) => setSaveInfo(e.target.checked)}
                    className="w-4 h-4 rounded text-[#105036] focus:ring-[#105036] border-gray-300"
                  />
                  <span>Save this information for next time</span>
                </label>
              </div>
            </div>

            {/* 3. Shipping Method Section */}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2.5">Shipping method</h2>
              <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200">
                {/* Inside Dhaka */}
                <label
                  className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                    deliveryZone === 'inside' ? 'bg-[#f0fdf4] border-l-4 border-l-[#105036]' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping_method"
                      checked={deliveryZone === 'inside'}
                      onChange={() => setDeliveryZone('inside')}
                      className="w-4 h-4 text-[#105036] focus:ring-[#105036] border-gray-300"
                    />
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 m-0">Inside Dhaka</p>
                      <p className="text-[11px] text-gray-500 m-0">Fast express delivery (24-48h)</p>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-900">TK 70.00</span>
                </label>

                {/* Outside Dhaka */}
                <label
                  className={`flex items-center justify-between p-3.5 cursor-pointer transition-colors ${
                    deliveryZone === 'outside' ? 'bg-[#f0fdf4] border-l-4 border-l-[#105036]' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping_method"
                      checked={deliveryZone === 'outside'}
                      onChange={() => setDeliveryZone('outside')}
                      className="w-4 h-4 text-[#105036] focus:ring-[#105036] border-gray-300"
                    />
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 m-0">Outside Dhaka</p>
                      <p className="text-[11px] text-gray-500 m-0">Nationwide courier delivery (2-4 days)</p>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-gray-900">TK 130.00</span>
                </label>
              </div>
            </div>

            {/* 4. Payment Section (Includes Cash on Delivery + Mobile Banking) */}
            <div>
              <div className="mb-2.5">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 m-0">Payment</h2>
                <p className="text-xs text-gray-500 m-0 mt-0.5">All transactions are secure and encrypted.</p>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200">
                {/* Cash on Delivery (COD) */}
                <div className={`${paymentMethod === 'cod' ? 'bg-[#f0fdf4]/40' : ''}`}>
                  <label className="flex items-center justify-between p-3.5 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="w-4 h-4 text-[#105036] focus:ring-[#105036] border-gray-300"
                      />
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">Cash on Delivery (COD)</span>
                    </div>
                    <Truck className="w-4 h-4 text-gray-400" />
                  </label>
                  {paymentMethod === 'cod' && (
                    <div className="px-10 pb-4 text-xs text-gray-600">
                      Pay with cash upon delivery at your doorstep. Please keep exact change ready.
                    </div>
                  )}
                </div>

                {/* bKash (Mobile Banking) */}
                <div className={`${paymentMethod === 'bkash' ? 'bg-[#fdf2f8]/50' : ''}`}>
                  <label className="flex items-center justify-between p-3.5 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === 'bkash'}
                        onChange={() => setPaymentMethod('bkash')}
                        className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-gray-900">bKash</span>
                        <span className="text-[10px] font-bold bg-[#e2136e] text-white px-2 py-0.5 rounded">
                          Mobile Banking
                        </span>
                      </div>
                    </div>
                  </label>

                  {paymentMethod === 'bkash' && (
                    <div className="px-5 sm:px-10 pb-4 text-xs text-gray-700 space-y-3">
                      <div className="p-3 bg-pink-50 rounded-lg border border-pink-100 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-pink-800 font-semibold m-0">Send Money to bKash Personal:</p>
                          <p className="text-sm font-mono font-bold text-pink-900 m-0 tracking-wider">01734018155</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyNumber('01734018155')}
                          className="px-2.5 py-1.5 rounded-md bg-white border border-pink-200 text-pink-700 text-xs font-semibold flex items-center gap-1 hover:bg-pink-100/50 transition cursor-pointer shadow-sm"
                        >
                          {copiedMfs ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedMfs ? 'Copied!' : 'Copy Number'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                            bKash Sender Number *
                          </label>
                          <input
                            type="tel"
                            placeholder="01XXXXXXXXX"
                            value={senderPhone}
                            onChange={(e) => setSenderPhone(e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 text-xs focus:border-pink-600 focus:ring-1 focus:ring-pink-600 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                            Transaction ID (TrxID)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. BL9X0Y1Z"
                            value={trxId}
                            onChange={(e) => setTrxId(e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 text-xs focus:border-pink-600 focus:ring-1 focus:ring-pink-600 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Nagad (Mobile Banking) */}
                <div className={`${paymentMethod === 'nagad' ? 'bg-[#fff7ed]/50' : ''}`}>
                  <label className="flex items-center justify-between p-3.5 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === 'nagad'}
                        onChange={() => setPaymentMethod('nagad')}
                        className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-gray-900">Nagad</span>
                        <span className="text-[10px] font-bold bg-[#f97316] text-white px-2 py-0.5 rounded">
                          Mobile Banking
                        </span>
                      </div>
                    </div>
                  </label>

                  {paymentMethod === 'nagad' && (
                    <div className="px-5 sm:px-10 pb-4 text-xs text-gray-700 space-y-3">
                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-orange-800 font-semibold m-0">Send Money to Nagad Personal:</p>
                          <p className="text-sm font-mono font-bold text-orange-900 m-0 tracking-wider">01734018155</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyNumber('01734018155')}
                          className="px-2.5 py-1.5 rounded-md bg-white border border-orange-200 text-orange-700 text-xs font-semibold flex items-center gap-1 hover:bg-orange-100/50 transition cursor-pointer shadow-sm"
                        >
                          {copiedMfs ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedMfs ? 'Copied!' : 'Copy Number'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                            Nagad Sender Number *
                          </label>
                          <input
                            type="tel"
                            placeholder="01XXXXXXXXX"
                            value={senderPhone}
                            onChange={(e) => setSenderPhone(e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 text-xs focus:border-orange-600 focus:ring-1 focus:ring-orange-600 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                            Transaction ID (TrxID)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 7N8X9Y"
                            value={trxId}
                            onChange={(e) => setTrxId(e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 text-xs focus:border-orange-600 focus:ring-1 focus:ring-orange-600 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rocket (Mobile Banking) */}
                <div className={`${paymentMethod === 'rocket' ? 'bg-[#faf5ff]/50' : ''}`}>
                  <label className="flex items-center justify-between p-3.5 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === 'rocket'}
                        onChange={() => setPaymentMethod('rocket')}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-gray-900">Rocket</span>
                        <span className="text-[10px] font-bold bg-[#8b5cf6] text-white px-2 py-0.5 rounded">
                          DBBL Rocket
                        </span>
                      </div>
                    </div>
                  </label>

                  {paymentMethod === 'rocket' && (
                    <div className="px-5 sm:px-10 pb-4 text-xs text-gray-700 space-y-3">
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-purple-800 font-semibold m-0">Send Money to Rocket:</p>
                          <p className="text-sm font-mono font-bold text-purple-900 m-0 tracking-wider">01734018155</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyNumber('01734018155')}
                          className="px-2.5 py-1.5 rounded-md bg-white border border-purple-200 text-purple-700 text-xs font-semibold flex items-center gap-1 hover:bg-purple-100/50 transition cursor-pointer shadow-sm"
                        >
                          {copiedMfs ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedMfs ? 'Copied!' : 'Copy Number'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                            Rocket Sender Number *
                          </label>
                          <input
                            type="tel"
                            placeholder="01XXXXXXXXX"
                            value={senderPhone}
                            onChange={(e) => setSenderPhone(e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 text-xs focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                            Transaction ID (TrxID)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 5R6X7Y"
                            value={trxId}
                            onChange={(e) => setTrxId(e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-gray-300 text-xs focus:border-purple-600 focus:ring-1 focus:ring-purple-600 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 6. Complete Order Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-lg bg-[#0b1a13] hover:bg-[#105036] text-white font-bold text-sm sm:text-base tracking-wide transition-all duration-200 shadow-md shadow-[#0b1a13]/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Securing Order...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Complete order • TK {formatBDT(total)}</span>
                  </>
                )}
              </button>
            </div>

            {/* 7. Footer policy links */}
            <div className="pt-4 border-t border-gray-200 text-[11px] text-gray-500 flex flex-wrap gap-x-4 gap-y-2">
              <span className="cursor-pointer hover:underline">Refund policy</span>
              <span className="cursor-pointer hover:underline">Shipping policy</span>
              <span className="cursor-pointer hover:underline">Privacy policy</span>
              <span className="cursor-pointer hover:underline">Terms of service</span>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary Sidebar (approx 42%) */}
        <div className="hidden lg:block w-full lg:w-[42%] bg-[#fafaf9] border-l border-gray-200 px-8 lg:px-12 py-10 min-h-screen">
          <div className="max-w-[440px] ml-0 mr-auto space-y-6">
            {/* Products List */}
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3.5">
                  {/* Thumbnail with corner count badge */}
                  <div className="relative w-16 h-16 rounded-lg bg-white border border-gray-200 overflow-visible flex-shrink-0 shadow-2xs">
                    <img
                      src={item.image || item.images?.[0] || '/assets/images/logo.jpg'}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                      {item.quantity}
                    </span>
                  </div>

                  {/* Title & Details */}
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-semibold text-gray-900 leading-snug truncate m-0">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500 m-0 mt-0.5">
                      Size: {item.selectedSize}
                      {item.selectedVariantName ? ` • ${item.selectedVariantName}` : ''}
                    </p>
                  </div>

                  {/* Item Total Price */}
                  <div className="text-sm font-bold text-gray-900 flex-shrink-0">
                    TK {formatBDT(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Discount / Gift Card Input */}
            <form onSubmit={handleApplyDiscount} className="flex gap-2">
              <input
                type="text"
                placeholder="Discount code or gift card"
                value={discountCode}
                onChange={(e) => {
                  setDiscountCode(e.target.value);
                  setDiscountError('');
                }}
                className="flex-grow px-3.5 py-2.5 rounded-lg border border-gray-300 text-xs sm:text-sm focus:border-[#105036] focus:ring-1 focus:ring-[#105036] outline-none bg-white placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-xs sm:text-sm font-semibold text-gray-700 transition cursor-pointer"
              >
                Apply
              </button>
            </form>
            {discountError && <p className="text-xs text-rose-600 m-0">{discountError}</p>}
            {discountApplied && <p className="text-xs text-emerald-700 font-medium m-0">✓ Code applied successfully</p>}

            {/* Cost Breakdown */}
            <div className="border-t border-gray-200 pt-4 space-y-2.5 text-sm text-gray-600">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">TK {formatBDT(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <span>Shipping</span>
                  <span className="text-[11px] text-gray-500">
                    ({deliveryZone === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'})
                  </span>
                </div>
                <span className="font-semibold text-gray-900">TK {formatBDT(deliveryCharge)}</span>
              </div>
            </div>

            {/* Total Row */}
            <div className="border-t border-gray-200 pt-4 flex justify-between items-baseline">
              <div>
                <span className="text-base font-bold text-gray-900 block leading-tight">Total</span>
                <span className="text-[11px] text-gray-500 uppercase tracking-wider">Including All VAT & Taxes</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-500 font-semibold mr-1.5">BDT</span>
                <span className="text-2xl font-extrabold text-[#0b1a13]">TK {formatBDT(total)}</span>
              </div>
            </div>

            {/* Luxury Assurance Badge */}
            <div className="p-4 rounded-xl bg-white border border-gray-200 flex items-start gap-3 shadow-2xs mt-6">
              <ShieldCheck className="w-5 h-5 text-[#105036] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-900 m-0">AUVARE Authenticity Guarantee</p>
                <p className="text-[11px] text-gray-500 m-0 mt-0.5 leading-relaxed">
                  Every curated vintage drop is physically inspected, hand-measured, and verified 1-of-1 authentic before dispatch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


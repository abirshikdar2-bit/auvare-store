'use client';

import React, { useState, useEffect } from 'react';
import type { Product } from '@/types';

interface HeroReelsSliderProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export function HeroReelsSlider({ products, onSelectProduct }: HeroReelsSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter top catalog drops with valid images
  const drops = products.slice(0, 10);

  useEffect(() => {
    if (drops.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % drops.length);
    }, 2500); // 2.5 seconds auto swipe duration
    return () => clearInterval(interval);
  }, [drops.length]);

  if (drops.length === 0) return null;

  const currentProduct = drops[currentIndex] || drops[0];

  return (
    <div
      className="relative w-full max-w-md mx-auto aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-stone-200/90 bg-white cursor-pointer select-none group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.18)]"
      onClick={() => onSelectProduct(currentProduct)}
    >
      {/* Slides Viewport & Track */}
      <div
        className="w-full h-full flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {drops.map((prod, idx) => {
          const imgUrl = prod.image || prod.images?.[0] || '/assets/images/logo.jpg';
          return (
            <div key={prod.id} className="w-full h-full flex-shrink-0 relative bg-stone-50">
              <img
                src={imgUrl}
                alt={prod.title}
                className="w-full h-full object-cover object-center select-none"
                loading={idx === 0 ? 'eager' : 'lazy'}
                draggable={false}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

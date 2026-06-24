import React, { useState } from 'react';
import { Tag, Sparkles, ChevronRight, ChevronLeft, Shirt, Activity, Award } from 'lucide-react';

interface BannerHeroProps {
  onSelectCategory: (category: string) => void;
  activeCategory: string;
}

export default function BannerHero({ onSelectCategory, activeCategory }: BannerHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      badge: 'Summer Cotton Collection 2026',
      title: 'Luxury Breathable Egyptian Cotton Fabrics',
      subtitle: 'Experience pure traditional craftsmanship. Premium unstitched and stitched suits customized for style & absolute warm-weather freshness.',
      image: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200&auto=format&fit=crop',
      cta: 'Explore Cotton Collection',
      category: 'Cotton Collection',
      colorTheme: 'from-indigo-950/95 to-slate-900/85',
    },
    {
      badge: 'Pro Elite Athletic Launch',
      title: 'Power and Dry-Fit Comfort Combined',
      subtitle: 'Engineered stretch gymwear, high-tension rackets, and pro gear designed to elevate your physical performance standards.',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200&auto=format&fit=crop',
      cta: 'Shop Sports Gear',
      category: 'Sports Gear',
      colorTheme: 'from-slate-950/95 to-indigo-950/90',
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const current = slides[currentSlide];

  return (
    <div className="relative w-full overflow-hidden" id="banner-hero-container">
      {/* Immersive Slideshow Banner */}
      <div className="relative h-[360px] sm:h-[420px] md:h-[480px] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-xl" id="banner-slider">
        <img
          src={current.image}
          alt={current.title}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 transform scale-102 filter brightness-75"
        />
        {/* Overlay gradient mask */}
        <div className={`absolute inset-0 bg-gradient-to-r ${current.colorTheme}`} />
        
        {/* Slide Content */}
        <div className="relative z-10 max-w-2xl text-white flex flex-col justify-center h-full px-5 sm:px-10 md:px-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/25 text-indigo-200 border border-indigo-500/35 rounded-full text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-3.5 self-start">
            <Sparkles size={11} />
            {current.badge}
          </span>
          <h1 className="text-2xl sm:text-3.5xl md:text-5xl font-extrabold tracking-tight text-white mb-3 font-display leading-tight">
            {current.title}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm md:text-base mb-6 md:mb-8 leading-relaxed font-sans max-w-lg">
            {current.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onSelectCategory(current.category)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group cursor-pointer w-full sm:w-auto"
            >
              <span>{current.cta}</span>
              <ChevronRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="hidden md:flex items-center gap-2 text-white/80 text-xs font-medium px-4 py-2 border border-white/20 rounded-lg backdrop-blur-sm">
              <Tag size={13} className="text-indigo-400" />
              <span>Use <strong>BISMILLAH10</strong> for 10% Flat Discount</span>
            </div>
          </div>
        </div>

        {/* Carousel controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors cursor-pointer z-10"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors cursor-pointer z-10"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                currentSlide === i ? 'bg-indigo-500 w-8' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Trust Highlights Section under Slide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6" id="trust-indicators-grid">
        <div className="flex items-center gap-3 sm:gap-4 bg-white border border-slate-205 p-3.5 sm:p-5 rounded-xl shadow-xs hover:shadow-sm transition-shadow">
          <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-700 shrink-0">
            <Shirt size={18} className="sm:w-[22px] sm:h-[22px]" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-[12px] sm:text-sm">Fine Cotton Quality</h3>
            <p className="text-slate-500 text-[10px] sm:text-xs">Egyptian Cotton thread count & breathable comfort.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4 bg-white border border-slate-205 p-3.5 sm:p-5 rounded-xl shadow-xs hover:shadow-sm transition-shadow">
          <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-700 shrink-0">
            <Activity size={18} className="sm:w-[22px] sm:h-[22px]" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-[12px] sm:text-sm">Athletic Wear</h3>
            <p className="text-slate-500 text-[10px] sm:text-xs">Sports textures, high performance gear & shoes.</p>
          </div>
        </div>
 
        <div className="flex items-center gap-3 sm:gap-4 bg-white border border-slate-205 p-3.5 sm:p-5 rounded-xl shadow-xs hover:shadow-sm transition-shadow">
          <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-700 shrink-0">
            <Award size={18} className="sm:w-[22px] sm:h-[22px]" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-[12px] sm:text-sm">Fast Shipping & COD</h3>
            <p className="text-slate-500 text-[10px] sm:text-xs">Easy Cash on Delivery & SSL secure payments.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Product } from '../types';
import ScrollFrameHero from './ScrollFrameHero';

type Props = {
  products: Product[];
  onSelectCategory: (category: string) => void;
  onOpenProduct: (product: Product) => void;
};

export default function CinematicExperience({
  products,
  onSelectCategory,
  onOpenProduct,
}: Props) {
  const goShop = () => {
    onSelectCategory('Trophies');
    document.getElementById('store-grid-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative bg-[var(--site-bg)] text-[var(--site-ink)]">
      <ScrollFrameHero
        products={products}
        onOpenProduct={onOpenProduct}
        onGoShop={goShop}
      />
    </div>
  );
}

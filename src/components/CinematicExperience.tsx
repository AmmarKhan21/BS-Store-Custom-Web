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
    <div className="relative bg-[#050d0b] text-[#f4efe6]">
      <ScrollFrameHero
        products={products}
        onOpenProduct={onOpenProduct}
        onGoShop={goShop}
      />
    </div>
  );
}

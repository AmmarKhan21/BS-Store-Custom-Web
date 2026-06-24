import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Product, Review, CartItem } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { Star, ShoppingCart, ArrowLeft, Plus, Minus } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { format } = useCurrency();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviewerName, setReviewerName] = useState('');
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setProduct(null);
        else {
          setProduct(data);
          setSelectedImage(data.images?.[0] || '');
          setSelectedSize(data.sizes?.[0] || '');
          setSelectedColor(data.colors?.[0] || '');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const addToCart = () => {
    if (!product) return;
    const saved = localStorage.getItem('bismillah_cart');
    const cart: CartItem[] = saved ? JSON.parse(saved) : [];
    const existingIdx = cart.findIndex(
      (item) => item.product.id === product.id && item.selectedSize === selectedSize && item.selectedColor === selectedColor
    );
    if (existingIdx > -1) {
      cart[existingIdx].quantity += quantity;
    } else {
      cart.push({ product, quantity, selectedSize, selectedColor });
    }
    localStorage.setItem('bismillah_cart', JSON.stringify(cart));
    setToast('Added to cart!');
    setTimeout(() => setToast(''), 2000);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewerName.trim() || !commentInput.trim()) return;
    await fetch(`/api/products/${product.id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewerName, rating: ratingInput, comment: commentInput }),
    });
    const res = await fetch(`/api/products/${product.id}`);
    setProduct(await res.json());
    setReviewerName('');
    setCommentInput('');
    setRatingInput(5);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <p className="text-slate-600">Product not found</p>
        <Link to="/" className="text-indigo-600 font-bold text-sm">← Back to store</Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && <div className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl">{toast}</div>}
      <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4">
        <Link to="/" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600">
          <ArrowLeft size={16} /> Back to store
        </Link>
      </header>
      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/2 p-6 bg-slate-50">
            <div className="aspect-square rounded-xl overflow-hidden bg-white border border-slate-100">
              <img src={selectedImage} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto">
                {product.images.map((img, idx) => (
                  <button key={idx} onClick={() => setSelectedImage(img)} className={`w-16 h-16 rounded-md overflow-hidden border shrink-0 ${selectedImage === img ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-slate-200'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="md:w-1/2 p-6 md:p-8">
            <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-widest">{product.category}</span>
            <h1 className="text-2xl font-bold font-display text-slate-900 mt-1 mb-3">{product.name}</h1>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-2xl font-bold">{format(product.price)}</span>
              {product.originalPrice && <span className="text-sm text-slate-400 line-through">{format(product.originalPrice)}</span>}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">{product.description}</p>
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button key={s} onClick={() => setSelectedSize(s)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${selectedSize === s ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200'}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Color</p>
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <button key={c} onClick={() => setSelectedColor(c)} className={`w-8 h-8 rounded-full border-2 ${selectedColor === c ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-slate-200'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-slate-200 rounded-xl">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 cursor-pointer"><Minus size={14} /></button>
                <span className="px-4 text-sm font-bold">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-2 cursor-pointer"><Plus size={14} /></button>
              </div>
              <span className="text-xs text-slate-500">{product.stock} in stock</span>
            </div>
            <button disabled={isOutOfStock} onClick={addToCart} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm ${isOutOfStock ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'}`}>
              <ShoppingCart size={16} /> {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>
        </div>
        <section className="mt-8 bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4">Customer Reviews</h2>
          {product.reviews.map((r) => (
            <div key={r.id} className="border-b border-slate-100 pb-4 mb-4">
              <span className="font-bold text-sm">{r.reviewerName}</span>
              <p className="text-sm text-slate-600 mt-1">{r.comment}</p>
            </div>
          ))}
          <form onSubmit={submitReview} className="space-y-3 border-t border-slate-100 pt-4">
            <input value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} placeholder="Your name" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required />
            <textarea value={commentInput} onChange={(e) => setCommentInput(e.target.value)} placeholder="Your review" rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" required />
            <button type="submit" className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer">Submit Review</button>
          </form>
        </section>
      </main>
    </div>
  );
}

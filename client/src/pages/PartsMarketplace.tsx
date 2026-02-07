import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import {
  Search, Plus, Package, Wrench, Zap, CircleDot, Car, Truck,
  Bike, Ship, ChevronRight, Eye, MessageCircle, MapPin, X,
  Tag, ShieldCheck, Clock, TrendingUp, Filter, SlidersHorizontal,
  Star, Heart, Share2, ArrowLeft, Send, CheckCircle, AlertCircle
} from "lucide-react";

const CATEGORIES = [
  { id: "engine", label: "Engine & Drivetrain", icon: Wrench, image: "/generated_images/marketplace_engine_parts.png", color: "from-orange-500/20 to-red-500/20" },
  { id: "brakes", label: "Brakes & Suspension", icon: CircleDot, image: "/generated_images/marketplace_brake_parts.png", color: "from-cyan-500/20 to-blue-500/20" },
  { id: "body", label: "Body & Exterior", icon: Car, image: "/generated_images/marketplace_body_parts.png", color: "from-purple-500/20 to-pink-500/20" },
  { id: "electrical", label: "Electrical & Lighting", icon: Zap, image: "/generated_images/marketplace_electrical.png", color: "from-yellow-500/20 to-green-500/20" },
  { id: "wheels", label: "Wheels & Tires", icon: CircleDot, image: "/generated_images/marketplace_wheels_tires.png", color: "from-emerald-500/20 to-teal-500/20" },
  { id: "interior", label: "Interior & Accessories", icon: Package, image: "/generated_images/marketplace_hero.png", color: "from-indigo-500/20 to-violet-500/20" },
];

const VEHICLE_TYPES = [
  { id: "car", label: "Cars", icon: Car },
  { id: "truck", label: "Trucks", icon: Truck },
  { id: "motorcycle", label: "Motorcycles", icon: Bike },
  { id: "boat", label: "Boats", icon: Ship },
  { id: "atv", label: "ATVs/UTVs", icon: Car },
  { id: "rv", label: "RVs", icon: Truck },
];

const CONDITIONS = [
  { id: "new", label: "New", color: "text-green-400" },
  { id: "like_new", label: "Like New", color: "text-emerald-400" },
  { id: "used", label: "Used - Good", color: "text-cyan-400" },
  { id: "fair", label: "Used - Fair", color: "text-yellow-400" },
  { id: "for_parts", label: "For Parts", color: "text-orange-400" },
];

function GlassCard({ children, className = "", onClick, hover3d = false }: { children: React.ReactNode; className?: string; onClick?: () => void; hover3d?: boolean }) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hover3d) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotateX(-y * 10);
    setRotateY(x * 10);
  };

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ transform: hover3d ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)` : undefined, transition: 'transform 0.1s ease-out' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { setRotateX(0); setRotateY(0); }}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02, borderColor: 'rgba(6,182,212,0.4)' } : undefined}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      {children}
    </motion.div>
  );
}

function CategoryCarousel({ onSelect }: { onSelect: (cat: string) => void }) {
  return (
    <div className="relative">
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.id}
            className="snap-center shrink-0 w-[280px]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard hover3d onClick={() => onSelect(cat.id)} className="group h-[200px]">
              <div className="absolute inset-0">
                <img src={cat.image} alt={cat.label} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} via-transparent to-black/60`} />
              </div>
              <div className="relative z-10 p-5 h-full flex flex-col justify-end">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-3 group-hover:bg-cyan-500/30 transition-colors">
                  <cat.icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-white font-semibold text-lg font-rajdhani">{cat.label}</h3>
                <div className="flex items-center gap-1 text-cyan-400 text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Browse</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ListingCard({ listing, onClick }: { listing: any; onClick: () => void }) {
  const conditionInfo = CONDITIONS.find(c => c.id === listing.condition) || CONDITIONS[2];
  return (
    <GlassCard hover3d onClick={onClick} className="group">
      <div className="relative h-48 overflow-hidden rounded-t-2xl">
        {listing.photos?.[0] ? (
          <img src={listing.photos[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <Package className="w-12 h-12 text-slate-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute top-3 right-3 flex gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-sm border border-white/10 ${conditionInfo.color}`}>
            {conditionInfo.label}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <span className="text-2xl font-bold text-white font-rajdhani">${listing.price}</span>
          {listing.shippingAvailable && (
            <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">Ships</span>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm line-clamp-2 mb-2 group-hover:text-cyan-300 transition-colors" data-testid={`listing-title-${listing.id}`}>
          {listing.title}
        </h3>
        {(listing.fitmentYear || listing.fitmentMake) && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
            <Car className="w-3.5 h-3.5 text-cyan-500/60" />
            <span>{[listing.fitmentYear, listing.fitmentMake, listing.fitmentModel].filter(Boolean).join(' ')}</span>
          </div>
        )}
        {listing.location && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5" />
            <span>{listing.location}</span>
          </div>
        )}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{listing.views || 0}</span>
          <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{listing.contactCount || 0}</span>
          <span className="flex items-center gap-1 ml-auto"><Clock className="w-3 h-3" />{new Date(listing.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </GlassCard>
  );
}

function CreateListingModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: '', description: '', partNumber: '', condition: 'used', price: '',
    category: 'general', fitmentYear: '', fitmentMake: '', fitmentModel: '', fitmentTrim: '',
    vehicleType: 'car', location: '', sellerZipCode: '', shippingAvailable: false, shippingPrice: '',
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/marketplace/listings', data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Listing Created", description: "Your part is now live on the marketplace!" });
      onCreated();
      onClose();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      price: form.price,
      fitmentYear: form.fitmentYear ? parseInt(form.fitmentYear) : null,
      shippingPrice: form.shippingPrice || null,
      photos: [],
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-950/95 backdrop-blur-xl shadow-[0_0_80px_rgba(6,182,212,0.1)]"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 pb-4 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl rounded-t-2xl">
          <h2 className="text-xl font-bold text-white font-rajdhani flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" />
            List a Part for Sale
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors" data-testid="close-create-modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Part Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all"
              placeholder="e.g. 2018 Honda Civic Alternator"
              data-testid="input-listing-title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Price ($) *</label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all"
                placeholder="0.00"
                data-testid="input-listing-price"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Condition *</label>
              <select
                value={form.condition}
                onChange={e => setForm({ ...form, condition: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all"
                data-testid="select-condition"
              >
                {CONDITIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all resize-none"
              placeholder="Describe the part, any defects, why you're selling..."
              data-testid="input-listing-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Part Number</label>
              <input
                type="text"
                value={form.partNumber}
                onChange={e => setForm({ ...form, partNumber: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all"
                placeholder="OEM or aftermarket #"
                data-testid="input-part-number"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all"
                data-testid="select-category"
              >
                <option value="general">General</option>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
            <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
              <Car className="w-4 h-4" /> Vehicle Fitment
            </h3>
            <div className="grid grid-cols-4 gap-3">
              <input
                type="number"
                value={form.fitmentYear}
                onChange={e => setForm({ ...form, fitmentYear: e.target.value })}
                className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none transition-all"
                placeholder="Year"
                data-testid="input-fitment-year"
              />
              <input
                type="text"
                value={form.fitmentMake}
                onChange={e => setForm({ ...form, fitmentMake: e.target.value })}
                className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none transition-all"
                placeholder="Make"
                data-testid="input-fitment-make"
              />
              <input
                type="text"
                value={form.fitmentModel}
                onChange={e => setForm({ ...form, fitmentModel: e.target.value })}
                className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none transition-all"
                placeholder="Model"
                data-testid="input-fitment-model"
              />
              <input
                type="text"
                value={form.fitmentTrim}
                onChange={e => setForm({ ...form, fitmentTrim: e.target.value })}
                className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none transition-all"
                placeholder="Trim"
                data-testid="input-fitment-trim"
              />
            </div>
            <div className="mt-3">
              <label className="block text-xs text-slate-500 mb-1.5">Vehicle Type</label>
              <div className="flex flex-wrap gap-2">
                {VEHICLE_TYPES.map(vt => (
                  <button
                    key={vt.id}
                    type="button"
                    onClick={() => setForm({ ...form, vehicleType: vt.id })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      form.vehicleType === vt.id
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 border'
                        : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                    data-testid={`btn-vehicle-type-${vt.id}`}
                  >
                    {vt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Your Location</label>
              <input
                type="text"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all"
                placeholder="City, State"
                data-testid="input-location"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">ZIP Code</label>
              <input
                type="text"
                value={form.sellerZipCode}
                onChange={e => setForm({ ...form, sellerZipCode: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all"
                placeholder="37201"
                data-testid="input-zip"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.shippingAvailable}
                onChange={e => setForm({ ...form, shippingAvailable: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-cyan-500/30"
                data-testid="checkbox-shipping"
              />
              <span className="text-sm text-slate-300">Willing to ship</span>
            </label>
            {form.shippingAvailable && (
              <input
                type="number"
                step="0.01"
                value={form.shippingPrice}
                onChange={e => setForm({ ...form, shippingPrice: e.target.value })}
                className="w-32 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none transition-all"
                placeholder="Ship cost $"
                data-testid="input-shipping-price"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            data-testid="button-create-listing"
          >
            {createMutation.isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Tag className="w-4 h-4" />
                List Part for Sale
              </>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function ListingDetail({ listing, onClose, onContact }: { listing: any; onClose: () => void; onContact: (msg: string) => void }) {
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const conditionInfo = CONDITIONS.find(c => c.id === listing.condition) || CONDITIONS[2];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-950/95 backdrop-blur-xl shadow-[0_0_80px_rgba(6,182,212,0.1)]"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-64 sm:h-80">
          {listing.photos?.[0] ? (
            <img src={listing.photos[0]} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <Package className="w-20 h-20 text-slate-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          <button onClick={onClose} className="absolute top-4 left-4 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors" data-testid="close-detail-modal">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-sm border border-white/10 ${conditionInfo.color}`}>
                {conditionInfo.label}
              </span>
              {listing.shippingAvailable && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 backdrop-blur-sm border border-green-500/20 text-green-400">
                  Shipping Available
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white font-rajdhani" data-testid="detail-title">{listing.title}</h2>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <GlassCard className="p-4 text-center">
              <div className="text-3xl font-bold text-cyan-400 font-rajdhani">${listing.price}</div>
              <div className="text-xs text-slate-500 mt-1">Asking Price</div>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <div className="text-lg font-bold text-white font-rajdhani">
                {[listing.fitmentYear, listing.fitmentMake].filter(Boolean).join(' ') || 'Universal'}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {listing.fitmentModel || 'All Models'}
              </div>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-white">
                <MapPin className="w-4 h-4 text-cyan-500" />
                <span className="font-semibold text-sm">{listing.location || listing.sellerZipCode || 'N/A'}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">Location</div>
            </GlassCard>
          </div>

          {listing.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{listing.description}</p>
            </div>
          )}

          {listing.partNumber && (
            <div className="mb-6 flex items-center gap-2">
              <span className="text-xs text-slate-500">Part #:</span>
              <span className="px-2 py-1 rounded bg-white/5 text-sm text-cyan-300 font-mono">{listing.partNumber}</span>
            </div>
          )}

          {listing.seller && (
            <GlassCard className="p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {(listing.seller.firstName || listing.seller.username || '?')[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{listing.seller.firstName || listing.seller.username}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-green-400" /> Verified Seller
                    {listing.seller.city && ` · ${listing.seller.city}, ${listing.seller.state}`}
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          <div className="border-t border-white/10 pt-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-cyan-400" />
              Contact Seller
            </h3>
            {sent ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Message sent! The seller will be notified.</span>
              </div>
            ) : (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all"
                  placeholder="Hi, is this still available?"
                  data-testid="input-contact-message"
                />
                <button
                  onClick={() => { onContact(message || "Hi, is this still available?"); setSent(true); }}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                  data-testid="button-send-message"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MyListingsPanel({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: listings = [], isLoading } = useQuery({ queryKey: ['/api/marketplace/my-listings'], queryFn: async () => { const r = await fetch('/api/marketplace/my-listings', { credentials: 'include' }); return r.json(); } });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest('DELETE', `/api/marketplace/listings/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['/api/marketplace/my-listings'] }); toast({ title: "Listing removed" }); }
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => { await apiRequest('PATCH', `/api/marketplace/listings/${id}`, { status }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['/api/marketplace/my-listings'] }); }
  });

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-950/95 backdrop-blur-xl"
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        exit={{ y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 pb-4 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl rounded-t-2xl">
          <h2 className="text-xl font-bold text-white font-rajdhani">My Listings</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" /></div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No listings yet. List your first part!</p>
            </div>
          ) : listings.map((listing: any) => (
            <GlassCard key={listing.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                  {listing.photos?.[0] ? <img src={listing.photos[0]} alt="" className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-slate-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate">{listing.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="text-cyan-400 font-bold">${listing.price}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{listing.views}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{listing.contactCount}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${listing.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {listing.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => toggleMutation.mutate({ id: listing.id, status: listing.status === 'active' ? 'paused' : 'active' })}
                    className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors"
                    data-testid={`toggle-listing-${listing.id}`}
                  >
                    {listing.status === 'active' ? 'Pause' : 'Activate'}
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(listing.id)}
                    className="px-3 py-1.5 rounded-lg text-xs bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                    data-testid={`delete-listing-${listing.id}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function PartsMarketplace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [activeVehicleType, setActiveVehicleType] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showMyListings, setShowMyListings] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [fitmentMake, setFitmentMake] = useState('');
  const [fitmentModel, setFitmentModel] = useState('');
  const [fitmentYear, setFitmentYear] = useState('');

  const queryParams = new URLSearchParams();
  if (search) queryParams.set('search', search);
  if (activeCategory) queryParams.set('category', activeCategory);
  if (activeVehicleType) queryParams.set('vehicleType', activeVehicleType);
  if (fitmentMake) queryParams.set('make', fitmentMake);
  if (fitmentModel) queryParams.set('model', fitmentModel);
  if (fitmentYear) queryParams.set('year', fitmentYear);

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['/api/marketplace/listings', search, activeCategory, activeVehicleType, fitmentMake, fitmentModel, fitmentYear],
    queryFn: async () => {
      const res = await fetch(`/api/marketplace/listings?${queryParams.toString()}`);
      return res.json();
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/marketplace/stats'],
    queryFn: async () => { const r = await fetch('/api/marketplace/stats'); return r.json(); },
  });

  const { data: selectedListing } = useQuery({
    queryKey: ['/api/marketplace/listings', selectedListingId],
    queryFn: async () => {
      const r = await fetch(`/api/marketplace/listings/${selectedListingId}`);
      return r.json();
    },
    enabled: !!selectedListingId,
  });

  const contactMutation = useMutation({
    mutationFn: async ({ id, message }: { id: string; message: string }) => {
      const res = await apiRequest('POST', `/api/marketplace/listings/${id}/contact`, { message });
      return res.json();
    },
    onSuccess: () => toast({ title: "Message Sent", description: "The seller has been notified." }),
    onError: (err: any) => toast({ title: "Error", description: err.message || "You need to be logged in to contact sellers.", variant: "destructive" }),
  });

  const hasActiveFilters = activeCategory || activeVehicleType || fitmentMake || fitmentModel || fitmentYear;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e17] via-[#0d1321] to-[#0a0e17]">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/generated_images/marketplace_hero.png" alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e17]/60 via-[#0a0e17]/80 to-[#0a0e17]" />
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-500/8 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-12">
          <div className="flex items-center justify-between mb-2">
            <a href="/" className="text-slate-500 hover:text-cyan-400 transition-colors text-sm flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to GarageBot
            </a>
            <div className="flex gap-2">
              {user && (
                <>
                  <button
                    onClick={() => setShowMyListings(true)}
                    className="px-4 py-2 rounded-xl text-sm bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
                    data-testid="button-my-listings"
                  >
                    <Package className="w-4 h-4" /> My Listings
                  </button>
                  <button
                    onClick={() => setShowCreate(true)}
                    className="px-4 py-2 rounded-xl text-sm bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
                    data-testid="button-sell-part"
                  >
                    <Plus className="w-4 h-4" /> Sell a Part
                  </button>
                </>
              )}
            </div>
          </div>

          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold font-rajdhani mb-3">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Parts Marketplace</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Buy and sell parts from fellow gearheads. Find exactly what you need by make, model, and year.
            </p>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <TrendingUp className="w-4 h-4 text-cyan-500" />
                <span><strong className="text-white">{stats?.active || 0}</strong> active listings</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span>Verified sellers</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="max-w-3xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search parts by name, number, or description..."
                className="w-full pl-12 pr-14 py-4 rounded-2xl bg-white/[0.06] border border-white/10 text-white placeholder-slate-500 focus:border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all text-lg backdrop-blur-sm"
                data-testid="input-search-parts"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all ${showFilters ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                data-testid="button-toggle-filters"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 p-4 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        value={fitmentMake}
                        onChange={e => setFitmentMake(e.target.value)}
                        placeholder="Make (e.g. Honda)"
                        className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none transition-all"
                        data-testid="filter-make"
                      />
                      <input
                        type="text"
                        value={fitmentModel}
                        onChange={e => setFitmentModel(e.target.value)}
                        placeholder="Model (e.g. Civic)"
                        className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none transition-all"
                        data-testid="filter-model"
                      />
                      <input
                        type="number"
                        value={fitmentYear}
                        onChange={e => setFitmentYear(e.target.value)}
                        placeholder="Year (e.g. 2018)"
                        className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none transition-all"
                        data-testid="filter-year"
                      />
                    </div>
                    {hasActiveFilters && (
                      <button
                        onClick={() => { setActiveCategory(''); setActiveVehicleType(''); setFitmentMake(''); setFitmentModel(''); setFitmentYear(''); }}
                        className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                        data-testid="button-clear-filters"
                      >
                        <X className="w-3 h-3" /> Clear all filters
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <motion.div
          className="mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-bold text-white font-rajdhani mb-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            Browse by Category
          </h2>
          <CategoryCarousel onSelect={(cat) => setActiveCategory(cat === activeCategory ? '' : cat)} />
        </motion.div>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {VEHICLE_TYPES.map(vt => (
              <button
                key={vt.id}
                onClick={() => setActiveVehicleType(vt.id === activeVehicleType ? '' : vt.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  activeVehicleType === vt.id
                    ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                data-testid={`filter-vehicle-${vt.id}`}
              >
                <vt.icon className="w-4 h-4" />
                {vt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white font-rajdhani">
            {search ? `Results for "${search}"` : hasActiveFilters ? 'Filtered Listings' : 'Latest Listings'}
            <span className="text-sm font-normal text-slate-500 ml-2">({listings.length})</span>
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.03] animate-pulse">
                <div className="h-48 bg-white/5 rounded-t-2xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-white font-rajdhani mb-2">No Listings Found</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              {search || hasActiveFilters ? 'Try adjusting your search or filters.' : 'Be the first to list a part!'}
            </p>
            {user && (
              <button
                onClick={() => setShowCreate(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 inline-flex items-center gap-2"
                data-testid="button-sell-first-part"
              >
                <Plus className="w-5 h-5" /> List a Part
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing: any, i: number) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ListingCard listing={listing} onClick={() => setSelectedListingId(listing.id)} />
              </motion.div>
            ))}
          </div>
        )}

        {!user && (
          <GlassCard className="mt-12 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
              <Tag className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white font-rajdhani mb-2">Got Spare Parts?</h3>
            <p className="text-slate-400 max-w-md mx-auto mb-6">
              Sign up to list your parts for sale. Reach thousands of gearheads looking for exactly what you have.
            </p>
            <a
              href="/auth"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
              data-testid="link-signup-to-sell"
            >
              Sign Up to Sell
              <ChevronRight className="w-4 h-4" />
            </a>
          </GlassCard>
        )}
      </div>

      <AnimatePresence>
        {showCreate && <CreateListingModal onClose={() => setShowCreate(false)} onCreated={() => queryClient.invalidateQueries({ queryKey: ['/api/marketplace/listings'] })} />}
        {showMyListings && <MyListingsPanel onClose={() => setShowMyListings(false)} />}
        {selectedListingId && selectedListing && (
          <ListingDetail
            listing={selectedListing}
            onClose={() => setSelectedListingId(null)}
            onContact={(msg) => contactMutation.mutate({ id: selectedListing.id, message: msg })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

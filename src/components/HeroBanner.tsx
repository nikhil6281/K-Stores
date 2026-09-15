import React from 'react';
import { Sparkles, Clock, ShieldCheck, ArrowRight, Phone } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const scrollToProducts = () => {
    document.querySelector('main')?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <div className="relative w-full overflow-hidden bg-navy-950 text-white" style={{minHeight:'72vh', display:'flex', alignItems:'center'}}>
      {/* Ambient hero image */}
      <div className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage:"url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2000&q=80')", opacity:0.18 }} />
      <div className="absolute inset-0" style={{background:'linear-gradient(135deg,#040814 0%,rgba(7,12,26,0.92) 60%,rgba(11,19,43,0.7) 100%)'}} />
      {/* Glow orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{background:'rgba(245,158,11,0.08)',transform:'translate(-30%,-30%)'}} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{background:'rgba(217,119,6,0.07)',transform:'translate(30%,30%)'}} />

      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-8 py-20 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-8"
          style={{background:'rgba(245,158,11,0.08)',backdropFilter:'blur(8px)'}}>
          <Sparkles className="w-4 h-4 text-amber-400" style={{animation:'pulse 2s infinite'}} />
          RA General Store — Bommalatapalli Village
        </div>

        {/* Headline */}
        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white mb-5" style={{lineHeight:1.15, letterSpacing:'-0.01em'}}>
          Fresh Groceries,<br />
          <span className="gold-text">Delivered in 20 Minutes</span>
        </h1>
        <p className="text-slate-300 text-base sm:text-xl max-w-2xl leading-relaxed mb-10" style={{fontFamily:'Lora,serif'}}>
          Premium pantry staples, dairy, farm-fresh vegetables and household essentials — right beside Chennampalli road, Bommalatapalli.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-3 justify-center mb-10 text-xs sm:text-sm">
          {[
            { icon: <Clock className="w-4 h-4 text-amber-400" />, text: '20-Min Express Delivery' },
            { icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />, text: '100% Quality Assured' },
            { icon: <span className="text-amber-400 font-bold text-base">₹</span>, text: 'Cash on Delivery & UPI' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-navy-600/60 text-slate-200" style={{background:'rgba(11,19,43,0.7)',backdropFilter:'blur(8px)'}}>
              {f.icon}<span>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button onClick={scrollToProducts}
            className="gold-btn flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base tracking-wide">
            Explore Store Catalog <ArrowRight className="w-4 h-4" />
          </button>
          <a href="https://wa.me/916281730144?text=Hello%20RA%20General%20Store%2C%20I%20want%20to%20order"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-amber-500/30 text-slate-200 hover:text-white hover:border-amber-400 transition-colors text-base font-semibold"
            style={{background:'rgba(11,19,43,0.6)',backdropFilter:'blur(8px)'}}>
            <Phone className="w-4 h-4 text-emerald-400" /> WhatsApp Quick Order
          </a>
        </div>
      </div>
    </div>
  );
};

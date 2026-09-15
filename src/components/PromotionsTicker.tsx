import React from 'react';
import { Sparkles } from 'lucide-react';
export const PromotionsTicker: React.FC = () => (
  <div className="w-full py-2.5 px-4 text-center text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center gap-2 text-navy-900"
    style={{background:'linear-gradient(90deg,#F59E0B,#FBBF24,#F59E0B)'}}>
    <Sparkles className="w-4 h-4 shrink-0" />
    <span><strong>Special Offer:</strong> Free Village Delivery on orders above &#8377;199! Fresh farm vegetables just arrived.</span>
  </div>
);

import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import confetti from 'canvas-confetti';
import { 
  MessageSquare, 
  Clock, 
  MapPin, 
  Printer, 
  Copy, 
  ArrowRight, 
  X,
  Check
} from 'lucide-react';
import { 
  getWhatsAppOrderUrl, 
  formatWhatsAppOrderBill 
} from '../utils/whatsapp';

export const OrderSuccessModal: React.FC = () => {
  const {
    isOrderSuccessOpen,
    setIsOrderSuccessOpen,
    setIsTrackingOpen,
    activeOrder,
    language,
    t,
    showToast
  } = useStore();

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOrderSuccessOpen && activeOrder) {
      // Fire festive confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Ignore if blocked
      }
    }
  }, [isOrderSuccessOpen, activeOrder]);

  if (!isOrderSuccessOpen || !activeOrder) return null;

  const whatsappUrl = getWhatsAppOrderUrl(activeOrder, language);

  const handleOpenWhatsApp = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    showToast('info', 'WhatsApp Bill', t.whatsappSentToast);
  };

  const handleCopyBill = () => {
    const text = formatWhatsAppOrderBill(activeOrder, language);
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('success', 'Copied', language === 'te' ? 'బిల్లు కాపీ చేయబడింది' : 'Bill text copied to clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scale-up border border-slate-200">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-600 text-white p-6 text-center relative">
          <button
            onClick={() => setIsOrderSuccessOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg bg-black/20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-3xl bg-amber-400 text-emerald-950 flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg ring-4 ring-white/20">
            🎉
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {t.orderSuccessTitle}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 font-medium max-w-md mx-auto">
            {t.orderSuccessSubtitle.replace('{orderId}', activeOrder.id)}
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-300 border border-white/10">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {activeOrder.deliveryType === 'delivery_20min' 
                ? (language === 'te' ? '20 నిమిషాల డెలివరీ సమయం' : '20-Minute Delivery Promised') 
                : (language === 'te' ? '5 నిమిషాల్లో షాప్ పికప్ సిద్ధం' : '5-Min Ready for Store Pickup')}
            </span>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {/* WhatsApp Action Card (Primary Highlight) */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-100/70 border-2 border-emerald-500/50 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-emerald-950 text-sm">
                  {t.whatsappCardTitle}
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                  {t.whatsappCardDesc}
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenWhatsApp}
              className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm transition-all"
            >
              <MessageSquare className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>{t.sendWhatsAppBtn}</span>
            </button>
          </div>

          {/* Itemized Bill Breakdown */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="font-bold text-slate-800">
                {language === 'te' ? 'ఆర్డర్ సారాంశం' : 'Order Bill Receipt'} (#{activeOrder.id})
              </div>
              <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                activeOrder.paymentMethod === 'online_razorpay'
                  ? 'bg-blue-100 text-blue-900'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {activeOrder.paymentMethod === 'online_razorpay'
                  ? 'PAID ONLINE (RAZORPAY)'
                  : activeOrder.paymentMethod === 'pay_on_pickup'
                  ? 'PAY ON PICKUP'
                  : 'CASH ON DELIVERY'}
              </span>
            </div>

            {/* List of items */}
            <div className="space-y-1.5 pt-1">
              {activeOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-slate-700">
                  <span className="font-medium truncate max-w-[200px] sm:max-w-[260px]">
                    {language === 'te' ? item.product.nameTe : item.product.nameEn} (x{item.quantity})
                  </span>
                  <span className="font-semibold">₹{item.product.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span>{t.itemTotal}</span>
                <span>₹{activeOrder.subtotal}</span>
              </div>
              {activeOrder.totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>{t.mrpSavings}</span>
                  <span>-₹{activeOrder.totalDiscount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t.deliveryFee}</span>
                <span>{activeOrder.deliveryFee === 0 ? <span className="text-emerald-700 font-bold">{t.free}</span> : `₹${activeOrder.deliveryFee}`}</span>
              </div>
              <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
                <span>{t.toPay}</span>
                <span className="text-base text-emerald-800">₹{activeOrder.totalAmount}</span>
              </div>
            </div>

            {/* Address notes if delivery */}
            {activeOrder.address && (
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">{activeOrder.address.fullName} (+91 {activeOrder.address.phone})</span>
                  <div>{activeOrder.address.doorNo ? `${activeOrder.address.doorNo}, ` : ''}{activeOrder.address.villageName}</div>
                  <div className="text-emerald-800 font-semibold">📍 Landmark: {activeOrder.address.landmark}</div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => {
                setIsOrderSuccessOpen(false);
                setIsTrackingOpen(true);
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Clock className="w-4 h-4 text-amber-300" />
              <span>{t.trackOrderBtn}</span>
            </button>

            <button
              onClick={handleCopyBill}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
              <span>{copied ? (language === 'te' ? 'కాపీ అయింది!' : 'Copied!') : (language === 'te' ? 'బిల్లు కాపీ చేయండి' : 'Copy Bill Text')}</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <button
              onClick={handlePrint}
              className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-[11px]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.printBillBtn}</span>
            </button>

            <button
              onClick={() => setIsOrderSuccessOpen(false)}
              className="text-emerald-700 font-bold hover:underline text-[11px] flex items-center gap-1"
            >
              <span>{t.continueShopping}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

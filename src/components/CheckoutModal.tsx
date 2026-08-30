import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  MapPin, 
  User, 
  Banknote, 
  Zap, 
  Store, 
  Navigation, 
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import type { DeliveryAddress } from '../types';
import { createRazorpayOrder, openRazorpayCheckout, verifyRazorpayPayment } from '../services/razorpay';

type PaymentMode = 'cod' | 'online';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cartSubtotal,
    cartDiscount,
    cartTotal,
    cartItemsCount,
    deliveryType,
    setDeliveryType,
    deliveryFee,
    placeOrder,
    user,
    setUser,
    setIsAuthOpen,
    language,
    t,
    showToast
  } = useStore();

  const [fullName, setFullName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [villageName, setVillageName] = useState(user?.savedAddress?.villageName || 'Chinna Bazar, Main Village');
  const [doorNo, setDoorNo] = useState(user?.savedAddress?.doorNo || '');
  const [landmark, setLandmark] = useState(user?.savedAddress?.landmark || '');
  const [notes, setNotes] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cod');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (user && isCheckoutOpen) {
      if (user.name) setFullName(prev => prev || user.name);
      if (user.phone) setPhoneNumber(prev => prev || user.phone);
      if (user.savedAddress?.doorNo) setDoorNo(prev => prev || user.savedAddress?.doorNo || '');
      if (user.savedAddress?.landmark) setLandmark(prev => prev || user.savedAddress?.landmark || '');
      if (user.savedAddress?.villageName) setVillageName(prev => prev || user.savedAddress?.villageName || '');
    }
  }, [user, isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
        <div className="relative bg-[#0f172a] text-slate-100 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-6 text-center space-y-4 border border-slate-800 animate-scale-up">
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl mx-auto">
            ðŸ”’
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-white">Sign in Required</h3>
            <p className="text-xs text-slate-400 mt-1">
              Please sign in or create an account to place your order with 20-minute village delivery.
            </p>
          </div>
          <button
            onClick={() => {
              setIsCheckoutOpen(false);
              setIsAuthOpen(true);
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Sign in / Create Account
          </button>
        </div>
      </div>
    );
  }

  if (cartItemsCount === 0) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-6 text-center space-y-4 border border-slate-200 animate-scale-up">
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl mx-auto">
            ðŸ›’
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">{language === 'te' ? 'à°®à±€ à°•à°¾à°°à±à°Ÿà± à°–à°¾à°³à±€à°—à°¾ à°‰à°‚à°¦à°¿' : 'Your Cart is Empty'}</h3>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'te' ? 'à°†à°°à±à°¡à°°à± à°šà±‡à°¯à°¡à°¾à°¨à°¿à°•à°¿ à°¦à°¯à°šà±‡à°¸à°¿ à°•à±‚à°°à°—à°¾à°¯à°²à± à°²à±‡à°¦à°¾ à°¸à°°à±à°•à±à°²à± à°Žà°‚à°šà±à°•à±‹à°‚à°¡à°¿.' : 'Please add some items to your cart before proceeding to checkout.'}
            </p>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
          >
            {language === 'te' ? 'à°¸à°°à±à°•à±à°²à± à°•à±Šà°¨à°‚à°¡à°¿' : 'Start Shopping'}
          </button>
        </div>
      </div>
    );
  }

  const handleAutoLocate = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          setLocationSuccess(true);
          setLandmark(prev => prev || `GPS Pin: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)} (Village Center Area)`);
          showToast('success', language === 'te' ? 'à°²à±Šà°•à±‡à°·à°¨à± à°—à±à°°à±à°¤à°¿à°‚à°šà°¬à°¡à°¿à°‚à°¦à°¿' : 'Location Detected', language === 'te' ? 'à°®à±€ GPS à°¸à±à°¥à°¾à°¨à°‚ à°¨à°®à±‹à°¦à± à°šà±‡à°¯à°¬à°¡à°¿à°‚à°¦à°¿' : 'GPS location captured for 20-min delivery rider');
        },
        () => {
          setIsLocating(false);
          setLocationSuccess(true);
          setLandmark(prev => prev || 'Near Village Center Bus Stop / Ramalayam');
          showToast('info', 'Location Set', 'Default village center landmark applied.');
        }
      );
    } else {
      setIsLocating(false);
      setLocationSuccess(true);
      setLandmark(prev => prev || 'Near Village Center');
    }
  };

  const validateForm = (): boolean => {
    if (!fullName.trim()) {
      showToast('error', 'Required Field', language === 'te' ? 'à°¦à°¯à°šà±‡à°¸à°¿ à°®à±€ à°ªà±‚à°°à±à°¤à°¿ à°ªà±‡à°°à± à°¨à°®à±‹à°¦à± à°šà±‡à°¯à°‚à°¡à°¿' : 'Please enter your full name');
      return false;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      showToast('error', 'Invalid Phone', language === 'te' ? 'à°¦à°¯à°šà±‡à°¸à°¿ à°¸à°°à±ˆà°¨ 10 à°…à°‚à°•à±†à°² à°®à±Šà°¬à±ˆà°²à± à°¨à°‚à°¬à°°à± à°¨à°®à±‹à°¦à± à°šà±‡à°¯à°‚à°¡à°¿' : 'Please enter a valid 10-digit mobile number');
      return false;
    }

    if (deliveryType === 'delivery_20min' && (!villageName.trim() || !landmark.trim())) {
      showToast('error', 'Address Incomplete', language === 'te' ? 'à°¦à°¯à°šà±‡à°¸à°¿ à°—à±à°°à°¾à°®à°‚ à°ªà±‡à°°à± à°®à°°à°¿à°¯à± à°—à±à°°à±à°¤à°¿à°‚à°ªà± à°²à±à°¯à°¾à°‚à°¡à±â€Œà°®à°¾à°°à±à°•à± à°¨à°®à±‹à°¦à± à°šà±‡à°¯à°‚à°¡à°¿' : 'Please provide village street name and a landmark for 20-min delivery');
      return false;
    }

    return true;
  };

    const buildOrderData = () => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const address: DeliveryAddress | undefined = deliveryType === 'delivery_20min' ? {
      fullName: fullName.trim(),
      phone: cleanPhone,
      villageName: villageName.trim(),
      doorNo: doorNo.trim() || undefined,
      landmark: landmark.trim(),
      pincode: '500001'
    } : undefined;
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const address: DeliveryAddress | undefined = deliveryType === 'delivery_20min' ? {
      fullName,
      phone: cleanPhone,
      villageName,
      doorNo,
      landmark,
      pincode: '500001'
    } : undefined;

    return { cleanPhone, address };
  };

  const saveUserProfile = (cleanPhone: string, address?: DeliveryAddress) => {
    if (!user || user.phone !== cleanPhone) {
      setUser({
        id: user?.id || `usr-${Date.now()}`,
        name: fullName,
        phone: cleanPhone,
        savedAddress: address,
        joinedAt: user?.joinedAt || new Date().toISOString()
      });
    }
  };

  // --- COD Order Flow ---
  const handleCODOrder = async () => {
    const { cleanPhone, address } = buildOrderData();
    saveUserProfile(cleanPhone, address);

    try {
      await placeOrder({
        customerName: fullName,
        customerPhone: cleanPhone,
        deliveryType,
        address,
        notes: notes.trim() || undefined,
        paymentMethod: deliveryType === 'store_pickup' ? 'pay_on_pickup' : 'cash_on_delivery',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Online Payment (Razorpay) Flow ---
  const handleOnlinePayment = async () => {
    const { cleanPhone, address } = buildOrderData();
    saveUserProfile(cleanPhone, address);

    setIsProcessingPayment(true);

    // Step 1: Create Razorpay order (or use standard client gateway)
    const result = await createRazorpayOrder(cartTotal);

    if (!result.success || !result.key_id) {
      setIsProcessingPayment(false);
      setIsSubmitting(false);
      showToast('error',
        language === 'te' ? 'à°ªà±‡à°®à±†à°‚à°Ÿà± à°Žà°°à±à°°à°°à±' : 'Payment Error',
        result.error || 'Could not connect to payment gateway. Please try Cash on Delivery.'
      );
      return;
    }

    // Step 2: Open Razorpay checkout modal
    openRazorpayCheckout({
      orderId: result.order_id,
      keyId: result.key_id,
      amountPaise: result.amount,
      currency: result.currency || 'INR',
      customerName: fullName,
      customerPhone: cleanPhone,
      storeOrderId: `MK-${Math.floor(100000 + Math.random() * 900000)}`,
      onSuccess: async (response) => {
        // Step 3: Verify payment signature via backend
        const verification = await verifyRazorpayPayment(
          response.razorpay_order_id,
          response.razorpay_payment_id,
          response.razorpay_signature
        );

        if (verification.success) {
          // Payment verified! Place the order
          try {
            await placeOrder({
              customerName: fullName,
              customerPhone: cleanPhone,
              deliveryType,
              address,
              notes: notes.trim() || undefined,
              paymentMethod: 'online_razorpay',
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
            });
            showToast('success',
              language === 'te' ? 'ðŸ’³ à°†à°¨à±â€Œà°²à±ˆà°¨à± à°šà±†à°²à±à°²à°¿à°‚à°ªà± à°µà°¿à°œà°¯à°µà°‚à°¤à°‚!' : 'ðŸ’³ Payment Successful!',
              language === 'te' ? 'à°®à±€ à°šà±†à°²à±à°²à°¿à°‚à°ªà± à°§à±ƒà°µà±€à°•à°°à°¿à°‚à°šà°¬à°¡à°¿à°‚à°¦à°¿. à°†à°°à±à°¡à°°à± à°¨à°®à±‹à°¦à°¯à°¿à°‚à°¦à°¿!' : `Payment â‚¹${cartTotal} confirmed. Order placed!`
            );
          } finally {
            setIsProcessingPayment(false);
            setIsSubmitting(false);
          }
        } else {
          setIsProcessingPayment(false);
          setIsSubmitting(false);
          showToast('error',
            language === 'te' ? 'à°ªà±‡à°®à±†à°‚à°Ÿà± à°µà±†à°°à°¿à°«à°¿à°•à±‡à°·à°¨à± à°«à±†à°¯à°¿à°²à±' : 'Payment Verification Failed',
            verification.error || 'Payment could not be verified. Please contact store owner or try again.'
          );
        }
      },
      onFailure: (error) => {
        setIsProcessingPayment(false);
        setIsSubmitting(false);
        showToast('error',
          language === 'te' ? 'à°šà±†à°²à±à°²à°¿à°‚à°ªà± à°µà°¿à°«à°²à°®à±ˆà°‚à°¦à°¿' : 'Payment Failed',
          error
        );
      },
      onDismiss: () => {
        setIsProcessingPayment(false);
        setIsSubmitting(false);
        showToast('info',
          language === 'te' ? 'à°ªà±‡à°®à±†à°‚à°Ÿà± à°°à°¦à±à°¦à±' : 'Payment Cancelled',
          language === 'te' ? 'à°®à±€à°°à± à°šà±†à°²à±à°²à°¿à°‚à°ªà±à°¨à± à°°à°¦à±à°¦à± à°šà±‡à°¸à°¾à°°à±. à°®à±€à°°à± à°•à±à°¯à°¾à°·à± à°†à°¨à± à°¡à±†à°²à°¿à°µà°°à±€ à°Žà°‚à°šà±à°•à±‹à°µà°šà±à°šà±.' : 'Payment was cancelled. You can choose Cash on Delivery instead.'
        );
      }
    });
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    if (paymentMode === 'online') {
      await handleOnlinePayment();
    } else {
      await handleCODOrder();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-green-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold text-lg shadow-md">
              ðŸ›µ
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-white leading-tight">
                {t.checkoutTitle}
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                {deliveryType === 'delivery_20min' ? 'âš¡ 20-Min Doorstep Delivery' : 'ðŸª 5-Min Store Pickup'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="text-white/80 hover:text-white p-2 rounded-xl bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Checkout Form */}
        <form onSubmit={handleSubmitOrder} className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Delivery Mode Toggle */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="text-xs font-bold text-slate-800 mb-2">{t.deliveryMode}</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryType('delivery_20min')}
                className={`p-3 rounded-xl text-left border flex flex-col gap-1 transition-all cursor-pointer ${
                  deliveryType === 'delivery_20min'
                    ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>20-Min Delivery</span>
                </div>
                <div className="text-[10px] text-slate-500">{t.doorstep20MinDesc}</div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('store_pickup')}
                className={`p-3 rounded-xl text-left border flex flex-col gap-1 transition-all cursor-pointer ${
                  deliveryType === 'store_pickup'
                    ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs">
                  <Store className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Store Pickup</span>
                </div>
                <div className="text-[10px] text-slate-500">{t.storePickupDesc}</div>
              </button>
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-700" />
              <span>{t.contactDetails}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {t.fullName} *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.enterFullName}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {t.phoneNumber} (WhatsApp) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder={t.enterPhoneNumber}
                    className="w-full pl-11 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address Details (Only if delivery mode) */}
          {deliveryType === 'delivery_20min' && (
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>{t.deliveryAddress}</span>
                </div>

                <button
                  type="button"
                  onClick={handleAutoLocate}
                  disabled={isLocating}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                >
                  <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{isLocating ? 'Locating...' : locationSuccess ? 'âœ“ Located' : t.useCurrentLocation}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t.villageName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={villageName}
                    onChange={(e) => setVillageName(e.target.value)}
                    placeholder={t.enterVillage}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t.doorNo}
                  </label>
                  <input
                    type="text"
                    value={doorNo}
                    onChange={(e) => setDoorNo(e.target.value)}
                    placeholder={t.enterDoorNo}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {t.landmark} * (Helps 20-min delivery rider reach quickly)
                </label>
                <input
                  type="text"
                  required
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder={t.enterLandmark}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Optional Delivery Notes */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              {t.deliveryNotes}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.enterNotes}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
            />
          </div>

          {/* ===== Payment Method Selection ===== */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              <span>{language === 'te' ? 'à°šà±†à°²à±à°²à°¿à°‚à°ªà± à°µà°¿à°§à°¾à°¨à°‚ à°Žà°‚à°šà±à°•à±‹à°‚à°¡à°¿' : 'Choose Payment Method'}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Cash on Delivery / Pay on Pickup */}
              <button
                type="button"
                onClick={() => setPaymentMode('cod')}
                className={`p-3 rounded-xl text-left border flex flex-col gap-1.5 transition-all cursor-pointer ${
                  paymentMode === 'cod'
                    ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Banknote className={`w-4 h-4 ${paymentMode === 'cod' ? 'text-emerald-700' : 'text-slate-500'}`} />
                  <span className={`text-xs font-bold ${paymentMode === 'cod' ? 'text-emerald-950' : 'text-slate-700'}`}>
                    {language === 'te' ? 'à°•à±à°¯à°¾à°·à± / UPI' : 'Cash / UPI'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {deliveryType === 'delivery_20min'
                    ? (language === 'te' ? 'à°¡à±†à°²à°¿à°µà°°à±€ à°¸à°®à°¯à°‚à°²à±‹ à°šà±†à°²à±à°²à°¿à°‚à°šà°‚à°¡à°¿' : 'Pay when delivered')
                    : (language === 'te' ? 'à°¸à±à°Ÿà±‹à°°à±â€Œà°²à±‹ à°šà±†à°²à±à°²à°¿à°‚à°šà°‚à°¡à°¿' : 'Pay at store counter')}
                </div>
              </button>

              {/* Pay Online (Razorpay) */}
              <button
                type="button"
                onClick={() => setPaymentMode('online')}
                className={`p-3 rounded-xl text-left border flex flex-col gap-1.5 transition-all cursor-pointer ${
                  paymentMode === 'online'
                    ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <CreditCard className={`w-4 h-4 ${paymentMode === 'online' ? 'text-blue-700' : 'text-slate-500'}`} />
                  <span className={`text-xs font-bold ${paymentMode === 'online' ? 'text-blue-950' : 'text-slate-700'}`}>
                    {language === 'te' ? 'à°†à°¨à±â€Œà°²à±ˆà°¨à± à°ªà±‡' : 'Pay Online'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {language === 'te' ? 'UPI, à°•à°¾à°°à±à°¡à±, à°¨à±†à°Ÿà± à°¬à±à°¯à°¾à°‚à°•à°¿à°‚à°—à±' : 'UPI, Card, Net Banking'}
                </div>
              </button>
            </div>

            {/* Payment info note */}
            <div className={`rounded-xl p-2.5 text-[10px] flex items-center gap-1.5 ${
              paymentMode === 'online'
                ? 'bg-blue-50 border border-blue-200 text-blue-900'
                : 'bg-emerald-50/80 border border-emerald-200 text-emerald-900'
            }`}>
              <ShieldCheck className={`w-3.5 h-3.5 flex-shrink-0 ${
                paymentMode === 'online' ? 'text-blue-600' : 'text-emerald-600'
              }`} />
              <span>
                {paymentMode === 'online'
                  ? (language === 'te'
                      ? 'Razorpay à°¦à±à°µà°¾à°°à°¾ à°¸à±à°°à°•à±à°·à°¿à°¤ à°šà±†à°²à±à°²à°¿à°‚à°ªà±. UPI, à°¡à±†à°¬à°¿à°Ÿà±/à°•à±à°°à±†à°¡à°¿à°Ÿà± à°•à°¾à°°à±à°¡à±, à°¨à±†à°Ÿà± à°¬à±à°¯à°¾à°‚à°•à°¿à°‚à°—à± à°†à°®à±‹à°¦à°¿à°‚à°šà°¬à°¡à°¤à°¾à°¯à°¿.'
                      : 'Secure payment via Razorpay. UPI, Debit/Credit Card, and Net Banking accepted.')
                  : (language === 'te'
                      ? 'à°¸à°°à±à°•à±à°²à± à°µà°šà±à°šà°¾à°• à°•à±à°¯à°¾à°·à± à°²à±‡à°¦à°¾ UPI à°¦à±à°µà°¾à°°à°¾ à°šà±†à°²à±à°²à°¿à°‚à°šà°‚à°¡à°¿. à°®à±à°‚à°¦à±à°—à°¾ à°šà±†à°²à±à°²à°¿à°‚à°ªà± à°…à°µà°¸à°°à°‚ à°²à±‡à°¦à±.'
                      : 'Pay with Cash or UPI when items arrive. No advance payment required.')}
              </span>
            </div>
          </div>

          {/* Bill Overview in Checkout */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>{cartItemsCount} {t.items} {t.itemTotal}</span>
              <span>â‚¹{cartSubtotal}</span>
            </div>
            {cartDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>{t.mrpSavings}</span>
                <span>-â‚¹{cartDiscount}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>{t.deliveryFee}</span>
              <span>{deliveryFee === 0 ? <span className="text-emerald-700 font-bold">{t.free}</span> : `â‚¹${deliveryFee}`}</span>
            </div>
            <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center text-sm font-extrabold text-slate-900">
              <span>{t.toPay}</span>
              <span className="text-base text-emerald-800">â‚¹{cartTotal}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isProcessingPayment}
            className={`w-full font-extrabold py-3.5 px-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-75 cursor-pointer ${
              paymentMode === 'online'
                ? 'bg-blue-600 hover:bg-blue-700 active:scale-98 text-white'
                : 'bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white'
            }`}
          >
            {isProcessingPayment ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white/80" />
                <span>{language === 'te' ? 'à°ªà±‡à°®à±†à°‚à°Ÿà± à°ªà±à°°à°¾à°¸à±†à°¸à°¿à°‚à°—à±...' : 'Processing Payment...'}</span>
              </>
            ) : isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white/80" />
                <span>{t.placingOrder}</span>
              </>
            ) : paymentMode === 'online' ? (
              <>
                <CreditCard className="w-5 h-5 text-amber-300" />
                <span>{language === 'te' ? `à°†à°¨à±â€Œà°²à±ˆà°¨à± à°šà±†à°²à±à°²à°¿à°‚à°šà°‚à°¡à°¿ â€¢ â‚¹${cartTotal}` : `Pay Online â€¢ â‚¹${cartTotal}`}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-amber-300" />
                <span>{`${t.placeOrder} â€¢ â‚¹${cartTotal}`}</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-slate-400">
            {language === 'te' 
              ? 'à°†à°°à±à°¡à°°à± à°ªà±‚à°°à±à°¤à°¯à°¿à°¨ à°¤à°°à±à°µà°¾à°¤ à°·à°¾à°ªà± à°“à°¨à°°à± à°µà°¾à°Ÿà±à°¸à°¾à°ªà± à°•à°¿ à°µà°¿à°µà°°à°®à±ˆà°¨ à°¬à°¿à°²à±à°²à± à°ªà°‚à°ªà°¬à°¡à±à°¤à±à°‚à°¦à°¿.' 
              : 'After placing, complete itemized bill will be generated for store owner WhatsApp.'}
          </p>

        </form>

      </div>
    </div>
  );
};


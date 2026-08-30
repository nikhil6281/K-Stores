import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  X, 
  Clock, 
  Phone, 
  MessageSquare, 
  MapPin, 
  RotateCcw, 
  ChevronRight
} from 'lucide-react';
import { STORE_OWNER_PHONE } from '../utils/whatsapp';
import type { OrderStatus } from '../types';

export const OrderTrackingModal: React.FC = () => {
  const {
    isTrackingOpen,
    setIsTrackingOpen,
    activeOrder,
    updateOrderStatus,
    reorder,
    language,
    t
  } = useStore();

  const timeLeftMinutes = (() => {
    if (!activeOrder) return 18;
    if (activeOrder.status === 'delivered') return 0;
    if (activeOrder.status === 'out_for_delivery') return 8;
    if (activeOrder.status === 'packing') return 14;
    return 18;
  })();

  if (!isTrackingOpen || !activeOrder) return null;

  const steps: { status: OrderStatus; labelEn: string; labelTe: string; descEn: string; descTe: string; icon: string }[] = [
    {
      status: 'pending',
      labelEn: 'Order Confirmed',
      labelTe: 'ఆర్డర్ కన్ఫర్మ్ అయింది',
      descEn: 'Kirana store received order',
      descTe: 'షాప్‌లో ఆర్డర్ స్వీకరించబడింది',
      icon: '📝'
    },
    {
      status: 'packing',
      labelEn: 'Packing Fresh Groceries',
      labelTe: 'సరుకులు ప్యాక్ చేస్తున్నారు',
      descEn: 'Items checked & bagged with care',
      descTe: 'తాజా వస్తువులు శుభ్రంగా ప్యాక్ అవుతున్నాయి',
      icon: '📦'
    },
    {
      status: 'out_for_delivery',
      labelEn: 'Out for 20-Min Delivery',
      labelTe: 'డెలివరీకి బయలుదేరింది',
      descEn: 'Rider on bike heading to your landmark',
      descTe: 'బైక్‌పై డెలివరీ బాయ్ బయలుదేరాడు',
      icon: '🛵'
    },
    {
      status: 'delivered',
      labelEn: 'Delivered at Doorstep',
      labelTe: 'డెలివరీ పూర్తయింది',
      descEn: 'Enjoy fresh village groceries!',
      descTe: 'సరుకులు చేరాయి. తాజా కిరాణా ఆనందించండి!',
      icon: '✅'
    }
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 0;
      case 'packing': return 1;
      case 'out_for_delivery': return 2;
      case 'delivered': return 3;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(activeOrder?.status || 'pending');

  // Demo helper to advance order status
  const handleAdvanceStatus = () => {
    if (!activeOrder?.id) return;
    const nextStatuses: OrderStatus[] = ['pending', 'packing', 'out_for_delivery', 'delivered'];
    const nextIdx = Math.min(3, currentStepIdx + 1);
    updateOrderStatus(activeOrder.id, nextStatuses[nextIdx]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
        
        {/* Top Header */}
        <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold text-lg shadow-md">
              🛵
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg text-white leading-tight">
                {t.liveTrackingTitle}
              </h2>
              <p className="text-xs text-emerald-200 font-medium">
                Order #{activeOrder.id}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsTrackingOpen(false)}
            className="text-white/80 hover:text-white p-2 rounded-xl bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tracking Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Estimated Delivery Time Box */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-100/60 rounded-2xl p-4 border border-emerald-300/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Clock className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="text-xs text-emerald-800 font-semibold">{t.estimatedTime}</div>
                <div className="text-xl font-black text-emerald-950">
                  {activeOrder.status === 'delivered' ? (
                    <span className="text-emerald-700">Delivered ✅</span>
                  ) : (
                    <span>~{timeLeftMinutes} {t.mins}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="bg-amber-400 text-emerald-950 font-extrabold text-[11px] px-2.5 py-1 rounded-full shadow-xs">
                ⚡ 20-MIN PROMISE
              </span>
              <div className="text-[10px] text-emerald-800 mt-1 font-medium">
                {activeOrder.deliveryType === 'delivery_20min' ? 'Village Doorstep' : 'Store Counter'}
              </div>
            </div>
          </div>

          {/* Delivery Timeline Stepper */}
          <div className="space-y-4 relative pl-2">
            {/* Progress line */}
            <div className="absolute left-[26px] top-4 bottom-4 w-0.5 bg-slate-200 z-0" />
            <div 
              className="absolute left-[26px] top-4 w-0.5 bg-emerald-600 transition-all duration-500 z-0"
              style={{ height: `${(currentStepIdx / 3) * 100}%` }}
            />

            {steps.map((step, idx) => {
              const isCompleted = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step.status} className="relative z-10 flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-xs transition-all ${
                    isCompleted 
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                      : isCurrent
                      ? 'bg-amber-400 text-emerald-950 ring-4 ring-amber-100 animate-pulse'
                      : 'bg-slate-100 text-slate-400 border border-slate-300'
                  }`}>
                    {isCompleted ? '✓' : step.icon}
                  </div>

                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs sm:text-sm font-bold ${
                        isCurrent ? 'text-emerald-900' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                      }`}>
                        {language === 'te' ? step.labelTe : step.labelEn}
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300 animate-bounce-subtle">
                          In Progress
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {language === 'te' ? step.descTe : step.descEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Demo Simulator button to advance status */}
          {activeOrder.status !== 'delivered' && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-medium">
                {language === 'te' ? 'సిమ్యులేషన్ (టెస్టింగ్):' : 'Demo Mode Tracker:'}
              </span>
              <button
                onClick={handleAdvanceStatus}
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold px-3 py-1 rounded-lg text-[11px] flex items-center gap-1 transition-colors"
              >
                <span>Advance to Next Step</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Delivery details card */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>{language === 'te' ? 'డెలివరీ చిరునామా' : 'Delivery Destination'}</span>
            </div>

            {activeOrder.address ? (
              <div className="text-slate-600 pl-5 space-y-0.5 text-[11px]">
                <div className="font-bold text-slate-800">{activeOrder.customerName} (+91 {activeOrder.customerPhone})</div>
                <div>{activeOrder.address.doorNo ? `${activeOrder.address.doorNo}, ` : ''}{activeOrder.address.villageName}</div>
                <div className="text-emerald-800 font-semibold">📍 Landmark: {activeOrder.address.landmark}</div>
              </div>
            ) : (
              <div className="text-slate-600 pl-5 text-[11px]">
                Store Counter Self-Pickup (Ready in 5 mins)
              </div>
            )}
          </div>

          {/* Store Owner Contact & Support buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href={`tel:+${STORE_OWNER_PHONE}`}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.callStoreOwner}</span>
            </a>

            <a
              href={`https://wa.me/${STORE_OWNER_PHONE}?text=${encodeURIComponent(`Hello, query regarding Order #${activeOrder.id}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
              <span>WhatsApp Store</span>
            </a>
          </div>

          {/* Reorder Button */}
          <button
            onClick={() => reorder(activeOrder)}
            className="w-full bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.reorderBtn}</span>
          </button>

        </div>

      </div>
    </div>
  );
};

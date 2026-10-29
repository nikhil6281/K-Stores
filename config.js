/**
 * Central Configuration for RA Store (Anantapur, AP)
 * Single source of truth for store branding, location, PIN codes, landmarks, and contact details.
 * Usable in browser (window.APP_CONFIG) and Node.js (module.exports / globalThis).
 */
const APP_CONFIG = {
  storeName: "RA Store",
  storeNameTelugu: "RA స్టోర్",
  businessLegalName: "RA Store",
  tagline: "Fresh Groceries Delivered in Anantapur",
  taglineTelugu: "అనంతపురంలో తాజా కిరాణా సరుకుల డెలివరీ",
  city: "Anantapur",
  cityTelugu: "అనంతపురం",
  cityAlternateSpellings: ["Ananthapur", "Anantapuramu"],
  state: "Andhra Pradesh",
  stateTelugu: "ఆంధ్రప్రదేశ్",
  country: "India",
  defaultPin: "515001",
  pinCodes: ["515001", "515002", "515003", "515004", "515005"],
  landmarks: [
    "Tower Clock",
    "Subhash Road",
    "Saptagiri Circle",
    "Rudrampeta",
    "Kamalanagar"
  ],
  landmarksTelugu: [
    "టవర్ క్లాక్",
    "సుభాష్ రోడ్డు",
    "సప్తగిరి సర్కిల్",
    "రుద్రంపేట",
    "కమలానగర్"
  ],
  // Shop address placeholder until owner confirms exact storefront location
  address: "Shop Address, Anantapur, Andhra Pradesh (Update in Store Settings)",
  addressTelugu: "షాప్ చిరునామా, అనంతపురం, ఆంధ్రప్రదేశ్",
  phone: "6281730144",
  formattedPhone: "+91 62817 30144",
  whatsappNumber: "916281730144",
  supportEmail: "support@rastore.in",
  grievanceOfficer: {
    name: "Store Manager",
    email: "grievance@rastore.in",
    phone: "+91 62817 30144",
    address: "Anantapur, Andhra Pradesh - 515001"
  },
  hours: "7:00 AM - 9:00 PM IST",
  hoursTelugu: "ఉదయం 7:00 AM నుండి రాత్రి 9:00 PM IST",
  workerApi: "https://ra-store-api.chowdarynikhil095.workers.dev",
  razorpayKeyId: "rzp_live_TtGrq3sfJkM0pA",
  razorpayTestKeyId: "rzp_live_TtGrq3sfJkM0pA",
  currency: "INR",
  storeLat: 14.6819,
  storeLng: 77.6006,
  deliveryRadiusKm: 5,
  requireLocation: false
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = APP_CONFIG;
}
if (typeof window !== 'undefined') {
  window.APP_CONFIG = APP_CONFIG;
}
if (typeof globalThis !== 'undefined') {
  globalThis.APP_CONFIG = APP_CONFIG;
}


export interface TranslationSchema {
  storeName: string;
  tagline: string;
  deliveryTime: string;
  freeDeliveryOver: string;
  searchPlaceholder: string;
  searchTitle: string;
  heroBadge: string;
  heroHeadline: string;
  heroSubheadline: string;
  shopNow: string;
  dealsSectionTitle: string;
  allProductsTitle: string;
  addToCart: string;
  outOfStock: string;
  cartTitle: string;
  cartEmpty: string;
  cartEmptyDesc: string;
  checkout: string;
  subtotal: string;
  deliveryFee: string;
  free: string;
  total: string;
  savings: string;
  discount: string;
  couponApplied: string;
  cashOnDelivery: string;
  payOnline: string;
  placeOrder: string;
  deliveryAddress: string;
  fullName: string;
  phoneNumber: string;
  villageName: string;
  doorNo: string;
  landmark: string;
  orderSuccessTitle: string;
  orderSuccessDesc: string;
  trackOrder: string;
  myOrders: string;
  noOrders: string;
  contactStore: string;
  storeAddress: string;
  storeHours: string;
  footerAbout: string;
  guaranteeBadge: string;
  pickupIn5Mins: string;
}

export const translations: Record<'en' | 'te', TranslationSchema> = {
  en: {
    storeName: 'RA General Store',
    tagline: 'Mana Kirana • 20-Min Village Delivery',
    deliveryTime: '20-Min Village Delivery',
    freeDeliveryOver: 'Free delivery on orders over ₹199',
    searchPlaceholder: 'Search vegetables, dairy, groceries...',
    searchTitle: 'Search Groceries',
    heroBadge: '20-MINUTE VILLAGE EXPRESS DELIVERY',
    heroHeadline: 'Fresh Daily Groceries Delivered Fast.',
    heroSubheadline: 'Farm-fresh vegetables, dairy, rice, and daily household staples delivered to your door in 20 minutes with Cash on Delivery or Online UPI.',
    shopNow: 'Order Groceries Now',
    dealsSectionTitle: "Today's Special Offers",
    allProductsTitle: 'All Grocery Items',
    addToCart: 'ADD',
    outOfStock: 'Out of Stock',
    cartTitle: 'Your Cart',
    cartEmpty: 'Your cart is empty',
    cartEmptyDesc: 'Add fresh groceries to start your 20-minute village order.',
    checkout: 'PROCEED TO CHECKOUT',
    subtotal: 'Subtotal',
    deliveryFee: 'Delivery Fee',
    free: 'FREE',
    total: 'Total to Pay',
    savings: 'Total Savings',
    discount: 'Discount',
    couponApplied: 'KIRANA20 applied (₹20 OFF)',
    cashOnDelivery: 'Cash on Delivery (COD)',
    payOnline: 'Pay Online (UPI / Card)',
    placeOrder: 'Confirm & Place Order',
    deliveryAddress: 'Delivery Address Details',
    fullName: 'Full Name',
    phoneNumber: '10-Digit Mobile Number',
    villageName: 'Village Name / Street',
    doorNo: 'House / Door No (Optional)',
    landmark: 'Nearest Landmark (Temple, Center, School)',
    orderSuccessTitle: 'Order Placed Successfully!',
    orderSuccessDesc: 'Your groceries are being packed at RA General Store and will reach you in ~20 minutes.',
    trackOrder: 'Track Order',
    myOrders: 'My Orders',
    noOrders: 'No orders found for this account.',
    contactStore: 'Contact Store',
    storeAddress: 'Main Road, Center Junction, Near Panchayat Office',
    storeHours: 'Everyday: 6:00 AM – 10:00 PM',
    footerAbout: 'RA General Store is your local village grocery partner, delivering everyday staples and farm-fresh produce with trusted Cash on Delivery and WhatsApp invoicing.',
    guaranteeBadge: '100% Fresh & Authentic',
    pickupIn5Mins: 'Store Pickup in 5 Mins'
  },
  te: {
    storeName: 'ఆర్.ఎ జనరల్ స్టోర్స్',
    tagline: 'మన కిరాణా • 20 నిమిషాల గ్రామీణ డెలివరీ',
    deliveryTime: '20 నిమిషాల డెలివరీ',
    freeDeliveryOver: '₹199 పైన ఆర్డర్లకు ఉచిత డెలివరీ',
    searchPlaceholder: 'కూరగాయలు, పాలు, నిత్యావసరాలు వెతకండి...',
    searchTitle: 'సరుకులు వెతకండి',
    heroBadge: 'గ్రామాలకు 20 నిమిషాల సూపర్ ఫాస్ట్ డెలివరీ',
    heroHeadline: 'మీ ఇంటి వద్దకే తాజా సరుకులు & కూరగాయలు.',
    heroSubheadline: 'ఉదయం కోసిన తాజా కూరగాయలు, పాలు, బియ్యం మరియు నిత్యావసరాలు 20 నిమిషాల్లో మీ ఇంటి ముందుకు. క్యాష్ ఆన్ డెలివరీ లేదా ఆన్‌లైన్ చెల్లింపు.',
    shopNow: 'సరుకులు ఆర్డర్ చేయండి',
    dealsSectionTitle: 'ఈ రోజు ప్రత్యేక ఆఫర్లు',
    allProductsTitle: 'అన్ని సరుకులు',
    addToCart: 'చేర్చండి',
    outOfStock: 'స్టాక్ అయిపోయింది',
    cartTitle: 'మీ షాపింగ్ కార్ట్',
    cartEmpty: 'మీ కార్ట్ ఖాళీగా ఉంది',
    cartEmptyDesc: '20 నిమిషాల్లో డెలివరీ పొందడానికి తాజా సరుకులను కార్ట్‌కు చేర్చండి.',
    checkout: 'ఆర్డర్ పూర్తి చేయండి',
    subtotal: 'సరుకుల మొత్తం',
    deliveryFee: 'డెలివరీ ఛార్జ్',
    free: 'ఉచితం',
    total: 'మొత్తం చెల్లించాల్సింది',
    savings: 'మొత్తం ఆదా',
    discount: 'డిస్కౌంట్',
    couponApplied: 'KIRANA20 ఆఫర్ వర్తించింది (₹20 తగ్గింపు)',
    cashOnDelivery: 'క్యాష్ ఆన్ డెలివరీ (ఇంటి వద్ద నగదు)',
    payOnline: 'ఆన్‌లైన్ చెల్లింపు (UPI / Google Pay)',
    placeOrder: 'ఆర్డర్ ఖరారు చేయండి',
    deliveryAddress: 'డెలివరీ చిరునామా వివరాలు',
    fullName: 'మీ పూర్తి పేరు',
    phoneNumber: '10 అంకెల మొబైల్ నంబర్',
    villageName: 'గ్రామం పేరు / వీధి',
    doorNo: 'ఇంటి నంబర్ (ఐచ్ఛికం)',
    landmark: 'గుర్తు / ల్యాండ్‌మార్క్ (గుడి, బడి, సెంటర్)',
    orderSuccessTitle: 'ఆర్డర్ విజయవంతంగా నమోదైంది!',
    orderSuccessDesc: 'ఆర్.ఎ జనరల్ స్టోర్స్ లో మీ సరుకులు ప్యాక్ అవుతున్నాయి. ~20 నిమిషాల్లో మీ ఇంటికి చేరుతాయి.',
    trackOrder: 'ఆర్డర్ ట్రాక్ చేయండి',
    myOrders: 'నా ఆర్డర్లు',
    noOrders: 'మీ ఖాతాలో ఎటువంటి ఆర్డర్లు లేవు.',
    contactStore: 'షాపును సంప్రదించండి',
    storeAddress: 'మెయిన్ రోడ్డు, సెంటర్ జంక్షన్, పంచాయతీ ఆఫీస్ దగ్గర',
    storeHours: 'ప్రతిరోజూ: ఉదయం 6:00 నుండి రాత్రి 10:00 వరకు',
    footerAbout: 'ఆర్.ఎ జనరల్ స్టోర్స్ మీ స్థానిక గ్రామీణ కిరాణా భాగస్వామి. తాజా కూరగాయలు మరియు నిత్యావసర సరుకులను నేరుగా మీ ఇంటి ముందుకు అందిస్తుంది.',
    guaranteeBadge: '100% తాజా మరియు నాణ్యమైన సరుకులు',
    pickupIn5Mins: 'షాపు వద్ద పికప్ (5 నిమిషాల్లో)'
  }
};

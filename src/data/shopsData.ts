import { KiranaShop, UserLocation } from '../types';

export const DEFAULT_USER_LOCATION: UserLocation = {
  name: "LB Nagar, Saraswathi Nagar, Hyderabad",
  area: "Saraswathi Nagar",
  city: "Hyderabad, Telangana",
  pincode: "500074",
  coordinates: {
    lat: 17.3457,
    lng: 78.5522,
  },
};

export const PRESET_LOCATIONS: UserLocation[] = [
  {
    name: "LB Nagar, Saraswathi Nagar, Hyderabad",
    area: "Saraswathi Nagar",
    city: "Hyderabad, Telangana",
    pincode: "500074",
    coordinates: { lat: 17.3457, lng: 78.5522 },
  },
  {
    name: "Kothapet Fruit Market Rd, Hyderabad",
    area: "Kothapet",
    city: "Hyderabad, Telangana",
    pincode: "500035",
    coordinates: { lat: 17.3621, lng: 78.5414 },
  },
  {
    name: "Dilsukhnagar Bus Depot Area, Hyderabad",
    area: "Dilsukhnagar",
    city: "Hyderabad, Telangana",
    pincode: "500060",
    coordinates: { lat: 17.3688, lng: 78.5284 },
  },
  {
    name: "Chandni Chowk Main Bazaar, Delhi",
    area: "Old Delhi",
    city: "Delhi, NCR",
    pincode: "110006",
    coordinates: { lat: 28.6507, lng: 77.2334 },
  },
];

export const NEARBY_KIRANA_SHOPS: KiranaShop[] = [
  {
    id: "raju_kirana",
    name: "Raju Kirana Store",
    distance: "500 m",
    distanceMeters: 500,
    address: "H.No 4-12, Saraswathi Nagar Colony Road, LB Nagar, Hyderabad",
    landmark: "Beside Saraswathi Temple Water Tank",
    rating: 4.8,
    reviewsCount: 342,
    timing: "6:30 AM – 10:30 PM",
    phone: "+91 98480 23145",
    owner: "Raju Yadav",
    gstin: "36AAECR9812K1Z3",
    specialty: "Lowest prices on Basmati rice, Sona Masoori & sunflower oils",
    coordinates: {
      lat: 17.3475,
      lng: 78.5545,
    },
    itemPrices: {
      1: 48,  // Rice: ₹48/kg
      2: 42,  // Sugar: ₹42/kg
      3: 118, // Oil: ₹118/L
      4: 92,  // Chana Dal: ₹92/kg
      5: 40,  // Chakki Atta: ₹40/kg
      6: 570, // Pure Desi Ghee: ₹570/kg
      7: 138, // Tata Tea: ₹138/pack
      8: 34,  // Turmeric: ₹34/pack
    },
    colorTheme: "#0284C7", // Sky blue pin
  },
  {
    id: "sharma_kirana",
    name: "Sharma Kirana Shop",
    distance: "750 m",
    distanceMeters: 750,
    address: "Plot 88, Near RTC Colony Arch, LB Nagar Main Road, Hyderabad",
    landmark: "Near LB Nagar Metro Pillar 1405",
    rating: 4.9,
    reviewsCount: 512,
    timing: "7:00 AM – 11:00 PM",
    phone: "+91 98110 44219",
    owner: "Ramesh Sharma",
    gstin: "36AAACS1429B1Z8",
    specialty: "Famous for unpolished pulses, pure spices & premium grains (Estd. 1994)",
    coordinates: {
      lat: 17.3435,
      lng: 78.5570,
    },
    itemPrices: {
      1: 50,  // Rice: ₹50/kg
      2: 40,  // Sugar: ₹40/kg (Lowest)
      3: 120, // Oil: ₹120/L
      4: 95,  // Chana Dal: ₹95/kg
      5: 42,  // Chakki Atta: ₹42/kg
      6: 580, // Pure Desi Ghee: ₹580/kg
      7: 140, // Tata Tea: ₹140/pack
      8: 35,  // Turmeric: ₹35/pack
    },
    colorTheme: "#059669", // Emerald green pin
  },
  {
    id: "balaji_kirana",
    name: "Balaji Super Kirana & General Store",
    distance: "1.1 km",
    distanceMeters: 1100,
    address: "Shop 12-14, Opp LB Nagar Metro Station Pillar 1420, Hyderabad",
    landmark: "Directly opposite Metro Exit Gate 2",
    rating: 4.6,
    reviewsCount: 218,
    timing: "8:00 AM – 10:30 PM",
    phone: "+91 99890 56211",
    owner: "K. Balaji Reddy",
    gstin: "36ABCPB4450D1Z2",
    specialty: "Fast express counter, branded FMCG staples & snack packs",
    coordinates: {
      lat: 17.3520,
      lng: 78.5490,
    },
    itemPrices: {
      1: 52,  // Rice: ₹52/kg
      2: 41,  // Sugar: ₹41/kg
      3: 124, // Oil: ₹124/L
      4: 98,  // Chana Dal: ₹98/kg
      5: 44,  // Chakki Atta: ₹44/kg
      6: 590, // Pure Desi Ghee: ₹590/kg
      7: 142, // Tata Tea: ₹142/pack
      8: 36,  // Turmeric: ₹36/pack
    },
    colorTheme: "#D97706", // Amber gold pin
  },
  {
    id: "sri_lakshmi_kirana",
    name: "Sri Lakshmi Venkateshwara Kirana Merchants",
    distance: "1.4 km",
    distanceMeters: 1400,
    address: "Main Road, Saraswathi Nagar Ext., Near Ramalayam Temple, Hyderabad",
    landmark: "Ramalayam Temple Junction",
    rating: 4.7,
    reviewsCount: 189,
    timing: "6:00 AM – 9:30 PM",
    phone: "+91 97011 88320",
    owner: "V. Lakshmi Narayana",
    gstin: "36AKLPV7810M1Z7",
    specialty: "Traditional grain flour chakki, pure farm bilona ghee & raw jaggery",
    coordinates: {
      lat: 17.3400,
      lng: 78.5460,
    },
    itemPrices: {
      1: 49,  // Rice: ₹49/kg
      2: 43,  // Sugar: ₹43/kg
      3: 115, // Oil: ₹115/L (Lowest)
      4: 90,  // Chana Dal: ₹90/kg (Lowest)
      5: 39,  // Chakki Atta: ₹39/kg (Lowest)
      6: 560, // Pure Desi Ghee: ₹560/kg (Lowest)
      7: 139, // Tata Tea: ₹139/pack
      8: 33,  // Turmeric: ₹33/pack (Lowest)
    },
    colorTheme: "#7C3AED", // Royal violet pin
  },
];

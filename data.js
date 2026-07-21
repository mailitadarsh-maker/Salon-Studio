// data.js - Seed Data & State Management for LUMÉ Salon & Studio (Indian Context Edition)

// --- INITIAL SEED DATA ---

const DEFAULT_SERVICES = [
  // Hair Category
  {
    id: "hair-cut-signature",
    name: "Royal Haircut & Blow Dry",
    category: "Hair",
    duration: 60,
    priceMin: 800,
    priceMax: 1500,
    description: "Premium shampoo, deep conditioning mask, personalized style cut, and professional volume blow-dry.",
    thumbnail: "✂️"
  },
  {
    id: "hair-balayage",
    name: "Premium Balayage / Global Highlights",
    category: "Hair",
    duration: 150,
    priceMin: 3500,
    priceMax: 6500,
    description: "Custom hand-painted highlights or global rich colors formulated to suit Indian hair textures and warm skin tones.",
    thumbnail: "🎨"
  },
  {
    id: "hair-blowout",
    name: "LUMÉ Keratin Infused Blowout",
    category: "Hair",
    duration: 45,
    priceMin: 1200,
    priceMax: 2000,
    description: "Frizz-control wash, precision blow-dry styling, and flat-iron gloss utilizing premium organic keratin serum.",
    thumbnail: "💨"
  },
  
  // Skin Category
  {
    id: "skin-glow-facial",
    name: "O3+ Radiant Glow Facial",
    category: "Skin",
    duration: 75,
    priceMin: 1800,
    priceMax: 3000,
    description: "Deep double-cleansing, mild scrub exfoliation, clarifying O3+ serum massage, and customized hydrating peel mask.",
    thumbnail: "✨"
  },
  {
    id: "skin-peel",
    name: "Ayurvedic Detan & Resurfacing",
    category: "Skin",
    duration: 50,
    priceMin: 1000,
    priceMax: 1800,
    description: "Natural detanning therapy using organic milk, honey, and herbal scrubs to clear hyperpigmentation and restore glow.",
    thumbnail: "🧖"
  },

  // Nails Category
  {
    id: "nails-gel-mani",
    name: "Signature Gel Manicure",
    category: "Nails",
    duration: 45,
    priceMin: 800,
    priceMax: 1400,
    description: "Cuticle grooming, nail shaping, premium gel polish application under LED, and a relaxing organic almond hand massage.",
    thumbnail: "💅"
  },
  {
    id: "nails-spa-pedi",
    name: "Deluxe Rose Petal Pedicure",
    category: "Nails",
    duration: 60,
    priceMin: 1200,
    priceMax: 2000,
    description: "Warm milk soak with organic rose petals, sea-salt scrub, soothing clay wrap, and hot oil massage.",
    thumbnail: "🦶"
  },

  // Grooming Category
  {
    id: "grooming-beard",
    name: "Royal Beard Styling & Hot Towel Shave",
    category: "Grooming",
    duration: 40,
    priceMin: 400,
    priceMax: 800,
    description: "Traditional hot towel prep, straight razor lining, rich sandalwood lather shave, and organic beard oil styling.",
    thumbnail: "🪒"
  },
  {
    id: "grooming-gentlemens-cut",
    name: "Classic Haircut & Head Champi",
    category: "Grooming",
    duration: 45,
    priceMin: 600,
    priceMax: 1200,
    description: "Sleek trim/style followed by a classic 15-minute Ayurvedic head oil massage (champi) to release tension.",
    thumbnail: "💈"
  },

  // Spa & Makeup
  {
    id: "spa-massage",
    name: "Ayurvedic Abhyanga Massage",
    category: "Spa",
    duration: 90,
    priceMin: 2200,
    priceMax: 4000,
    description: "Traditional full body Ayurvedic massage using warm herbal oils (Dhanwantharam) to soothe nerves and detoxify.",
    thumbnail: "💆"
  },
  {
    id: "makeup-glam",
    name: "Festive / Bridal Glam Makeup",
    category: "Makeup",
    duration: 75,
    priceMin: 2500,
    priceMax: 8000,
    description: "Flawless HD photo-ready makeup styling tailored for Indian festivals, weddings, and grand celebrations.",
    thumbnail: "💄"
  }
];

const DEFAULT_STAFF = [
  {
    id: "staff-priya",
    name: "Priya Sharma",
    specialty: "Master Hair Colorist",
    category: "Hair",
    rating: 4.9,
    reviewsCount: 148,
    photo: "assets/stylist_sarah.jpg", // reusing generated assets
    bio: "With over 9 years of training in Mumbai and Paris, Priya is renowned for her global highlights, balayage, and custom keratin treatments tailored to Indian hair textures.",
    workingHours: { start: "09:00", end: "18:00" },
    services: ["hair-cut-signature", "hair-balayage", "hair-blowout"],
    portfolio: [
      "assets/salon_interior.jpg",
      "assets/stylist_sarah.jpg"
    ]
  },
  {
    id: "staff-rohan",
    name: "Rohan Malhotra",
    specialty: "Men's Grooming & Champi Expert",
    category: "Grooming",
    rating: 4.8,
    reviewsCount: 204,
    photo: "assets/stylist_marcus.jpg", // reusing generated assets
    bio: "Rohan has spent the last decade mastering modern fades, beard styling, and traditional Ayurvedic head oil massages. He guarantees you will walk out feeling refreshed.",
    workingHours: { start: "10:00", end: "19:00" },
    services: ["grooming-beard", "grooming-gentlemens-cut", "hair-cut-signature"],
    portfolio: [
      "assets/salon_interior.jpg",
      "assets/stylist_marcus.jpg"
    ]
  },
  {
    id: "staff-anjali",
    name: "Anjali Sen",
    specialty: "Nail Artist & Esthetician",
    category: "Nails",
    rating: 4.95,
    reviewsCount: 182,
    photo: "assets/stylist_elena.jpg", // reusing generated assets
    bio: "Anjali treats nail design as a canvas for storytelling. She specializes in festival-inspired custom nail art, bridal extensions, and organic rose pedicures.",
    workingHours: { start: "09:00", end: "18:00" },
    services: ["nails-gel-mani", "nails-spa-pedi"],
    portfolio: [
      "assets/salon_interior.jpg",
      "assets/stylist_elena.jpg"
    ]
  }
];

const DEFAULT_REVIEWS = [
  {
    name: "Sneha Patel",
    rating: 5,
    text: "Priya is a hair magician! The global highlights she did are beautiful and blend so well with my natural hair color. Everyone at the wedding loved it.",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    service: "Premium Balayage / Global Highlights"
  },
  {
    name: "Amit Malhotra",
    rating: 5,
    text: "Rohan's classic haircut and head champi is the ultimate relaxation. He has amazing hands, and the hot towel shave is top class. Highly recommended!",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    service: "Classic Haircut & Head Champi"
  },
  {
    name: "Riya Sen",
    rating: 5,
    text: "Anjali is incredibly talented. Her gel manicure with subtle gold foil line art is beautiful. I get it done before every festival, it stays perfect for weeks.",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    service: "Signature Gel Manicure"
  }
];

const DEFAULT_BOOKINGS = [
  {
    id: "bk-1001",
    customerName: "Aarav Patel",
    customerEmail: "aarav.patel@example.com",
    customerPhone: "+91 98123 45678",
    services: ["hair-cut-signature"],
    staffId: "staff-priya",
    date: "2026-07-22",
    time: "10:00",
    priceEstimate: 800,
    duration: 60,
    status: "Confirmed",
    notes: "Need a slight trim and blowout style for an office event."
  },
  {
    id: "bk-1002",
    customerName: "Kabir Malhotra",
    customerEmail: "kabir@example.com",
    customerPhone: "+91 99887 76655",
    services: ["grooming-beard", "grooming-gentlemens-cut"],
    staffId: "staff-rohan",
    date: "2026-07-22",
    time: "14:30",
    priceEstimate: 1000,
    duration: 85,
    status: "Pending",
    notes: "First time, excited for the beard trim and the Ayurvedic head massage."
  },
  {
    id: "bk-1003",
    customerName: "Pooja Mehta",
    customerEmail: "pooja.mehta@example.com",
    customerPhone: "+91 98222 33344",
    services: ["nails-gel-mani"],
    staffId: "staff-anjali",
    date: "2026-07-21",
    time: "11:00",
    priceEstimate: 800,
    duration: 45,
    status: "Completed",
    notes: "Looking for pastel pink gel nails."
  }
];

// --- STORAGE KEY DEF ---
const KEYS = {
  SERVICES: "lume_services",
  STAFF: "lume_staff",
  BOOKINGS: "lume_bookings",
  FAVORITES: "lume_favorites",
  CURRENT_USER: "lume_current_user"
};

// --- DATA ACCESS LAYER ---
const LumeStore = {
  init() {
    // If the old user Darren Finch exists, clear storage to reload the Indian context datasets
    const oldUser = localStorage.getItem(KEYS.CURRENT_USER);
    if (oldUser && JSON.parse(oldUser).name === "Darren Finch") {
      localStorage.clear();
    }

    if (!localStorage.getItem(KEYS.SERVICES)) {
      localStorage.setItem(KEYS.SERVICES, JSON.stringify(DEFAULT_SERVICES));
    }
    if (!localStorage.getItem(KEYS.STAFF)) {
      localStorage.setItem(KEYS.STAFF, JSON.stringify(DEFAULT_STAFF));
    }
    if (!localStorage.getItem(KEYS.BOOKINGS)) {
      localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(DEFAULT_BOOKINGS));
    }
    if (!localStorage.getItem(KEYS.FAVORITES)) {
      localStorage.setItem(KEYS.FAVORITES, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.CURRENT_USER)) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify({
        name: "Devansh Sharma",
        email: "devansh.sharma@example.com",
        phone: "+91 98765 43210",
        genderPref: "Unisex"
      }));
    }
  },

  // SERVICES
  getServices() {
    this.init();
    return JSON.parse(localStorage.getItem(KEYS.SERVICES));
  },
  saveServices(services) {
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(services));
  },
  addService(service) {
    const list = this.getServices();
    list.push(service);
    this.saveServices(list);
    return service;
  },
  updateService(serviceId, updatedData) {
    const list = this.getServices();
    const idx = list.findIndex(s => s.id === serviceId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updatedData };
      this.saveServices(list);
    }
  },
  deleteService(serviceId) {
    let list = this.getServices();
    list = list.filter(s => s.id !== serviceId);
    this.saveServices(list);
  },

  // STAFF
  getStaff() {
    this.init();
    return JSON.parse(localStorage.getItem(KEYS.STAFF));
  },
  saveStaff(staff) {
    localStorage.setItem(KEYS.STAFF, JSON.stringify(staff));
  },
  addStaff(member) {
    const list = this.getStaff();
    list.push(member);
    this.saveStaff(list);
    return member;
  },
  updateStaff(staffId, updatedData) {
    const list = this.getStaff();
    const idx = list.findIndex(s => s.id === staffId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updatedData };
      this.saveStaff(list);
    }
  },
  deleteStaff(staffId) {
    let list = this.getStaff();
    list = list.filter(s => s.id !== staffId);
    this.saveStaff(list);
  },

  // BOOKINGS
  getBookings() {
    this.init();
    return JSON.parse(localStorage.getItem(KEYS.BOOKINGS));
  },
  saveBookings(bookings) {
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(bookings));
  },
  addBooking(booking) {
    const list = this.getBookings();
    list.push(booking);
    this.saveBookings(list);
    return booking;
  },
  updateBookingStatus(bookingId, status) {
    const list = this.getBookings();
    const booking = list.find(b => b.id === bookingId);
    if (booking) {
      booking.status = status;
      this.saveBookings(list);
      
      // Dispatch custom event for notifications
      window.dispatchEvent(new CustomEvent("bookingStatusChanged", {
        detail: { bookingId, status }
      }));
    }
  },

  // FAVORITES
  getFavorites() {
    this.init();
    return JSON.parse(localStorage.getItem(KEYS.FAVORITES));
  },
  toggleFavorite(staffId) {
    const favs = this.getFavorites();
    const idx = favs.indexOf(staffId);
    if (idx === -1) {
      favs.push(staffId);
    } else {
      favs.splice(idx, 1);
    }
    localStorage.setItem(KEYS.FAVORITES, JSON.stringify(favs));
    return favs;
  },
  isFavorite(staffId) {
    return this.getFavorites().includes(staffId);
  },

  // CURRENT USER
  getCurrentUser() {
    this.init();
    return JSON.parse(localStorage.getItem(KEYS.CURRENT_USER));
  },
  updateCurrentUser(userData) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(userData));
  },

  // REVIEWS
  getReviews() {
    return DEFAULT_REVIEWS;
  }
};

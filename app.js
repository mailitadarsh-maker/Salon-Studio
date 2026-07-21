// app.js - Controller Logic for LUMÉ Salon & Studio

// --- GLOBAL APP STATE ---
let currentPersona = 'landing';
let currentCustomerScreen = 'home';
let currentAdminScreen = 'home';

// Booking Wizard State
let bookingWizardState = {
  services: [],
  staffId: '',
  date: '',
  time: '',
  notes: ''
};

// Selected Booking ID for reschedule modal
let rescheduleBookingId = null;

// Crisp SVG outlines mapping for service categories (replacing cheap emojis)
function getServiceCategorySVG(category) {
  const cat = category.toLowerCase();
  if (cat === 'hair') {
    return `<svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="stroke: var(--color-accent);"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>`;
  } else if (cat === 'skin') {
    return `<svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="stroke: var(--color-accent);"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`;
  } else if (cat === 'nails') {
    return `<svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="stroke: var(--color-accent);"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5"></path><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path><path d="M10 11V5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v9"></path><path d="M6 14v-2a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6c0 4.418 3.582 8 8 8h4c2.21 0 4-1.79 4-4v-7"></path></svg>`;
  } else if (cat === 'grooming') {
    return `<svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="stroke: var(--color-accent);"><rect x="3" y="4" width="18" height="12" rx="2"></rect><path d="M7 16v4"></path><path d="M17 16v4"></path><path d="M12 16v4"></path><line x1="3" y1="8" x2="21" y2="8"></line></svg>`;
  } else if (cat === 'spa') {
    return `<svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="stroke: var(--color-accent);"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.28 2 8a7 7 0 0 1-10 10Z"></path><path d="M19 2 9.8 11.2"></path></svg>`;
  } else if (cat === 'makeup') {
    return `<svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="stroke: var(--color-accent);"><path d="m18 8-1 1-6-6 1-1Z"></path><path d="M12 8 8 12"></path><path d="M9 11v6a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2v-6Z"></path><path d="m21 3-2 2"></path></svg>`;
  }
  return `<svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="stroke: var(--color-accent);"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"></path></svg>`;
}

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  LumeStore.init();
  
  // Set default view based on current persona
  switchPersona(currentPersona);

  // Setup Date picker minimum to today
  const dateInput = document.getElementById("booking-date-input");
  const rescheduleDateInput = document.getElementById("reschedule-date");
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    if (rescheduleDateInput) rescheduleDateInput.min = today;
  }

  // Subscribe to booking status change event for toast notifications
  window.addEventListener("bookingStatusChanged", (e) => {
    const { bookingId, status } = e.detail;
    showToast(`Booking ${bookingId} has been updated to "${status}"!`, status === 'Confirmed' ? 'success' : 'info');
  });
});

// --- PERSONA ROUTER ---
function switchPersona(persona) {
  currentPersona = persona;

  // Toggle views
  document.getElementById("landing-view").style.display = persona === 'landing' ? 'block' : 'none';
  document.getElementById("customer-view").style.display = persona === 'customer' ? 'block' : 'none';
  document.getElementById("admin-view").style.display = persona === 'admin' ? 'block' : 'none';

  // Toggle switcher button active class
  document.querySelectorAll(".switcher-btn").forEach(btn => btn.classList.remove("active"));
  if (persona === 'landing') document.getElementById("btn-switch-landing").classList.add("active");
  if (persona === 'customer') document.getElementById("btn-switch-customer").classList.add("active");
  if (persona === 'admin') document.getElementById("btn-switch-admin").classList.add("active");

  // Load appropriate persona initial screens
  if (persona === 'landing') {
    renderLandingPage();
  } else if (persona === 'customer') {
    renderCustomerApp();
  } else if (persona === 'admin') {
    renderAdminDashboard();
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToCustomerBooking() {
  switchPersona('customer');
  switchCustomerScreen('services');
}

// --- TOAST NOTIFICATIONS ---
function showToast(message, type = 'info') {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div style="display:flex; align-items:center; gap: 8px;">
      <span style="font-size:1.2rem;">${type === 'success' ? '✔' : 'ℹ'}</span>
      <span>${message}</span>
    </div>
    <button onclick="this.parentElement.remove()" style="color:var(--color-text-muted); font-size:1.1rem; font-weight:700;">&times;</button>
  `;
  container.appendChild(toast);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// =====================================================
// PART A — PUBLIC LANDING PAGE CONTROLLER
// =====================================================
function renderLandingPage() {
  const services = LumeStore.getServices();
  const staff = LumeStore.getStaff();
  const reviews = LumeStore.getReviews();

  // 1. Featured Services Menu Tabs
  const categories = ["Hair", "Skin", "Nails", "Grooming"];
  const tabsContainer = document.getElementById("landing-services-tabs");
  tabsContainer.innerHTML = categories.map((cat, i) => `
    <button class="tab-btn ${i === 0 ? 'active' : ''}" onclick="filterLandingServices('${cat}', this)">${cat}</button>
  `).join("");

  // Initial services filter on first category
  filterLandingServices(categories[0]);

  // 2. Featured Staff Preview Cards
  const staffGrid = document.getElementById("landing-staff-grid");
  staffGrid.innerHTML = staff.slice(0, 3).map(member => `
    <div class="card staff-card">
      <div class="staff-photo-wrapper">
        <img src="${member.photo}" alt="${member.name}">
      </div>
      <div class="staff-card-content">
        <div class="staff-card-specialty">${member.specialty}</div>
        <h3 class="staff-card-name">${member.name}</h3>
        <div class="staff-card-rating">
          <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          <span>${member.rating} (${member.reviewsCount} reviews)</span>
        </div>
        <button class="btn btn-secondary" style="width:100%;" onclick="goToCustomerBooking()">View Portfolio & Book</button>
      </div>
    </div>
  `).join("");

  // 3. Testimonials Carousel
  const reviewsCarousel = document.getElementById("landing-reviews-carousel");
  reviewsCarousel.innerHTML = reviews.map(rev => `
    <div class="review-card">
      <div class="review-user">
        <img src="${rev.photo}" alt="${rev.name}">
        <div class="review-user-name">
          <h4>${rev.name}</h4>
          <span>Verified Client • ${rev.service}</span>
        </div>
      </div>
      <div class="review-stars">
        ${"★".repeat(rev.rating)}${"☆".repeat(5 - rev.rating)}
      </div>
      <p class="review-text">"${rev.text}"</p>
    </div>
  `).join("");
}

function filterLandingServices(category, element = null) {
  if (element) {
    document.querySelectorAll("#landing-services-tabs .tab-btn").forEach(btn => btn.classList.remove("active"));
    element.classList.add("active");
  }

  const services = LumeStore.getServices();
  const filtered = services.filter(s => s.category.toLowerCase() === category.toLowerCase());
  const grid = document.getElementById("landing-services-grid");

  grid.innerHTML = filtered.slice(0, 3).map(s => `
    <div class="card service-card" style="box-shadow: var(--shadow-subtle);">
      <div class="service-card-info">
        <span class="service-card-tag">${s.category}</span>
        <h3 class="service-card-title">${s.name}</h3>
        <p class="service-card-desc">${s.description}</p>
      </div>
      <div class="service-card-pricing">
        <div class="service-card-price">₹${s.priceMin} - ₹${s.priceMax}</div>
        <div class="service-card-duration">Est: ${s.duration} mins</div>
        <button class="btn btn-primary" onclick="goToCustomerBooking()">Book Now</button>
      </div>
    </div>
  `).join("");
}

// =====================================================
// PART B — CUSTOMER APP CONTROLLER
// =====================================================
function switchCustomerScreen(screenId) {
  currentCustomerScreen = screenId;

  // Toggle active screen panel classes
  document.querySelectorAll("#customer-view .app-screen").forEach(scr => scr.classList.remove("active"));
  document.getElementById(`customer-screen-${screenId}`).classList.add("active");

  // Toggle active sidebar buttons
  document.querySelectorAll("#customer-view .sidebar-nav-btn").forEach(btn => btn.classList.remove("active"));
  document.getElementById(`cnav-${screenId}`).classList.add("active");

  // Collapse staff details on directory navigate
  if (screenId === 'staff') {
    document.getElementById("cust-staff-grid").style.display = "grid";
    document.getElementById("staff-detail-pane").style.display = "none";
  }

  // Load data for specific screens
  if (screenId === 'home') renderCustomerHome();
  if (screenId === 'staff') renderCustomerStaffDirectory();
  if (screenId === 'favorites') renderCustomerFavorites();
  if (screenId === 'services') renderCustomerServicesMenu();
  if (screenId === 'bookings') renderCustomerBookingsList();
  if (screenId === 'profile') populateCustomerProfileForm();
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderCustomerApp() {
  const user = LumeStore.getCurrentUser();
  
  // Set customer profile name text placeholders
  document.getElementById("cust-profile-name").textContent = user.name;
  document.getElementById("welcome-name").textContent = user.name.split(' ')[0];
  
  // Set avatar abbreviation
  const abbr = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
  document.getElementById("cust-avatar-abbr").textContent = abbr;

  switchCustomerScreen(currentCustomerScreen);
}

// --- Customer Dashboard Screens Renders ---
function renderCustomerHome() {
  const services = LumeStore.getServices();
  const staff = LumeStore.getStaff();

  // Render 3 popular services
  const popularServs = services.slice(0, 3);
  document.getElementById("cust-home-services").innerHTML = popularServs.map(s => `
    <div class="card service-card">
      <div class="service-card-info" style="display:flex; align-items:center; gap:20px;">
        <span style="display:flex; align-items:center; justify-content:center; background:var(--color-bg-secondary); width:44px; height:44px; border-radius:50%; flex-shrink:0;">${getServiceCategorySVG(s.category)}</span>
        <div>
          <span class="service-card-tag">${s.category}</span>
          <h3 class="service-card-title" style="margin:2px 0 6px;">${s.name}</h3>
          <p class="service-card-desc">${s.description}</p>
        </div>
      </div>
      <div class="service-card-pricing">
        <div class="service-card-price">₹${s.priceMin} - ₹${s.priceMax}</div>
        <div class="service-card-duration">${s.duration} mins</div>
        <button class="btn btn-primary" onclick="quickBookService('${s.id}')">Book</button>
      </div>
    </div>
  `).join("");

  // Render featured staff carousel
  document.getElementById("cust-home-staff").innerHTML = staff.map(member => {
    const isFav = LumeStore.isFavorite(member.id);
    return `
      <div class="card staff-card">
        <button class="favorite-btn ${isFav ? 'active' : ''}" onclick="toggleStylistFav('${member.id}', event)">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
        </button>
        <div class="staff-photo-wrapper" style="height:200px; cursor:pointer;" onclick="viewStaffProfile('${member.id}')">
          <img src="${member.photo}" alt="${member.name}">
        </div>
        <div class="staff-card-content">
          <div class="staff-card-specialty">${member.specialty}</div>
          <h3 class="staff-card-name" style="cursor:pointer;" onclick="viewStaffProfile('${member.id}')">${member.name}</h3>
          <div class="staff-card-rating">
            <span>★ ${member.rating} (${member.reviewsCount} reviews)</span>
          </div>
          <button class="btn btn-secondary" style="width:100%;" onclick="startBookingWithStaff('${member.id}')">Book Slots</button>
        </div>
      </div>
    `;
  }).join("");
}

// --- Staff Directory ---
function renderCustomerStaffDirectory() {
  filterStaff();
}

function filterStaff() {
  const query = document.getElementById("staff-search-input").value.toLowerCase();
  const specialty = document.getElementById("staff-filter-specialty").value;
  const staff = LumeStore.getStaff();

  const filtered = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(query) || member.specialty.toLowerCase().includes(query);
    const matchesSpecialty = specialty === 'All' || member.category === specialty;
    return matchesSearch && matchesSpecialty;
  });

  const grid = document.getElementById("cust-staff-grid");
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <p>No stylists found matching your selection.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(member => {
    const isFav = LumeStore.isFavorite(member.id);
    return `
      <div class="card staff-card">
        <button class="favorite-btn ${isFav ? 'active' : ''}" onclick="toggleStylistFav('${member.id}', event)">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
        </button>
        <div class="staff-photo-wrapper" style="cursor:pointer;" onclick="viewStaffProfile('${member.id}')">
          <img src="${member.photo}" alt="${member.name}">
        </div>
        <div class="staff-card-content">
          <div class="staff-card-specialty">${member.specialty}</div>
          <h3 class="staff-card-name" style="cursor:pointer;" onclick="viewStaffProfile('${member.id}')">${member.name}</h3>
          <div class="staff-card-rating">
            <svg viewBox="0 0 24 24" style="width:16px; height:16px; fill:#F4A261; margin-right:4px;"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            <span>${member.rating} (${member.reviewsCount} reviews)</span>
          </div>
          <p style="font-size:0.85rem; color:var(--color-text-secondary); margin-bottom:16px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${member.bio}</p>
          <div style="display:flex; gap:10px;">
            <button class="btn btn-secondary" style="flex:1; padding:8px 12px; font-size:0.85rem;" onclick="viewStaffProfile('${member.id}')">Portfolio</button>
            <button class="btn btn-primary" style="flex:1.2; padding:8px 12px; font-size:0.85rem;" onclick="startBookingWithStaff('${member.id}')">Book Now</button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function toggleStylistFav(staffId, event) {
  if (event) event.stopPropagation();
  LumeStore.toggleFavorite(staffId);
  showToast(LumeStore.isFavorite(staffId) ? "Stylist added to your favorites!" : "Stylist removed from favorites.");
  
  // Re-render whatever screen we are on
  if (currentCustomerScreen === 'home') renderCustomerHome();
  if (currentCustomerScreen === 'staff') renderCustomerStaffDirectory();
  if (currentCustomerScreen === 'favorites') renderCustomerFavorites();
}

function viewStaffProfile(staffId) {
  const staff = LumeStore.getStaff().find(s => s.id === staffId);
  const services = LumeStore.getServices();
  if (!staff) return;

  // Hide grid, show detail view pane
  document.getElementById("cust-staff-grid").style.display = "none";
  const pane = document.getElementById("staff-detail-pane");
  pane.style.display = "block";

  const isFav = LumeStore.isFavorite(staff.id);
  const staffServices = services.filter(s => staff.services.includes(s.id));

  document.getElementById("staff-detail-content").innerHTML = `
    <div class="profile-card-sticky">
      <img src="${staff.photo}" alt="${staff.name}" class="profile-avatar-large">
      <h3 style="font-size:1.6rem; margin-bottom:6px;">${staff.name}</h3>
      <div style="color:var(--color-accent); font-weight:600; font-size:0.9rem; margin-bottom:12px; text-transform:uppercase;">${staff.specialty}</div>
      <div style="display:flex; justify-content:center; align-items:center; gap:8px; font-size:0.9rem; color:var(--color-text-secondary); margin-bottom:24px;">
        <span>★ ${staff.rating}</span>
        <span>•</span>
        <span>${staff.reviewsCount} verified reviews</span>
      </div>
      <div style="display:flex; flex-direction:column; gap:12px;">
        <button class="btn btn-primary" onclick="startBookingWithStaff('${staff.id}')">Book Appointment with ${staff.name.split(' ')[0]}</button>
        <button class="btn btn-secondary" onclick="toggleStylistFav('${staff.id}'); viewStaffProfile('${staff.id}');">
          ${isFav ? '❤️ Remove Favorite' : '♡ Add to Favorites'}
        </button>
      </div>
    </div>
    <div class="profile-detail-grid">
      <div>
        <h3 style="margin-bottom:16px; border-bottom:1px solid var(--color-bg-secondary); padding-bottom:8px;">Artist Biography</h3>
        <p style="color:var(--color-text-secondary);">${staff.bio}</p>
      </div>
      <div>
        <h3 style="margin-bottom:16px; border-bottom:1px solid var(--color-bg-secondary); padding-bottom:8px;">Specialist Portfolio</h3>
        <div class="profile-portfolio-grid">
          ${staff.portfolio.map(p => `
            <div class="profile-portfolio-item" onclick="openLightbox('${p}')" style="cursor:pointer;">
              <img src="${p}" alt="Portfolio artwork sample">
            </div>
          `).join("")}
        </div>
      </div>
      <div>
        <h3 style="margin-bottom:16px; border-bottom:1px solid var(--color-bg-secondary); padding-bottom:8px;">Menu Offerings & Estimates</h3>
        <div style="display:flex; flex-direction:column; gap:16px;">
          ${staffServices.map(s => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#FFF; padding:16px 20px; border-radius:var(--radius-sm); box-shadow:var(--shadow-subtle);">
              <div>
                <h4 style="font-weight:600;">${s.name}</h4>
                <p style="font-size:0.8rem; color:var(--color-text-muted);">${s.duration} mins</p>
              </div>
              <div style="font-weight:700; color:var(--color-accent); font-size:1.1rem;">₹${s.priceMin} - ₹${s.priceMax}</div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

function closeStaffDetail() {
  document.getElementById("cust-staff-grid").style.display = "grid";
  document.getElementById("staff-detail-pane").style.display = "none";
}

// --- Favorites Screen ---
function renderCustomerFavorites() {
  const staff = LumeStore.getStaff();
  const favIds = LumeStore.getFavorites();
  const grid = document.getElementById("cust-favorites-grid");

  const favorites = staff.filter(s => favIds.includes(s.id));

  if (favorites.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 48px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:16px;"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
        <h3>No Favorites Yet</h3>
        <p style="margin-top:8px; color:var(--color-text-muted);">Stylists you add to your favorites will appear here for easy quick bookings.</p>
        <button class="btn btn-secondary" style="margin-top:20px;" onclick="switchCustomerScreen('staff')">Find Stylists</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = favorites.map(member => `
    <div class="card staff-card">
      <button class="favorite-btn active" onclick="toggleStylistFav('${member.id}', event)">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
      </button>
      <div class="staff-photo-wrapper" style="height:220px;">
        <img src="${member.photo}" alt="${member.name}">
      </div>
      <div class="staff-card-content">
        <div class="staff-card-specialty">${member.specialty}</div>
        <h3 class="staff-card-name">${member.name}</h3>
        <div class="staff-card-rating">
          <span>★ ${member.rating}</span>
        </div>
        <button class="btn btn-primary" style="width:100%; margin-top:8px;" onclick="startBookingWithStaff('${member.id}')">Book Appointment</button>
      </div>
    </div>
  `).join("");
}

// --- Customer Services Catalog ---
function renderCustomerServicesMenu() {
  filterServices();
}

function filterServices() {
  const query = document.getElementById("services-search-input").value.toLowerCase();
  const category = document.getElementById("services-filter-category").value;
  const services = LumeStore.getServices();

  const filtered = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(query) || s.description.toLowerCase().includes(query);
    const matchesCategory = category === 'All' || s.category === category;
    return matchesSearch && matchesCategory;
  });

  const menuContainer = document.getElementById("cust-services-menu");
  if (filtered.length === 0) {
    menuContainer.innerHTML = `
      <div class="empty-state">
        <p>No services found matching your criteria.</p>
      </div>
    `;
    return;
  }

  // Group services by category for structured layout
  const grouped = {};
  filtered.forEach(s => {
    if (!grouped[s.category]) grouped[s.category] = [];
    grouped[s.category].push(s);
  });

  menuContainer.innerHTML = Object.keys(grouped).map(catName => `
    <div class="service-menu-category">
      <h3 class="service-menu-category-title">${catName} Menu</h3>
      <div style="display:flex; flex-direction:column; gap:16px;">
        ${grouped[catName].map(s => `
          <div class="card service-card">
            <div class="service-card-info" style="display:flex; align-items:center; gap:20px;">
              <span style="background:var(--color-bg-secondary); width:50px; height:50px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">${getServiceCategorySVG(s.category)}</span>
              <div>
                <h4 class="service-card-title">${s.name}</h4>
                <p class="service-card-desc">${s.description}</p>
              </div>
            </div>
            <div class="service-card-pricing">
              <div class="service-card-price">₹${s.priceMin} - ₹${s.priceMax}</div>
              <div class="service-card-duration">Estimate: ${s.duration} mins</div>
              <button class="btn btn-primary" onclick="quickBookService('${s.id}')">Add to Schedule</button>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `).join("");
}

// --- BOOKING FLOW WIZARD CONTROLS ---
function initiateBookingFlow() {
  bookingWizardState = {
    services: [],
    staffId: '',
    date: '',
    time: '',
    notes: ''
  };

  switchCustomerScreen('booking');
  wizardNextStep(1);
  renderWizardStep1();
}

function quickBookService(serviceId) {
  initiateBookingFlow();
  // Pre-select service
  bookingWizardState.services = [serviceId];
  wizardNextStep(2);
}

function startBookingWithStaff(staffId) {
  initiateBookingFlow();
  // Pre-select staff
  bookingWizardState.staffId = staffId;
  wizardNextStep(1); // will go straight to step 1 first but with staff assigned
}

function wizardNextStep(step) {
  // Validate transitions
  if (step === 2) {
    if (bookingWizardState.services.length === 0) {
      // Gather checked checkboxes
      const checked = Array.from(document.querySelectorAll(".wselect-checkbox:checked")).map(cb => cb.value);
      if (checked.length === 0) {
        showToast("Please select at least one service to proceed.", "info");
        return;
      }
      bookingWizardState.services = checked;
    }
    renderWizardStep2();
  }

  if (step === 3) {
    // Collect selected staff radio
    const selectedRadio = document.querySelector('input[name="wselect-staff"]:checked');
    if (!selectedRadio && !bookingWizardState.staffId) {
      showToast("Please select a stylist or select 'Any Available'.", "info");
      return;
    }
    if (selectedRadio) bookingWizardState.staffId = selectedRadio.value;
    renderWizardStep3();
  }

  if (step === 4) {
    if (!bookingWizardState.date) {
      const dateVal = document.getElementById("booking-date-input").value;
      if (!dateVal) {
        showToast("Please select a date.", "info");
        return;
      }
      bookingWizardState.date = dateVal;
    }
    if (!bookingWizardState.time) {
      showToast("Please select an available timeslot.", "info");
      return;
    }
    renderWizardStep4();
  }

  // Update classes
  document.querySelectorAll(".wizard-panel").forEach(p => p.classList.remove("active"));
  document.getElementById(`wpanel-${step}`).classList.add("active");

  document.querySelectorAll(".wizard-step-node").forEach((node, i) => {
    node.classList.remove("active", "completed");
    if (i + 1 < step) node.classList.add("completed");
    if (i + 1 === step) node.classList.add("active");
  });
}

function renderWizardStep1() {
  const services = LumeStore.getServices();
  const listContainer = document.getElementById("wselect-services-list");
  const filtersContainer = document.getElementById("wselect-services-filters");
  
  // Get active category filter
  const activeCat = bookingWizardState.activeCategory || "All";
  
  // Unique categories
  const categories = ["All", ...new Set(services.map(s => s.category))];
  
  // Render filters
  if (filtersContainer) {
    filtersContainer.innerHTML = `
      <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:8px; -ms-overflow-style:none; scrollbar-width:none; margin-bottom:16px;">
        ${categories.map(cat => `
          <button class="tab-btn ${activeCat === cat ? 'active' : ''}" type="button" style="padding:6px 14px; font-size:0.8rem; border-radius:100px; font-family:var(--font-heading);" onclick="filterWizardServices('${cat}')">${cat}</button>
        `).join("")}
      </div>
    `;
  }
  
  // Filter services list
  const filtered = activeCat === "All" ? services : services.filter(s => s.category === activeCat);
  
  listContainer.innerHTML = filtered.map(s => {
    const isSelected = bookingWizardState.services.includes(s.id);
    return `
      <label class="wizard-service-item" style="cursor:pointer; display:flex; align-items:center;">
        <div style="display:flex; align-items:center; gap:16px;">
          <input type="checkbox" class="wselect-checkbox" value="${s.id}" ${isSelected ? 'checked' : ''} onchange="updateWizardServicesState(this)">
          <div>
            <strong style="font-weight:600; font-size:1.05rem;">${s.name}</strong>
            <div style="font-size:0.8rem; color:var(--color-text-muted);">${s.category} • ${s.duration} mins</div>
          </div>
        </div>
        <div style="font-weight:700; color:var(--color-accent);">₹${s.priceMin} - ₹${s.priceMax}</div>
      </label>
    `;
  }).join("");
}

function updateWizardServicesState(checkbox) {
  const val = checkbox.value;
  if (checkbox.checked) {
    if (!bookingWizardState.services.includes(val)) bookingWizardState.services.push(val);
  } else {
    bookingWizardState.services = bookingWizardState.services.filter(id => id !== val);
  }
}

function renderWizardStep2() {
  const staff = LumeStore.getStaff();
  const container = document.getElementById("wselect-staff-grid");

  let html = `
    <label class="card wselect-staff-card" style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
      <input type="radio" name="wselect-staff" value="any" ${bookingWizardState.staffId === 'any' || !bookingWizardState.staffId ? 'checked' : ''} onchange="updateWizardStaffState('any')" style="position:absolute; opacity:0;">
      <div class="selected-badge-indicator">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
      <div style="background:var(--color-bg-secondary); width:70px; height:70px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:12px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--color-accent);"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
      </div>
      <h3 style="font-size:1.15rem; font-family:var(--font-body); font-weight:600;">Any Available Stylist</h3>
      <p style="font-size:0.8rem; color:var(--color-text-secondary); margin-top:4px; text-align:center;">We'll assign the best artisan available at your slot.</p>
    </label>
  `;

  html += staff.map(member => {
    const isSelected = bookingWizardState.staffId === member.id;
    return `
      <label class="card wselect-staff-card" style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <input type="radio" name="wselect-staff" value="${member.id}" ${isSelected ? 'checked' : ''} onchange="updateWizardStaffState('${member.id}')" style="position:absolute; opacity:0;">
        <div class="selected-badge-indicator">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <img src="${member.photo}" alt="${member.name}" style="width:70px; height:70px; border-radius:50%; object-fit:cover; margin:0 auto 12px; border:2px solid var(--color-accent-light);">
        <h3 style="font-size:1.15rem; font-family:var(--font-body); font-weight:600;">${member.name}</h3>
        <p style="font-size:0.8rem; color:var(--color-accent); font-weight:500;">${member.specialty}</p>
        <p style="font-size:0.8rem; color:var(--color-text-secondary); margin-top:4px;">★ ${member.rating} rating</p>
      </label>
    `;
  }).join("");

  container.innerHTML = html;
}

function updateWizardStaffState(val) {
  bookingWizardState.staffId = val;
}

function renderWizardStep3() {
  const dateInput = document.getElementById("booking-date-input");
  
  // Set date picker bounds to starting today to prevent past appointments
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;

  if (bookingWizardState.date) {
    dateInput.value = bookingWizardState.date;
  } else {
    bookingWizardState.date = today;
    dateInput.value = today;
  }

  loadAvailableTimeSlots();
}

function loadAvailableTimeSlots() {
  const dateVal = document.getElementById("booking-date-input").value;
  bookingWizardState.date = dateVal;
  const container = document.getElementById("wbooking-slots");

  if (!dateVal) {
    container.innerHTML = `<p style="color:var(--color-text-muted); font-size:0.9rem;">Please choose a date above first to view available timings.</p>`;
    return;
  }

  // Pre-defined hourly slots
  const slots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"];
  
  container.innerHTML = slots.map(slot => {
    const isSelected = bookingWizardState.time === slot;
    return `
      <button class="slot-btn ${isSelected ? 'active' : ''}" type="button" onclick="selectWizardTimeSlot('${slot}', this)">${slot}</button>
    `;
  }).join("");
}

function selectWizardTimeSlot(slot, element) {
  bookingWizardState.time = slot;
  document.querySelectorAll("#wbooking-slots .slot-btn").forEach(btn => btn.classList.remove("active"));
  element.classList.add("active");
}

function renderWizardStep4() {
  const services = LumeStore.getServices();
  const staff = LumeStore.getStaff();

  const selectedServices = services.filter(s => bookingWizardState.services.includes(s.id));
  const staffName = bookingWizardState.staffId === 'any' ? 'Any Available Stylist' : (staff.find(s => s.id === bookingWizardState.staffId)?.name || 'N/A');

  // Calculations
  const totalPriceMin = selectedServices.reduce((sum, s) => sum + s.priceMin, 0);
  const totalPriceMax = selectedServices.reduce((sum, s) => sum + s.priceMax, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

  const container = document.getElementById("wsummary-content");
  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; border-bottom: 1px solid rgba(0,0,0,0.06); padding-bottom: 12px; margin-bottom: 16px;">
      <div>
        <span style="font-size:0.8rem; color:var(--color-text-muted); text-transform:uppercase;">Scheduled Date</span>
        <h4 style="font-size:1.15rem; font-weight:600; margin-top:2px;">${bookingWizardState.date}</h4>
      </div>
      <div style="text-align:right;">
        <span style="font-size:0.8rem; color:var(--color-text-muted); text-transform:uppercase;">Arrival Time</span>
        <h4 style="font-size:1.15rem; font-weight:600; margin-top:2px;">${bookingWizardState.time}</h4>
      </div>
    </div>
    
    <div style="margin-bottom:16px;">
      <span style="font-size:0.8rem; color:var(--color-text-muted); text-transform:uppercase; display:block; margin-bottom:6px;">Assigned Stylist</span>
      <strong>${staffName}</strong>
    </div>

    <div style="margin-bottom:16px;">
      <span style="font-size:0.8rem; color:var(--color-text-muted); text-transform:uppercase; display:block; margin-bottom:6px;">Selected Treatments</span>
      <ul style="list-style:none; padding-left:0; display:flex; flex-direction:column; gap:4px;">
        ${selectedServices.map(s => `
          <li style="display:flex; justify-content:space-between; font-size:0.95rem;">
            <span>• ${s.name} (${s.duration} mins)</span>
            <span style="font-weight:500;">₹${s.priceMin} - ₹${s.priceMax}</span>
          </li>
        `).join("")}
      </ul>
    </div>

    <div style="border-top:1px solid rgba(0,0,0,0.06); padding-top:12px; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <strong>Estimated Duration</strong>
        <p style="font-size:0.85rem; color:var(--color-text-muted);">${totalDuration} minutes</p>
      </div>
      <div style="text-align:right;">
        <strong>Total Estimate</strong>
        <p style="font-family:var(--font-heading); font-size:1.4rem; font-weight:700; color:var(--color-accent);">₹${totalPriceMin} - ₹${totalPriceMax}</p>
      </div>
    </div>
  `;
}

function submitBookingFlow() {
  const services = LumeStore.getServices();
  const staff = LumeStore.getStaff();
  const selectedServices = services.filter(s => bookingWizardState.services.includes(s.id));
  const user = LumeStore.getCurrentUser();

  const totalPriceMin = selectedServices.reduce((sum, s) => sum + s.priceMin, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

  const notesVal = document.getElementById("wbooking-notes").value;

  const newBooking = {
    id: "bk-" + Math.floor(1000 + Math.random() * 9000),
    customerName: user.name,
    customerEmail: user.email,
    customerPhone: user.phone,
    services: bookingWizardState.services,
    staffId: bookingWizardState.staffId,
    date: bookingWizardState.date,
    time: bookingWizardState.time,
    priceEstimate: totalPriceMin,
    duration: totalDuration,
    status: "Pending",
    notes: notesVal
  };

  LumeStore.addBooking(newBooking);
  
  // Clear notes input
  document.getElementById("wbooking-notes").value = "";

  // Populate visual confirmation success modal details
  const matchedStaff = staff.find(s => s.id === newBooking.staffId);
  const staffName = newBooking.staffId === 'any' ? 'Any Available Stylist' : (matchedStaff ? matchedStaff.name : 'Artisan');
  const serviceNamesText = selectedServices.map(s => s.name).join(", ");
  
  document.getElementById("success-modal-services").textContent = serviceNamesText;
  document.getElementById("success-modal-datetime").textContent = `${newBooking.date} at ${newBooking.time} with ${staffName}`;

  // Show the confirmation overlay modal
  document.getElementById("modal-booking-success").classList.add("active");
}

// --- Customer Bookings List ---
let activeCustomerBookingsFilter = 'All';

function renderCustomerBookingsList() {
  filterCustomerBookings(activeCustomerBookingsFilter);
}

function filterCustomerBookings(statusFilter) {
  activeCustomerBookingsFilter = statusFilter;
  
  document.querySelectorAll("#customer-screen-bookings .tab-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  
  const activeBtn = document.getElementById(`bk-filter-${statusFilter.toLowerCase()}`);
  if (activeBtn) activeBtn.classList.add("active");

  const bookings = LumeStore.getBookings();
  const staff = LumeStore.getStaff();
  const services = LumeStore.getServices();
  const currentUser = LumeStore.getCurrentUser();

  // Filter bookings for current logged-in customer name
  const userBookings = bookings.filter(b => b.customerName === currentUser.name);

  const filtered = userBookings.filter(b => {
    return statusFilter === 'All' || b.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const listContainer = document.getElementById("cust-bookings-list");
  if (filtered.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 48px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:16px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        <h3>No Appointments Found</h3>
        <p style="margin-top:8px; color:var(--color-text-muted);">You have no appointments registered under this status.</p>
      </div>
    `;
    return;
  }

  // Sort: upcoming date first
  filtered.sort((a,b) => new Date(a.date) - new Date(b.date));

  listContainer.innerHTML = filtered.map(b => {
    const matchedStaff = staff.find(s => s.id === b.staffId);
    const staffName = b.staffId === 'any' ? 'Any Available Stylist' : (matchedStaff ? matchedStaff.name : 'Unknown Artisan');
    
    const selectedServices = services.filter(s => b.services.includes(s.id));
    const serviceNamesText = selectedServices.map(s => s.name).join(", ");

    const isActionable = b.status === 'Pending' || b.status === 'Confirmed';

    return `
      <div class="booking-card status-${b.status.toLowerCase()}">
        <div class="booking-card-details">
          <span class="badge badge-${b.status.toLowerCase()}" style="margin-bottom:8px;">${b.status}</span>
          <h3>${serviceNamesText}</h3>
          <p><strong>Stylist:</strong> ${staffName}</p>
          <p><strong>Scheduled:</strong> ${b.date} at ${b.time} (${b.duration} minutes duration)</p>
          <p><strong>Total Price Base:</strong> ₹${b.priceEstimate}</p>
          ${b.notes ? `<p style="font-size:0.85rem; font-style:italic; margin-top:8px; color:var(--color-text-muted);">"${b.notes}"</p>` : ''}
        </div>
        <div class="booking-card-actions">
          <span style="font-family:var(--font-heading); font-size:1.3rem; font-weight:700; color:var(--color-accent);">ID: ${b.id}</span>
          
          ${isActionable ? `
            <div style="display:flex; gap:8px; margin-top:16px;">
              <button class="btn btn-secondary" style="padding:6px 12px; font-size:0.8rem;" onclick="openRescheduleModal('${b.id}')">Reschedule</button>
              <button class="btn btn-danger" style="padding:6px 12px; font-size:0.8rem;" onclick="cancelAppointment('${b.id}')">Cancel</button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join("");
}

function cancelAppointment(bookingId) {
  if (confirm("Are you sure you want to cancel this appointment?")) {
    LumeStore.updateBookingStatus(bookingId, "Cancelled");
    showToast(`Appointment ${bookingId} cancelled.`);
    renderCustomerBookingsList();
  }
}

// --- Customer Profile Form ---
function populateCustomerProfileForm() {
  const user = LumeStore.getCurrentUser();
  document.getElementById("profile-input-name").value = user.name;
  document.getElementById("profile-input-email").value = user.email;
  document.getElementById("profile-input-phone").value = user.phone;
  document.getElementById("profile-input-gender").value = user.genderPref;
}

function saveCustomerProfile(event) {
  event.preventDefault();
  const nameVal = document.getElementById("profile-input-name").value;
  const emailVal = document.getElementById("profile-input-email").value;
  const phoneVal = document.getElementById("profile-input-phone").value;
  const genderVal = document.getElementById("profile-input-gender").value;

  LumeStore.updateCurrentUser({
    name: nameVal,
    email: emailVal,
    phone: phoneVal,
    genderPref: genderVal
  });

  showToast("Profile details updated successfully!", "success");
  renderCustomerApp(); // refreshes name headers
}


// =====================================================
// PART C — ADMIN DASHBOARD CONTROLLER
// =====================================================
function switchAdminScreen(screenId) {
  currentAdminScreen = screenId;

  // Toggle active screens
  document.querySelectorAll("#admin-view .app-screen").forEach(scr => scr.classList.remove("active"));
  document.getElementById(`admin-screen-${screenId}`).classList.add("active");

  // Toggle active sidebar buttons
  document.querySelectorAll("#admin-view .sidebar-nav-btn").forEach(btn => btn.classList.remove("active"));
  document.getElementById(`anav-${screenId}`).classList.add("active");

  if (screenId === 'home') renderAdminHome();
  if (screenId === 'bookings') renderAdminBookings();
  if (screenId === 'staff') renderAdminStaff();
  if (screenId === 'services') renderAdminServices();
  if (screenId === 'customers') renderAdminCustomers();
  if (screenId === 'analytics') renderAdminAnalytics();
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderAdminDashboard() {
  switchAdminScreen(currentAdminScreen);
}

// --- Admin Home Overview ---
function renderAdminHome() {
  const bookings = LumeStore.getBookings();
  const staff = LumeStore.getStaff();
  const services = LumeStore.getServices();

  // 1. Calculations for Counters
  const pendingCount = bookings.filter(b => b.status === 'Pending').length;
  const activeCount = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending').length;
  const activeStaffCount = staff.length;
  
  // Total Revenue of Completed + Confirmed bookings
  const completedRevenue = bookings
    .filter(b => b.status === 'Completed' || b.status === 'Confirmed')
    .reduce((sum, b) => sum + b.priceEstimate, 0);

  document.getElementById("astat-pending").textContent = pendingCount;
  document.getElementById("astat-active").textContent = activeCount;
  document.getElementById("astat-revenue").textContent = `₹${completedRevenue.toLocaleString()}`;
  document.getElementById("astat-staff").textContent = activeStaffCount;

  // 2. Actionable Booking Queue Table
  // Show only pending bookings or recently created ones in home queue
  const queueBookings = bookings.filter(b => b.status === 'Pending');
  const tbody = document.getElementById("admin-queue-tbody");

  if (queueBookings.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center" style="color:var(--color-text-muted); padding:48px 0; font-size:0.95rem;">
          No pending booking actions in the queue.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = queueBookings.map(b => {
    const stylist = staff.find(s => s.id === b.staffId);
    const stylistName = b.staffId === 'any' ? 'Any Available' : (stylist ? stylist.name : 'Unknown');
    const selectedServices = services.filter(s => b.services.includes(s.id)).map(s => s.name).join(", ");

    return `
      <tr>
        <td>
          <strong>${b.customerName}</strong><br>
          <span style="font-size:0.8rem; color:var(--color-text-muted);">${b.customerPhone}</span>
        </td>
        <td>${stylistName}</td>
        <td>
          <strong>${b.date}</strong><br>
          <span style="font-size:0.85rem; color:var(--color-accent);">${b.time}</span>
        </td>
        <td>
          <div style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${selectedServices}">
            ${selectedServices}
          </div>
        </td>
        <td><strong>₹${b.priceEstimate}</strong></td>
        <td><span class="badge badge-pending">${b.status}</span></td>
        <td>
          <div class="table-actions">
            <button class="btn btn-success" style="padding:6px 12px; font-size:0.75rem;" onclick="adminConfirmBooking('${b.id}')">Confirm</button>
            <button class="btn btn-danger" style="padding:6px 12px; font-size:0.75rem;" onclick="adminRejectBooking('${b.id}')">Reject</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// --- Admin Booking Manager screen ---
function renderAdminBookings() {
  filterAdminBookings();
}

function filterAdminBookings() {
  const query = document.getElementById("admin-bookings-search").value.toLowerCase();
  const statusFilter = document.getElementById("admin-bookings-filter-status").value;

  const bookings = LumeStore.getBookings();
  const staff = LumeStore.getStaff();
  const services = LumeStore.getServices();

  const filtered = bookings.filter(b => {
    const matchesSearch = b.customerName.toLowerCase().includes(query) || b.id.includes(query);
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tbody = document.getElementById("admin-bookings-tbody");
  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center" style="color:var(--color-text-muted); padding:32px 0;">No bookings matching search settings.</td>
      </tr>
    `;
    return;
  }

  // Sort by date descending (newest bookings first)
  filtered.sort((a,b) => new Date(b.date) - new Date(a.date));

  tbody.innerHTML = filtered.map(b => {
    const stylist = staff.find(s => s.id === b.staffId);
    const stylistName = b.staffId === 'any' ? 'Any Available' : (stylist ? stylist.name : 'N/A');
    const servsText = services.filter(s => b.services.includes(s.id)).map(s => s.name).join(", ");

    return `
      <tr>
        <td><strong>#${b.id}</strong></td>
        <td><strong>${b.customerName}</strong></td>
        <td>${b.customerPhone}</td>
        <td>${stylistName}</td>
        <td>${b.date} @ ${b.time}</td>
        <td>
          <div style="max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${servsText}">
            ${servsText}
          </div>
        </td>
        <td><span class="badge badge-${b.status.toLowerCase()}">${b.status}</span></td>
        <td>
          <div class="table-actions">
            ${b.status === 'Pending' ? `
              <button class="btn btn-success" style="padding:4px 8px; font-size:0.75rem;" onclick="adminConfirmBooking('${b.id}')">Confirm</button>
              <button class="btn btn-danger" style="padding:4px 8px; font-size:0.75rem;" onclick="adminRejectBooking('${b.id}')">Reject</button>
            ` : ''}
            
            ${b.status === 'Confirmed' ? `
              <button class="btn btn-success" style="padding:4px 8px; font-size:0.75rem;" onclick="adminCompleteBooking('${b.id}')">Complete</button>
              <button class="btn btn-danger" style="padding:4px 8px; font-size:0.75rem;" onclick="adminRejectBooking('${b.id}')">Cancel</button>
            ` : ''}
            
            ${b.status === 'Completed' || b.status === 'Cancelled' || b.status === 'Rejected' ? `
              <span style="font-size:0.8rem; color:var(--color-text-muted);">No actions</span>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function adminConfirmBooking(id) {
  LumeStore.updateBookingStatus(id, "Confirmed");
  showToast(`Booking ${id} confirmed!`, 'success');
  if (currentAdminScreen === 'home') renderAdminHome();
  if (currentAdminScreen === 'bookings') renderAdminBookings();
}

function adminRejectBooking(id) {
  LumeStore.updateBookingStatus(id, "Rejected");
  showToast(`Booking ${id} rejected.`);
  if (currentAdminScreen === 'home') renderAdminHome();
  if (currentAdminScreen === 'bookings') renderAdminBookings();
}

function adminCompleteBooking(id) {
  LumeStore.updateBookingStatus(id, "Completed");
  showToast(`Booking ${id} marked as completed.`, 'success');
  if (currentAdminScreen === 'home') renderAdminHome();
  if (currentAdminScreen === 'bookings') renderAdminBookings();
}

// --- Admin Staff CRUD ---
function renderAdminStaff() {
  const staff = LumeStore.getStaff();
  const grid = document.getElementById("admin-staff-grid");

  grid.innerHTML = staff.map(member => `
    <div class="card" style="padding:24px; display:flex; gap:20px; align-items:center;">
      <img src="${member.photo}" alt="${member.name}" style="width:80px; height:80px; border-radius:50%; object-fit:cover; border:2px solid var(--color-accent);">
      <div style="flex:1;">
        <h3 style="font-size:1.2rem; margin-bottom:4px;">${member.name}</h3>
        <p style="color:var(--color-accent); font-weight:500; font-size:0.85rem; text-transform:uppercase;">${member.specialty}</p>
        <p style="font-size:0.8rem; color:var(--color-text-secondary); margin-top:4px;">Rating: ★ ${member.rating} (${member.reviewsCount} reviews)</p>
      </div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        <button class="btn btn-secondary" style="padding:6px 12px; font-size:0.8rem;" onclick="editStaffMember('${member.id}')">Edit</button>
        <button class="btn btn-danger" style="padding:6px 12px; font-size:0.8rem;" onclick="deleteStaffMember('${member.id}')">Delete</button>
      </div>
    </div>
  `).join("");
}

function openStaffModal(staffId = null) {
  const modal = document.getElementById("modal-staff-form");
  modal.classList.add("active");

  const title = document.getElementById("staff-modal-title");
  const formId = document.getElementById("staff-form-id");
  const name = document.getElementById("staff-form-name");
  const specialty = document.getElementById("staff-form-specialty");
  const category = document.getElementById("staff-form-category");
  const bio = document.getElementById("staff-form-bio");

  if (staffId) {
    title.textContent = "Edit Stylist Details";
    const member = LumeStore.getStaff().find(s => s.id === staffId);
    formId.value = member.id;
    name.value = member.name;
    specialty.value = member.specialty;
    category.value = member.category;
    bio.value = member.bio;
  } else {
    title.textContent = "Add New Stylist";
    formId.value = "";
    name.value = "";
    specialty.value = "";
    category.value = "Hair";
    bio.value = "";
  }
}

function closeStaffModal() {
  document.getElementById("modal-staff-form").classList.remove("active");
}

function handleStaffSubmit(event) {
  event.preventDefault();
  const formId = document.getElementById("staff-form-id").value;
  const name = document.getElementById("staff-form-name").value;
  const specialty = document.getElementById("staff-form-specialty").value;
  const category = document.getElementById("staff-form-category").value;
  const bio = document.getElementById("staff-form-bio").value;

  if (formId) {
    // Edit mode
    LumeStore.updateStaff(formId, { name, specialty, category, bio });
    showToast("Stylist details updated.", "success");
  } else {
    // Create mode
    const newId = "staff-" + name.toLowerCase().replace(/\s+/g, '-');
    LumeStore.addStaff({
      id: newId,
      name,
      specialty,
      category,
      rating: 5.0,
      reviewsCount: 0,
      photo: "assets/stylist_sarah.jpg", // default fallbacks portrait
      bio,
      workingHours: { start: "09:00", end: "18:00" },
      services: ["hair-cut-signature"],
      portfolio: ["assets/salon_interior.jpg"]
    });
    showToast("New stylist added to roster!", "success");
  }

  closeStaffModal();
  renderAdminStaff();
}

function deleteStaffMember(staffId) {
  if (confirm("Are you sure you want to remove this stylist from the roster?")) {
    LumeStore.deleteStaff(staffId);
    showToast("Stylist removed.");
    renderAdminStaff();
  }
}

// --- Admin Services Catalog CRUD ---
function renderAdminServices() {
  const services = LumeStore.getServices();
  const tbody = document.getElementById("admin-services-tbody");

  tbody.innerHTML = services.map(s => `
    <tr>
      <td>
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="background:var(--color-bg-secondary); width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">${getServiceCategorySVG(s.category)}</span>
          <strong>${s.name}</strong>
        </div>
      </td>
      <td><span class="badge badge-completed">${s.category}</span></td>
      <td><strong>₹${s.priceMin} - ₹${s.priceMax}</strong></td>
      <td>${s.duration} mins</td>
      <td style="max-width:300px; font-size:0.85rem; color:var(--color-text-secondary);">${s.description}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-secondary" style="padding:4px 8px; font-size:0.75rem;" onclick="openServiceModal('${s.id}')">Edit</button>
          <button class="btn btn-danger" style="padding:4px 8px; font-size:0.75rem;" onclick="deleteServiceItem('${s.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function openServiceModal(serviceId = null) {
  const modal = document.getElementById("modal-service-form");
  modal.classList.add("active");

  const title = document.getElementById("service-modal-title");
  const formId = document.getElementById("service-form-id");
  const name = document.getElementById("service-form-name");
  const category = document.getElementById("service-form-category");
  const priceMin = document.getElementById("service-form-min");
  const priceMax = document.getElementById("service-form-max");
  const duration = document.getElementById("service-form-duration");
  const desc = document.getElementById("service-form-desc");

  if (serviceId) {
    title.textContent = "Edit Service Details";
    const s = LumeStore.getServices().find(item => item.id === serviceId);
    formId.value = s.id;
    name.value = s.name;
    category.value = s.category;
    priceMin.value = s.priceMin;
    priceMax.value = s.priceMax;
    duration.value = s.duration;
    desc.value = s.description;
  } else {
    title.textContent = "Create New Service";
    formId.value = "";
    name.value = "";
    category.value = "Hair";
    priceMin.value = "";
    priceMax.value = "";
    duration.value = "45";
    desc.value = "";
  }
}

function closeServiceModal() {
  document.getElementById("modal-service-form").classList.remove("active");
}

function handleServiceSubmit(event) {
  event.preventDefault();
  const formId = document.getElementById("service-form-id").value;
  const name = document.getElementById("service-form-name").value;
  const category = document.getElementById("service-form-category").value;
  const priceMin = parseInt(document.getElementById("service-form-min").value);
  const priceMax = parseInt(document.getElementById("service-form-max").value);
  const duration = parseInt(document.getElementById("service-form-duration").value);
  const desc = document.getElementById("service-form-desc").value;

  if (formId) {
    LumeStore.updateService(formId, { name, category, priceMin, priceMax, duration, description: desc });
    showToast("Service item updated.", "success");
  } else {
    const newId = "serv-" + name.toLowerCase().replace(/\s+/g, '-');
    LumeStore.addService({
      id: newId,
      name,
      category,
      priceMin,
      priceMax,
      duration,
      description: desc,
      thumbnail: "✨" // default star icon
    });
    showToast("New service catalog item published!", "success");
  }

  closeServiceModal();
  renderAdminServices();
}

function deleteServiceItem(serviceId) {
  if (confirm("Are you sure you want to remove this service from the catalog?")) {
    LumeStore.deleteService(serviceId);
    showToast("Service deleted.");
    renderAdminServices();
  }
}

// --- Admin Client Registry ---
function renderAdminCustomers() {
  const bookings = LumeStore.getBookings();
  const tbody = document.getElementById("admin-customers-tbody");

  // Generate unique list of customers from booking data
  const clients = {};
  bookings.forEach(b => {
    if (!clients[b.customerName]) {
      clients[b.customerName] = {
        name: b.customerName,
        email: b.customerEmail || 'N/A',
        phone: b.customerPhone || 'N/A',
        totalBookings: 0
      };
    }
    clients[b.customerName].totalBookings += 1;
  });

  const clientList = Object.values(clients);

  if (clientList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="color:var(--color-text-muted);">No customers registered.</td></tr>`;
    return;
  }

  tbody.innerHTML = clientList.map(c => `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td>${c.email}</td>
      <td>${c.phone}</td>
      <td><span class="badge badge-completed">${c.totalBookings} Appointments</span></td>
      <td><button class="btn btn-secondary" style="padding:4px 8px; font-size:0.75rem;" onclick="adminViewCustomerDetail('${c.name}')">History</button></td>
    </tr>
  `).join("");
}

function adminViewCustomerDetail(customerName) {
  // Jump to bookings table with filter set
  switchAdminScreen('bookings');
  document.getElementById("admin-bookings-search").value = customerName;
  filterAdminBookings();
}

// --- Admin Business Analytics (Visual Charts) ---
function renderAdminAnalytics() {
  const bookings = LumeStore.getBookings();
  const staff = LumeStore.getStaff();
  const services = LumeStore.getServices();

  // 1. Chart: Bookings per Stylist
  const staffCounts = {};
  // initialize
  staff.forEach(s => staffCounts[s.name] = 0);
  staffCounts["Any Available"] = 0;

  bookings.forEach(b => {
    if (b.staffId === 'any') {
      staffCounts["Any Available"] += 1;
    } else {
      const stylist = staff.find(s => s.id === b.staffId);
      if (stylist) staffCounts[stylist.name] += 1;
    }
  });

  const staffContainer = document.getElementById("chart-staff-bookings");
  const maxStaffCount = Math.max(...Object.values(staffCounts), 1);

  staffContainer.innerHTML = Object.keys(staffCounts).map(name => {
    const val = staffCounts[name];
    const pct = (val / maxStaffCount) * 100;
    return `
      <div class="chart-bar-wrapper">
        <div class="chart-bar" style="height:${pct}%;">
          <span class="chart-bar-value">${val}</span>
        </div>
        <div class="chart-bar-label">${name.split(' ')[0]}</div>
      </div>
    `;
  }).join("");

  // 2. Chart: Bookings by Category
  const catCounts = { Hair: 0, Skin: 0, Nails: 0, Grooming: 0, Spa: 0, Makeup: 0 };
  bookings.forEach(b => {
    b.services.forEach(servId => {
      const s = services.find(item => item.id === servId);
      if (s && catCounts[s.category] !== undefined) {
        catCounts[s.category] += 1;
      }
    });
  });

  const categoryContainer = document.getElementById("chart-category-bookings");
  const maxCatCount = Math.max(...Object.values(catCounts), 1);

  categoryContainer.innerHTML = Object.keys(catCounts).map(cat => {
    const val = catCounts[cat];
    const pct = (val / maxCatCount) * 100;
    return `
      <div class="chart-bar-wrapper">
        <div class="chart-bar" style="height:${pct}%;">
          <span class="chart-bar-value">${val}</span>
        </div>
        <div class="chart-bar-label">${cat}</div>
      </div>
    `;
  }).join("");
}


// =====================================================
// GLOBAL MODAL EVENT HANDLERS
// =====================================================
function openLightbox(imagePath) {
  const modal = document.getElementById("modal-lightbox");
  const img = document.getElementById("lightbox-img");
  img.src = imagePath;
  modal.classList.add("active");
}

function closeLightbox() {
  document.getElementById("modal-lightbox").classList.remove("active");
}

// --- Customer Reschedule flow ---
let rescheduleSelectedSlot = '';

function openRescheduleModal(bookingId) {
  rescheduleBookingId = bookingId;
  rescheduleSelectedSlot = '';

  const modal = document.getElementById("modal-reschedule");
  modal.classList.add("active");

  const booking = LumeStore.getBookings().find(b => b.id === bookingId);
  const dateInput = document.getElementById("reschedule-date");
  dateInput.value = booking.date;

  loadRescheduleSlots();
}

function closeRescheduleModal() {
  document.getElementById("modal-reschedule").classList.remove("active");
}

function loadRescheduleSlots() {
  const dateVal = document.getElementById("reschedule-date").value;
  const container = document.getElementById("reschedule-slots");

  if (!dateVal) {
    container.innerHTML = `<p style="color:var(--color-text-muted);">Select date to check availability.</p>`;
    return;
  }

  // Pre-defined hourly slots
  const slots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"];
  
  container.innerHTML = slots.map(slot => {
    const isSelected = rescheduleSelectedSlot === slot;
    return `
      <button class="slot-btn ${isSelected ? 'active' : ''}" type="button" onclick="selectRescheduleTimeSlot('${slot}', this)">${slot}</button>
    `;
  }).join("");
}

function selectRescheduleTimeSlot(slot, element) {
  rescheduleSelectedSlot = slot;
  document.querySelectorAll("#reschedule-slots .slot-btn").forEach(btn => btn.classList.remove("active"));
  element.classList.add("active");
}

function handleRescheduleSubmit(event) {
  event.preventDefault();
  const dateVal = document.getElementById("reschedule-date").value;

  if (!rescheduleSelectedSlot) {
    alert("Please select a time slot.");
    return;
  }

  // Update booking in local storage
  const bookings = LumeStore.getBookings();
  const booking = bookings.find(b => b.id === rescheduleBookingId);
  if (booking) {
    booking.date = dateVal;
    booking.time = rescheduleSelectedSlot;
    // Set status back to Pending so admin reviews reschedule
    booking.status = "Pending";
    LumeStore.saveBookings(bookings);

    showToast(`Appointment reschedule request submitted. Waiting for admin confirmation.`, 'success');
  }

  closeRescheduleModal();
  renderCustomerBookingsList();
}

function filterWizardServices(category) {
  bookingWizardState.activeCategory = category;
  renderWizardStep1();
}

function closeSuccessModalAndShowBookings() {
  document.getElementById("modal-booking-success").classList.remove("active");
  switchCustomerScreen('bookings');
}

// ---------- Utility Functions ----------
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [
  ...context.querySelectorAll(selector),
];

const formatPrice = (price) => {
  return "$" + parseFloat(price).toFixed(2);
};

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// ---------- Product Data ----------
const products = [
  {
    id: "supply-350",
    name: "Supply 350",
    category: "shoes",
    price: 160,
    originalPrice: 200,
    image: "images/shoes/shoe-1.png",
    description: "Premium comfort with advanced cushioning technology.",
    rating: 4.5,
    reviews: 128,
    badge: "sale",
    badgeText: "Sale",
  },
  {
    id: "nike-360",
    name: "Nike 360",
    category: "shoes",
    price: 180,
    originalPrice: null,
    image: "images/shoes/shoe-2.png",
    description: "Advanced athletic performance with style.",
    rating: 4.0,
    reviews: 95,
    badge: "new",
    badgeText: "New",
  },
  {
    id: "red-airmax",
    name: "Red Airmax",
    category: "shoes",
    price: 220,
    originalPrice: 280,
    image: "images/shoes/shoe-3.png",
    description: "Bold design with maximum comfort and support.",
    rating: 5.0,
    reviews: 156,
    badge: "hot",
    badgeText: "Hot",
  },
  {
    id: "red-laltu-bag",
    name: "Red Laltu Bag",
    category: "bags",
    price: 89,
    originalPrice: 120,
    image: "images/bags/bag-1.png",
    description: "Stylish and spacious travel companion.",
    rating: 4.0,
    reviews: 64,
    badge: null,
    badgeText: "",
  },
  {
    id: "luxury-watch",
    name: "Luxury Watch",
    category: "watches",
    price: 450,
    originalPrice: 550,
    image: "images/categories/watch.png",
    description: "Elegant timepiece with premium materials.",
    rating: 5.0,
    reviews: 42,
    badge: "hot",
    badgeText: "Hot",
  },
  {
    id: "designer-bag",
    name: "Designer Bag",
    category: "bags",
    price: 150,
    originalPrice: 200,
    image: "images/categories/bag.png",
    description: "Stylish and functional for everyday use.",
    rating: 4.8,
    reviews: 73,
    badge: null,
    badgeText: "",
  },
  {
    id: "wireless-headphones",
    name: "Wireless Headphones",
    category: "electronics",
    price: 299,
    originalPrice: 399,
    image: "images/banner-images/headphone.png",
    description: "Premium noise-cancelling wireless headphones.",
    rating: 4.9,
    reviews: 210,
    badge: "sale",
    badgeText: "Sale",
  },
  {
    id: "sports-shoes",
    name: "Sports Shoes",
    category: "shoes",
    price: 130,
    originalPrice: 160,
    image: "images/categories/shoes.png",
    description: "Lightweight and comfortable for daily wear.",
    rating: 4.3,
    reviews: 88,
    badge: null,
    badgeText: "",
  },
];

// ---------- State Management ----------
let state = {
  cart: JSON.parse(localStorage.getItem("eliteCart")) || [],
  wishlist: JSON.parse(localStorage.getItem("eliteWishlist")) || [],
  currentFilter: "all",
  currentSort: "featured",
  searchQuery: "",
  currentTheme: localStorage.getItem("eliteTheme") || "modern-blue",
  isDarkMode: JSON.parse(localStorage.getItem("eliteDarkMode")) || false,
};

// ---------- Theme Manager ----------
class ThemeManager {
  constructor() {
    this.bindEvents();
    this.applyTheme();
    this.updateUI();
  }

  bindEvents() {
    $$(".theme-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const theme = btn.dataset.theme;
        this.setTheme(theme);
      });
    });

    $("#darkModeToggle").addEventListener("click", () => this.toggleDarkMode());

    // Listen for system dark mode preference if not set
    if (window.matchMedia && !localStorage.getItem("eliteDarkMode")) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      state.isDarkMode = mediaQuery.matches;
      this.applyTheme();
      mediaQuery.addEventListener("change", (e) => {
        if (!localStorage.getItem("eliteDarkMode")) {
          state.isDarkMode = e.matches;
          this.applyTheme();
          this.updateUI();
        }
      });
    }
  }

  setTheme(themeName) {
    state.currentTheme = themeName;
    $$(".theme-btn").forEach((btn) => btn.classList.remove("active"));
    $(`.theme-btn.${themeName}`).classList.add("active");
    this.applyTheme();
    localStorage.setItem("eliteTheme", themeName);
  }

  toggleDarkMode() {
    state.isDarkMode = !state.isDarkMode;
    this.applyTheme();
    this.updateUI();
    localStorage.setItem("eliteDarkMode", JSON.stringify(state.isDarkMode));
  }

  applyTheme() {
    const html = document.documentElement;
    html.setAttribute("data-color-theme", state.currentTheme);
    if (state.isDarkMode) {
      html.setAttribute("data-theme", "dark");
    } else {
      html.removeAttribute("data-theme");
    }
  }

  updateUI() {
    const toggleBtn = $("#darkModeToggle");
    const icon = toggleBtn.querySelector("i");
    const text = toggleBtn.querySelector("span");
    if (state.isDarkMode) {
      icon.className = "fas fa-sun";
      text.textContent = "Light Mode";
    } else {
      icon.className = "fas fa-moon";
      text.textContent = "Dark Mode";
    }
  }
}

// ---------- Cart & Wishlist Manager ----------
class CartManager {
  constructor() {
    this.bindEvents();
    this.updateBadges();
    this.renderCartDrawer();
  }

  bindEvents() {
    document.addEventListener("click", (e) => {
      const addBtn = e.target.closest(
        ".add-to-cart, .hero-add-to-cart, .deal-add-to-cart, #quickViewAddToCart",
      );
      if (addBtn) {
        const productId = addBtn.dataset.productId;
        const product = products.find((p) => p.id === productId);
        if (product) this.addToCart(product);
      }

      const wishlistBtn = e.target.closest(".wishlist-btn, #quickViewWishlist");
      if (wishlistBtn) {
        const productId =
          wishlistBtn.dataset.productId ||
          wishlistBtn.closest(".product-card")?.dataset.productId;
        const product = products.find((p) => p.id === productId);
        if (product) this.toggleWishlist(product);
      }

      const viewBtn = e.target.closest(".view-btn");
      if (viewBtn) {
        const productId = viewBtn.closest(".product-card").dataset.productId;
        const product = products.find((p) => p.id === productId);
        if (product) this.openQuickView(product);
      }

      const removeBtn = e.target.closest(".cart-item-remove");
      if (removeBtn) {
        const id = removeBtn.dataset.id;
        this.removeFromCart(id);
      }
    });

    $("#clearCart").addEventListener("click", () => this.clearCart());
  }

  addToCart(product) {
    const existing = state.cart.find((item) => item.id === product.id);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      state.cart.push({ ...product, quantity: 1 });
    }
    this.saveCart();
    this.updateBadges();
    this.renderCartDrawer();
    this.showToast(`${product.name} added to cart!`, "success");
    // Animate button if present
    const btn = document.querySelector(`[data-product-id="${product.id}"]`);
    if (btn) {
      btn.style.transform = "scale(0.95)";
      setTimeout(() => (btn.style.transform = ""), 150);
    }
  }

  removeFromCart(id) {
    state.cart = state.cart.filter((item) => item.id !== id);
    this.saveCart();
    this.updateBadges();
    this.renderCartDrawer();
    this.showToast("Item removed from cart", "info");
  }

  clearCart() {
    state.cart = [];
    this.saveCart();
    this.updateBadges();
    this.renderCartDrawer();
    this.showToast("Cart cleared", "info");
  }

  toggleWishlist(product) {
    const index = state.wishlist.findIndex((item) => item.id === product.id);
    if (index > -1) {
      state.wishlist.splice(index, 1);
      this.showToast(`${product.name} removed from wishlist`, "info");
    } else {
      state.wishlist.push(product);
      this.showToast(`${product.name} added to wishlist!`, "success");
    }
    localStorage.setItem("eliteWishlist", JSON.stringify(state.wishlist));
    this.updateBadges();
  }

  updateBadges() {
    const cartBadge = $("#cartBadge");
    const cartDrawerCount = $("#cartDrawerCount");
    const wishlistBadge = $("#wishlistBadge");
    if (cartBadge)
      cartBadge.textContent = state.cart.reduce(
        (sum, item) => sum + (item.quantity || 1),
        0,
      );
    if (cartDrawerCount) cartDrawerCount.textContent = state.cart.length;
    if (wishlistBadge) wishlistBadge.textContent = state.wishlist.length;
  }

  saveCart() {
    localStorage.setItem("eliteCart", JSON.stringify(state.cart));
  }

  renderCartDrawer() {
    const cartItems = $("#cartItems");
    const cartEmpty = $("#cartEmpty");
    const cartFooter = $("#cartFooter");
    const subtotal = $("#cartSubtotal");

    if (!cartItems) return;

    if (state.cart.length === 0) {
      cartItems.innerHTML = "";
      cartEmpty.style.display = "block";
      cartFooter.style.display = "none";
    } else {
      cartEmpty.style.display = "none";
      cartFooter.style.display = "block";
      let html = "";
      let total = 0;
      state.cart.forEach((item) => {
        const itemTotal = item.price * (item.quantity || 1);
        total += itemTotal;
        html += `
          <div class="cart-item">
            <div class="cart-item-image">
              <img src="${item.image}" alt="${item.name}" />
            </div>
            <div class="cart-item-info">
              <div class="cart-item-title">${item.name}</div>
              <div class="cart-item-price">${formatPrice(item.price)}${item.quantity > 1 ? ` × ${item.quantity}` : ""}</div>
            </div>
            <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove item">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        `;
      });
      cartItems.innerHTML = html;
      subtotal.textContent = formatPrice(total);
    }
  }

  openQuickView(product) {
    $("#quickViewImage").src = product.image;
    $("#quickViewImage").alt = product.name;
    $("#quickViewTitle").textContent = product.name;
    $("#quickViewDescription").textContent = product.description;
    $("#quickViewCurrentPrice").textContent = formatPrice(product.price);
    if (product.originalPrice) {
      $("#quickViewOriginalPrice").textContent = formatPrice(
        product.originalPrice,
      );
      $("#quickViewOriginalPrice").style.display = "inline";
    } else {
      $("#quickViewOriginalPrice").style.display = "none";
    }
    // Stars
    const starsContainer = $("#quickViewStars");
    const fullStars = Math.floor(product.rating);
    const halfStar = product.rating % 1 >= 0.5;
    let starsHtml = "";
    for (let i = 0; i < fullStars; i++)
      starsHtml += '<i class="fas fa-star"></i>';
    if (halfStar) starsHtml += '<i class="fas fa-star-half-alt"></i>';
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++)
      starsHtml += '<i class="far fa-star"></i>';
    starsContainer.innerHTML = starsHtml;
    $("#quickViewRatingCount").textContent = `(${product.reviews})`;
    $("#quickViewAddToCart").dataset.productId = product.id;
    $("#quickViewWishlist").dataset.productId = product.id;
    const modal = new bootstrap.Modal(
      document.getElementById("quickViewModal"),
    );
    modal.show();
  }

  showToast(message, type = "info") {
    const container = $("#toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `
      <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : type === "warning" ? "exclamation-triangle" : "info-circle"}"></i>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// ---------- Product Rendering & Filtering ----------
class ProductRenderer {
  constructor() {
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    $$(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(".filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        state.currentFilter = btn.dataset.filter;
        this.render();
      });
    });

    $$(".category-filter").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const cat = item.dataset.category;
        $$(".filter-btn").forEach((b) => b.classList.remove("active"));
        if (cat === "all") {
          $('.filter-btn[data-filter="all"]').classList.add("active");
        } else {
          $(`.filter-btn[data-filter="${cat}"]`)?.classList.add("active");
        }
        state.currentFilter = cat;
        this.render();
        document
          .getElementById("products")
          ?.scrollIntoView({ behavior: "smooth" });
      });
    });

    $("#sortSelect").addEventListener("change", (e) => {
      state.currentSort = e.target.value;
      this.render();
    });

    $("#searchInput").addEventListener(
      "input",
      debounce((e) => {
        state.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
        this.showSuggestions(state.searchQuery);
      }, 300),
    );

    $("#searchBtn").addEventListener("click", () => {
      const query = $("#searchInput").value.trim();
      if (query) {
        state.searchQuery = query.toLowerCase();
        this.render();
        document
          .getElementById("products")
          ?.scrollIntoView({ behavior: "smooth" });
      }
    });

    $("#resetFilters").addEventListener("click", () => {
      state.currentFilter = "all";
      state.searchQuery = "";
      $("#searchInput").value = "";
      $$(".filter-btn").forEach((b) => b.classList.remove("active"));
      $('.filter-btn[data-filter="all"]').classList.add("active");
      $("#sortSelect").value = "featured";
      state.currentSort = "featured";
      this.render();
    });
  }

  getFilteredAndSortedProducts() {
    let filtered = [...products];
    if (state.currentFilter !== "all") {
      filtered = filtered.filter((p) => p.category === state.currentFilter);
    }
    if (state.searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(state.searchQuery) ||
          p.description.toLowerCase().includes(state.searchQuery) ||
          p.category.toLowerCase().includes(state.searchQuery),
      );
    }
    switch (state.currentSort) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // featured: keep original order or by reviews
        filtered.sort((a, b) => b.reviews - a.reviews);
    }
    return filtered;
  }

  render() {
    const grid = $("#productsGrid");
    const emptyState = $("#emptyState");
    const productsToShow = this.getFilteredAndSortedProducts();

    if (productsToShow.length === 0) {
      grid.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }
    emptyState.style.display = "none";

    let html = "";
    productsToShow.forEach((product) => {
      const starsHtml = this.getStarsHtml(product.rating);
      const badgeHtml = product.badge
        ? `<div class="product-badge ${product.badge}">${product.badgeText}</div>`
        : "";
      const originalPriceHtml = product.originalPrice
        ? `<span class="original-price">${formatPrice(product.originalPrice)}</span>`
        : "";
      html += `
        <div class="col-xl-3 col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="${Math.random() * 200}">
          <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
              <img src="${product.image}" alt="${product.name}" loading="lazy" />
              <div class="product-actions">
                <button class="action-btn wishlist-btn" data-product-id="${product.id}" aria-label="Add to wishlist">
                  <i class="far fa-heart"></i>
                </button>
                <button class="action-btn view-btn" data-product-id="${product.id}" aria-label="Quick view">
                  <i class="far fa-eye"></i>
                </button>
              </div>
              ${badgeHtml}
            </div>
            <div class="product-info">
              <h5 class="product-title">${product.name}</h5>
              <p class="product-description">${product.description}</p>
              <div class="product-rating">
                <div class="stars">${starsHtml}</div>
                <span class="rating-count">(${product.reviews})</span>
              </div>
              <div class="product-price">
                <span class="current-price">${formatPrice(product.price)}</span>
                ${originalPriceHtml}
              </div>
              <button class="btn btn-primary w-100 add-to-cart" data-product-id="${product.id}">
                <i class="fas fa-shopping-cart me-2"></i>Add to Cart
              </button>
            </div>
          </div>
        </div>
      `;
    });
    grid.innerHTML = html;
    // Refresh AOS
    AOS.refresh();
  }

  getStarsHtml(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let stars = "";
    for (let i = 0; i < full; i++) stars += '<i class="fas fa-star"></i>';
    if (half) stars += '<i class="fas fa-star-half-alt"></i>';
    const empty = 5 - full - (half ? 1 : 0);
    for (let i = 0; i < empty; i++) stars += '<i class="far fa-star"></i>';
    return stars;
  }

  showSuggestions(query) {
    const container = $("#searchSuggestions");
    if (!container) return;
    if (query.length < 2) {
      container.classList.remove("show");
      return;
    }
    const matches = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query),
      )
      .slice(0, 5);
    if (matches.length === 0) {
      container.classList.remove("show");
      return;
    }
    let html = "";
    matches.forEach((product) => {
      html += `
        <div class="suggestion-item" data-id="${product.id}">
          <img src="${product.image}" alt="${product.name}" />
          <span>${product.name}</span>
        </div>
      `;
    });
    container.innerHTML = html;
    container.classList.add("show");
    // Bind click on suggestions
    $$(".suggestion-item", container).forEach((item) => {
      item.addEventListener("click", () => {
        const id = item.dataset.id;
        const product = products.find((p) => p.id === id);
        if (product) {
          $("#searchInput").value = product.name;
          container.classList.remove("show");
          state.searchQuery = product.name.toLowerCase();
          this.render();
          // open quick view maybe? or just navigate
        }
      });
    });
  }
}

// ---------- Newsletter Manager ----------
class NewsletterManager {
  constructor() {
    this.bindEvents();
  }
  bindEvents() {
    const form = $("#newsletterForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]').value;
        if (this.validateEmail(email)) {
          const btn = form.querySelector('button[type="submit"]');
          const original = btn.innerHTML;
          btn.innerHTML =
            '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
          btn.disabled = true;
          setTimeout(() => {
            btn.innerHTML = original;
            btn.disabled = false;
            form.reset();
            this.showToast("Thank you for subscribing!", "success");
          }, 1500);
        } else {
          this.showToast("Please enter a valid email address.", "error");
        }
      });
    }
  }
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  showToast(message, type) {
    // Reuse global toast
    const container = $("#toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `<i class="fas fa-check-circle"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// ---------- Scroll & UI Effects ----------
class ScrollManager {
  constructor() {
    this.bindEvents();
  }
  bindEvents() {
    // Smooth scroll for anchor links
    $$('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const targetId = anchor.getAttribute("href");
        if (targetId === "#") return;
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    // Back to top button
    const backToTop = $("#backToTop");
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        backToTop.classList.add("show");
      } else {
        backToTop.classList.remove("show");
      }
      // Navbar shadow on scroll
      const navbar = $("#mainNavbar");
      if (window.scrollY > 50) {
        navbar.style.boxShadow = "var(--shadow-lg)";
      } else {
        navbar.style.boxShadow = "var(--shadow)";
      }
    });
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

// ---------- Announcement Rotator ----------
class AnnouncementRotator {
  constructor() {
    this.items = $$(".announcement-text");
    this.currentIndex = 0;
    this.interval = setInterval(() => this.next(), 4000);
  }
  next() {
    this.items[this.currentIndex].classList.remove("active");
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.items[this.currentIndex].classList.add("active");
  }
}

// ---------- Countdown Timer ----------
class CountdownTimer {
  constructor() {
    this.endTime = new Date();
    this.endTime.setHours(this.endTime.getHours() + 24); // 24 hours from now
    this.start();
  }
  start() {
    const update = () => {
      const now = new Date();
      const diff = this.endTime - now;
      if (diff <= 0) {
        this.endTime = new Date();
        this.endTime.setHours(this.endTime.getHours() + 24);
        return update();
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      $("#countdownHours").textContent = String(hours).padStart(2, "0");
      $("#countdownMinutes").textContent = String(minutes).padStart(2, "0");
      $("#countdownSeconds").textContent = String(seconds).padStart(2, "0");
    };
    update();
    setInterval(update, 1000);
  }
}

// ---------- Preloader ----------
window.addEventListener("load", () => {
  setTimeout(() => {
    $("#preloader").classList.add("hidden");
  }, 500);
});

// ---------- Initialize Everything ----------
document.addEventListener("DOMContentLoaded", () => {
  // Initialize AOS
  AOS.init({
    duration: 800,
    easing: "ease-in-out",
    once: true,
    offset: 50,
  });

  // Initialize all managers
  new ThemeManager();
  new CartManager();
  new ProductRenderer();
  new NewsletterManager();
  new ScrollManager();
  new AnnouncementRotator();
  new CountdownTimer();

  // Close suggestions on outside click
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-box")) {
      $("#searchSuggestions")?.classList.remove("show");
    }
  });
});

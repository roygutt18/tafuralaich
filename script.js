/* ==============================================
   1. APP STATE
============================================== */
const state = {
  cart: [],
  isMenuOpen: false,
  isCartOpen: false,
  a11yMenuOpen: false,
  textSize: 1, // 1 to 5
  lastScrollY: 0
};

const dom = {
  // Navigation
  hamburger: document.getElementById('hamburger'),
  sideMenu: document.getElementById('sideMenu'),
  menuOverlay: document.getElementById('menuOverlay'),
  closeMenuBtn: document.getElementById('close-menu'),
  navLinks: document.querySelectorAll('.nav-link'),
  topbar: document.querySelector('.topbar'),

  // Cart
  cartTrigger: document.getElementById('cart-trigger'),
  cartDrawer: document.getElementById('cart-drawer'),
  cartOverlay: document.getElementById('cart-overlay'),
  closeCartBtn: document.getElementById('close-cart'),
  cartItemsContainer: document.getElementById('cart-items-container'),
  cartTotalAmount: document.getElementById('cart-total-amount'),
  cartCountBadge: document.querySelector('.cart-count'),
  addBtns: document.querySelectorAll('.btn-add-cart'),

  // Sections
  sectionsToReveal: document.querySelectorAll('.hero-content, .about-card, .product-card, .review-card, .contact-section, .timeline-item'), // Add timeline items here for generic reveal
  contactForm: document.querySelector('.contact-form'),

  // Timeline Specifics
  timelineContainer: document.querySelector('.timeline-container'),
  timelineLineProgress: document.querySelector('.timeline-line-progress'),
  timelineItems: document.querySelectorAll('.timeline-item'),

  // Accessibility
  a11yToggle: document.getElementById('a11y-toggle'),
  a11yMenu: document.getElementById('a11y-menu'),
  btnTextInc: document.getElementById('a11y-text-inc'),
  btnTextDec: document.getElementById('a11y-text-dec'),
  btnContrast: document.getElementById('a11y-contrast'),
  btnAnim: document.getElementById('a11y-anim'),
};

/* ==============================================
   2. INITIALIZATION
============================================== */
function init() {
  setupEventListeners();
  observeReveals();
  window.addEventListener('scroll', handleGlobalScroll);
  updateCartUI();
}

function setupEventListeners() {
  // Mobile Menu
  if (dom.hamburger) {
    dom.hamburger.addEventListener('click', toggleMenu);
    dom.menuOverlay.addEventListener('click', toggleMenu);
    dom.closeMenuBtn.addEventListener('click', toggleMenu);
    dom.navLinks.forEach(l => l.addEventListener('click', () => state.isMenuOpen && toggleMenu()));
  }

  // Cart
  if (dom.cartTrigger) {
    dom.cartTrigger.addEventListener('click', toggleCart);
    dom.cartOverlay.addEventListener('click', toggleCart);
    dom.closeCartBtn.addEventListener('click', toggleCart);
  }

  // Add to Cart Buttons
  dom.addBtns.forEach(btn => {
    btn.addEventListener('click', handleAddToCart);
  });
  if (dom.cartItemsContainer) {
    dom.cartItemsContainer.addEventListener('click', handleCartAction);
  }

  // Contact Form
  if (dom.contactForm) {
    dom.contactForm.addEventListener('submit', handleContactSubmit);
  }

  // Accessibility
  if (dom.a11yToggle) {
    dom.a11yToggle.addEventListener('click', () => {
      state.a11yMenuOpen = !state.a11yMenuOpen;
      dom.a11yMenu.classList.toggle('open', state.a11yMenuOpen);
    });

    dom.btnTextInc.addEventListener('click', () => changeTextSize(1));
    dom.btnTextDec.addEventListener('click', () => changeTextSize(-1));

    dom.btnContrast.addEventListener('click', () => {
      document.body.classList.toggle('a11y-contrast');
      dom.btnContrast.classList.toggle('active');
    });
    dom.btnAnim.addEventListener('click', () => {
      document.body.classList.toggle('a11y-no-anim');
      dom.btnAnim.classList.toggle('active');
      const icon = dom.btnAnim.querySelector('i');
      if (document.body.classList.contains('a11y-no-anim')) {
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
      } else {
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
      }
    });
  }
}

/* ==============================================
   3. GLOBAL SCROLL & BI-DIRECTIONAL LOGIC
============================================== */
function handleGlobalScroll() {
  const currentScrollY = window.scrollY;
  const isScrollingDown = currentScrollY > state.lastScrollY;
  state.lastScrollY = currentScrollY;

  // Header scroll
  if (currentScrollY > 20) {
    dom.topbar.classList.add('scrolled');
  } else {
    dom.topbar.classList.remove('scrolled');
  }

  // Timeline Fill
  updateTimelineProgress();
}

// 3.1 Timeline Progress Line
function updateTimelineProgress() {
  if (!dom.timelineContainer) return;

  const viewportHeight = window.innerHeight;
  const containerRect = dom.timelineContainer.getBoundingClientRect();
  const triggerPoint = viewportHeight * 0.6; // Line fills up to 60% of viewport

  // Start filling when container enters
  const totalHeight = dom.timelineContainer.clientHeight;
  const scrollPositions = Math.abs(containerRect.top - triggerPoint);

  // Simple math: Map container's position in viewport to %
  // We want 0% when top is at triggerPoint, 100% when bottom is at triggerPoint
  let percentage = 0;

  // If container top is above trigger (user is scrolling past it)
  if (containerRect.top < triggerPoint) {
    percentage = ((triggerPoint - containerRect.top) / totalHeight) * 100;
  }

  // Bi-directionally fill/unfill
  percentage = Math.max(0, Math.min(100, percentage));
  dom.timelineLineProgress.style.height = `${percentage}%`;

  // Also update Active state for Dots based on line
  dom.timelineItems.forEach(item => {
    const itemRect = item.getBoundingClientRect();
    if (itemRect.top < triggerPoint) {
      item.classList.add('active'); // Dot grows
    } else {
      item.classList.remove('active'); // Dot shrinks
    }
  });
}

// 3.2 Reveal Observer with Bi-Directional hints
function observeReveals() {
  // We actually use IntersectionObserver for "Enter View"
  // For directionality, we check scroll direction in the callback logic or CSS 
  // But CSS transitions don't natively know "scroll direction".
  // 
  // TRICK: We will re-use the standard Observer but toggling classes based on position

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;

      if (entry.isIntersecting) {
        // If we are scrolling UP, we might want a different animation?
        // The user asked for "Fade+SlideDown when scrolling UP" 

        // Since Observer is async, we check relative bounding rect to guess entry direction
        // Or simply rely on "isScrollingDown" state check?
        // State check is safer.

        if (state.lastScrollY > 0) { // Should be safe enough, but strictly "scrolling down" logic is better
          // If element is appearing, remove slide-down class to ensure default slide-up
          el.classList.remove('slide-down');
        }

        el.classList.add('active');

        // For timeline items, we want them to disappear if we scroll way past? 
        // User said "Appear and Dissapear".
        // Observer default behavior keeps them active once entered.
        // To support "Disappear", we need `else` block.
      } else {
        // Determine if we are above or below
        const rect = el.getBoundingClientRect();
        if (rect.top > window.innerHeight) {
          // It exited out the bottom (user scrolled UP)
          // Reset its state so it can animate in again
          el.classList.remove('active');
          el.classList.add('slide-down'); // Next time it appears, it will slide down?
          // Actually, if we scroll UP, it enters from TOP.
          // "Slide Down" implies translating from -Y to 0.
        }
        // If it exited out the top, we keep it active usually, unless user wants full replay.
      }
    });
  }, { threshold: 0.15 });

  dom.sectionsToReveal.forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}


/* ==============================================
   4. ACCESSIBILITY LOGIC
============================================== */
function changeTextSize(direction) {
  if (direction === 1) {
    if (state.textSize < 5) state.textSize++;
  } else {
    if (state.textSize > 1) state.textSize--;
  }

  // Apply scale to root
  document.documentElement.setAttribute('data-text-size', state.textSize);
}

function handleContactSubmit(e) {
  e.preventDefault();
  const btn = dom.contactForm.querySelector('button[type="submit"]');

  btn.textContent = 'שולח...';
  btn.style.opacity = '0.7';

  setTimeout(() => {
    dom.contactForm.innerHTML = `
            <div style="text-align:center; padding:40px;">
                <i class="fa-solid fa-check-circle" style="font-size:3rem; color:var(--clr-primary); margin-bottom:20px;"></i>
                <h3 style="margin-bottom:10px;">תודה רבה!</h3>
                <p>ההודעה שלך התקבלה בהצלחה. נחזור אלייך בהקדם.</p>
            </div>
        `;
  }, 1500);
}


/* ==============================================
   5. CART & MENU
============================================== */
function toggleMenu() {
  state.isMenuOpen = !state.isMenuOpen;
  const { sideMenu, menuOverlay } = dom;

  if (state.isMenuOpen) {
    sideMenu.style.right = '0';
    menuOverlay.style.opacity = '1';
    menuOverlay.style.pointerEvents = 'auto';
  } else {
    sideMenu.style.right = '-300px';
    menuOverlay.style.opacity = '0';
    menuOverlay.style.pointerEvents = 'none';
  }
}

function toggleCart() {
  state.isCartOpen = !state.isCartOpen;
  if (state.isCartOpen) {
    document.body.classList.add('cart-open');
  } else {
    document.body.classList.remove('cart-open');
  }
}

function handleAddToCart(e) {
  const card = e.target.closest('.product-card');
  const product = {
    id: card.dataset.id,
    name: card.dataset.name,
    price: parseFloat(card.dataset.price),
    img: card.dataset.img
  };

  const existing = state.cart.find(p => p.id === product.id);
  if (existing) {
    existing.qty++;
  } else {
    state.cart.push({ ...product, qty: 1 });
  }

  updateCartUI();
  if (!state.isCartOpen) toggleCart();
}

function handleCartAction(e) {
  const action = e.target.dataset.action;
  const id = e.target.closest('.cart-item')?.dataset.id;
  if (!action || !id) return;

  const item = state.cart.find(p => p.id === id);
  if (!item) return;

  if (action === 'increase') {
    item.qty++;
  } else if (action === 'decrease') {
    item.qty--;
    if (item.qty <= 0) state.cart = state.cart.filter(p => p.id !== id);
  } else if (action === 'remove') {
    state.cart = state.cart.filter(p => p.id !== id);
  }

  updateCartUI();
}

function updateCartUI() {
  const totalQty = state.cart.reduce((s, i) => s + i.qty, 0);
  dom.cartCountBadge.textContent = totalQty;

  const totalVal = state.cart.reduce((s, i) => s + (i.price * i.qty), 0);
  dom.cartTotalAmount.textContent = `₪${totalVal.toFixed(2)}`;

  if (state.cart.length === 0) {
    dom.cartItemsContainer.innerHTML = `
      <div style="text-align:center; padding: 40px; color:#999;">
        <i class="fa-solid fa-basket-shopping" style="font-size:2rem; margin-bottom:10px;"></i>
        <p>העגלה ריקה</p>
      </div>`;
    return;
  }

  dom.cartItemsContainer.innerHTML = state.cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <img src="${item.img}" alt="${item.name}">
      <div style="flex:1;">
        <div style="font-weight:700;">${item.name}</div>
        <div style="font-size:0.9rem; color:#666;">₪${item.price}</div>
        <div style="display:flex; align-items:center; gap:10px; margin-top:5px;">
           <button class="qty-btn" style="border:1px solid #ddd; width:24px;" data-action="decrease">-</button>
           <span>${item.qty}</span>
           <button class="qty-btn" style="border:1px solid #ddd; width:24px;" data-action="increase">+</button>
           <button style="margin-right:auto; color:red; font-size:0.8rem;" data-action="remove">הסר</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Start
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

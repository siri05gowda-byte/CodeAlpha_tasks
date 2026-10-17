
const API_URL = "http://localhost:5000/api";

function getCart() {
  return JSON.parse(localStorage.getItem("sFashionCart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("sFashionCart", JSON.stringify(cart));
  updateCartCount();
}

function getWishlist() {
  return JSON.parse(localStorage.getItem("sFashionWishlist") || "[]");
}

function updateCartCount() {
  const count = getCart().reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const badge = document.getElementById("cartCount");
  if (badge) badge.textContent = count;
}

function money(amount) {
  return "₹" + Number(amount || 0).toLocaleString("en-IN");
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(localStorage.getItem("sFashionToken")
        ? { Authorization: `Bearer ${localStorage.getItem("sFashionToken")}` }
        : {}),
      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

function productCard(product) {
  const wishlist = getWishlist();
  const isSaved = wishlist.includes(product._id);
  const discount = product.discount ||
    (product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : 0);

  return `
    <article class="product-card">
      <div class="product-image-wrap">
        <a href="product.html?id=${encodeURIComponent(product._id)}">
          <img
            class="product-image"
            src="${escapeHTML(product.image)}"
            alt="${escapeHTML(product.name)}"
            loading="lazy"
            onerror="this.onerror=null;this.src='https://placehold.co/500x650/f4eeee/722f45?text=S+Fashion'"
          >
        </a>
        ${discount > 0 ? `<span class="product-badge">${discount}% OFF</span>` : ""}
        <button
          class="wishlist-button"
          type="button"
          data-wishlist="${escapeHTML(product._id)}"
          aria-label="Toggle wishlist"
        >${isSaved ? "♥" : "♡"}</button>
      </div>
      <div class="product-info">
        <p class="product-brand">${escapeHTML(product.brand || "S Fashion")}</p>
        <a href="product.html?id=${encodeURIComponent(product._id)}">
          <h3 class="product-name">${escapeHTML(product.name)}</h3>
        </a>
        <div class="product-prices">
          <span class="product-price">${money(product.price)}</span>
          ${product.originalPrice > product.price
            ? `<span class="original-price">${money(product.originalPrice)}</span>`
            : ""}
          ${discount > 0
            ? `<span class="discount-text">${discount}% off</span>`
            : ""}
        </div>
        <button
          class="add-to-cart"
          type="button"
          data-add-cart="${escapeHTML(product._id)}"
          ${Number(product.stock) <= 0 ? "disabled" : ""}
        >${Number(product.stock) <= 0 ? "OUT OF STOCK" : "ADD TO BAG"}</button>
      </div>
    </article>
  `;
}

async function loadFeaturedProducts() {
  const container = document.getElementById("featuredProducts");
  if (!container) return;

  try {
    const data = await apiRequest("/products?sort=popular");
    const products = data.products || data;

    if (!Array.isArray(products) || products.length === 0) {
      container.innerHTML =
        '<p class="empty-message">Products will appear here once the catalogue is loaded.</p>';
      return;
    }

    container.innerHTML = products.slice(0, 8).map(productCard).join("");
  } catch (error) {
    container.innerHTML = `
      <p class="empty-message">
        Could not load products. Please make sure the backend and MongoDB are running.
      </p>
    `;
  }
}

async function searchProducts(query) {
  window.location.href = `products.html?search=${encodeURIComponent(query)}`;
}

document.addEventListener("click", async event => {
  const addButton = event.target.closest("[data-add-cart]");

  if (addButton) {
    const id = addButton.dataset.addCart;

    try {
      const data = await apiRequest(`/products/${encodeURIComponent(id)}`);
      const product = data.product || data;

      const cart = getCart();
      const existing = cart.find(item => item.productId === product._id);

      if (existing) {
        if (existing.quantity >= Math.min(Number(product.stock), 20)) {
          alert("You have reached the available stock limit.");
          return;
        }
        existing.quantity += 1;
      } else {
        if (Number(product.stock) <= 0) {
          alert("This product is out of stock.");
          return;
        }

        cart.push({
          productId: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity: 1,
          size: "",
          color: ""
        });
      }

      saveCart(cart);
      const originalText = addButton.textContent;
      addButton.textContent = "ADDED TO BAG ✓";
      setTimeout(() => {
        addButton.textContent = originalText;
      }, 1200);
    } catch (error) {
      alert(error.message || "Unable to add product to bag.");
    }
  }

  const wishlistButton = event.target.closest("[data-wishlist]");

  if (wishlistButton) {
    const id = wishlistButton.dataset.wishlist;
    const wishlist = getWishlist();
    const index = wishlist.indexOf(id);

    if (index >= 0) {
      wishlist.splice(index, 1);
      wishlistButton.textContent = "♡";
    } else {
      wishlist.push(id);
      wishlistButton.textContent = "♥";
    }

    localStorage.setItem("sFashionWishlist", JSON.stringify(wishlist));
  }

  if (event.target.closest("#copyCoupon")) {
    try {
      await navigator.clipboard.writeText("WELCOME10");
      alert("Coupon WELCOME10 copied!");
    } catch {
      alert("Use coupon code WELCOME10 at checkout.");
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  loadFeaturedProducts();

  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");

  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", event => {
      event.preventDefault();
      const query = searchInput.value.trim();
      if (query) searchProducts(query);
    });
  }
});

/* S FASHION: QUICK ADD-TO-BAG SIZE AND COLOUR POPUP */
(function () {
  if (document.getElementById("quickAddModal")) return;

  const style = document.createElement("style");
  style.textContent = `
    #quickAddModal {
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(25,15,20,.55);
      display: none; align-items: center; justify-content: center;
      padding: 18px;
    }
    #quickAddModal.open { display: flex; }
    .quick-add-box {
      background: #fffaf8; width: 100%; max-width: 430px;
      padding: 26px; border-radius: 4px; max-height: 90vh;
      overflow-y: auto; color: #24141b;
    }
    .quick-add-box h2 { margin: 0 0 8px; }
    .quick-add-box button { cursor: pointer; }
    .quick-options { display:flex; gap:9px; flex-wrap:wrap; margin:12px 0 20px; }
    .quick-option {
      border:1px solid #e7dadd; background:white; padding:11px 15px;
    }
    .quick-option.selected { border:2px solid #762d47; background:#f6e9ed; }
    .quick-option:disabled { opacity:.35; text-decoration:line-through; cursor:not-allowed; }
    .quick-add-main {
      width:100%; border:0; padding:15px; color:white;
      background:#762d47; font-weight:bold;
    }
    .quick-add-close { float:right; border:0; background:none; font-size:24px; }
    #quickAddMessage { color:#a12636; margin:12px 0; }
  `;
  document.head.appendChild(style);

  const modal = document.createElement("div");
  modal.id = "quickAddModal";
  modal.innerHTML = `
    <section class="quick-add-box">
      <button type="button" class="quick-add-close" aria-label="Close">&times;</button>
      <p class="eyebrow">S FASHION / QUICK ADD</p>
      <h2 id="quickAddName">Choose your options</h2>
      <p id="quickAddPrice"></p>
      <strong>Select size</strong>
      <div id="quickAddSizes" class="quick-options"></div>
      <strong>Select colour</strong>
      <div id="quickAddColors" class="quick-options"></div>
      <p id="quickAddMessage" role="status"></p>
      <button type="button" class="quick-add-main" id="quickAddConfirm">ADD TO BAG</button>
    </section>`;
  document.body.appendChild(modal);

  let product = null;
  let selectedSize = "";
  let selectedColor = "";

  const close = () => modal.classList.remove("open");

  modal.querySelector(".quick-add-close").addEventListener("click", close);
  modal.addEventListener("click", e => {
    if (e.target === modal) close();
  });

  function drawOptions(container, values, selected, onSelect, isSize) {
    container.innerHTML = "";

    (values.length ? values : ["Standard"]).forEach(value => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quick-option" + (value === selected ? " selected" : "");
      button.textContent = value;

      // The current database only stores total stock, not stock per size/colour.
      // Only disable all choices if the whole product is out of stock.
      button.disabled = Number(product.stock) <= 0;
      button.addEventListener("click", () => onSelect(value));
      container.appendChild(button);
    });
  }

  function refreshOptions() {
    drawOptions(
      document.getElementById("quickAddSizes"),
      product.sizes || [],
      selectedSize,
      value => {
        selectedSize = value;
        refreshOptions();
      },
      true
    );

    drawOptions(
      document.getElementById("quickAddColors"),
      product.colors || [],
      selectedColor,
      value => {
        selectedColor = value;
        refreshOptions();
      },
      false
    );

    document.getElementById("quickAddMessage").textContent =
      Number(product.stock) <= 0 ? "Out of stock" : "";
  }

  async function openForProduct(id) {
    try {
      const result = await apiRequest("/products/" + encodeURIComponent(id));
      product = result.product || result;

      if (!product || !product._id) throw new Error("Product not found.");

      selectedSize = (product.sizes || [])[0] || "Standard";
      selectedColor = (product.colors || [])[0] || "Standard";

      document.getElementById("quickAddName").textContent = product.name;
      document.getElementById("quickAddPrice").textContent =
        "₹" + Number(product.price).toLocaleString("en-IN");

      refreshOptions();
      modal.classList.add("open");
    } catch (error) {
      alert(error.message || "Unable to load product options.");
    }
  }

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-add-cart]");
    if (!button) return;

    // Intercept the existing quick-add button before its old handler adds
    // a product without asking for options.
    event.preventDefault();
    event.stopImmediatePropagation();

    const card = button.closest("[data-product-id]");
    const id = button.dataset.addCart || (card && card.dataset.productId);

    if (!id) {
      alert("Could not identify this product. Please open its details page.");
      return;
    }

    openForProduct(id);
  }, true);

  document.getElementById("quickAddConfirm").addEventListener("click", () => {
    if (!product) return;

    const message = document.getElementById("quickAddMessage");

    if (Number(product.stock) <= 0) {
      message.textContent = "Sorry, this product is out of stock.";
      return;
    }

    const cart = getCart();
    const existing = cart.find(item =>
      String(item.productId || item._id || item.id) === String(product._id) &&
      (item.size || "") === selectedSize &&
      (item.color || item.colour || "") === selectedColor
    );

    const currentQuantity = existing ? Number(existing.quantity || 1) : 0;

    if (currentQuantity >= Number(product.stock)) {
      message.textContent = "You have reached the available stock limit.";
      return;
    }

    if (existing) {
      existing.quantity = currentQuantity + 1;
    } else {
      cart.push({
        productId: product._id,
        name: product.name,
        price: Number(product.price),
        image: product.image,
        quantity: 1,
        size: selectedSize,
        color: selectedColor
      });
    }

    if (typeof setCart === "function") setCart(cart);
    else if (typeof saveCart === "function") saveCart(cart);
    else localStorage.setItem("sFashionCart", JSON.stringify(cart));

    if (typeof updateCartCount === "function") updateCartCount();

    close();
    alert("Added to bag!");
  });
})();

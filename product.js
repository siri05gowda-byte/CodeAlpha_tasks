
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("productDetails");
  if (!container) return;

  const id = new URLSearchParams(location.search).get("id");
  if (!id) {
    container.textContent = "Product not found.";
    return;
  }

  try {
    const result = await apiRequest("/products/" + encodeURIComponent(id));
    const p = result.product || result;
    const variants = p.variants || [];

    const colors = p.colors?.length ? p.colors : ["Standard"];
    const sizes = p.sizes?.length ? p.sizes : ["Standard"];
    const patterns = p.patterns?.length ? p.patterns : [];

    let color = colors[0];
    let size = sizes[0];
    let pattern = patterns[0] || "Standard";

    const safe = value => escapeHTML(String(value ?? ""));
    const money = value => Number(value || 0).toLocaleString("en-IN");

    function currentVariant() {
      return variants.find(v =>
        v.color === color &&
        v.size === size &&
        (v.pattern || "Standard") === pattern
      );
    }

    function currentImage() {
      const v = currentVariant();

      if (v?.image) return v.image;

      const imageEntry = (p.images || []).find(img =>
        img && typeof img === "object" &&
        String(img.color || "").toLowerCase() === color.toLowerCase() &&
        (!img.pattern || img.pattern === pattern) &&
        img.url
      );

      return imageEntry?.url || p.image;
    }

    function currentStock() {
      const v = currentVariant();
      return Number(v ? v.stock : p.stock || 0);
    }

    container.innerHTML = `
      <div class="product-detail-layout">
        <div class="product-detail-image">
          <img id="variantImage" src="${safe(p.image)}"
               alt="${safe(p.name)}"
               style="width:100%;height:auto;object-fit:cover">
        </div>
        <div class="product-detail-info">
          <p class="eyebrow">${safe(p.brand || "S EDIT")}</p>
          <h1>${safe(p.name)}</h1>
          <p class="product-detail-price">
            ₹${money(p.price)}
            <del>₹${money(p.originalPrice)}</del>
            ${p.discount ? `<span>${safe(p.discount)}% OFF</span>` : ""}
          </p>
          <p>${safe(p.description)}</p>
          <p><strong>Size</strong></p>
          <div id="sizeOptions" class="quick-options"></div>
          <p><strong>Colour</strong></p>
          <div id="colorOptions" class="quick-options"></div>
          ${patterns.length ? `
            <p><strong>Pattern</strong></p>
            <div id="patternOptions" class="quick-options"></div>
          ` : ""}
          <p id="variantStock" role="status"></p>
          <p id="variantMessage" role="status"></p>
          <button class="form-button" id="addVariantToBag" type="button">
            ADD TO BAG
          </button>
          <button class="form-button" id="variantWishlist"
                  type="button" style="margin-top:12px">
            ♡ ADD TO WISHLIST
          </button>
        </div>
      </div>`;

    const message = document.getElementById("variantMessage");

    function renderOptions(elementId, values, selected, change) {
      const box = document.getElementById(elementId);
      if (!box) return;

      box.innerHTML = "";

      values.forEach(value => {
        const button = document.createElement("button");
        button.type = "button";
        button.className =
          "quick-option" + (value === selected ? " selected" : "");
        button.textContent = value;

        button.addEventListener("click", () => {
          change(value);
          renderAll();
        });

        box.appendChild(button);
      });
    }

    function renderAll() {
      renderOptions("sizeOptions", sizes, size, v => size = v);
      renderOptions("colorOptions", colors, color, v => color = v);
      renderOptions("patternOptions", patterns, pattern, v => pattern = v);

      const v = currentVariant();
      const stock = currentStock();
      const imageUrl = currentImage();

      const img = document.getElementById("variantImage");
      img.src = imageUrl;
      img.alt = `${p.name} - ${color} - ${pattern}`;

      document.getElementById("variantStock").textContent =
        stock > 0 ? `${stock} available` : "Out of stock";

      document.getElementById("addVariantToBag").disabled = stock <= 0;

      if (v) {
        message.textContent = stock <= 0
          ? "This combination is out of stock."
          : "";
      } else {
        message.textContent = "";
      }
    }

    renderAll();

    document.getElementById("addVariantToBag").addEventListener("click", () => {
      const stock = currentStock();

      if (stock <= 0) {
        message.textContent = "This combination is out of stock.";
        return;
      }

      const cart = getCart();
      const v = currentVariant();

      const existing = cart.find(item =>
        String(item.productId || item._id || item.id) === String(p._id) &&
        (item.size || "Standard") === size &&
        (item.color || "Standard") === color &&
        (item.pattern || "Standard") === pattern
      );

      const quantity = Number(existing?.quantity || 0);

      if (quantity >= stock) {
        message.textContent = "Available stock limit reached.";
        return;
      }

      if (existing) {
        existing.quantity = quantity + 1;
      } else {
        cart.push({
          productId: p._id,
          name: p.name,
          price: Number(p.price),
          image: currentImage(),
          quantity: 1,
          size,
          color,
          pattern
        });
      }

      if (typeof setCart === "function") setCart(cart);
      else localStorage.setItem("sFashionCart", JSON.stringify(cart));

      if (typeof updateCartCount === "function") updateCartCount();

      message.textContent = "Added to bag successfully!";
    });

    document.getElementById("variantWishlist").addEventListener("click", () => {
      const wishlist = getWishlist();
      const productId = String(p._id);
      const exists = wishlist.some(item =>
        String(typeof item === "object"
          ? item.productId || item._id
          : item) === productId
      );

      const updated = exists
        ? wishlist.filter(item =>
            String(typeof item === "object"
              ? item.productId || item._id
              : item) !== productId
          )
        : [...wishlist, productId];

      localStorage.setItem("sFashionWishlist", JSON.stringify(updated));
      message.textContent = exists
        ? "Removed from wishlist."
        : "Added to wishlist!";
    });
  } catch (error) {
    container.textContent = error.message || "Unable to load this product.";
  }
});


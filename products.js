
const shopState = {
  products: [],
  category: new URLSearchParams(location.search).get("category") || "",
  search: new URLSearchParams(location.search).get("search") || "",
  sort: new URLSearchParams(location.search).get("sort") || "popular",
  price: "all"
};

async function loadShopProducts() {
  const container = document.getElementById("shopProducts");
  const count = document.getElementById("productCount");
  const message = document.getElementById("shopMessage");

  try {
    const data = await apiRequest("/products");
    shopState.products = Array.isArray(data)
      ? data
      : data.products || [];

    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.value = shopState.search;

    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) sortSelect.value = shopState.sort;

    const categoryRadio = document.querySelector(
      `input[name="category"][value="${CSS.escape(shopState.category)}"]`
    );

    if (categoryRadio) categoryRadio.checked = true;

    renderShopProducts();
  } catch (error) {
    container.innerHTML = `
      <p class="empty-message">
        Unable to load products. Start the backend and make sure MongoDB is running.
      </p>
    `;
    count.textContent = "Products unavailable";
    message.textContent = error.message;
  }
}

function renderShopProducts() {
  const container = document.getElementById("shopProducts");
  const count = document.getElementById("productCount");
  const title = document.getElementById("shopTitle");

  if (!container) return;

  let products = [...shopState.products];

  if (shopState.category) {
    products = products.filter(product =>
      product.category?.toLowerCase() === shopState.category.toLowerCase() ||
      product.gender?.toLowerCase() === shopState.category.toLowerCase()
    );
  }

  if (shopState.search) {
    const query = shopState.search.toLowerCase();

    products = products.filter(product =>
      [
        product.name,
        product.description,
        product.category,
        product.gender,
        product.subcategory,
        product.brand
      ].some(value => String(value || "").toLowerCase().includes(query))
    );
  }

  if (shopState.price !== "all") {
    products = products.filter(product => {
      const price = Number(product.price);

      if (shopState.price === "0-500") return price < 500;
      if (shopState.price === "500-1000") return price >= 500 && price <= 1000;
      if (shopState.price === "1000-2000") return price > 1000 && price <= 2000;
      if (shopState.price === "2000-5000") return price > 2000 && price <= 5000;
      if (shopState.price === "5000+") return price > 5000;

      return true;
    });
  }

  switch (shopState.sort) {
    case "low":
      products.sort((a, b) => a.price - b.price);
      break;
    case "high":
      products.sort((a, b) => b.price - a.price);
      break;
    case "discount":
      products.sort((a, b) => (b.discount || 0) - (a.discount || 0));
      break;
    case "new":
      products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      break;
    default:
      products.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }

  if (title) {
    title.textContent = shopState.search
      ? `Search: ${shopState.search}`
      : shopState.category
        ? `Shop ${shopState.category}`
        : "Shop All Products";
  }

  count.textContent = `${products.length} product${products.length === 1 ? "" : "s"} found`;

  container.innerHTML = products.length
    ? products.map(productCard).join("")
    : '<p class="empty-message">No products found. Try another category or search.</p>';

  const message = document.getElementById("shopMessage");
  if (message) message.textContent = "";
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("shopProducts")) return;

  loadShopProducts();

  document.querySelectorAll('input[name="category"]').forEach(input => {
    input.addEventListener("change", () => {
      shopState.category = input.value;
      const url = new URL(location.href);

      if (input.value) {
        url.searchParams.set("category", input.value);
      } else {
        url.searchParams.delete("category");
      }

      history.replaceState({}, "", url);
      renderShopProducts();
    });
  });

  document.querySelectorAll('input[name="price"]').forEach(input => {
    input.addEventListener("change", () => {
      shopState.price = input.value;
      renderShopProducts();
    });
  });

  document.getElementById("sortSelect")?.addEventListener("change", event => {
    shopState.sort = event.target.value;
    renderShopProducts();
  });

  document.getElementById("searchForm")?.addEventListener("submit", event => {
    event.preventDefault();

    const query = document.getElementById("searchInput").value.trim();
    shopState.search = query;

    const url = new URL(location.href);

    if (query) {
      url.searchParams.set("search", query);
    } else {
      url.searchParams.delete("search");
    }

    history.replaceState({}, "", url);
    renderShopProducts();
  });
});

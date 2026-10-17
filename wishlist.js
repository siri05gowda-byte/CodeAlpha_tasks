
async function loadWishlist() {
  const container = document.getElementById("wishlistProducts");
  if (!container) return;

  const ids = getWishlist();

  if (ids.length === 0) {
    container.innerHTML = `
      <p class="empty-message">
        Your wishlist is empty. Find something you love!
      </p>
      <a class="primary-button" href="products.html">EXPLORE PRODUCTS</a>
    `;
    return;
  }

  try {
    const results = await Promise.all(
      ids.map(async id => {
        try {
          const data = await apiRequest(
            `/products/${encodeURIComponent(id)}`
          );
          return data.product || data;
        } catch {
          return null;
        }
      })
    );

    const products = results.filter(Boolean);

    if (products.length === 0) {
      container.innerHTML = `
        <p class="empty-message">No saved products are available right now.</p>
        <a class="primary-button" href="products.html">SHOP NOW</a>
      `;
      return;
    }

    container.innerHTML = products.map(productCard).join("");
  } catch (error) {
    container.innerHTML = `
      <p class="empty-message">Unable to load your wishlist. Please try again.</p>
    `;
  }
}

document.addEventListener("DOMContentLoaded", loadWishlist);

document.addEventListener("click", event => {
  const wishlistButton = event.target.closest("[data-wishlist]");
  if (!wishlistButton) return;

  setTimeout(loadWishlist, 0);
});


function renderCartPage() {
  const container = document.getElementById("cartItems");
  const subtotalElement = document.getElementById("cartSubtotal");
  const totalElement = document.getElementById("cartTotal");

  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <p class="empty-message">Your shopping bag is empty.</p>
      <a class="primary-button" href="products.html">START SHOPPING</a>
    `;

    if (subtotalElement) subtotalElement.textContent = money(0);
    if (totalElement) totalElement.textContent = money(0);
    return;
  }

  container.innerHTML = cart.map((item, index) => `
    <article class="cart-item">
      <img
        src="${escapeHTML(item.image || "")}"
        alt="${escapeHTML(item.name)}"
        onerror="this.onerror=null;this.src='https://placehold.co/200x250/f4eeee/722f45?text=S+Fashion'"
      >

      <div class="cart-item-details">
        <h3>${escapeHTML(item.name)}</h3>
        <p>${money(item.price)}</p>
        ${item.size ? `<p>Size: ${escapeHTML(item.size)}</p>` : ""}
        ${item.color ? `<p>Colour: ${escapeHTML(item.color)}</p>` : ""}

        <div class="quantity-control">
          <button type="button" data-decrease="${index}" aria-label="Decrease quantity">−</button>
          <span>${Number(item.quantity)}</span>
          <button type="button" data-increase="${index}" aria-label="Increase quantity">+</button>
        </div>

        <button type="button" class="remove-button" data-remove="${index}">
          REMOVE
        </button>
      </div>

      <strong>${money(Number(item.price) * Number(item.quantity))}</strong>
    </article>
  `).join("");

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  if (subtotalElement) subtotalElement.textContent = money(subtotal);
  if (totalElement) totalElement.textContent = money(subtotal);
}

document.addEventListener("click", event => {
  const decrease = event.target.closest("[data-decrease]");
  const increase = event.target.closest("[data-increase]");
  const remove = event.target.closest("[data-remove]");

  const cart = getCart();

  if (decrease) {
    const index = Number(decrease.dataset.decrease);

    if (cart[index]) {
      cart[index].quantity -= 1;

      if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
      }

      saveCart(cart);
      renderCartPage();
    }
  }

  if (increase) {
    const index = Number(increase.dataset.increase);

    if (cart[index]) {
      if (cart[index].quantity >= 20) {
        alert("Maximum quantity is 20 per item.");
        return;
      }

      cart[index].quantity += 1;
      saveCart(cart);
      renderCartPage();
    }
  }

  if (remove) {
    cart.splice(Number(remove.dataset.remove), 1);
    saveCart(cart);
    renderCartPage();
  }
});

document.addEventListener("DOMContentLoaded", renderCartPage);

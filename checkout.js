
let appliedCoupon = "";

function getCheckoutTotals() {
  const cart = getCart();
  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  let discount = 0;

  if (appliedCoupon === "WELCOME10" && subtotal >= 500) {
    discount = Math.round(subtotal * 0.10);
  } else if (appliedCoupon === "SAVE200" && subtotal >= 1500) {
    discount = 200;
  }

  return {
    subtotal,
    discount,
    total: Math.max(0, subtotal - discount)
  };
}

function renderCheckoutSummary() {
  const container = document.getElementById("checkoutItems");
  if (!container) return;

  const cart = getCart();

  container.innerHTML = cart.length
    ? cart.map(item => `
        <div class="summary-row">
          <span>${escapeHTML(item.name)} × ${Number(item.quantity)}</span>
          <strong>${money(Number(item.price) * Number(item.quantity))}</strong>
        </div>
      `).join("")
    : `<p class="empty-message">Your bag is empty. <a class="text-link" href="products.html">Shop now</a></p>`;

  const totals = getCheckoutTotals();

  document.getElementById("checkoutSubtotal").textContent = money(totals.subtotal);
  document.getElementById("checkoutDiscount").textContent = money(totals.discount);
  document.getElementById("checkoutTotal").textContent = money(totals.total);
}

document.addEventListener("DOMContentLoaded", () => {
  renderCheckoutSummary();

  const couponForm = document.getElementById("couponForm");
  const couponInput = document.getElementById("couponCode");
  const couponMessage = document.getElementById("couponMessage");

  couponForm?.addEventListener("submit", event => {
    event.preventDefault();

    const code = couponInput.value.trim().toUpperCase();
    const subtotal = getCheckoutTotals().subtotal;

    if (code === "WELCOME10" && subtotal >= 500) {
      appliedCoupon = code;
    } else if (code === "SAVE200" && subtotal >= 1500) {
      appliedCoupon = code;
    } else {
      appliedCoupon = "";
      couponMessage.textContent =
        "Invalid coupon or minimum order amount not reached.";
      couponMessage.className = "form-message error";
      renderCheckoutSummary();
      return;
    }

    couponMessage.textContent = `Coupon ${code} applied successfully!`;
    couponMessage.className = "form-message success";
    renderCheckoutSummary();
  });

  document.getElementById("checkoutForm")?.addEventListener("submit", async event => {
    event.preventDefault();

    const message = document.getElementById("checkoutMessage");
    const button = document.getElementById("placeOrderButton");
    const cart = getCart();

    if (!localStorage.getItem("sFashionToken")) {
      message.textContent = "Please log in before placing your order.";
      message.className = "form-message error";
      return;
    }

    if (cart.length === 0) {
      message.textContent = "Your shopping bag is empty.";
      message.className = "form-message error";
      return;
    }

    const form = event.currentTarget;

    if (!form.reportValidity()) return;

    const formData = new FormData(form);

    const shippingAddress = {
      fullName: String(formData.get("fullName")).trim(),
      phone: String(formData.get("phone")).trim(),
      addressLine: String(formData.get("addressLine")).trim(),
      city: String(formData.get("city")).trim(),
      state: String(formData.get("state")).trim(),
      pincode: String(formData.get("pincode")).trim()
    };

    const paymentMethod = formData.get("paymentMethod");
    const totals = getCheckoutTotals();

    button.disabled = true;
    button.textContent = "PLACING ORDER...";

    try {
      const result = await apiRequest("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.productId,
            quantity: Number(item.quantity),
            size: item.size || "",
            color: item.color || ""
          })),
          shippingAddress,
          paymentMethod,
          couponCode: appliedCoupon
        })
      });

      localStorage.removeItem("sFashionCart");
      localStorage.removeItem("sFashionLastCoupon");

      message.textContent =
        `Order placed successfully! Order ID: ${result.order._id}`;
      message.className = "form-message success";

      button.textContent = "ORDER PLACED ✓";

      setTimeout(() => {
        window.location.href = "orders.html";
      }, 1800);
    } catch (error) {
      message.textContent = error.message || "Unable to place your order.";
      message.className = "form-message error";
      button.disabled = false;
      button.textContent = "PLACE ORDER";
    }
  });
});

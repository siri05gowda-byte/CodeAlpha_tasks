
document.addEventListener("DOMContentLoaded", async () => {
  const list = document.getElementById("ordersList");
  const message = document.getElementById("ordersMessage");

  if (!localStorage.getItem("sFashionToken")) {
    message.textContent = "Please log in to view your orders.";
    list.innerHTML = '<a href="login.html?redirect=orders.html">Log in</a>';
    return;
  }

  try {
    const result = await apiRequest("/orders/my-orders");
    const orders = result.orders || [];

    if (orders.length === 0) {
      list.innerHTML = `
        <div class="form-card">
          <h2>No orders yet</h2>
          <p>Your shopping journey starts here.</p>
          <a class="form-button" href="products.html">Start Shopping</a>
        </div>`;
      return;
    }

    list.innerHTML = orders.map(order => `
      <article class="form-card" style="margin-bottom:20px">
        <h2>Order #${escapeHTML(order._id.slice(-8).toUpperCase())}</h2>
        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
        <p><strong>Status:</strong> ${escapeHTML(order.orderStatus || "Placed")}</p>
        <p><strong>Payment:</strong> ${escapeHTML(order.paymentMethod || "COD")}</p>
        <p><strong>Payment status:</strong> ${escapeHTML(order.paymentStatus || "Pending")}</p>
        <div style="margin:15px 0">
          ${(order.items || []).map(item => `
            <p>${escapeHTML(item.name)} × ${Number(item.quantity)}</p>
          `).join("")}
        </div>
        <h3>Total: ${money(order.total)}</h3>
      </article>
    `).join("");
  } catch (error) {
    message.textContent = error.message || "Unable to load orders. Please try again.";
    message.className = "form-message error";
    list.innerHTML = "";
  }
});

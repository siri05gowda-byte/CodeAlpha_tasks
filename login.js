
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = document.getElementById("loginMessage");
    const button = document.getElementById("loginButton");

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    button.disabled = true;
    button.textContent = "LOGGING IN...";
    message.textContent = "";

    try {
      const result = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      if (!result.token) {
        throw new Error("Login response did not include a token.");
      }

      localStorage.setItem("sFashionToken", result.token);

      if (result.user) {
        localStorage.setItem("sFashionUser", JSON.stringify(result.user));
      }

      message.textContent = "Login successful! Redirecting...";
      message.className = "form-message success";

      window.location.replace("index.html");
    } catch (error) {
      message.textContent = error.message || "Login failed. Please check your details.";
      message.className = "form-message error";
      button.disabled = false;
      button.textContent = "LOG IN";
    }
  });
});

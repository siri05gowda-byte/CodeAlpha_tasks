
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = document.getElementById("registerMessage");
    const button = document.getElementById("registerButton");

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phoneField = document.getElementById("phone");
    const phone = phoneField ? phoneField.value.trim() : "";
    const password = document.getElementById("password").value;

    button.disabled = true;
    button.textContent = "CREATING ACCOUNT...";
    message.textContent = "";

    try {
      const registration = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, phone, password })
      });

      let result = registration;

      // If registration did not return a login token,
      // log in automatically using the new account.
      if (!result.token) {
        result = await apiRequest("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password })
        });
      }

      if (!result.token) {
        throw new Error("Account created. Please log in to continue.");
      }

      localStorage.setItem("sFashionToken", result.token);

      if (result.user) {
        localStorage.setItem("sFashionUser", JSON.stringify(result.user));
      }

      message.textContent = "Success! Taking you to the homepage...";
      message.className = "form-message success";

      window.location.replace("index.html");
    } catch (error) {
      message.textContent =
        error.message || "Could not complete registration. Please try again.";
      message.className = "form-message error";
      button.disabled = false;
      button.textContent = "CREATE ACCOUNT";
    }
  });
});

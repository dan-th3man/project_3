document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("submitLoginBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const username = document.getElementById("loginUsername").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      // Require both fields to be filled
      if (!username || !password) {
        alert("Please enter both username and password.");
        return;
      }

      fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            localStorage.setItem("currentUser", JSON.stringify({
              username: data.username,
              email: data.email,
            }));
            // Hide all pages first
            document.querySelectorAll(".page").forEach(p => p.classList.add("d-none"));
            // Show only the rules page (or quiz page if you want to skip rules)
            document.getElementById("rulesPage").classList.remove("d-none");
          }
        })
        .catch(err => console.error("Login error:", err));
    });
  }
});
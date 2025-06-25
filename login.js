document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("submitLoginBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const username = document.getElementById("loginUsername").value;
      const password = document.getElementById("loginPassword").value;

      fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            localStorage.setItem("currentUser", data.username);
            document.getElementById("loginPage").classList.add("d-none");
            document.getElementById("questionCountPage").classList.remove("d-none");
          } else {
            alert("Login failed! Check your credentials.");
          }
        })
        .catch(err => console.error("Login error:", err));
    });
  }
});

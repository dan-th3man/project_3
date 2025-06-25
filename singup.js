document.addEventListener("DOMContentLoaded", () => {
  const signupBtn = document.getElementById("submitSignupBtn");

  if (signupBtn) {
    signupBtn.addEventListener("click", () => {
      const username = document.getElementById("signupUsername").value;
      const password = document.getElementById("signupPassword").value;

      fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            alert("Signup successful! Please log in.");
            document.getElementById("signupPage").classList.add("d-none");
            document.getElementById("loginPage").classList.remove("d-none");
          } else {
            alert("Signup failed! User may already exist.");
          }
        })
        .catch(err => console.error("Signup error:", err));
    });
  }
});

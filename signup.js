document.addEventListener("DOMContentLoaded", () => {
  const signupBtn = document.getElementById("submitSignupBtn");

  if (signupBtn) {
    signupBtn.addEventListener("click", () => {
      const username = document.getElementById("signupUsername").value;
      const password = document.getElementById("signupPassword").value;
      const email = document.getElementById("signupEmail").value;
      
      if(!username || !password || !email) {
        alert("Please fill in all fields.");
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
      }

      fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email })
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

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  const msg = document.getElementById("msg");
  if (res.ok) {
    msg.style.color = "green";
    msg.innerText = "Login successful!";
    // Save token (if returned) and redirect
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1000);
  } else {
    msg.innerText = data.message || "Login failed!";
  }
});
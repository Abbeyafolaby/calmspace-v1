// backend url
const API_URL = "http://localhost:3000/auth"; 

// Register
if (document.getElementById("registerForm")) {
document.getElementById("registerForm").addEventListener("submit", async (e) => {
e.preventDefault();
const fullName = document.getElementById("fullName").value;
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, email, password })
});
const data = await res.json();
document.getElementById("msg").innerText = JSON.stringify(data);
});
}

// Login
if (document.getElementById("loginForm")) {
document.getElementById("loginForm").addEventListener("submit", async (e) => {
e.preventDefault();
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
});
const data = await res.json();

if (data.status === "pending-otp") {
    localStorage.setItem("userId", data.userId);
    window.location.href = "otp.html";
} else {
    document.getElementById("msg").innerText = JSON.stringify(data);
}
});
}

// Verify OTP
if (document.getElementById("otpForm")) {
document.getElementById("otpForm").addEventListener("submit", async (e) => {
e.preventDefault();
const otp = document.getElementById("otp").value;
const userId = localStorage.getItem("userId");

const res = await fetch(`${API_URL}/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, otp })
});
const data = await res.json();

if (data.status === "success") {
    localStorage.setItem("token", data.token);
    document.getElementById("msg").innerText = "Login successful! Token saved.";
} else {
    document.getElementById("msg").innerText = JSON.stringify(data);
}
});
}

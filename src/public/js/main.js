// backend url
const API_URL = "http://localhost:3000/auth"; 

// Register
if (document.getElementById("registerForm")) {
  document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const msgDiv = document.getElementById("msg");

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password })
      });
      
      const data = await res.json();
      
      if (res.ok && data.status === "pending-email-verification") {
        // Redirect to email verification page
        window.location.href = `otp.html?userId=${data.userId}&source=email&email=${encodeURIComponent(email)}`;
      } else {
        msgDiv.innerHTML = `<div style="color: red; padding: 10px; background: #ffebee; border-radius: 4px;">${data.error || 'Registration failed'}</div>`;
      }
    } catch (err) {
      msgDiv.innerHTML = '<div style="color: red; padding: 10px; background: #ffebee; border-radius: 4px;">Network error. Please try again.</div>';
    }
  });
}

// Login
if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const msgDiv = document.getElementById("msg");

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();

      if (res.ok && data.status === "success") {
        // Direct login success - save token and redirect
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        msgDiv.innerHTML = '<div style="color: green; padding: 10px; background: #e8f5e8; border-radius: 4px;">✅ Login successful! Redirecting...</div>';
        setTimeout(() => {
          window.location.href = "auth-success.html";
        }, 1500);
      } else if (data.status === "email-not-verified") {
        // Redirect to verification page
        window.location.href = `otp.html?userId=${data.userId}&source=email&email=${encodeURIComponent(email)}`;
      } else {
        msgDiv.innerHTML = `<div style="color: red; padding: 10px; background: #ffebee; border-radius: 4px;">${data.error || 'Login failed'}</div>`;
      }
    } catch (err) {
      msgDiv.innerHTML = '<div style="color: red; padding: 10px; background: #ffebee; border-radius: 4px;">Network error. Please try again.</div>';
    }
  });
}

// This is now only for email verification (no login OTP)
if (document.getElementById("otpForm")) {
  document.getElementById("otpForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const otp = document.getElementById("otp").value;
    
    // Get userId from URL params (set by registration or login redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');

    if (!userId) {
      document.getElementById("msg").innerHTML = '<div style="color: red;">Session expired. Please try again.</div>';
      return;
    }

    try {
      const res = await fetch(`${API_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp })
      });
      
      const data = await res.json();

      if (res.ok && data.status === "email-verified") {
        document.getElementById("msg").innerHTML = '<div style="color: green;">✅ Email verified successfully!</div>';
        
        // Check if this was from Google OAuth
        const source = urlParams.get('source');
        if (source === 'google') {
          document.getElementById("msg").innerHTML += '<div style="margin-top: 10px;">Completing your Google sign-in...</div>';
          setTimeout(() => {
            window.location.href = `/auth/google/complete?userId=${userId}`;
          }, 2000);
        } else {
          document.getElementById("msg").innerHTML += '<div style="margin-top: 10px;">You can now <a href="login.html">login to your account</a>.</div>';
        }
      } else {
        document.getElementById("msg").innerHTML = `<div style="color: red;">${data.error || 'Verification failed'}</div>`;
      }
    } catch (err) {
      document.getElementById("msg").innerHTML = '<div style="color: red;">Network error. Please try again.</div>';
    }
  });
}

// Google OAuth login function
function loginWithGoogle() {
  window.location.href = '/auth/google';
}
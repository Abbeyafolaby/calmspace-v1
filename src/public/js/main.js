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

    // Clear previous messages
    msgDiv.innerHTML = '';

    // Basic frontend validation
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      msgDiv.innerHTML = '<div style="color: red; padding: 10px; background: #ffebee; border-radius: 4px;">All fields are required</div>';
      return;
    }

    if (password.length < 8) {
      msgDiv.innerHTML = '<div style="color: red; padding: 10px; background: #ffebee; border-radius: 4px;">Password must be at least 8 characters long</div>';
      return;
    }

    // Show loading message
    msgDiv.innerHTML = '<div style="color: blue; padding: 10px; background: #e3f2fd; border-radius: 4px;">Creating your account...</div>';

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

    // Clear previous messages
    msgDiv.innerHTML = '';

    // Basic frontend validation
    if (!email.trim() || !password.trim()) {
      msgDiv.innerHTML = '<div style="color: red; padding: 10px; background: #ffebee; border-radius: 4px;">Email and password are required</div>';
      return;
    }

    // Show loading message
    msgDiv.innerHTML = '<div style="color: blue; padding: 10px; background: #e3f2fd; border-radius: 4px;">Signing you in...</div>';

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
          window.location.href = "dashboard.html";
        }, 1500);
      } else if (data.status === "pending-otp") {
        // Need OTP verification for login
        window.location.href = `otp.html?userId=${data.userId}&source=login&email=${encodeURIComponent(email)}`;
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

// OTP Verification (for both email verification and login OTP)
if (document.getElementById("otpForm")) {
  document.getElementById("otpForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const otp = document.getElementById("otp").value;
    const msgDiv = document.getElementById("msg");
    
    // Get parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const source = urlParams.get('source');

    if (!userId) {
      msgDiv.innerHTML = '<div style="color: red; padding: 10px; background: #ffebee; border-radius: 4px;">Session expired. Please try again.</div>';
      return;
    }

    if (!otp || otp.length !== 6) {
      msgDiv.innerHTML = '<div style="color: red; padding: 10px; background: #ffebee; border-radius: 4px;">Please enter a valid 6-digit code</div>';
      return;
    }

    // Show loading message
    msgDiv.innerHTML = '<div style="color: blue; padding: 10px; background: #e3f2fd; border-radius: 4px;">Verifying code...</div>';

    try {
      const res = await fetch(`${API_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp })
      });
      
      const data = await res.json();

      if (res.ok) {
        if (data.status === "email-verified") {
          msgDiv.innerHTML = '<div style="color: green; padding: 10px; background: #e8f5e8; border-radius: 4px;">✅ Email verified successfully!</div>';
          
          if (source === 'google') {
            msgDiv.innerHTML += '<div style="margin-top: 10px; color: blue;">Completing your Google sign-in...</div>';
            setTimeout(() => {
              window.location.href = `/auth/google/complete?userId=${userId}`;
            }, 2000);
          } else {
            msgDiv.innerHTML += '<div style="margin-top: 10px;">You can now <a href="login.html" style="color: #059669;">login to your account</a>.</div>';
          }
        } else if (data.status === "success") {
          // Login OTP verified - save token and redirect to dashboard
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          
          msgDiv.innerHTML = '<div style="color: green; padding: 10px; background: #e8f5e8; border-radius: 4px;">✅ Login successful! Redirecting to dashboard...</div>';
          setTimeout(() => {
            window.location.href = "dashboard.html";
          }, 1500);
        }
      } else {
        msgDiv.innerHTML = `<div style="color: red; padding: 10px; background: #ffebee; border-radius: 4px;">${data.error || 'Verification failed'}</div>`;
      }
    } catch (err) {
      msgDiv.innerHTML = '<div style="color: red; padding: 10px; background: #ffebee; border-radius: 4px;">Network error. Please try again.</div>';
    }
  });
}

// Google OAuth login function
function loginWithGoogle() {
  window.location.href = '/auth/google';
}

// Resend OTP function
async function resendOtp() {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId');
  const msgDiv = document.getElementById("msg");
  
  if (!userId) {
    msgDiv.innerHTML = '<div style="color: red; padding: 10px; background: #ffebee; border-radius: 4px;">Session expired. Please try again.</div>';
    return;
  }

      try {
    const res = await fetch(`${API_URL}/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      msgDiv.innerHTML = '<div style="color: green; padding: 10px; background: #e8f5e8; border-radius: 4px;">✅ New verification code sent!</div>';
    } else {
      msgDiv.innerHTML = `<div style="color: red; padding: 10px; background: #ffebee; border-radius: 4px;">${data.error || 'Failed to resend code'}</div>`;
    }
  } catch (err) {
    msgDiv.innerHTML = '<div style="color: red; padding: 10px; background: #ffebee; border-radius: 4px;">Network error. Please try again.</div>';
  }
}
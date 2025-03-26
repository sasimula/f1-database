// Firebase configuration with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyB_-zwWXdr4kkMc8GbC2skE71NBKFATZ9k",
  authDomain: "f1-database-8a56b.firebaseapp.com",
  projectId: "f1-database-8a56b",
  storageBucket: "f1-database-8a56b.firebasestorage.app",
  messagingSenderId: "1053647560139",
  appId: "1:1053647560139:web:601f72b25f120ded112a4e",
  measurementId: "G-RTQ3D0L5XM"
};

// Initialize Firebase
if (!firebase.apps || !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // if already initialized
}

// Get auth instance
const auth = firebase.auth();

// Function to set cookie
function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + encodeURIComponent(value || "") + expires + "; path=/";
  console.log(`Cookie set: ${name}`);
}

// Function to get cookie
function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
}

// Function to erase cookie
function eraseCookie(name) {
  document.cookie = name + '=; Max-Age=-99999999; path=/';
  console.log(`Cookie erased: ${name}`);
}

// Handle login form submission - REAL FIREBASE AUTHENTICATION
function loginUser(email, password) {
  console.log(`Attempting login for: ${email}`);
  
  // Use actual Firebase Authentication
  return auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("Login successful, getting token...");
      // Get ID token
      return userCredential.user.getIdToken();
    })
    .then((token) => {
      console.log("Got token, saving to cookies...");
      // Save token to cookie
      setCookie('firebase_token', token, 7);
      // Also save email for easier identification
      setCookie('email', email, 7);
      return token;
    });
}

// Handle registration form submission - REAL FIREBASE REGISTRATION
function registerUser(email, password) {
  console.log(`Attempting registration for: ${email}`);
  
  // Use actual Firebase Authentication
  return auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("Registration successful, getting token...");
      // Get ID token
      return userCredential.user.getIdToken();
    })
    .then((token) => {
      console.log("Got token, saving to cookies...");
      // Save token to cookie
      setCookie('firebase_token', token, 7);
      // Also save email for easier identification
      setCookie('email', email, 7);
      return token;
    });
}

// Handle logout - REAL FIREBASE LOGOUT
function logoutUser() {
  console.log("Logging out user");
  
  // Clear all cookies before sign out
  eraseCookie('firebase_token');
  eraseCookie('email');

  // Now sign out from Firebase
  return auth.signOut()
    .then(() => {
      console.log("Logout successful, cookies cleared");
      
      // Force reload the page to ensure UI is updated
      setTimeout(() => {
        window.location.href = '/login?logged_out=true';
      }, 100);
    })
    .catch((error) => {
      console.error("Logout error:", error);
      
      // Force reload even if there's an error
      window.location.href = '/login?logged_out=true';
    });
}

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log("Checking auth state...");
  
  // Check if on login page
  if (window.location.pathname === '/login') {
    // Clear auth state on login page
    eraseCookie('firebase_token');
    eraseCookie('email');
    auth.signOut().catch(e => console.log("Error signing out:", e));
    return;
  }
  
  const authStatusElement = document.getElementById('authStatus');
  const loginElement = document.querySelector('a[href="/login"]');
  const logoutElement = document.querySelector('a[href="/auth/logout"]');
  
  // Check for server-side authentication first
  const serverAuthState = document.body.getAttribute('data-auth') === 'true';
  const emailCookie = getCookie('email');
  
  // Update UI based on cookies
  if (emailCookie) {
    // We have an email cookie, assume logged in
    if (authStatusElement) {
      authStatusElement.textContent = `Logged in as: ${emailCookie}`;
    }
    
    if (loginElement) {
      loginElement.style.display = 'none';
    }
    
    if (logoutElement) {
      logoutElement.style.display = 'block';
    }
    
    // Show elements that require authentication
    document.querySelectorAll('.auth-required').forEach(el => {
      el.style.display = 'block';
    });
  }
  
  // Listen for auth state changes
  auth.onAuthStateChanged((user) => {
    console.log("Auth state changed:", user ? `User: ${user.email}` : "No user");
    
    if (user) {
      // User is signed in
      if (authStatusElement) {
        authStatusElement.textContent = `Logged in as: ${user.email}`;
      }
      
      if (loginElement) {
        loginElement.style.display = 'none';
      }
      
      if (logoutElement) {
        logoutElement.style.display = 'block';
      }
      
      // Get and save the token
      user.getIdToken().then(token => {
        setCookie('firebase_token', token, 7);
        setCookie('email', user.email, 7);
      });
      
      // Show elements that require authentication
      document.querySelectorAll('.auth-required').forEach(el => {
        el.style.display = 'block';
      });
    } else {
      // Only update UI if we don't have an email cookie
      // This prevents flickering during page loads
      if (!emailCookie) {
        // User is signed out
        if (authStatusElement) {
          authStatusElement.textContent = 'Not logged in';
        }
        
        if (loginElement) {
          loginElement.style.display = 'block';
        }
        
        if (logoutElement) {
          logoutElement.style.display = 'none';
        }
        
        // Hide elements that require authentication
        document.querySelectorAll('.auth-required').forEach(el => {
          el.style.display = 'none';
        });
      }
    }
  });
  
  console.log("Firebase Auth JS loaded successfully");
  
  // Add click handler to logout button
  if (logoutElement) {
    logoutElement.addEventListener('click', function(e) {
      // Only prevent default if we need to handle it with JS
      if (typeof logoutUser === 'function') {
        e.preventDefault();
        logoutUser();
      }
    });
  }
});
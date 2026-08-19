const SUPABASE_URL = "https://mtlfnjywizezxxohxaoh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_krTsE9XrzVBi8M9OXULhCg_MhDfyBKc";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// Elements
const modal = document.getElementById("authModal");
const open = document.getElementById("openAuth");
const close = document.getElementById("closeAuth");
const closeBtn = document.getElementById("closeAuthButton");

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const switchMode = document.getElementById("switchMode");

const form = document.getElementById("authForm");
const title = document.getElementById("authTitle");
const subtitle = document.getElementById("authSubtitle");
const submit = document.getElementById("authSubmit");
const msg = document.getElementById("authMessage");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

let mode = "login";

// -----------------------------
// Messages
// -----------------------------

function showMessage(text, success = false) {
  msg.textContent = text;
  msg.style.color = success ? "#34745c" : "#b14d45";
}

// -----------------------------
// Auth mode
// -----------------------------

function setMode(newMode) {
  mode = newMode;

  const isSignup = mode === "signup";

  loginTab.classList.toggle("active", !isSignup);
  signupTab.classList.toggle("active", isSignup);

  title.textContent = isSignup ? "Create account" : "Log in";

  subtitle.textContent = isSignup
    ? "Create your Northline account with your email."
    : "Welcome back. Enter your email and password.";

  submit.textContent = isSignup ? "Create account" : "Log in";

  passwordInput.autocomplete = isSignup
    ? "new-password"
    : "current-password";

  switchMode.textContent = isSignup
    ? "Already have an account? Log in"
    : "Don’t have an account? Create one";

  showMessage("");
}

// -----------------------------
// Modal
// -----------------------------

function openModal() {
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

// -----------------------------
// Session / button
// -----------------------------

async function updateAuthButton() {
  try {
    const {
      data: { session }
    } = await supabaseClient.auth.getSession();

    if (session) {
      open.textContent = "Log out";
      open.dataset.loggedIn = "true";
    } else {
      open.textContent = "Log in";
      open.dataset.loggedIn = "false";
    }
  } catch (error) {
    console.error("Session error:", error);

    open.textContent = "Log in";
    open.dataset.loggedIn = "false";
  }
}

// -----------------------------
// Main auth button
// -----------------------------

open.addEventListener("click", async () => {
  if (open.dataset.loggedIn === "true") {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      showMessage(error.message);
      return;
    }

    await updateAuthButton();
    return;
  }

  openModal();
});

// -----------------------------
// Close modal
// -----------------------------

close.addEventListener("click", closeModal);
closeBtn.addEventListener("click", closeModal);

// -----------------------------
// Tabs
// -----------------------------

loginTab.addEventListener("click", () => {
  setMode("login");
});

signupTab.addEventListener("click", () => {
  setMode("signup");
});

switchMode.addEventListener("click", () => {
  setMode(mode === "login" ? "signup" : "login");
});

// -----------------------------
// Submit
// -----------------------------

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  showMessage("");

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showMessage("Please enter your email and password.");
    return;
  }

  submit.disabled = true;

  submit.textContent =
    mode === "signup"
      ? "Creating…"
      : "Logging in…";

  try {

    // =========================
    // CREATE ACCOUNT
    // =========================

    if (mode === "signup") {

      const {
        data,
        error
      } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo:
            "https://sasha123469.github.io/northline-demo/"
        }
      });

      console.log("SIGN UP:", data);
      console.log("SIGN UP ERROR:", error);

      if (error) {
        throw error;
      }

      if (data.session) {

        showMessage(
          "Account created. You are now logged in.",
          true
        );

        await updateAuthButton();

        setTimeout(() => {
          closeModal();
        }, 700);

      } else {

        showMessage(
          "Account created. Check your email to confirm your address.",
          true
        );
      }

    }

    // =========================
    // LOG IN
    // =========================

    else {

      const {
        data,
        error
      } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

      console.log("LOGIN:", data);
      console.log("LOGIN ERROR:", error);

      if (error) {
        throw error;
      }

      showMessage(
        "Logged in successfully.",
        true
      );

      await updateAuthButton();

      setTimeout(() => {
        closeModal();
      }, 500);
    }

  } catch (error) {

    console.error("AUTH ERROR:", error);

    let text = error?.message || "Something went wrong.";

    if (text.toLowerCase().includes("email not confirmed")) {
      text = "Please confirm your email address first.";
    }

    if (text.toLowerCase().includes("invalid login credentials")) {
      text = "Incorrect email or password.";
    }

    showMessage(text);

  } finally {

    submit.disabled = false;

    submit.textContent =
      mode === "signup"
        ? "Create account"
        : "Log in";
  }
});

// -----------------------------
// Auth state
// -----------------------------

supabaseClient.auth.onAuthStateChange(
  (event, session) => {

    console.log("AUTH EVENT:", event);

    if (session) {
      open.textContent = "Log out";
      open.dataset.loggedIn = "true";
    } else {
      open.textContent = "Log in";
      open.dataset.loggedIn = "false";
    }
  }
);

// -----------------------------
// Initial state
// -----------------------------

setMode("login");
updateAuthButton();
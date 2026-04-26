(() => {
  console.log("APP START");

  // ─────────────────────────────
  // SUPABASE
  // ─────────────────────────────
  const sb = window.supabase.createClient(
    "https://axjzwtfzbwmemgxucucq.supabase.co",
    "sb_publishable_P6qpYiubu2DRGLjdHkDnqA_TMSUC08G"
  );

  // ─────────────────────────────
  // CHECK AUTH (LOCK APP)
  // ─────────────────────────────
  async function checkAuth() {
    const { data } = await sb.auth.getUser();

    if (!data.user) {
      console.log("NOT LOGGED IN");

      // Show modal
      const modal = document.getElementById("upgrade-modal");
      if (modal) {
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
      }

      // Lock UI
      document.body.classList.add("locked");
    } else {
      console.log("LOGGED IN");

      document.body.classList.remove("locked");

      // Update button to show username
      const btn = document.getElementById("auth-btn");
      if (btn) {
        btn.innerText = data.user.email.split("@")[0];
      }
    }
  }

  // Run on load
  window.addEventListener("load", checkAuth);

  // ─────────────────────────────
  // OPEN MODAL (manual click)
  // ─────────────────────────────
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("#auth-btn");

    if (btn) {
      console.log("BUTTON CLICKED");

      const modal = document.getElementById("upgrade-modal");
      if (modal) {
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
      }
    }
  });

  // ─────────────────────────────
  // CLOSE MODAL
  // ─────────────────────────────
  window.closeModal = function () {
    const modal = document.getElementById("upgrade-modal");
    if (modal) modal.style.display = "none";
    document.body.style.overflow = "";
  };

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") window.closeModal();
  });

  // ─────────────────────────────
  // AUTH (LOGIN → SIGNUP)
  // ─────────────────────────────
  document.addEventListener("submit", async (e) => {
    if (!e.target || e.target.id !== "auth-form") return;

    e.preventDefault();
    console.log("FORM SUBMIT");

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorBox = document.getElementById("auth-error");

    errorBox.style.display = "none";

    try {
      // LOGIN FIRST
      const login = await sb.auth.signInWithPassword({
        email,
        password,
      });

      if (!login.error) {
        console.log("Logged in");

        alert("Logged in 🚀");
        window.location.href = "/dashboard.html";
        return;
      }

      // SIGNUP
      const signup = await sb.auth.signUp({
        email,
        password,
      });

      if (signup.error) {
        const msg = signup.error.message.toLowerCase();

        if (msg.includes("rate")) {
          errorBox.textContent =
            "Too many attempts. Wait 30–60 seconds.";
        } else if (msg.includes("exists")) {
          errorBox.textContent =
            "Account exists. Try logging in.";
        } else {
          errorBox.textContent = signup.error.message;
        }

        errorBox.style.display = "block";
        return;
      }

      console.log("Account created");

      alert("Account created 🎉");
      window.location.href = "/dashboard.html";

    } catch (err) {
      console.error(err);
      errorBox.textContent = "Something went wrong";
      errorBox.style.display = "block";
    }
  });
})();
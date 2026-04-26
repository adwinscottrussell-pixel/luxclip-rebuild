<script>
  console.log("JS LOADED");

  const sb = supabase.createClient(
    "https://axjzwtfzbwmemgxucucq.supabase.co",
    "sb_publishable_P6qpYiubu2DRGLjdHkDnqA_TMSUC08G"
  );

  let user = null;

  async function init() {
    console.log("INIT RUNNING");

    const { data } = await sb.auth.getSession();
    user = data.session?.user;

    if (!user) {
      window.location.href = "/";
      return;
    }

    document.getElementById("userEmail").innerText =
      "Logged in as: " + user.email;

    loadVideos();
  }

  async function loadVideos() {
    const { data } = await sb
      .from("videos")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const container = document.getElementById("videos");
    container.innerHTML = "";

    data.forEach((video) => {
      const div = document.createElement("div");

      div.innerHTML = `
        <p><b>${video.prompt}</b></p>
        <p>Status: ${video.status}</p>
        <p>${video.script || ""}</p>
        <hr>
      `;

      container.appendChild(div);
    });
  }

  async function generate() {
    console.log("GENERATE CLICKED");

    const prompt = document.getElementById("prompt").value;

    if (!prompt) {
      alert("Enter a prompt");
      return;
    }

    const { data: profile } = await sb
      .from("profiles")
      .select("is_pro")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      alert("Profile not found");
      return;
    }

    const { data: existing } = await sb
      .from("videos")
      .select("id")
      .eq("user_id", user.id);

    if (!profile.is_pro && existing.length >= 3) {
      alert("🚀 Free limit reached");
      upgrade();
      return;
    }

    const { data: video } = await sb
      .from("videos")
      .insert([
        {
          user_id: user.id,
          prompt: prompt,
          status: "processing"
        }
      ])
      .select()
      .single();

    const res = await fetch("/api/generate-script", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();

    await sb
      .from("videos")
      .update({
        script: data.script,
        status: "script_ready"
      })
      .eq("id", video.id);

    loadVideos();
  }

  async function upgrade() {
    console.log("UPGRADE CLICKED");

    if (!user) {
      alert("Not logged in");
      return;
    }

    const res = await fetch("/api/create-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: user.id
      })
    });

    let data;

    try {
      data = await res.json();
    } catch {
      alert("Server error");
      return;
    }

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || "Checkout failed");
    }
  }

  async function logout() {
    await sb.auth.signOut();
    window.location.href = "/";
  }

  init();
</script>
async function generate() {
  console.log("GENERATE CLICKED");

  const prompt = document.getElementById("prompt").value;

  if (!prompt) {
    alert("Enter a prompt");
    return;
  }

  // 🔒 Count how many videos user has
  const { data: existing, error } = await sb
    .from("videos")
    .select("id")
    .eq("user_id", user.id);

  if (error) {
    console.error(error);
    alert("Error checking usage");
    return;
  }

  // 🚨 LIMIT = 3
  if (existing.length >= 3) {
    alert("🚀 Free limit reached.\nUpgrade to continue.");

    // 👉 OPTIONAL: auto open upgrade
    upgrade();

    return;
  }

  // Create new video
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

  // Call AI
  const res = await fetch("/api/generate-script", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt })
  });

  const data = await res.json();

  // Update DB
  await sb
    .from("videos")
    .update({
      script: data.script,
      status: "script_ready"
    })
    .eq("id", video.id);

  loadVideos();
}
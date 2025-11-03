export const config = {
  api: { bodyParser: false, responseLimit: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }

  try {
    const upstream = await fetch(
      "https://litterbox.catbox.moe/resources/internals/api.php",
      {
        method: "POST",
        headers: {
          "content-type": req.headers["content-type"] || "application/octet-stream",
        },
        body: req,
      }
    );

    const text = await upstream.text();
    if (upstream.ok && /^https?:\/\//.test(text.trim())) {
      return res.status(200).json({ success: true, link: text.trim() });
    }
    return res.status(500).json({ success: false, error: "Upload failed", raw: text });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}

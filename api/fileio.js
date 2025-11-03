export const config = {
  api: { bodyParser: false, responseLimit: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }

  try {
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    const expires = searchParams.get("expires") || "1d";

    const upstream = await fetch(`https://www.file.io/?expires=${encodeURIComponent(expires)}`, {
      method: "POST",
      headers: {
        "content-type": req.headers["content-type"] || "application/octet-stream",
      },
      body: req,
    });

    const text = await upstream.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { success: false, raw: text }; }

    res.status(upstream.status).json(data);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}

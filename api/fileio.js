export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }

  try {
    const url = new URL(req.url, "http://localhost");
    const expires = url.searchParams.get("expires") || "1d";

    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const bodyBuffer = Buffer.concat(chunks);

    const upstream = await fetch(`https://file.io/?expires=${encodeURIComponent(expires)}`, {
      method: "POST",
      headers: { "content-type": req.headers["content-type"] || "application/octet-stream" },
      body: bodyBuffer,
    });

    const data = await upstream.json().catch(() => ({ success: false }));
    res.status(upstream.status).json(data);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}

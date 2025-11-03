export const config = {
  api: { bodyParser: false, responseLimit: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const contentType = req.headers["content-type"] || "multipart/form-data";

    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const bodyBuffer = Buffer.concat(chunks);

    const upstream = await fetch(
      "https://litterbox.catbox.moe/resources/internals/api.php",
      {
        method: "POST",
        headers: {
          "content-type": contentType,
          "content-length": String(bodyBuffer.length),
        },
        body: bodyBuffer,
      }
    );

    const text = await upstream.text();
    const okLink = text.trim();

    if (upstream.ok && /^https?:\/\//.test(okLink)) {
      return res.status(200).json({ success: true, link: okLink });
    }

    return res
      .status(upstream.status || 500)
      .json({ success: false, error: "Upload failed", raw: text });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}

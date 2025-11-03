import { useState } from "react";
import { db, serverTimestamp } from "../app/firebase";
import { collection, addDoc } from "firebase/firestore";
import "../styles/UploadBox.css";

const mapExpiry = (e) => {
  if (e === "1h" || e === "6h") return e === "6h" ? "12h" : "1h";
  if (e === "1d") return "24h";
  return "24h";
};

export default function UploadBox({ roomId, disabled }) {
  const [expiry, setExpiry] = useState("1d");
  const [busy, setBusy] = useState(false);

  const uploadOne = async (file) => {
    if (file.size > 200 * 1024 * 1024) {
      alert("ไฟล์ใหญ่เกิน 200MB");
      return;
    }

    const litterTime = mapExpiry(expiry);
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("time", litterTime);
    form.append("fileToUpload", file, file.name);

    const resp = await fetch(`/api/litter`, { method: "POST", body: form });
    const data = await resp.json().catch(() => ({ success: false }));

    if (!resp.ok || !data?.success || !data?.link) {
      console.error("❌ litterbox failed:", { status: resp.status, data });
      alert("อัปโหลดไป Litterbox ไม่สำเร็จ");
      return;
    }

    await addDoc(collection(db, "rooms", roomId, "files"), {
      filename: file.name,
      downloadURL: data.link,
      sizeBytes: file.size,
      createdAt: serverTimestamp(),
      expiry: litterTime,
      provider: "litterbox",
    });
    console.log("✅ addDoc OK:", file.name);
  };

  const onPick = async (e) => {
    const files = e.target.files;
    if (!files || disabled || busy) return;

    setBusy(true);
    try {
      for (const f of files) await uploadOne(f);
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  return (
    <div className={`upload-box ${disabled ? "disabled" : ""}`}>
      <div className="upload-header">
        <label htmlFor="expiry" className="expiry-label">Expire after:</label>
        <select
          id="expiry"
          className="expiry-select"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          disabled={disabled || busy}
        >
          <option value="1h">1 hour</option>
          <option value="6h">6 hours</option>
          <option value="1d">1 day</option>
        </select>
      </div>

      <label className="upload-input-wrapper">
        <div className="upload-text">{busy ? "Uploading..." : "Click or drag to upload files"}</div>
        <input type="file" multiple onChange={onPick} className="upload-input" disabled={disabled || busy} />
      </label>
    </div>
  );
}

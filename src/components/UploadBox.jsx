import { db, serverTimestamp } from "../app/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useState } from "react";
import "../styles/UploadBox.css";

export default function UploadBox({ roomId, disabled }) {
  const [expiry, setExpiry] = useState("1d");

  const onPick = async (e) => {
    const files = e.target.files;
    if (!files || disabled) return;

    for (const f of files) {
      try {
        if (f.size > 200 * 1024 * 1024) {
          alert("ไฟล์ใหญ่เกิน 200MB");
          continue;
        }

        const form = new FormData();
        form.append("file", f);
        console.log("📤 upload -> file.io:", f.name, "expiry:", expiry);

        const resp = await fetch(`/api/fileio?expires=${expiry}`, {
          method: "POST",
          body: form,
        });

        const data = await resp.json();
        console.log("📦 file.io response:", data);

        if (!resp.ok || !data?.success || !data?.link) {
          console.error("❌ file.io failed:", { status: resp.status, data });
          alert("อัปโหลดไป file.io ไม่สำเร็จ");
          continue;
        }

        console.log("🧩 roomId:", roomId);
        await addDoc(collection(db, "rooms", roomId, "files"), {
          filename: f.name,
          downloadURL: data.link,
          sizeBytes: f.size,
          createdAt: serverTimestamp(),
          expiry,
          provider: "file.io",
        });

        console.log("✅ addDoc OK:", f.name);
      } catch (err) {
        console.error("🔥 upload error:", err);
        alert("เกิดข้อผิดพลาดระหว่างอัปโหลด");
      }
    }

    e.target.value = "";
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
          disabled={disabled}
        >
          <option value="1h">1 hour</option>
          <option value="6h">6 hours</option>
          <option value="1d">1 day</option>
        </select>
      </div>

      <label className="upload-input-wrapper">
        <div className="upload-text">Click or drag to upload files</div>
        <input
          type="file"
          multiple
          onChange={onPick}
          className="upload-input"
          disabled={disabled}
        />
      </label>
    </div>
  );
}

import { doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../app/firebase";
import QRCode from "qrcode";
import { v4 as uuid } from "uuid";
import { useState } from "react";
import "../styles/CreateRoomButton.css";

export default function CreateRoomButton() {
  const [qr, setQr] = useState(null);
  const [joinUrl, setJoinUrl] = useState("");

  const createRoom = async () => {
    const id = uuid();
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(now.toMillis() + 24 * 60 * 60 * 1000);

    await setDoc(doc(db, "rooms", id), {
      createdAt: now,
      expiresAt,
      closed: false,
    });

    const url = `${window.location.origin}/room/${id}`;
    const dataUrl = await QRCode.toDataURL(url);
    setJoinUrl(url);
    setQr(dataUrl);
  };

  return (
    <div className="create-room">
      <button onClick={createRoom} className="btn btn-primary">Create Room (24h)</button>
      {qr && (
        <div className="qr-box">
          <img alt="Room QR" src={qr} className="qr-image" />
          <div className="join-link">
            <a href={joinUrl} target="_blank" rel="noreferrer">{joinUrl}</a>
          </div>
        </div>
      )}
    </div>
  );
}

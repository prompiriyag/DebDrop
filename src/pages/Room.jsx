import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { db } from "../app/firebase";
import {
  doc, onSnapshot,
  collection, query, orderBy, onSnapshot as onSnapshotColl,
  updateDoc
} from "firebase/firestore";
import UploadBox from "../components/UploadBox";
import FileList from "../components/FileList";
import "../styles/Room.css";

export default function Room() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (!roomId) return;
    const unsubRoom = onSnapshot(doc(db, "rooms", roomId), (snap) => {
      setRoom(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });

    const q = query(
      collection(db, "rooms", roomId, "files"),
      orderBy("createdAt", "desc")
    );
    const unsubFiles = onSnapshotColl(q, (snap) => {
      setFiles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubRoom(); unsubFiles(); };
  }, [roomId]);

  const expired = useMemo(() => {
    if (!room) return false;
    if (room.closed) return true;
    const now = new Date();
    const exp = room.expiresAt?.toDate?.() || new Date(0);
    return exp < now;
  }, [room]);

  const onCloseRoom = async () => {
    if (!roomId) return;
    try { await updateDoc(doc(db, "rooms", roomId), { closed: true }); }
    catch { alert("ปิดห้องไม่สำเร็จ"); }
  };

  if (room === null) return <div className="page room not-found">Room not found.</div>;
  if (!room) return <div className="page room loading">Loading...</div>;

  return (
    <div className="page room">
      <div className="room-header">
        <h2 className="room-title">Room {roomId}</h2>
        <button onClick={onCloseRoom} className="btn btn-danger">Close Room</button>
      </div>

      {expired ? (
        <div className="room-expired">Room is closed or expired.</div>
      ) : (
        <>
          <UploadBox roomId={roomId} disabled={expired} />
          <FileList files={files} />
        </>
      )}
    </div>
  );
}

import { db } from "../app/firebase";
import {
  collection, getDocs, deleteDoc, doc
} from "firebase/firestore";

export async function cleanupExpiredRooms() {
  try {
    const roomsSnap = await getDocs(collection(db, "rooms"));
    const now = Date.now();

    for (const r of roomsSnap.docs) {
      const data = r.data();
      const expiresAtMs = data?.expiresAt?.toMillis?.() ?? 0;
      const expired = expiresAtMs > 0 && expiresAtMs < now;
      const closed = !!data?.closed;

      if (expired || closed) {
        const filesSnap = await getDocs(collection(db, "rooms", r.id, "files"));
        for (const f of filesSnap.docs) {
          try { await deleteDoc(doc(db, "rooms", r.id, "files", f.id)); } catch {}
        }
        try { await deleteDoc(doc(db, "rooms", r.id)); } catch {}
      }
    }
  } catch {}
}

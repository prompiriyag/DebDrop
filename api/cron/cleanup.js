const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

module.exports = async (req, res) => {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const now = admin.firestore.Timestamp.now();

    const snap = await db.collection("rooms")
      .where("expiresAt", "<", now)
      .limit(200)
      .get();

    let deletedRooms = 0, deletedFiles = 0;

    for (const docSnap of snap.docs) {
      const roomRef = docSnap.ref;
      const filesRef = roomRef.collection("files");

      while (true) {
        const batchSnap = await filesRef.limit(300).get();
        if (batchSnap.empty) break;
        const batch = db.batch();
        batchSnap.forEach(d => batch.delete(d.ref));
        await batch.commit();
        deletedFiles += batchSnap.size;
      }

      await roomRef.delete();
      deletedRooms++;
    }

    return res.status(200).json({ ok: true, deletedRooms, deletedFiles });
  } catch (e) {
    console.error("cleanup error:", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
};

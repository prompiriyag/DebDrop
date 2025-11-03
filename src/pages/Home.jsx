import CreateRoomButton from "../components/CreateRoomButton";
import "../styles/Home.css";

export default function Home() {
  return (
    <div className="page home">
      <h1 className="title">DebDrop</h1>
      <p className="subtitle">สร้างห้องแชร์ไฟล์ผ่านลิงก์/QR ชั่วคราว</p>
      <CreateRoomButton />
    </div>
  );
}

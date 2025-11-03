import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/routes";
import { cleanupExpiredRooms } from "./utils/cleanup";
import "./styles/App.css";

export default function App() {
  useEffect(() => {
    cleanupExpiredRooms();
    const id = setInterval(cleanupExpiredRooms, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="app">
      <RouterProvider router={router} />
    </div>
  );
}

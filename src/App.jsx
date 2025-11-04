import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/routes";
import "./styles/App.css";

export default function App() {
  return (
    <div className="app">
      <RouterProvider router={router} />
    </div>
  );
}

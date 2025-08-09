import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setupMockApi, setupAutoLogin } from "./lib/mockApi";

// Configurar mock APIs para funcionar sem backend
setupMockApi();
setupAutoLogin();

createRoot(document.getElementById("root")!).render(<App />);

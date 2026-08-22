import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { registerServiceWorker } from "./offline.js";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

// v81: the course is already entirely local — packs bundled, audio on the
// origin, progress in localStorage. The only thing that ever needs a network is
// the AI, so there was never a good reason for a tunnel to break a lesson.
registerServiceWorker();

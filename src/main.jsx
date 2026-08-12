import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";
import "./coruja-template/editor-dom.js";
import "./coruja-template/compat-content.js";

createRoot(document.getElementById("root")).render(<React.StrictMode><App /></React.StrictMode>);

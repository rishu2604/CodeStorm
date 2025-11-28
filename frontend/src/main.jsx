// import React from "react";
// import ReactDOM from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
// import App from "./App";
// import './index.css'
// import KeycloakProvider from "./keycloak/KeycloakProvider";

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <BrowserRouter>
//     {/* <KeycloakProvider> */}
//       <App />
//     {/* </KeycloakProvider> */}
//   </BrowserRouter>
// );

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import keycloak from "./keycloak/keycloak";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

// Show loading screen until Keycloak finishes init
root.render(
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
    <h2>Loading…</h2>
  </div>
);

keycloak
  .init({ onLoad: "login-required", checkLoginIframe: false,})
  .then((authenticated) => {
    if (authenticated) {
      root.render(
        <React.StrictMode>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </React.StrictMode>
      );
    } else {
      keycloak.login();
    }
  })
  .catch((err) => {
    console.error("Keycloak init error:", err);
    // Render app anyway to see UI
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );
  });

import React, { useEffect, useState } from "react";
import keycloak from "./keycloak";
import KeycloakContext from "./KeycloakContext";

export default function KeycloakProvider({ children }) {
  const [init, setInit] = useState(false);

  useEffect(() => {
    keycloak
      .init({ onLoad: "login-required", checkLoginIframe: false })
      .then(() => setInit(true))
      .catch(console.error);
  }, []);

  if (!init) return <div>Loading authentication...</div>;

  return (
    <KeycloakContext.Provider value={{ keycloak }}>
      {children}
    </KeycloakContext.Provider>
  );
}

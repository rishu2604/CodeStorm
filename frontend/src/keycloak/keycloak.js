import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8081",   // Keycloak server URL
  realm: "circleMax",        // Your realm name
  clientId: "circlemax-frontend", // Your client ID
});

export default keycloak;

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

const domain = process.env.REACT_APP_AUTH0_DOMAIN;
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;
const audience = process.env.REACT_APP_AUTH0_AUDIENCE;

console.log("Domain:", domain);
console.log("Client ID:", clientId);
console.log("Audience:", audience);

// Check if Auth0 environment variables are set
if (!domain || !clientId) {
  console.error("Auth0 environment variables are not properly configured");
}

root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
        scope: "openid profile email"
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      <BrowserRouter> 
        <App />
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>
);
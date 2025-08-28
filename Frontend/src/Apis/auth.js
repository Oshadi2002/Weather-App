// src/hooks/useAuth.js
import { useAuth0 } from "@auth0/auth0-react";

export const useAuth = () => {
  const {
    loginWithRedirect,
    logout,
    user,
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
  } = useAuth0();

  const login = async () => {
    await loginWithRedirect({
      authorizationParams: { 
        screen_hint: "login",
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: "openid profile email"
      },
    });
  };

  const signup = async () => {
    await loginWithRedirect({
      authorizationParams: { 
        screen_hint: "signup",
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: "openid profile email"
      },
    });
  };

  const logOutUser = () => {
    // Clear stored token on logout
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_token_expiry");
    
    logout({
      logoutParams: { returnTo: window.location.origin },
    });
  };

  const getToken = async () => {
    console.log("[AUthenticated NOT] Getting access token...");
    if (!isAuthenticated) return null;
    console.log("[AUthenticated] Getting access token...");
    
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        },
      });
      
      // Store token with expiry (default 1 hour)
      const expiresIn = 3600; // 1 hour in seconds
      const expiryTime = new Date().getTime() + (expiresIn * 1000);
      
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_token_expiry", expiryTime.toString());
      
      return token;
    } catch (err) {
      console.error("Error getting access token:", err);
      return null;
    }
  };

  // Check if we have a valid stored token
  const hasValidToken = () => {
    const token = localStorage.getItem("auth_token");
    const expiryTime = localStorage.getItem("auth_token_expiry");
    
    if (!token || !expiryTime) return false;
    
    // Check if token is expired
    return new Date().getTime() < parseInt(expiryTime);
  };

  return {
    login,
    signup,
    logout: logOutUser,
    user,
    isAuthenticated,
    isLoading,
    getToken,
    hasValidToken,
  };
};
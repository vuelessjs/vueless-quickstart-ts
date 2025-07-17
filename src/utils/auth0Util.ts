import { createAuth0 } from "@auth0/auth0-vue";

export const PERMISSIONS = {
  fullAccess: "full_access",
  clientAccess: "client_access",
  ownAccess: "own_access",
};

class Auth0Service {
  constructor() {
    this.createAuth0Instance();
  }

  createAuth0Instance() {
    this.auth0Instance = createAuth0({
      domain: import.meta.env.VITE_AUTH0_DOMAIN,
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: "bo_api",
      },
    });
  }

  obtainAccessToken = async () => {
    const accessToken = await this.auth0Instance.getAccessTokenSilently();

    this.setAccessToken(accessToken);
  };

  setAccessToken = (accessToken) => {
    localStorage.setItem("accessToken", accessToken);
  };

  getAccessToken = () => {
    return localStorage.getItem("accessToken");
  };

  removeAccessToken = () => {
    localStorage.removeItem("accessToken");
  };

  parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };

  getPermissions = (token) => {
    const accessToken = token || getAccessToken();

    return this.parseJwt(accessToken)?.permissions || [];
  };

  setEmailVerification = (query) => {
    if (query?.error === "access_denied") {
      localStorage.setItem("emailNotVerified", "1");
    }
  };

  removeEmailVerification = () => {
    localStorage.removeItem("emailNotVerified");
  };

  isEmailVerified = () => {
    return !localStorage.getItem("emailNotVerified");
  };

  logout = async () => {
    this.removeAccessToken();
    this.removeEmailVerification();
    await this.auth0Instance.logout();
  };
}

const Auth0ServiceInstance = new Auth0Service();

export const {
  auth0Instance: auth0,
  getPermissions,
  setEmailVerification,
  isEmailVerified,
  obtainAccessToken,
  getAccessToken,
  logout,
} = Auth0ServiceInstance;

export default Auth0ServiceInstance;

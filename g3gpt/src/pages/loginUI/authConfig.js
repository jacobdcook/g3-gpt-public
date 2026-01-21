import { PublicClientApplication } from '@azure/msal-browser';
import {jwtDecode} from 'jwt-decode';

// MSAL configuration
export const msalConfig = {
  auth: {
    clientId: '9f7bdaba-5f80-4cfb-9ed9-1ec58329763e', // Replace with your actual client ID
    authority: 'https://login.microsoftonline.com/81d83dba-7dad-445f-be29-25f9f1fe20a5', // Replace with your tenant ID
    redirectUri: window.location.origin, // Adjust if needed
  },
};

// Instantiate MSAL client
export const pca = new PublicClientApplication(msalConfig);

// Initialize MSAL
export async function initializeMSAL() {
  try {
    await pca.initialize();
    console.log('MSAL Initialized');
  } catch (error) {
    console.error('MSAL Initialization Error:', error);
  }
}

// Function to get user roles from the access token
export async function getUserRoles() {
  try {
    const accounts = pca.getAllAccounts();
    if (accounts.length === 0) throw new Error("No accounts found");

    // Acquire the access token with specific scopes for roles
    const tokenResponse = await pca.acquireTokenSilent({
      account: accounts[0],
      scopes: [
        `api://9f7bdaba-5f80-4cfb-9ed9-1ec58329763e/.default`],    

    });

    // Decode the ID token
    const decodedToken = jwtDecode(tokenResponse.idToken);
    console.log("Decoded ID Token:", decodedToken); // Debugging: inspect token structure

    // Extract roles from the decoded access token
    const userRoles = decodedToken.roles || [];  // Check for roles claim
    console.log("Extracted Roles:", userRoles);   // Debugging: log extracted roles

    
    return userRoles;
  } catch (error) {
    console.error("Error getting roles:", error);
    return [];
  }
}

export async function getIDToken() {
  try {
    const accounts = pca.getAllAccounts();
    if (accounts.length === 0) throw new Error("No accounts found");

    // Acquire the access token with specific scopes for roles
    const tokenResponse = await pca.acquireTokenSilent({
      account: accounts[0],
    });

    return tokenResponse.idToken;
  } catch (error) {
    console.error("Error getting roles:", error);
    return {};
  }
}






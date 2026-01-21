import { pca } from './authConfig';

// Redirect user to Azure AD for login
export async function redirectToLogin() {
  try {
    const loginRequest = {
      scopes: [`api://9f7bdaba-5f80-4cfb-9ed9-1ec58329763e/roles openid profile`],
    };
    await pca.loginRedirect(loginRequest);
  } catch (error) {
    console.error("Login Redirect Error:", error);
  }
}

// Handle redirect response and process the auth_code
export async function handleRedirectResponse() {
  try {
    const response = await pca.handleRedirectPromise();
    if (response) {
      console.log("Login Response:", response);

      const authCode = response.authorizationCode; // Extract auth_code
      console.log("Auth Code:", authCode);

      // Send auth_code to the backend
      const backendResponse = await fetch('http://localhost:3000/auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: authCode }),
      });

      const tokens = await backendResponse.json();
      console.log('Tokens from backend:', tokens);
    }
  } catch (error) {
    console.error('Error handling redirect response:', error);
  }
}
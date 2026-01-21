// Login.js
import React, { useState, useEffect } from 'react';
import styles from './Login.module.css';
import { pca, initializeMSAL } from './authConfig';  
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeMSAL();
        // Handle any redirect response
        const response = await pca.handleRedirectPromise();
        if (response) {
          // Successful login via redirect
          console.log("Logged in via redirect:", response);
          navigate("/home"); // Navigate to home on successful login
        }
      } catch (error) {
        console.error("MSAL initialization error:", error);
        setErrorMessage("Failed to initialize authentication. Please try again.");
      } finally {
        setLoading(false); // MSAL is ready or failed
      }
    };
    initialize();
  }, [navigate]);

  const handleAzureLogin = async () => {
    if (isLoggingIn) return; // Prevent multiple login attempts
    setIsLoggingIn(true);

    try {
      console.log("Attempting Azure login...");
      await pca.loginRedirect(); // Initiate redirect login
    } catch (error) {
      console.error("Azure login error:", error);
      setErrorMessage(`Azure Login Failed: ${error.errorCode}\n${error.message}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading message until MSAL is ready
  }

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginBox}>
        <p className={styles.loginTextTitle}>G3 GPT</p>

        {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}

          <button 
            onClick={handleAzureLogin} 
            className={styles.azureLoginButton} 
            disabled={isLoggingIn}
          >
            {isLoggingIn ? 'Logging in...' : 'SSO Azure Login'}
          </button>
        </div>
      </div>
  );
}

export default Login;

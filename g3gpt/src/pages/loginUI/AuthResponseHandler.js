import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal, useIsAuthenticated } from '@azure/msal-react'; // Added useIsAuthenticated
import { EventType, InteractionStatus } from '@azure/msal-browser';

function AuthResponseHandler() {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState("Processing login...");
  const [loginError, setLoginError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      console.log("User is authenticated.");
      navigate('/home'); // Redirect to home if user is authenticated
    } else if (inProgress === InteractionStatus.None && accounts.length === 0) {
      setStatusMessage("User is not authenticated. Redirecting to login page...");
      navigate('/login'); // Redirect to login if not authenticated
    } else {
      setStatusMessage("Waiting for authentication...");
    }

    // Listen for MSAL login events
    const callbackId = instance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload?.account) {
        console.log("MSAL Login Event Triggered!");
        const account = event.payload.account;
        instance.setActiveAccount(account);
        setStatusMessage("Login successful! Redirecting...");
        navigate('/home');
      }

      if (event.eventType === EventType.LOGIN_FAILURE) {
        console.error("Login failed:", event.error);
        setLoginError(event.error.message);
        setStatusMessage("Login failed. Please try again.");
      }
    });

    // Cleanup event listener on unmount
    return () => {
      if (callbackId) {
        instance.removeEventCallback(callbackId);
      }
    };
  }, [accounts, instance, inProgress, isAuthenticated, navigate]);

  if (inProgress === InteractionStatus.Startup || inProgress === InteractionStatus.Login) {
    return <div>{statusMessage}</div>;
  }

  if (loginError) {
    return (
      <div>
        <p>Error: {loginError}</p>
        <button onClick={() => navigate('/login')}>Try Again</button>
      </div>
    );
  }

  return <div>{statusMessage}</div>;
}

export default AuthResponseHandler;
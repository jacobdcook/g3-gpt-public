// g3gpt/src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { pca, initializeMSAL } from './pages/loginUI/authConfig';

// Initialize MSAL before rendering the app
initializeMSAL().then(() => {
  console.log("MSAL is ready.");

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App msalInstance={pca} /> {/* Pass MSAL instance to App */}
    </React.StrictMode>
  );

  reportWebVitals();
}).catch((error) => {
  console.error("Error initializing MSAL:", error);
});




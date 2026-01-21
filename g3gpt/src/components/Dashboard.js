// src/components/Dashboard.js
import React, { useState } from 'react';
import { loginAndGetToken } from '../authConfig'; // Ensure the correct path

const Dashboard = () => {
  // State to store the user's roles
  const [userRole, setUserRole] = useState(null);

  // Function to handle login and role extraction
  const handleLogin = async () => {
    try {
      const { accessToken, userRoles } = await loginAndGetToken();
      console.log('Access Token:', accessToken);
      console.log('User Roles:', userRoles);

      // Set the roles in the state, which triggers re-rendering
      setUserRole(userRoles);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {/* Button to trigger login */}
      <button onClick={handleLogin}>Login with Azure</button>

      {/* Conditionally render based on user roles */}
      {userRole?.includes('admin') && (
        <div>
          <h1>Welcome, Admin!</h1>
          <p>This content is visible only to admins.</p>
        </div>
      )}

      {userRole?.includes('users') && !userRole?.includes('admin') && (
        <div>
          <h1>Welcome, User!</h1>
          <p>This content is visible only to regular users.</p>
        </div>
      )}
      
    </div>
  );
};

export default Dashboard;

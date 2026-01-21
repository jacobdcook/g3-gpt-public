import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/loginUI/Login';
import HomePage from './pages/HomeUI/HomePage';
import MyDocuments from './pages/MyDocumentsUI/MyDocuments';
import RecentsPage from './pages/RecentsUI/RecentsPage';
import AuthResponseHandler from './pages/loginUI/AuthResponseHandler';
import Questions from './pages/QuestionsUI/Questions';
import { pca } from './pages/loginUI/authConfig';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import {jwtDecode} from 'jwt-decode';
import { ChatProvider } from './pages/ChatContext/ChatContext'

// Unauthorized Page Component
const UnauthorizedPage = () => {
  const goToHome = () => {
    window.location.href = '/home';
  };

  const handleLogout = async () => {
    try {
      const currentAccount = pca.getActiveAccount();
      
      if (currentAccount) {
        const logoutRequest = {
          account: currentAccount,
          postLogoutRedirectUri: window.location.origin + '/login'
        };

        await pca.logoutRedirect(logoutRequest);
      } else {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.href = '/login';
    }
  };

  return (
    <div>
      <h1>Unauthorized Access</h1>
      <p>You do not have permission to access this page.</p>
      <button onClick={goToHome}>Go Back to Home</button>
      <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Logout</button>
    </div>
  );
};

// Component to display user info badge only on the home page
const UserInfoBadge = ({ email, roles }) => {
  const location = useLocation();
  
  if (location.pathname !== '/home') return null;

  return (
    <div style={styles.userInfoBadge}>
      <p style={styles.userInfoText}><strong>Email:</strong> {email}</p>
      <p style={styles.userInfoText}><strong>Role:</strong> {roles.join(', ')}</p>
    </div>
  );
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: false,
      loading: true,
      roles: null,
      email: null,
      error: null,
    };
  }

  async componentDidMount() {
    try {
      const redirectResponse = await pca.handleRedirectPromise();
      if (redirectResponse) {
        pca.setActiveAccount(redirectResponse.account);
      }

      const isAuthenticated = this.checkAuthentication();
      if (isAuthenticated) {
        const { roles, email } = await this.extractRolesAndEmail();
        this.setState({ roles, email });
      }
      this.setState({ isAuthenticated, loading: false });
    } catch (error) {
      console.error("Authentication check failed:", error);
      this.setState({ error: error.message, loading: false });
    }
  }

  checkAuthentication = () => {
    const accounts = pca.getAllAccounts();
    return accounts.length > 0;
  };

  extractRolesAndEmail = async () => {
    const accounts = pca.getAllAccounts();
    if (accounts.length === 0) {
      console.error("No account found. User may not be logged in.");
      return { roles: [], email: 'Unknown' };
    }
  
    const request = {
      scopes: ["openid", "profile", "User.Read"]
    };
    
    try {
      const response = await pca.acquireTokenSilent(request);
      const decodedToken = jwtDecode(response.idToken);
    
      const userEmail = decodedToken.email || decodedToken.preferred_username || decodedToken.upn || 'Unknown';
      const userRoles = decodedToken.roles ? decodedToken.roles.map(role => role.toLowerCase()) : [];
    
      return { roles: userRoles, email: userEmail };
    
    } catch (error) {
      console.error("Token acquisition or decoding failed:", error.message || error);
      return { roles: [], email: 'Unknown' };
    }
  }    

  // ProtectedRoute Component with Role-Based Access Control
  ProtectedRoute = ({ children, requiredRoles, adminFullAccess = false }) => {
    const { isAuthenticated, roles } = this.state;

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    // Check if user has admin role and admin access is required
    if (roles?.includes('admin') && adminFullAccess) {
      return children;
    }

    // Check if user has any of the required roles
    if (!roles || !requiredRoles.some(role => roles.includes(role.toLowerCase()))) {
      return <Navigate to="/unauthorized" />;
    }

    return children;
  };

  render() {
    const { isAuthenticated, loading, roles, email } = this.state;

    if (loading) {
      return <div>Loading...</div>;
    }

    return (
      <Router>
        {isAuthenticated && roles && email && <UserInfoBadge email={email} roles={roles} />}
        <ChatProvider>
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Login />} />
            <Route path="/home" element={<HomePage />} />
            
            {/* Admin-only pages */}
            <Route path="/my-documents" element={<this.ProtectedRoute requiredRoles={['admin']} adminFullAccess={true}><MyDocuments /></this.ProtectedRoute>} />

            {/* Pages accessible by all users */}
            <Route path="/recents" element={<RecentsPage />} />
            <Route path="/auth" element={<AuthResponseHandler />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
          </Routes>
        </ChatProvider>
      </Router>
    );
  }
}

const styles = {
  userInfoBadge: {
    position: 'fixed',
    top: '10px',
    right: '10px',
    backgroundColor: '#007BFF',
    color: 'white',
    borderRadius: '12px',
    padding: '8px 12px',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    textAlign: 'right',
    maxWidth: '200px',
  },
  userInfoText: {
    margin: 0,
    fontSize: '12px',
    fontWeight: 'normal',
    lineHeight: '1.4',
  },
};

export default App;
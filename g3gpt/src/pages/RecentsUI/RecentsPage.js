import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import addIcon from '../assests/addIcon.svg';
import recentIcon from '../assests/recentIcon.svg';
import docIcon from '../assests/docIcon.svg';
import questionIcon from '../assests/question.svg';
import newG3Logo from '../assests/newG3Logo.svg';
import logout from '../assests/logout.svg';
import './RecentsPage.css';
import { pca } from '../loginUI/authConfig';
import ChatContext from '../ChatContext/ChatContext';

function RecentsPage() {
  const navigate = useNavigate();
  const { chatSessions, loadChatSession, removeChatSession, startNewChat, clearAllChats } = useContext(ChatContext);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showClearAllChatsDialog, setShowClearAllChatsDialog] = useState(false);  // State for Clear All Chats Dialog

  const handleChatClick = (sessionIndex) => {
    loadChatSession(sessionIndex); // Load the selected session in ChatContext
    navigate('/home');
  }

  const handleGoBack = () => {
    if (chatSessions.length === 0) {
      startNewChat();
    }
    navigate('/home');
  };

  const toggleSidebar = () => {
    setSidebarExpanded(prev => !prev);
  };

  const handleClearAllChats = () => {
    setShowClearAllChatsDialog(true); // Show the confirmation dialog
  }

  const handleClearChatsConfirm = () => {
    clearAllChats(); // Clear all chats
    setShowClearAllChatsDialog(false); // Close the dialog
  }

  const handleNewChat = () => {
    startNewChat();
    navigate('/home');
  }

  // Updated Logout functions
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

  const openLogoutDialog = () => {
    setShowLogoutDialog(true);
  };

  const closeLogoutDialog = () => {
    setShowLogoutDialog(false);
  };

  const handleConfirmLogout = () => {
    handleLogout();
    setShowLogoutDialog(false);
  };

  return (
    <div className='layout'>
      {/* Sidebar */}
      <div className={`App ${sidebarExpanded ? 'sidebar-expanded' : ''}`}>
        <aside className="sidebar" onMouseEnter={toggleSidebar} onMouseLeave={toggleSidebar}>
          <div className="logo-container">
            <img src={newG3Logo} alt="G3 Logo" className="logo" />
          </div>
          <nav className="nav">
            <button className={`listItems clickable`} onClick={handleNewChat} id='new-chat-button'>
              <img src={addIcon} alt="New Chat" /> New Chat
            </button>
            <button className={`listItems clickable active`} onClick={() => navigate('/recents')} id='recent-chats-button'>
              <img src={recentIcon} alt="Recents" /> Recent Chats
            </button>
            <button className={`listItems clickable`} onClick={() => navigate('/my-documents')} id='my-docs-button'>
              <img src={docIcon} alt="My Documents" /> My Documents
            </button>
            <button className={`listItems clickable`} onClick={() => navigate('/Questions')} id='questions-button'>
              <img src={questionIcon} alt="Questions?" /> Questions?
            </button>
            <hr className="separator" />
            <button className={`listItems clickable`} onClick={openLogoutDialog}>
              <img src={logout} alt="Logout" className='icon'/>
              Logout
            </button>
          </nav>
        </aside>

        {/* Chats content */}
        <main>
          <h2>Recent Chats</h2>
          <button className="goBackButton" onClick={handleGoBack}>Go Back to Home</button>
          <div className="clearAllChatsMessage"> Warning! This will clear ALL chats immediately.
          </div>
          <button className="clearAllChatsButton" onClick={handleClearAllChats} id='clear-chats-button'> Clear ALL Chats</button>
          <div></div>
          {chatSessions.length > 0 ? (
            chatSessions.slice().reverse().map((session, reversedIndex) => {
              const actualIndex = chatSessions.length - 1 - reversedIndex;
              return (
                Array.isArray(session) && (
                  <div key={actualIndex} className="chatSession">
                    <h3
                      onClick={() => handleChatClick(actualIndex)}
                      style={{ cursor: 'pointer' }}
                      tabIndex={0}
                      role="button"
                    >
                      Chat {chatSessions.length - reversedIndex} (Click to load)
                    </h3>
                    {session.map((message, index) => (
                      <div key={index} className={`chat ${message.type}`}>
                        {message.type === 'bot' ? (
                          <div className="chat bot">
                            <div className="bot-icon">
                            <img src={newG3Logo} alt="G3 Logo" className="logo" />
                            </div>
                          <p>{message.text}</p>
                          </div>
                        ) : (
                          <div className="chat user">
                            <div className="user-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px" fill="#333333">
                              <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-2.7 0-8 1.4-8 4v3h16v-3c0-2.6-5.3-4-8-4z" />
                            </svg>
                            </div>
                            <p><strong>User:</strong> {message.text}</p>
                          </div>
                        )}
                      </div>
                    ))}
                    <button className="removeButton" onClick={() => removeChatSession(actualIndex)}>
                      Remove Chat
                    </button>
                  </div>
                )
              )
            })
          ) : (
            <div className="noChatsPlaceholder"> No recent messages available.
          </div>
          )}
        </main>

        {/* Logout Dialog */}
        {showLogoutDialog && (
          <div className="logout-dialog">
            <div className="dialog-content">
              <p>Are you sure you want to logout?</p>
              <button onClick={handleConfirmLogout}>Logout</button>
              <button onClick={closeLogoutDialog}>Cancel</button>
            </div>
          </div>
        )}

        {/* Clear All Chats Dialog */}
        {showClearAllChatsDialog && (
          <div className="logout-dialog">
            <div className="dialog-content">
              <p>This will clear all the chats from history. Are you sure?</p>
              <button onClick={handleClearChatsConfirm} id='clear-button'>Clear All Chats</button>
              <button onClick={() => setShowClearAllChatsDialog(false)} id='cancel-button'>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentsPage;

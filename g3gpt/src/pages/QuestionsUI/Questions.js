import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import addIcon from '../assests/addIcon.svg';
import recentIcon from '../assests/recentIcon.svg';
import docIcon from '../assests/docIcon.svg';
import questionIcon from '../assests/question.svg';
import newG3Logo from '../assests/newG3Logo.svg';
import logout from '../assests/logout.svg';
import './Questions.css';
import { pca } from '../loginUI/authConfig';
import ChatContext from '../ChatContext/ChatContext';

const Questions = () => {
  const navigate = useNavigate();
  const [faqData, setFaqData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { chatSessions, startNewChat } = useContext(ChatContext);
  
  useEffect(() => {
    const data = [
      {
        question: 'What is G3-GPT?',
        answer: 'G3-GPT is an AI-facilitated application developed for G3 Enterprises to enhance internal information access for employees in the wine industry. Utilizing Retrieval Augmented Generation (RAG) technology, G-3 GPT scans and retrieves relevant information from a vast database of company documents, providing accurate responses to user queries while respecting document-level security and individual access rights. This application aims to streamline the process of finding critical information, enabling employees to work more efficiently and effectively.'
      },
      // ... Other FAQ items ...
    ];
    setFaqData(data);
    console.log('FAQ Data:', data); 
  }, []);

  const toggleSidebar = () => {
    setSidebarExpanded(prev => !prev);
  };

  const toggleAnswer = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleButtonClick = (buttonId) => {
    if (buttonId === 'myDocuments') {
      navigate('/my-documents');
    } else if (buttonId === 'myDocuments') {
      navigate('/my-documents');
    } else if (buttonId === 'Questions') {
      navigate('/Questions');
    } else if (buttonId === 'recents') {
      navigate('/recents');
    } else if (buttonId === 'newChat') {
      startNewChat(); // Clears existing messages and starts a new session
      navigate('/home');
    }
  };

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
    <div className={`App ${sidebarExpanded ? 'sidebar-expanded' : ''}`}>
      <aside className="sidebar" onMouseEnter={toggleSidebar} onMouseLeave={toggleSidebar}>
        <div className="logo-container">
          <img src={newG3Logo} alt="G3 Logo" className="logo" />
        </div>
        <nav className="nav">
          <button
            className={`listItems clickable`}
            onClick={() => handleButtonClick('newChat')}
            id='new-chat-button'
          >
            <img src={addIcon} alt="New Chat" /> New Chat
          </button>
          <button
            className={`listItems clickable`}
            onClick={() => handleButtonClick('recents')}
            id='recent-chats-button'
          >
            <img src={recentIcon} alt="Recents" /> Recent Chats
          </button>
          <button
            className={`listItems clickable`}
            onClick={() => handleButtonClick('myDocuments')}
            id='my-docs-button'
          >
            <img src={docIcon} alt="My Documents" /> My Documents
          </button>
    
          
          <button
            className={`listItems clickable active`}
            onClick={() => handleButtonClick('Questions')}
            id='questions-button'
          >
            <img src={questionIcon} alt="Questions" /> Questions
          </button>
          <hr className="separator" />
          <button
            className={`listItems clickable`}
            onClick={openLogoutDialog}
          >
            <img src={logout} alt="Logout" className='icon'/>
            Logout
          </button>
        </nav>
      </aside>

      <main className="faq">
        <h2>Frequently Asked Questions</h2>
        {faqData.map((item, index) => (
          <div key={index} className="qa-item">
            <div className="question" onClick={() => toggleAnswer(index)}>
              {item.question}
            </div>
            <div className="answer" style={{display: activeIndex === index ? 'block' : 'none'}}>
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
        {/* Resource Section */}
        <div className="resource-container">
          Additional Resources 
          <h3>Here are some additional articles that provide more information about our implementations to our project.</h3>
          <ul className='resource-list'>
            <li>
              <a href="https://www.packtpub.com/article-hub/everything-you-need-to-know-about-pinecone-a-vector-database" target="_blank" rel="noopener noreferrer">
                Everything You Need to Know About Pinecone - A Vector Database
              </a>
            </li>
            <li>
              <a href="https://mlconference.ai/blog/openai-embeddings-technology-2024/#:~:text=In%20practice%2C%20OpenAI%20embeddings%20are,query%2C%20and%20grouping%20text." target="_blank" rel="noopener noreferrer">
                OpenAI Embeddings
              </a>
            </li>
          </ul>
          </div>
          
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
    </div>
  );
};

export default Questions;

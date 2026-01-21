import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import markdownit from 'markdown-it';
import parse from 'html-react-parser';
import './homepage.css';
import newG3Logo from '../assests/newG3Logo.svg';  
import addIcon from '../assests/addIcon.svg';     
import recentIcon from '../assests/recentIcon.svg'; 
import docIcon from '../assests/docIcon.svg';      
import questionIcon from '../assests/question.svg';
import sendIcon from '../assests/sendIcon.svg';    
import micIcon from '../assests/micIcon.svg';
import logout from '../assests/logout.svg';
import { pca } from '../loginUI/authConfig';
import ChatContext from '../ChatContext/ChatContext';
import { getIDToken } from '../loginUI/authConfig';

// NOTE: Store API keys in environment variables, not hardcoded
const ASSEMBLY_AI_KEY = process.env.REACT_APP_ASSEMBLY_AI_KEY || '';

function HomePage() {
  const navigate = useNavigate();
  const [activeButton, setActiveButton] = useState('newChat');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [messages, setMessages] = useState('');
  const {
    chatMessages, 
    setChatMessages,
    sendChatMessage,
    startNewChat,
    loadChatSessions,
    chatSessions,
    clearAllChats,
    userRole,
    setUserRole,
    setIdToken
  } = useContext(ChatContext);
  const chatsBoxer = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const [chatsContainer, setChatsContainer] = useState(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const audioChunksRef = useRef([]);
  

  const saveUserRoles = async () => {
    try {
      const idTok = await getIDToken();
      setIdToken(idTok);
    } catch (error) {
      console.error('Error fetching user roles:', error);
    }
  };

  useEffect(() => {
    setChatsContainer(document.getElementById('chats-container'));
    saveUserRoles();
  }, []);


  const handleButtonClick = (buttonId) => {
    setActiveButton(buttonId);
    if (buttonId === 'myDocuments') {
      navigate('/my-documents');
    } else if (buttonId === 'Questions') {
      navigate('/Questions');
    } else if (buttonId === 'recents') {
      navigate('/recents');
    } else if (buttonId === 'newChat') {
        startNewChat();
        setInputValue('');
        navigate('/home');
    }
  };

  const toggleSidebar = () => {
    setSidebarExpanded((prev) => !prev);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
      setIsTranscribing(false);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsListening(false);
      setIsTranscribing(true);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    try {
      const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
        method: 'POST',
        headers: {
          'Authorization': ASSEMBLY_AI_KEY
        },
        body: audioBlob
      });

      const uploadData = await uploadResponse.json();
      const audioUrl = uploadData.upload_url;

      const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
        method: 'POST',
        headers: {
          'Authorization': ASSEMBLY_AI_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          audio_url: audioUrl,
          language_code: 'en'
        })
      });

      const transcriptData = await transcriptResponse.json();
      const transcriptId = transcriptData.id;

      let result;
      while (true) {
        const pollingResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
          headers: {
            'Authorization': ASSEMBLY_AI_KEY
          }
        });
        result = await pollingResponse.json();

        if (result.status === 'completed' || result.status === 'error') {
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (result.status === 'completed') {
        setInputValue(result.text);
      } else {
        console.error('Transcription failed:', result.error);
        alert('Failed to transcribe audio. Please try again.');
      }
    } catch (error) {
      console.error('Error during transcription:', error);
      alert('Failed to transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() !== '') {
      setAwaitingResponse(true);
      const message = inputValue.trim();
      setInputValue('');
      try {
        await sendChatMessage(message);
      } finally {
        setAwaitingResponse(false);
      }
      setTimeout(() => {
        if (chatsBoxer.current) chatsBoxer.current.scrollTop = chatsBoxer.current.scrollHeight;
      }, 100);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const md = markdownit({
    html: true,
    typographer: true,
    breaks: true,
  });

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

  const handleGoBack = () => {
    if (chatSessions.length === 0) {
      startNewChat();
    }
    navigate('/home');
  };

  return (
    <div className={`App ${sidebarExpanded ? 'sidebar-expanded' : ''}`}>
      <aside className="sidebar" onMouseEnter={toggleSidebar} onMouseLeave={toggleSidebar}>
        <div className="logo-container">
          <img src={newG3Logo} alt="G3 GPT Logo" className="logo" />
        </div>
        <nav className="nav">
          <button
            className={`listItems clickable ${activeButton === 'newChat' ? 'active' : ''}`}
            onClick={() => handleButtonClick('newChat')}
            id='new-chat-button'
          >
            <img src={addIcon} alt="New Chat" /> New Chat
          </button>
          <button
            className={`listItems clickable ${activeButton === 'recents' ? 'active' : ''}`}
            onClick={() => handleButtonClick('recents')}
            id='recent-chats-button'
          >
            <img src={recentIcon} alt="Recents" /> Recent Chats
          </button>
          <button
            className={`listItems clickable ${activeButton === 'myDocuments' ? 'active' : ''}`}
            onClick={() => handleButtonClick('myDocuments')}
            id="my-docs-button"
          >
            <img src={docIcon} alt="My Documents" /> My Documents
          </button>
          <button
            className={`listItems clickable ${activeButton === 'Questions' ? 'active' : ''}`}
            onClick={() => handleButtonClick('Questions')}
            id='questions-button'
          >
            <img src={questionIcon} alt="Questions?" /> Questions?
          </button>
          <hr className="separator" />
          <button
            className={`listItems clickable ${activeButton === 'logoutBtn' ? 'active' : ''}`}
            onClick={openLogoutDialog}
          >
            <img src={logout} alt="Logout" className='icon'/>
            Logout
          </button>
        </nav>
      </aside>
      <main className="main">
        <div className="chats" id="chats-container" ref={chatsBoxer}>
          {chatMessages.map((message, index) => (
            <div key={index} className="msg-container">
              <div className={`chat ${message.type}`}>  
              {/* delete if needed */}
              {message.type === 'user' && (
            <div className="user-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24px"
                height="24px"
                fill="#333333"
              >
                <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-2.7 0-8 1.4-8 4v3h16v-3c0-2.6-5.3-4-8-4z" />
              </svg>
            </div>
          )}  {/* delete if needed^ */}                           
                {message.type === 'bot' ? (
                  <img className="chatImg" src={newG3Logo} alt="chatImg" />
                ) : null}
                <span 
                  className="txt" 
                  name={`${message.type === 'bot' ? 'ai' : 'user'}-msg`}>
                    {parse(md.render(message.text))}
                </span>
              </div>
            </div>
          ))}
          {awaitingResponse && (
            <div className="thinkingIndicator">
              <p>Thinking...</p>
            </div>
          )}
        </div>
        <div className="chatFooter">
          <div className="chatInput">
            <input
              type="text"
              placeholder={isTranscribing ? 'Converting speech to text...' : 'Hello! How can I help you?'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTranscribing}
              id='chat-input'
            />
            <button
              className={`Microphone ${isListening ? 'active' : ''}`}
              onClick={isListening ? stopRecording : startRecording}
            >
              <img src={micIcon} alt="mic" />
            </button>
            <button className="send" onClick={handleSendMessage} disabled={isTranscribing}>
              <img src={sendIcon} alt="Send" />
            </button>
          </div>
          
          <p>Created by Sleep Cravers</p>
        </div>
      </main>
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
}

export default HomePage;

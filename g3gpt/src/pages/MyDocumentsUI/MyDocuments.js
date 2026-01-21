import React, { useState, useEffect, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import FileUploadPrompt from './FileUploadPrompt'; 
import './MyDocuments.css';
import recentIcon from '../assests/recentIcon.svg';
import docIcon from '../assests/docIcon.svg';
import questionIcon from '../assests/question.svg';
import addIcon from '../assests/addIcon.svg';
import newG3Logo from '../assests/newG3Logo.svg';
import logout from '../assests/logout.svg';
import { backendURL } from "../../constants/baseURL";
import { pca } from '../loginUI/authConfig';
import ChatContext from "../ChatContext/ChatContext";
import { getIDToken } from "../loginUI/authConfig";

const getFileTypeIcon = (filename) => {
  const extension = filename.split('.').pop().toLowerCase();
  switch (extension) {
    case 'pdf':
      return '/icons/pdf-icon.svg';
    case 'doc':
    case 'docx':
      return '/icons/word-icon.svg';
    case 'xls':
    case 'xlsx':
      return '/icons/excel-icon.svg';
    case 'ppt':
    case 'pptx':
      return '/icons/powerpoint-icon.svg';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return '/icons/image-icon.svg';
    default:
      return '/icons/file-icon.svg';
  }
};

const formatDate = (isoString) => {
  if (!isoString) return "Unknown Date";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "Invalid Date";
  return date.toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    hour12: true,
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

function MyDocuments() {
  const navigate = useNavigate();
  const [documentList, setDocumentList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeButton, setActiveButton] = useState('myDocuments');
  const [sortOption, setSortOption] = useState('recent');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [isUploadPromptOpen, setIsUploadPromptOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);  // State for the Remove Document dialog
  const [documentToRemove, setDocumentToRemove] = useState(null);  // The document that is being removed
  const { chatSessions, startNewChat } = useContext(ChatContext);
  
  const userRoles = useMemo(() => ["Admin"], []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${backendURL}/api/get-documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: await getIDToken() }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched documents:', data.documents);
        setDocumentList(data.documents);
      } else {
        console.error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const toggleSidebar = () => setSidebarExpanded(!sidebarExpanded);

  const handleButtonClick = (buttonId) => {
    setActiveButton(buttonId);
    if (buttonId === 'myDocuments') {
      navigate('/my-documents');
    } 
    else if (buttonId === 'myDocuments') navigate('/my-documents', { state: { documents: documentList } });
    else if (buttonId === 'Questions') navigate('/Questions');
    else if (buttonId === 'recents') {
      navigate('/recents');
    } else if (buttonId === 'newChat') {
      startNewChat(); // Clears existing messages and starts a new session
      navigate('/home')
    };
  };

  const handleGoBack = () => {
    if (chatSessions.length === 0) {
      startNewChat();
    }

    navigate('/home'); // Navigate back to the home page
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

  const openUploadPrompt = () => {
    setIsUploadPromptOpen(true);
    setSelectedFile(null);
    setSelectedRoles([]);
  };

  const closeUploadPrompt = () => {
    setIsUploadPromptOpen(false);
    setSelectedFile(null);
    setSelectedRoles([]);
  };

  const handleFileSelection = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setSelectedRoles([]);
    }
  };

  const handleRoleChange = (event) => {
    const { name, checked } = event.target;
    if (name === 'selectAll') {
      if (checked) {
        setSelectedRoles(['Admin', 'HR', 'Finance']);
      } else {
        setSelectedRoles([]);
      }
    } else {
      if (checked) {
        setSelectedRoles(prev => [...prev, name]);
      } else {
        setSelectedRoles(prev => prev.filter(role => role !== name));
      }
    }
  };

  const uploadFileWithRoles = async (file, roles) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileRoles', JSON.stringify(roles));

      const response = await fetch(`${backendURL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const uploadedDocument = await response.json();
        setDocumentList(prevList => [uploadedDocument, ...prevList]);
        console.log(`Document '${uploadedDocument.name}' uploaded successfully.`);
      } else {
        const error = await response.json();
        console.error(`Error uploading document: ${error.error}`);
        alert('Failed to upload document. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Please try again.');
    }
  };

  const handleSaveUpload = () => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }
    if (selectedRoles.length === 0) {
      alert("Please select at least one role.");
      return;
    }
    uploadFileWithRoles(selectedFile, selectedRoles).then(() => {
      closeUploadPrompt();
      fetchDocuments();
    });
  };

  const handleRemoveDocument = async (document, index) => {
    setDocumentToRemove({ document, index });
    setShowRemoveDialog(true); // Open the remove confirmation dialog
  };

  const confirmRemoveDocument = async () => {
    try {
      const response = await fetch(`${backendURL}/api/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: documentToRemove.document.name }),
      });
      if (response.ok) {
        setDocumentList(prevList => prevList.filter(doc => doc.name !== documentToRemove.document.name));
        console.log(`Document '${documentToRemove.document.name}' removed successfully.`);
      } else {
        const error = await response.json();
        console.error(`Error removing document: ${error.error}`);
      }
    } catch (error) {
      console.error('Error removing document:', error);
    } finally {
      setShowRemoveDialog(false); // Close the dialog after confirming
      setDocumentToRemove(null);
    }
  };

  const cancelRemoveDocument = () => {
    setShowRemoveDialog(false); // Close the dialog without removing the document
    setDocumentToRemove(null);
  };

  const filteredDocuments = documentList.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortOption === 'asc') return a.name.localeCompare(b.name);
    if (sortOption === 'desc') return b.name.localeCompare(a.name);
    return new Date(b.upload_date) - new Date(a.upload_date);
  });

  return (
    <div className={`myDocuments ${sidebarExpanded ? 'sidebar-expanded' : ''}`}>
      <aside className="sidebar" onMouseEnter={toggleSidebar} onMouseLeave={toggleSidebar}>
        <div className="logo-container">
          <img src={newG3Logo} alt="G3 Logo" className="logo" />
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
            id='my-docs-button'
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
        <h2>My Documents</h2>
        <div className="docsContainer">
          <button className="uploadButton" onClick={openUploadPrompt}>Upload File</button>
          {isUploadPromptOpen && (
            <FileUploadPrompt
              onClose={closeUploadPrompt}
              onSave={handleSaveUpload}
              onFileChange={handleFileSelection}
              onRoleChange={handleRoleChange}
              selectedRoles={selectedRoles}
              fileName={selectedFile ? selectedFile.name : ''}
              documentList={documentList}
            />
          )}
          
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="searchBar"
          />
          
          <div className="sortOptions">
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="sortSelect">
              <option value="recent">Most Recent</option>
              <option value="asc">A to Z</option>
              <option value="desc">Z to A</option>
            </select>
          </div>
          {/* Table for Headers (ie Document Name, Upload Time, etc) */}
          <table className="docsHeaderTable">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Upload Date</th>
              <th>Actions</th>
            </tr>
          </thead>
        </table>
          {/* Table for uploaded files */}
          <table className="docsTable">
            <tbody>
              {sortedDocuments.length > 0 ? (
                sortedDocuments.map((document, index) => (
                  <tr key={index} className="docItem">
                    <td>
                      <div className="docDetails">
                        <img
                          src={getFileTypeIcon(document.name)}
                          alt={`${document.name} icon`}
                          className="fileTypeIcon"
                        />
                        <a href={document.url} download={document.name} className="docLink">
                          {document.name}
                        </a>
                      </div>
                    </td>
                    <td className="fileUploadDate">{formatDate(document.upload_date)}</td>
                    <td className="removeButtonCell">
                      {userRoles.includes('Admin') && (
                        <button className="removeButton" onClick={() => handleRemoveDocument(document, index)} id={`remove-btn-${document.name}`}>
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="noDocumentsMessage">No documents found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
  
          <button className="goBackButton" onClick={handleGoBack}>
            Go Back To Home
          </button>
          <p className="createdBy">Created by Sleep Cravers</p>
        </div>
      </main>

      {/* Remove Document Confirmation Dialog */}
      {showRemoveDialog && (
        <div className="logout-dialog">
          <div className="dialog-content">
            <p>Are you sure you want to remove this document?</p>
            <button onClick={confirmRemoveDocument} id="remove-confirm-button">Remove</button>
            <button onClick={cancelRemoveDocument}>Cancel</button>
          </div>
        </div>
      )}

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
}

export default MyDocuments;

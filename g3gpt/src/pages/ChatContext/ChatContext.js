// ChatContext.js as a wrapper and module to centralize chat functionality for HomePage and RecentsPage
import React, { createContext, useState, useEffect } from 'react';
import { backendURL } from '../../constants/baseURL';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [chatMessages, setChatMessages] = useState([]);
    const [awaitingResponse, setAwaitingResponse] = useState(false);
    const [chatSessions, setChatSessions] = useState([]);
    const [activeSessionIndex, setActiveSessionIndex, chatsContainer, setChatsContainer] = useState(null);
    const [userRole, setUserRole] = useState('Admin');
    const [idToken, setIdToken] = useState('');

    // Load chat sessions from localStorage on initial render
    useEffect(() => {
        try {
            const storedSessions = JSON.parse(localStorage.getItem('chatSessions')) || [];
            setChatSessions(storedSessions);
        } catch (error) {
            console.log("Error loading chat sessions from localStorage:", error);
            setChatSessions([]);
        }
    }, []);

    // Save the current chat session to localStorage when messages change
    useEffect(() => {
        if (chatMessages.length > 0 && activeSessionIndex !== null) {
            const updatedSessions = [...chatSessions];
            updatedSessions[activeSessionIndex] = chatMessages;
            localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
            setChatSessions(updatedSessions);
        }
    }, [chatMessages]);

// Handle sending a message
const sendChatMessage = async (inputValue) => {
    if (inputValue.trim() === '') return; // Handle empty input

    if (activeSessionIndex == null) {
        startNewChat(); // This will create a new session and set activeSessionIndex 
    }

    setChatMessages((prevMessages) => [
        ...prevMessages,
        { type: 'user', text: inputValue }
    ]);

    try {
        const serialMessages = JSON.stringify(
            [...chatMessages, { type: 'user', text: inputValue }].map((m) => 
                [m.type === 'user' ? 'human' : 'ai', m.text]
            )
        );

        const response = await fetch(`${backendURL}/api/user-query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: inputValue, messages: serialMessages, idToken: idToken })
        });

        if (response.ok) {
            const data = await response.json();
            const botMessage = { type: 'bot', text: data.response };
            setChatMessages((prevMessages) => {
                const updatedMessages = [...prevMessages, botMessage];
                if (chatsContainer) {
                    setTimeout(() => {
                      chatsContainer.scrollTop = chatsContainer.scrollHeight;
                    }, 100);
                }
                return updatedMessages;
            });
        } else {
            // Handle error response
            console.log("Response not OK:", response)
            setChatMessages((currMessages) => [
                ...currMessages,
                { type: 'bot', text: 'Sorry, something went wrong. Please try again.' },
            ]);
        }
    } catch (error) {
        console.error("Error sending message:", error);
        setChatMessages((currMessages) => [
          ...currMessages,
          { type: 'bot', text: 'Sorry, something went wrong. Please try again.' },
        ]);
    }
};


    // Start a new chat session and save current session to localStorage
    const startNewChat = () => {
        if (chatMessages.length > 0 && activeSessionIndex !== null) {
            const updatedSessions = [...chatSessions, chatMessages];
            localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
            setChatSessions(updatedSessions);
        }
        setChatMessages([]);
        setActiveSessionIndex(chatSessions.length); // Set new session as active
        setAwaitingResponse(false); // Reset awaiting response sate if needed
    };

    // Load a specific chat session
    const loadChatSession = (sessionIndex) => {
        if (sessionIndex >= 0 && sessionIndex < chatSessions.length) {
            setActiveSessionIndex(sessionIndex);
            const sessionToLoad = chatSessions[sessionIndex];
            setChatMessages([...sessionToLoad]);
            setAwaitingResponse(false);
        }
    };

    // Remove a specific chat session
    const removeChatSession = (sessionIndex) => {
        const updatedSessions = chatSessions.filter((_, index) => index !== sessionIndex);
        localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
        setChatSessions(updatedSessions);

        if (updatedSessions.length === 0) {
            clearAllChats();
        }
    };
    
    const clearAllChats = () => {
        localStorage.removeItem('chatSessions'); // Remove from localStorage
        setChatSessions([]); // Clear the chat sessions array
        setChatMessages([]); // Clear any active chat messages
        setActiveSessionIndex(null); // Or set to default if necessary
        setAwaitingResponse(false); // Reset awaiting response state
    };

    return (
        <ChatContext.Provider value={{ 
            chatMessages, 
            awaitingResponse, 
            sendChatMessage, 
            startNewChat, 
            loadChatSession, 
            removeChatSession, 
            chatSessions,
            clearAllChats,
            userRole,
            setIdToken
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export default ChatContext;

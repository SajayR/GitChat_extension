import './App.css';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import logo from './assets/logo2.png';
import addBtn from './assets/add-30.png';
import sendBtn from './assets/send.svg';
import userIcon from './assets/botLogo.png';

import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';  

/* global chrome */

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('idle');
  const [sessionId, setSessionId] = useState('');
  const [fileDirectory, setFileDirectory] = useState([]);
  const chatsRef = React.useRef(null);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);
  const [newCodebaseLink, setNewCodebaseLink] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);



  

  useEffect(() => {
    chrome.storage.local.get(['sessionId'], function(result) {
      if (result.sessionId) {
        setSessionId(result.sessionId);
        checkStatus(result.sessionId);
         
        fetchMessages(sessionId);
        
        
      } else {
        // Handle the absence of sessionId
        const newSessionId = uuidv4(); // Generate a new sessionId
        chrome.storage.local.set({ sessionId: newSessionId }, () => {
          console.log('New sessionId is stored in Chrome storage');
          setSessionId(newSessionId);
          checkStatus(newSessionId);
           
          fetchMessages(newSessionId);
        });
      }
    });
  }, []);

  
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const url = tabs[0].url;
      if (url.startsWith('https://github.com/')) {
        if (url !== newCodebaseLink && sessionId) { // Check if sessionId is not an empty string
          handleGitHubSubmit(url);
          fetchMessages(sessionId);
        }
      }
    });
  }, [sessionId]);

  useEffect(() => {
    if (chatsRef.current) {
      chatsRef.current.scrollTop = chatsRef.current.scrollHeight;
    }
  }, [messages]);



  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };


  const handleGitHubSubmit = async (url) => {
    let formattedUrl = url;
    setNewCodebaseLink(url);
    if (!formattedUrl.endsWith('.git')) {
      formattedUrl += '.git';
    }
  
    try {
      const response = await axios.post('http://127.0.0.1:5000/gitget', {
        link: formattedUrl,
        session_id: sessionId,
      });
      if (response.status === 200) {
        
        fetchMessages(sessionId);
        
        setSidebarCollapsed(false);
      } else {
        console.error('Error submitting GitHub URL:', response);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.error('GitHub URL not found:', error);
      } else {
        console.error('Error submitting GitHub URL:', error);
      }
    }
  };



 const handleSend = async () => {
  try {
    const response = await axios.post('http://127.0.0.1:5000/newprompt', {
      prompt: input,
      session_id: sessionId,
    });
    console.log(response.data.message); // Processing new prompt...
    setInput(''); // Clear the input field after sending the message
    
    // Call checkStatus after sending the message
    checkStatus(sessionId);
    fetchMessages(sessionId);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error('Endpoint not found:', error);
    } else {
      console.error('Error sending prompt:', error);
  }
  }};


  const fetchMessages = async (sessionId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/get_messages?session_id=${sessionId}`);
      setMessages(response.data);
  
      // Continue polling if the status is "processing"
      if (status.toLowerCase() === 'processing') {
        setTimeout(() => fetchMessages(sessionId), 100);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.error('No messages found for this session:', error);
        setMessages([{ from: "bot", content: "Welcome to GitChat! Start by typing your message." }]);
      } else {
        console.error('Error fetching messages:', error);
    }
  }};

 

  const checkStatus = async (sessionId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/check_status?session_id=${sessionId}`);
      const newStatus = response.data.status.toLowerCase();
      console.log('New status:', newStatus);
      setStatus(newStatus);
  
      // If the status is "processing", call checkStatus again after a delay
      if (newStatus === 'processing') {
        setTimeout(() => {
          checkStatus(sessionId);
          fetchMessages(sessionId); // Call fetchMessages along with checkStatus
        }, 100);
      } else if (newStatus !== 'processing') {
        // If the status has changed from "processing" to something else, fetch messages one last time
        fetchMessages(sessionId);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.error('Session not found:', error);
      } else {
        console.error('Error checking status:', error);
    }
  }};



  

  const extractRepoDetails = (githubUrl) => {
    const parts = githubUrl.split('/');
    if (parts.length >= 2) {
      const repoNameWithExtension = parts[parts.length - 1];
      const repoNameWithoutExtension = repoNameWithExtension.replace(/\.git$/, ''); // Remove .git extension
      return {
        user: parts[parts.length - 2],
        repo: repoNameWithoutExtension,
      };
    } else {
      return { user: 'Unknown', repo: 'Unknown' };
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && status.toLowerCase() !== 'processing') {
      e.preventDefault(); // Prevent the default form submission on pressing 'Enter'
      handleSend();       // Call the handleSend function only if status is not 'processing'
    }
    };

//END OF DHRUVAL STUFF
  

return (
    <div className={`App`}>
      <div className='main'>
      <div className='chats' ref={chatsRef}>
        {messages.map((message, index) => (
        <div key={index} className={`chat ${message.from === 'bot' ? 'bot-message' : 'user-message'}`}>
          {message.from === 'bot' && <img src={logo} alt="Bot" className="bot-icon" />}
          <p className='message-text'>{message.content}</p>
        {message.from !== 'bot' && <img src={userIcon} alt="User" className="user-icon" />}
      </div>
      ))}

      </div>
  {(
  <div className='chatFooter'>
    <div className='inp'>
      <input type='text' 
      placeholder='Send a message' 
      value={input} 
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={handleKeyPress} // Add the onKeyPress event handler
      />
      <button className='send' onClick={handleSend} disabled={status.toLowerCase() === 'processing'}><img src={sendBtn} alt='' /></button>
    </div>
    <p>Status: {status}</p>
  </div>
)}
</div>
    </div>
  );

  }
export default App;
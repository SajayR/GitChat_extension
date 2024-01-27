import './App.css';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import logo from './assets/logo2.png';
import addBtn from './assets/add-30.png';
import sendBtn from './assets/send.svg';
import userIcon from './assets/botLogo.png';
import GitHubPopup from './GithubPopup';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';  

/* global chrome */

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('idle');
  const [showDialog, setShowDialog] = useState(false);
  const [gitHubUrl, setGitHubUrl] = useState('');
  const[sessionId, setSessionId] = useState('');
  const [fileDirectory, setFileDirectory] = useState([]);
  const [showDarkPopup, setShowDarkPopup] = useState(true);
  const [newCodebaseLink, setNewCodebaseLink] = useState('');
  const chatsRef = React.useRef(null);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);
  const [newgitdownloaded, setNewgitdownloaded] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);



  

  useEffect(() => {
    chrome.storage.local.get(['sessionId'], function(result) {
      if (result.sessionId) {
        setSessionId(result.sessionId);
        checkStatus(result.sessionId);
        fetchFileDirectory(result.sessionId); 
        fetchMessages(result.sessionId);
      } else {
        // Handle the absence of sessionId
        const newSessionId = uuidv4(); // Generate a new sessionId
        chrome.storage.local.set({ sessionId: newSessionId }, () => {
          console.log('New sessionId is stored in Chrome storage');
          setSessionId(newSessionId);
          checkStatus(newSessionId);
          fetchFileDirectory(newSessionId); 
          fetchMessages(newSessionId);
        });
      }
    });
  }, []);

  useEffect(() => {
    if (chatsRef.current) {
      chatsRef.current.scrollTop = chatsRef.current.scrollHeight;
    }
  }, [messages]);



  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };


  const handleGitHubSubmit = async () => {
    // Ensure the URL starts with https:// and ends with .git
    let formattedUrl = gitHubUrl;
    if (!formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    if (!formattedUrl.endsWith('.git')) {
      formattedUrl += '.git';
    }
  
    try {
      const response = await axios.post('http://127.0.0.1:5000/gitget', {
        link: formattedUrl,
        session_id: sessionId,
      });
      if (response.status === 200) {
        setNewCodebaseLink(formattedUrl);
        setShowDarkPopup(false);
        setGitHubUrl('');
        fetchMessages(sessionId);
        if (response.data.file_directory) {
          const parsedDirectory = parseFileDirectory(response.data.file_directory);
          setFileDirectory(parsedDirectory);
        }
        setSidebarCollapsed(false);
      } else {
        console.error('Error submitting GitHub URL:', response);
      }
    } catch (error) {
      console.error('Error submitting GitHub URL:', error);
    }
  };

const fetchFileDirectory = async (sessionId) => {
  // console.log('Fetching file directory...');
   setIsLoadingDirectory(true);
   try {
     //console.log('Sending request to /get_file_directory');
     const response = await axios.get(`http://127.0.0.1:5000/get_file_directory?session_id=${sessionId}`);
     if (response.data.file_directory) {
      // console.log('File directory found:', response.data.file_directory);
       const parsedDirectory = parseFileDirectory(response.data.file_directory);
       setFileDirectory(parsedDirectory);
     } else {
       console.error('File directory not found in response:', response.data);
     }
   } catch (error) {
     console.error('Error fetching file directory:', error);
   } finally {
     setIsLoadingDirectory(false);
     
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
    console.error('Error sending prompt:', error);
  }
  };


  const fetchMessages = async (sessionId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/get_messages?session_id=${sessionId}`);
      setMessages(response.data);
  
      // Continue polling if the status is "processing"
      if (status.toLowerCase() === 'processing') {
        setTimeout(() => fetchMessages(sessionId), 100);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (error.response && error.response.status === 404) {
        setMessages([{ from: "bot", content: "Welcome to GitChat! Start by typing your message." }]);
      }
    }
  };

 

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
      console.error('Error checking status:', error);
    }
  };



  



//HANDING FILE DIRECTORY AND PREIMPLEMENTED DHRUVAL STUFF

const parseFileDirectory = (filePaths) => {
  const root = {};

  filePaths.forEach((path) => {
    const parts = path.split('/');
    let current = root;

    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = index === parts.length - 1 ? null : {};  // If it's the last part, it's a file; otherwise, it's a directory.
      }
      current = current[part];
    });
  });

  return root;
}; 

const [expandedItems, setExpandedItems] = useState({}); // New state to track expanded items

const renderFileDirectory = (directory, path = '', depth = 0) => {
const entries = Object.entries(directory);

if (!entries.length) return null; // No files or directories

return (
  <ul style={{ marginTop: '20px', textAlign: 'center', color: '#ddd', listStyle: 'none', fontFamily: 'Roboto Mono, monospace' }}>
    {entries.map(([key, value]) => {
      const fullPath = path ? `${path}/${key}` : key;

      const isExpanded = expandedItems[fullPath];

      const toggleExpand = () => {
        setExpandedItems({
          ...expandedItems,
          [fullPath]: !isExpanded,
        });
      };

      return (
        <li key={fullPath} style={{ margin: '7px 0', textAlign: 'left', position: 'relative' }}>
          {value ? (
            <>
              <div
                className="folder"
                style={{
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginBottom: '5px',
                  color: '#f56e0f', // Light cyan for folders
                }}
                onClick={toggleExpand}
              >
                {isExpanded ? '▼' : '►'} {key}
              </div>
              {isExpanded && (
                <div style={{ marginLeft: '25px', borderLeft: '2px dashed #64ffda', padding: '10px' }}>
                  {/* Adjust the distance and styles as needed */}
                  {renderFileDirectory(value, fullPath, depth + 1)}
                </div>
              )}
            </>
          ) : (
            <span className="file" style={{ color: '#bbb' }}>{key}</span>
          )}
        </li>
      );
    })}
  </ul>
);
};

  const openDialog = () => {
    setShowDarkPopup(true);
  };

  const closeDialog = () => {
    setShowDarkPopup(false);
  };

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
    <div className={`App ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className={`sideBar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <button onClick={toggleSidebar} className="toggleSidebarButton">
          {sidebarCollapsed ? '►' : '◄'} {/* Simple text-based toggle icon */}
        </button>
        <div className='upperSide'>
          <div className='upperSideTop'><img src={logo} alt='' className='logo'/><span className='brand'>GitChat</span></div>
          <button className='closeSidebarBtn' onClick={toggleSidebar}>
          Close Sidebar
          </button>
          <button className='closeSidebarBtn' onClick={openDialog}>
            <img src={addBtn} alt='' className='addBtn'/>New Codebase
          </button>
          
          {newCodebaseLink && (<a href={newCodebaseLink}
    target="_blank"
    rel="noopener noreferrer"
    className="newCodebaseLink"
    style={{
      display: 'block',
      textAlign: 'center',
      marginTop: '20px',
      fontFamily: 'Roboto Mono, monospace',
      color: '#f56e0f',
      textDecoration: 'none',
      fontSize: '16px',
    }}
  >
    {extractRepoDetails(newCodebaseLink).user} / {extractRepoDetails(newCodebaseLink).repo}
  </a>
)}

        </div>
        <div className='fileDirectory'>
            <h3>File Directory</h3>
            {isLoadingDirectory ? (
            <p>Loading directory...</p>
            ) : (
            renderFileDirectory(fileDirectory)
          )}
          </div>
      </div>
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
  {!showDarkPopup && (
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

      <GitHubPopup
        show={showDarkPopup}
        onClose={closeDialog}
        onGitHubSubmit={handleGitHubSubmit}
        gitHubUrl={gitHubUrl}
        setGitHubUrl={setGitHubUrl}
      />
    </div>
  );
};

export default App;
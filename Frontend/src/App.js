import './App.css';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import logo from './assets/logo2.png';
import home from './assets/home.svg';
import addBtn from './assets/add-30.png';
import msgIcon from './assets/message.svg';
import saved from './assets/bookmark.svg';
import rocket from './assets/rocket.svg';
import sendBtn from './assets/send.svg';
import userIcon from './assets/user.png';
import GitHubPopup from './GithubPopup';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';  


ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);


function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('idle');
  const [showDialog, setShowDialog] = useState(false);
  const [gitHubUrl, setGitHubUrl] = useState('');
  const[sessionId, setSessionId] = useState('');
  const [fileDirectory, setFileDirectory] = useState([]);
  const [showDarkPopup, setShowDarkPopup] = useState(true);




  useEffect(() => {

    // Poll for messages and status every second
    let sessionId = Cookies.get('sessionId');
    if (!sessionId) {
      sessionId = uuidv4();  // Generate a new session ID
      Cookies.set('sessionId', sessionId, { expires: 7 });  // Store it in a cookie
    }

    setSessionId(sessionId);  // Update the sessionId state
  
    const intervalId = setInterval(() => {
      fetchMessages(sessionId);  // Pass sessionId to fetch messages
      checkStatus(sessionId);
      fetchFileDirectory(sessionId)    // Pass sessionId to check status
    }, 10000);
    return () => clearInterval(intervalId);
  }, []);

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
  const renderFileDirectory = (directory, path = '') => {
    const entries = Object.entries(directory);
    if (!entries.length) return null;  // No files or directories
  
    return (
      <ul>
        {entries.map(([key, value]) => {
          const fullPath = path ? `${path}/${key}` : key;
          return (
            <li key={fullPath}>
              {value ? (
                <>
                  <span className="folder">{key}</span>
                  {renderFileDirectory(value, fullPath)}
                </>
              ) : (
                <span className="file">{key}</span>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  const fetchMessages = async (sessionId) => {
    try {
      const response = await axios.get(`/get_messages/${sessionId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();  // Prevent the default form submission on pressing 'Enter'
      handleSend();         // Call the handleSend function
    }
  };

  const checkStatus = async (sessionId) => {
    try {
      const response = await axios.get(`/check_status/${sessionId}`);
      setStatus(response.data.status);
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };


  const fetchFileDirectory = async (sessionId) => {
    try {
      const response = await axios.get(`/get_file_directory/${sessionId}`);
      if (response.data.file_directory) {
        const parsedDirectory = parseFileDirectory(response.data.file_directory);
        setFileDirectory(parsedDirectory);
      } else {
        console.error('File directory not found in response:', response.data);
      }
    } catch (error) {
      console.error('Error fetching file directory:', error);
    }
  };
  

  const handleSend = async () => {
    try {
      const response = await axios.post('/newprompt', {
        prompt: input,
        session_id: sessionId,
      });
      console.log(response.data.message); // Processing new prompt...
      setInput(''); // Clear the input field after sending the message

    } catch (error) {
      console.error('Error sending prompt:', error);
    }
  };

  const handleGitHubSubmit = async () => {
    try {
      const response = await axios.post('/gitget', {
        link: gitHubUrl,
        session_id: sessionId,  // Assuming you have a sessionId, adjust as needed
      });
      setShowDarkPopup(false);
      setGitHubUrl(''); // Reset the GitHub URL

    } catch (error) {
      console.error('Error submitting GitHub URL:', error);
    }
  };

  const openDialog = () => {
    setShowDarkPopup(true);
  };

  const closeDialog = () => {
    setShowDarkPopup(false);
  };

  // Function to recursively render file directory items


  return (
    <div className="App">
      <div className='sideBar'>
        <div className='upperSide'>
          <div className='upperSideTop'><img src={logo} alt='' className='logo'/><span className='brand'>GitChat</span></div>
          <button className='midBtn' onClick={openDialog}>
            <img src={addBtn} alt='' className='addBtn'/>New Codebase
          </button>
        </div>
        <div className='fileDirectory'>
            <h3>File Directory</h3>
            {renderFileDirectory(fileDirectory)}
        </div>
      </div>
      <div className='main'>
        <div className='chats'>
          {messages.map((message, index) => (
            <div key={index} className={`chat ${message.from === 'bot' ? 'bot' : ''}`}>
              <img src={message.from === 'bot' ? logo : userIcon} alt=""/>
              <p className='txt'>{message.content}</p>
            </div>
          ))}
        </div>
        <div className='chatFooter'>
          <div className='inp'>
            <input type='text' 
            placeholder='Send a message' 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress} // Add the onKeyPress event handler
          />
            <button className='send' onClick={handleSend}><img src={sendBtn} alt='' /></button>
          </div>
          <p>Status: {status}</p>
        </div>
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
}

export default App;


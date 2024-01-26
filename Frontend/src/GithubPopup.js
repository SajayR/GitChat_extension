// GitHubPopup.js
import React, { useState } from 'react';
import logo from './assets/logo2.png';

const GitHubPopup = ({ show, onClose, onGitHubSubmit, gitHubUrl, setGitHubUrl }) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateGitHubUrl = (url) => {
    const regex = /^https:\/\/github\.com\/[^/]+\/[^/]+(\.git)?$/;
    return regex.test(url);
  };

  const handleSubmit = async () => {
    if (validateGitHubUrl(gitHubUrl)) {
      setIsLoading(true);
      await onGitHubSubmit();
      setIsLoading(false);
    } else {
      setError('Invalid GitHub Repository URL');
    }
  };

  return (
    show && (
      <div className='darkPopupContainer'>
        <img src={logo} alt='Logo' className='logoImage' />
        <div className='darkPopup'>
          <div className='popupContent'>
            <input
              type='text'
              placeholder='GitHub Repository URL'
              value={gitHubUrl}
              onChange={(e) => setGitHubUrl(e.target.value)}
            />
            <button onClick={handleSubmit} disabled={isLoading}>Submit</button>
            <button onClick={onClose}>Cancel</button>
            {isLoading && <p>Loading...</p>}
            {error && <p className="error">{error}</p>}
          </div>
        </div>
      </div>
    )
  );
};

export default GitHubPopup;
import { v4 as uuidv4 } from 'uuid';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get({ sessionId: null }, (result) => {
    if (!result.sessionId) {
      const newSessionId = uuidv4(); // Generate a new sessionId
      chrome.storage.local.set({ sessionId: newSessionId }, () => {
        console.log('New sessionId is stored in Chrome storage');
      });
    }
  });
});

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  const currentUrl = tabs[0].url;
  chrome.storage.local.set({currentUrl: currentUrl}, function() {
    console.log('URL is stored in Chrome storage');
  });
});
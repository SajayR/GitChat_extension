chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentUrl = tabs[0].url;
    chrome.storage.local
    .set({currentUrl: currentUrl}, function() {
      console.log('URL is stored in Chrome storage');
    });
  });
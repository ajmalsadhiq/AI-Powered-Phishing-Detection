const input = document.getElementById('apiBaseUrl');
const button = document.getElementById('save');

// Retrieve the currently saved URL (default to localhost)
chrome.storage.sync.get(['apiBaseUrl'], (result) => {
  input.value = result.apiBaseUrl || 'http://localhost:5000';
});

// Save the custom URL on button click
button.addEventListener('click', () => {
  chrome.storage.sync.set({ apiBaseUrl: input.value.trim() || 'http://localhost:5000' });
  button.textContent = 'Saved';
  setTimeout(() => {
    button.textContent = 'Save API URL';
  }, 1000);
});

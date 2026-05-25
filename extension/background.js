chrome.runtime.onInstalled.addListener(() => {
  // Create context menu item on install
  chrome.contextMenus.create({
    id: "check-hoax-jagafakta",
    title: "Cek dengan JagaFakta",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "check-hoax-jagafakta" && info.selectionText) {
    // URL encode the highlighted text
    const query = encodeURIComponent(info.selectionText);

    // Open JagaFakta with the query parameter
    // In production, this would be: https://jagafakta.com/?q=${query}
    const url = `https://jagafakta-379590111218.asia-southeast1.run.app/?q=${query}`;

    // Create a new tab with the results
    chrome.tabs.create({ url });
  }
});

chrome.action.onClicked.addListener(() => {
  // Clicking the extension icon just opens the website
  chrome.tabs.create({ url: "https://jagafakta-379590111218.asia-southeast1.run.app" });
});

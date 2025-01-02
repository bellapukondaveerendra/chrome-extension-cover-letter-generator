import { validateSelectedText } from "./utils.js";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "generateCoverLetter",
    title: "Generate Cover Letter",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  // console.log("Context Menu Clicked:", info.selectionText);
  if (info.menuItemId === "generateCoverLetter" && info.selectionText) {
    const validation = validateSelectedText(info.selectionText);

    if (!validation.isValid) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "Invalid Selection",
        message: validation.message,
      });
      return;
    }

    // Save the selected text for the popup to access
    chrome.storage.local.set({ selectedText: info.selectionText });
  }
});

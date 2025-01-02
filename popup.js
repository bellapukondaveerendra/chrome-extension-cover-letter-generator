import { validateSelectedText } from "./utils.js";
import config from "./config.js";
let isGenerating = false; // Track the generation status
document.addEventListener("DOMContentLoaded", async () => {
  const coverLetterTextarea = document.getElementById("coverLetter");
  const copyButton = document.getElementById("copyButton");
  const openSettingsButton = document.getElementById("openSettings");
  const errorMessage = document.getElementById("errorMessage");
  const closeButton = document.getElementById("closeButton");

  // Fetch the selected text dynamically
  let jobDescription = "No job description selected.";
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString(),
    });
    jobDescription = result.result || "No job description selected.";
  } catch (error) {
    console.error("Error fetching selected text:", error);
  }

  if (jobDescription === "No job description selected.") {
    coverLetterTextarea.value = jobDescription;
    return;
  }

  coverLetterTextarea.value = "Validating Selected Text...";
  const validation = validateSelectedText(jobDescription);

  if (validation && validation.isValid) {
    coverLetterTextarea.value = "Generating cover letter...";
    try {
      const userProfile = await getUserDetails();
      isGenerating = true; // Mark as generating
      const coverLetter = await generateCoverLetterWithOpenAI(
        jobDescription,
        userProfile
      );
      coverLetterTextarea.value = coverLetter;
    } catch (error) {
      if (isGenerating) {
        coverLetterTextarea.value =
          "Error generating cover letter. Try again Later.";
      }
    } finally {
      isGenerating = false; // Reset the generation status
    }
  } else {
    coverLetterTextarea.value = validation.message;
  }

  copyButton.addEventListener("click", () => {
    const coverLetter = coverLetterTextarea.value;
    if (!coverLetter || coverLetter.includes("No job description")) {
      errorMessage.textContent = "No valid cover letter to copy!";
      return;
    }
    navigator.clipboard.writeText(coverLetter).then(() => {
      alert("Cover letter copied to clipboard!");
    });
  });

  closeButton.addEventListener("click", () => {
    if (isGenerating) {
      isGenerating = false; // Stop generation process
      coverLetterTextarea.value = "Cover letter generation canceled.";
    }
    window.close();
  });

  openSettingsButton.addEventListener("click", () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage().catch((error) => {
        console.error("Failed to open options page:", error);
        window.open(chrome.runtime.getURL("settings.html"));
      });
    } else {
      window.open(chrome.runtime.getURL("settings.html"));
    }
  });
});

/**
 * Fetch user profile from chrome.storage.local.
 */
async function getUserDetails() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["userDetails"], (data) => {
      resolve(data.userDetails || {});
    });
  });
}

/**
 * Function to interact with OpenAI API
 */
async function generateCoverLetterWithOpenAI(jobDescription, userProfile) {
  const apiKey = config.OPENAI_API_KEY;
  const prompt = `
    Generate a professional cover letter based on the following details:
    Job Description: ${jobDescription}
    User Profile: Name: ${userProfile.name}, Skills: ${userProfile.skills}, Experience: ${userProfile.experience}.
  `;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorDetails = await response.json();
    throw new Error(
      `OpenAI API Error: ${errorDetails.error.message || response.statusText}`
    );
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

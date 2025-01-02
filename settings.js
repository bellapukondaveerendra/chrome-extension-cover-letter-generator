document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("name");
  const workExperienceInput = document.getElementById("workExperience");
  const educationInput = document.getElementById("education");
  const skillsInput = document.getElementById("skills");
  const projectsInput = document.getElementById("projects");
  const achievementsInput = document.getElementById("achievements");
  const statusMessage = document.getElementById("statusMessage");

  // Populate the form with existing details from storage
  chrome.storage.local.get(["userDetails"], (data) => {
    const userDetails = data.userDetails || {};
    nameInput.value = userDetails.name || "";
    workExperienceInput.value = userDetails.workExperience || "";
    educationInput.value = userDetails.education || "";
    skillsInput.value = userDetails.skills || "";
    projectsInput.value = userDetails.projects || "";
    achievementsInput.value = userDetails.achievements || "";
  });

  // Save form data to storage
  document.getElementById("userForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const userDetails = {
      name: nameInput.value.trim(),
      workExperience: workExperienceInput.value.trim(),
      education: educationInput.value.trim(),
      skills: skillsInput.value.trim(),
      projects: projectsInput.value.trim(),
      achievements: achievementsInput.value.trim(),
    };

    chrome.storage.local.set({ userDetails }, () => {
      statusMessage.textContent = "Details saved successfully!";
      statusMessage.style.color = "green";
      setTimeout(() => {
        statusMessage.textContent = "";
      }, 3000);
    });
  });
});

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWFlOGNkZGYtZDc3My00OGZhLTkzNmMtNmRjZmMxZDlmMzExIiwidHlwZSI6InNhbmRib3hfYXBpX3Rva2VuIiwibmFtZSI6ImZsYXNoIiwiaXNfY3VzdG9tIjp0cnVlfQ.lBVWb-jfCXedMK_jtpb4hfUYQMg8mMT_jJo7TNgnlvI'
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const generateBtn = document.getElementById("generate-btn");
  const userInput = document.getElementById("user-input");
  const flashcardsContainer = document.getElementById("flashcards-container");
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");

  const geminiApiKey = localStorage.getItem("GEMINI_API_KEY") || "AIzaSyAug3QzeXsavkWaGzuMNTGafLmLSva9dZU";
  const edenApiKey = localStorage.getItem("EDEN_API_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWFlOGNkZGYtZDc3My00OGZhLTkzNmMtNmRjZmMxZDlmMzExIiwidHlwZSI6InNhbmRib3hfYXBpX3Rva2VuIiwibmFtZSI6ImZsYXNoIiwiaXNfY3VzdG9tIjp0cnVlfQ.lBVWb-jfCXedMK_jtpb4hfUYQMg8mMT_jJo7TNgnlvI";
  const geminiApiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${geminiApiKey.trim()}`;
  const edenApiUrl = "https://api.edenai.run/v2/image/generation";

  const maxPromptLength = 1500;

  // Function to set the theme
  function setTheme(theme) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
      themeIcon.textContent = theme === "light" ? "☀️ Light" : "🌙 Dark";
  }

  // Load theme on page load
  function loadTheme() {
      const savedTheme = localStorage.getItem("theme") || "light";
      setTheme(savedTheme);
  }

  // Toggle theme
  function toggleTheme() {
      const currentTheme = localStorage.getItem("theme") || "light";
      const newTheme = currentTheme === "light" ? "dark" : "light";
      setTheme(newTheme);
  }

  // Event Listeners
  themeToggle.addEventListener("click", toggleTheme);
  window.addEventListener("load", loadTheme);

  // Flashcard generation function
  async function generateFlashcardImage() {
      const inputText = userInput.value.trim();
      if (!inputText) {
          alert("Please enter a topic to generate a flashcard.");
          return;
      }

      if (!geminiApiKey || !edenApiKey) {
          alert("Missing API keys! Please set them in localStorage.");
          console.error("Error: Missing API keys.");
          return;
      }

      try {
          generateBtn.innerHTML = 'Generating... <i class="fas fa-spinner fa-spin"></i>';
          generateBtn.disabled = true;

          // Step 1: Generate an image prompt using Gemini API
          const geminiResponse = await fetch(geminiApiUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  contents: [{ parts: [{ text: `Generate a short, descriptive image prompt (max ${maxPromptLength} chars) for a flashcard about ${inputText}.` }] }]
              })
          });

          if (!geminiResponse.ok) {
              throw new Error(`Gemini API Error: ${geminiResponse.status} - ${geminiResponse.statusText}`);
          }

          const geminiData = await geminiResponse.json();
          const imagePrompt = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (!imagePrompt) {
              throw new Error("Invalid response from Gemini API.");
          }

          console.log("Generated Image Prompt:", imagePrompt);

          // Step 2: Generate an image using Eden AI
          const imageResponse = await fetch(edenApiUrl, {
              method: "POST",
              headers: {
                  "Authorization": `Bearer ${edenApiKey.trim()}`,
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({
                  providers: "stabilityai",
                  text: imagePrompt.substring(0, maxPromptLength),
                  resolution: "512x512"
              }),
          });

          if (!imageResponse.ok) {
              throw new Error(`Eden AI Error: ${imageResponse.status} - ${imageResponse.statusText}`);
          }

          const imageData = await imageResponse.json();
          const imageUrl = imageData?.stabilityai?.items?.[0]?.image;
          if (!imageUrl) {
              throw new Error("No image URL received from Eden AI.");
          }

          // Display the generated image
          displayFlashcardImage(imageUrl);

      } catch (error) {
          console.error("Error generating flashcard image:", error);
          alert("Failed to generate flashcard image. Please try again.");
      } finally {
          generateBtn.innerHTML = 'Generate Flashcard <i class="fas fa-magic"></i>';
          generateBtn.disabled = false;
      }
  }

  // Function to display the generated flashcard image
  function displayFlashcardImage(imageUrl) {
      flashcardsContainer.innerHTML = ""; 

      const imageElement = document.createElement("img");
      imageElement.src = imageUrl;
      imageElement.alt = "Generated Flashcard Image";
      imageElement.className = "flashcard-image img-fluid rounded shadow";

      flashcardsContainer.appendChild(imageElement);
  }

  generateBtn.addEventListener("click", generateFlashcardImage);

  console.log("Set API keys using:");
  console.log('localStorage.setItem("GEMINI_API_KEY", "your-gemini-api-key-here");');
  console.log('localStorage.setItem("EDEN_API_KEY", "your-eden-api-key-here");');
});


//Prevent righ click
document.oncontextmenu = () => {
    alert("Don't try right click")
    return false
}

document.onkeydown = e => {
    //Prevent F12 key
    if (e.key == "F12") {
        alert("Don't try to inspect element")
        return false
    }

    //Prevent showing page source by ctrl + U
    if (e.ctrlKey && e.key == "u") {
        alert("Don't try to view page sources")
        return false
    }
}

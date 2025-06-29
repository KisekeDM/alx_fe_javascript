// ===============================
// QUOTES STORAGE & SETUP
// ===============================
let quotes = [];

// Load quotes from localStorage or fallback to defaults
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    quotes = JSON.parse(stored);
  } else {
    quotes = [
      { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
      { text: "Imagination is more important than knowledge.", category: "Inspiration" },
      { text: "Do not wait to strike till the iron is hot; but make it hot by striking.", category: "Action" }
    ];
    saveQuotes();
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ===============================
// DOM ELEMENT REFERENCES
// ===============================
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const categoryFilter = document.getElementById("categoryFilter");
const exportBtn = document.getElementById("exportQuotesBtn");
const importFileInput = document.getElementById("importFile");

// ===============================
// SHOW RANDOM QUOTE
// ===============================
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category.toLowerCase() === selectedCategory.toLowerCase());

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes available in this category.</p>`;
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p>"${quote.text}"</p>
    <span style="font-style: italic; color: gray;">— [${quote.category}]</span>
  `;

  // Save last viewed quote to sessionStorage
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// ===============================
// ADD NEW QUOTE
// ===============================
function addQuote() {
  const quoteTextInput = document.getElementById("newQuoteText");
  const quoteCategoryInput = document.getElementById("newQuoteCategory");

  const quoteText = quoteTextInput.value.trim();
  const quoteCategory = quoteCategoryInput.value.trim();

  if (!quoteText || !quoteCategory) {
    alert("Please enter both the quote and its category.");
    return;
  }

  const newQuote = { text: quoteText, category: quoteCategory };
  quotes.push(newQuote);
  saveQuotes(); // Persist updated quotes

  // Update dropdown if new category
  const exists = Array.from(categoryFilter.options).some(
    opt => opt.value.toLowerCase() === quoteCategory.toLowerCase()
  );
  if (!exists) {
    const newOption = document.createElement("option");
    newOption.value = quoteCategory;
    newOption.textContent = quoteCategory;
    categoryFilter.appendChild(newOption);
  }

  quoteTextInput.value = "";
  quoteCategoryInput.value = "";
  alert("Quote added successfully!");
}

// ===============================
// EXPORT TO JSON FILE
// ===============================
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ===============================
// IMPORT FROM JSON FILE
// ===============================
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);

      if (!Array.isArray(importedQuotes)) throw new Error("Invalid format");

      importedQuotes.forEach(q => {
        if (q.text && q.category) {
          quotes.push({ text: q.text, category: q.category });
        }
      });

      saveQuotes();
      updateCategoryDropdown();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Failed to import quotes. Make sure the file is a valid JSON array.");
    }
  };
  reader.readAsText(file);
}

// ===============================
// UTILITIES
// ===============================
function updateCategoryDropdown() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All</option>';
  uniqueCategories.forEach(category => {
    const opt = document.createElement("option");
    opt.value = category;
    opt.textContent = category;
    categoryFilter.appendChild(opt);
  });
}

function loadLastViewedQuote() {
  const lastQuoteStr = sessionStorage.getItem("lastQuote");
  if (lastQuoteStr) {
    const quote = JSON.parse(lastQuoteStr);
    quoteDisplay.innerHTML = `
      <p>"${quote.text}"</p>
      <span style="font-style: italic; color: gray;">— [${quote.category}]</span>
    `;
  }
}

// ===============================
// INIT APP
// ===============================
window.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  updateCategoryDropdown();
  loadLastViewedQuote();
});

// ===============================
// EVENT LISTENERS
// ===============================
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
exportBtn.addEventListener("click", exportQuotes);
importFileInput.addEventListener("change", importFromJsonFile);

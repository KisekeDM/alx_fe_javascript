let quotes = [];

// === LOAD/SAVE QUOTES ===
function createAddQuoteForm() {
  const stored = localStorage.getItem("quotes");
  quotes = stored ? JSON.parse(stored) : getDefaultQuotes();
  saveQuotes(); // Ensure storage exists
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// === DEFAULT STARTING QUOTES ===
function getDefaultQuotes() {
  return [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { text: "Imagination is more important than knowledge.", category: "Inspiration" },
    { text: "Do not wait to strike till the iron is hot; but make it hot by striking.", category: "Action" }
  ];
}

// === DOM REFERENCES ===
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const categoryFilter = document.getElementById("categoryFilter");
const exportBtn = document.getElementById("exportQuotesBtn");
const importFileInput = document.getElementById("importFile");

// === POPULATE CATEGORY DROPDOWN ===
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  }

  );

  // Restore saved filter
  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) {
    categoryFilter.value = savedFilter;
    filterQuotes(); // Show filtered quotes
  }
}

// === FILTER QUOTES BY CATEGORY ===
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("selectedCategory", selected); // Remember filter

  const filtered = selected === "all"
    ? quotes
    : quotes.filter(q => q.category === selected);

  displayQuotes(filtered);
}

// === DISPLAY QUOTES ===
function displayQuotes(list) {
  if (list.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes in this category.</p>`;
    return;
  }

  const html = list.map(q =>
    `<p>"${q.text}"<br><span style="font-style: italic; color: gray;">— [${q.category}]</span></p>`
  ).join("");

  quoteDisplay.innerHTML = html;
}

// === SHOW RANDOM QUOTE ===
function showRandomQuote() {
  const selected = categoryFilter.value;
  const filtered = selected === "all"
    ? quotes
    : quotes.filter(q => q.category === selected);

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes available in this category.</p>`;
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.innerHTML = `
    <p>"${random.text}"</p>
    <span style="font-style: italic; color: gray;">— [${random.category}]</span>
  `;

  // Save last viewed to sessionStorage
  sessionStorage.setItem("lastQuote", JSON.stringify(random));
}

// === ADD NEW QUOTE ===
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const catInput = document.getElementById("newQuoteCategory");
  const text = textInput.value.trim();
  const category = catInput.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  filterQuotes();

  textInput.value = "";
  catInput.value = "";
  alert("Quote added!");
}

// === EXPORT QUOTES ===
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

// === IMPORT QUOTES ===
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid format");

      imported.forEach(q => {
        if (q.text && q.category) {
          quotes.push({ text: q.text, category: q.category });
        }
      });

      saveQuotes();
      populateCategories();
      filterQuotes();
      alert("Quotes imported!");
    } catch (err) {
      alert("Import failed. Invalid JSON format.");
    }
  };

  reader.readAsText(file);
}

// === INIT ON PAGE LOAD ===
window.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  filterQuotes();

  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const q = JSON.parse(lastQuote);
    quoteDisplay.innerHTML = `
      <p>"${q.text}"</p>
      <span style="font-style: italic; color: gray;">— [${q.category}]</span>
    `;
  }
});

// =====================
// SIMULATED SERVER SYNC
// =====================

// Mock server URL for fetching quotes
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';

// Track last sync state
let lastServerQuotes = [];

// Fetch from server every X seconds
function startSyncInterval() {
  setInterval(syncWithServer, 10000); // every 10 seconds
}

// Fetch server data and compare with local
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    const hasConflict = detectConflicts(quotes, serverData);

    if (hasConflict) {
      // Server wins in this simple example
      quotes = serverData;
      saveQuotes();
      populateCategories();
      filterQuotes();

      notifyUser("Quotes updated from server. Local changes may have been overwritten.");
    }

    lastServerQuotes = serverData;
  } catch (err) {
    console.error("Failed to fetch server data:", err);
  }
}

// Conflict detection — very basic
function detectConflicts(local, server) {
  if (local.length !== server.length) return true;

  for (let i = 0; i < local.length; i++) {
    if (
      local[i].text !== server[i]?.text ||
      local[i].category !== server[i]?.category
    ) {
      return true;
    }
  }
  return false;
}

// OPTIONAL: Simulate POST to server
async function syncQuotes() {
  try {
    await fetch(SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quotes),
    });
    notifyUser("Quotes synced with server!");
  } catch (err) {
    console.error("Failed to post data to server:", err);
  }
}

function notifyUser(message) {
  const note = document.getElementById("notification");
  note.textContent = message;
  setTimeout(() => {
    note.textContent = "";
  }, 5000);
}

startSyncInterval(); // Begin periodic syncing


// === EVENT LISTENERS ===
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
exportBtn.addEventListener("click", exportQuotes);
importFileInput.addEventListener("change", importFromJsonFile);

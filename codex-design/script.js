const DATA_URL = "../redesign/jokes-data.json";
const htmlEl = document.documentElement;
const toggleBtn = document.querySelector(".theme-toggle");
const toggleLabel = toggleBtn?.querySelector(".toggle-label");
const toggleIcon = toggleBtn?.querySelector(".toggle-icon");
const randomBtn = document.querySelector(".random");
const spotlightCard = document.querySelector(".spotlight-card");
const spotlightText = spotlightCard?.querySelector(".joke-text");
const spotlightGuest = spotlightCard?.querySelector(".guest");
const spotlightSource = spotlightCard?.querySelector(".source");
const resultsList = document.querySelector("[data-results]");
const countEl = document.querySelector("[data-count]");
const searchInput = document.querySelector("input[name='search']");
const guestSelect = document.querySelector("select[name='guest']");
const sourceSelect = document.querySelector("select[name='source']");
const template = document.getElementById("joke-card");

const state = {
  jokes: [],
  filtered: [],
  filters: {
    search: "",
    guest: "",
    source: "",
  },
};

function getStoredTheme() {
  try {
    return localStorage.getItem("codex-theme");
  } catch (error) {
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem("codex-theme", theme);
  } catch (error) {
    // storage may be disabled; ignore
  }
}

function resolveTheme() {
  const stored = getStoredTheme();
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  return prefersDark ? "dark" : "light";
}

function applyTheme(theme) {
  htmlEl.setAttribute("data-theme", theme);
  const isDark = theme === "dark";
  if (toggleBtn) {
    toggleBtn.setAttribute("aria-pressed", String(isDark));
  }
  if (toggleLabel) {
    toggleLabel.textContent = isDark ? "Dark mode" : "Light mode";
  }
  if (toggleIcon) {
    toggleIcon.textContent = isDark ? "🌚" : "🌞";
  }
}

function toggleTheme() {
  const current = htmlEl.getAttribute("data-theme") === "dark" ? "dark" : "light";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  storeTheme(next);
}

function initTheme() {
  applyTheme(resolveTheme());
  if (!window.matchMedia) return;
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const listener = (event) => {
    const stored = getStoredTheme();
    if (!stored) {
      applyTheme(event.matches ? "dark" : "light");
    }
  };
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", listener);
  } else if (mediaQuery.addListener) {
    mediaQuery.addListener(listener);
  }
}

function normalise(value) {
  return value?.toLowerCase().trim() || "";
}

function filterJokes() {
  const { search, guest, source } = state.filters;
  const searchTerm = normalise(search);
  state.filtered = state.jokes.filter((joke) => {
    if (guest && joke.guest !== guest) return false;
    if (source && joke.source !== source) return false;
    if (!searchTerm) return true;
    const haystack = [joke.joke, joke.episode, joke.guest, joke.source]
      .filter(Boolean)
      .join("\n")
      .toLowerCase();
    return haystack.includes(searchTerm);
  });
  renderResults();
}

function renderSpotlight(joke) {
  if (!spotlightCard || !joke) {
    return;
  }
  spotlightCard.removeAttribute("data-placeholder");
  if (spotlightText) {
    spotlightText.innerHTML = joke.joke;
  }
  if (spotlightGuest) {
    spotlightGuest.textContent = joke.guest ? `Guest: ${joke.guest}` : "Guest: —";
  }
  if (spotlightSource) {
    spotlightSource.textContent = joke.source ? `Source: ${joke.source}` : "Source: —";
  }
}

function randomiseSpotlight() {
  const sourceArray = state.filtered.length ? state.filtered : state.jokes;
  if (!sourceArray.length) {
    return;
  }
  const index = Math.floor(Math.random() * sourceArray.length);
  renderSpotlight(sourceArray[index]);
}

function renderResults() {
  if (!resultsList || !template) return;
  resultsList.innerHTML = "";
  const fragment = document.createDocumentFragment();
  state.filtered.forEach((joke) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector(".joke-text").innerHTML = joke.joke;
    node.querySelector(".guest").textContent = joke.guest || "—";
    node.querySelector(".source").textContent = joke.source || "—";
    node.querySelector(".episode").textContent = joke.episode || "—";
    node.querySelector(".time").textContent = joke.time || "—";
    const link = node.querySelector(".jump-link");
    if (joke.url) {
      const url = new URL("https://www.youtube.com/watch");
      url.searchParams.set("v", joke.url);
      if (joke.time) {
        url.searchParams.set("t", joke.time.replace(/[^0-9hms]/gi, ""));
      }
      link.href = url.toString();
      link.hidden = false;
    }
    fragment.appendChild(node);
  });
  resultsList.appendChild(fragment);
  if (countEl) {
    countEl.textContent = state.filtered.length;
  }
  if (!state.filtered.length) {
    const empty = document.createElement("li");
    empty.className = "card";
    empty.textContent = "No jokes match your filters just yet.";
    resultsList.appendChild(empty);
  }
}

function populateFilters() {
  const guests = new Set();
  const sources = new Set();
  state.jokes.forEach((joke) => {
    if (joke.guest) guests.add(joke.guest);
    if (joke.source) sources.add(joke.source);
  });
  const sortedGuests = Array.from(guests).sort((a, b) => a.localeCompare(b));
  const sortedSources = Array.from(sources).sort((a, b) => a.localeCompare(b));
  if (guestSelect) {
    sortedGuests.forEach((guest) => {
      const option = document.createElement("option");
      option.value = guest;
      option.textContent = guest;
      guestSelect.appendChild(option);
    });
  }
  if (sourceSelect) {
    sortedSources.forEach((source) => {
      const option = document.createElement("option");
      option.value = source;
      option.textContent = source;
      sourceSelect.appendChild(option);
    });
  }
}

async function loadJokes() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch jokes (${response.status})`);
    }
    const jokes = await response.json();
    if (!Array.isArray(jokes)) {
      throw new Error("Unexpected data format");
    }
    state.jokes = jokes;
    populateFilters();
    filterJokes();
    randomiseSpotlight();
  } catch (error) {
    handleLoadError(error);
  }
}

function handleLoadError(error) {
  console.error(error);
  if (spotlightText) {
    spotlightText.textContent = "We couldn't reach the archive just now. Try reloading.";
  }
  if (resultsList) {
    resultsList.innerHTML = "";
    const fail = document.createElement("li");
    fail.className = "card";
    fail.textContent = "Unable to load jokes. Please check your connection.";
    resultsList.appendChild(fail);
  }
  if (countEl) {
    countEl.textContent = "0";
  }
}

function attachEvents() {
  toggleBtn?.addEventListener("click", toggleTheme);
  randomBtn?.addEventListener("click", () => {
    randomiseSpotlight();
    randomBtn.blur();
  });
  searchInput?.addEventListener("input", (event) => {
    state.filters.search = event.target.value;
    filterJokes();
  });
  guestSelect?.addEventListener("change", (event) => {
    state.filters.guest = event.target.value;
    filterJokes();
  });
  sourceSelect?.addEventListener("change", (event) => {
    state.filters.source = event.target.value;
    filterJokes();
  });
}

function boot() {
  initTheme();
  attachEvents();
  loadJokes();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

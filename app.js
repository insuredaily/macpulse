// Pulse News Aggregator Client - Static Version
const state = {
  allArticles: [],       // Raw array of all articles loaded from articles.json
  filteredArticles: [],  // Currently filtered subset (active category + search)
  activeFilter: 'all',   // 'all', 'bookmarks', or specific category name
  searchQuery: '',
  bookmarkedIds: JSON.parse(localStorage.getItem('pulse_bookmarks') || '[]'),
  isLoading: false
};

// DOM Elements
const elements = {
  articlesGrid: document.getElementById('articles-grid'),
  searchInput: document.getElementById('search-input'),
  searchClearBtn: document.getElementById('search-clear-btn'),
  categoryTabs: document.getElementById('category-tabs'),
  articleCount: document.getElementById('article-count'),
  feedTitle: document.getElementById('feed-title'),
  toastContainer: document.getElementById('toast-container')
};

// Relative time formatter
function formatRelativeTime(dateString) {
  if (!dateString) return 'unknown date';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  
  if (isNaN(diffMs)) return dateString;

  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// Toast Notifications Helper
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-success';
  
  // Icon
  const icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;

  toast.innerHTML = `${icon}<span>${message}</span>`;
  elements.toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Render skeleton loading states
function renderSkeletons() {
  if (elements.articlesGrid) {
    elements.articlesGrid.innerHTML = Array(4)
      .fill(0)
      .map(() => `<div class="skeleton-card"></div>`)
      .join('');
  }
}

// Fetch Articles from static JSON file
async function fetchArticles() {
  if (!elements.articlesGrid) return; // Not on the news feed page (e.g. on About/Privacy pages)
  
  state.isLoading = true;
  renderSkeletons();

  try {
    const response = await fetch('./articles.json');
    if (!response.ok) throw new Error('Could not fetch articles.json');
    
    state.allArticles = await response.json();
    filterAndRender();
  } catch (error) {
    console.error('Error fetching articles.json:', error);
    elements.articlesGrid.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <h3>No articles loaded</h3>
        <p>Ensure the feed updater script has executed and created <code>articles.json</code> in your repository root.</p>
      </div>
    `;
  } finally {
    state.isLoading = false;
  }
}

// Local Search and Filter Logic
function filterAndRender() {
  let results = [...state.allArticles];

  // 1. Filter by category
  if (state.activeFilter === 'bookmarks') {
    results = results.filter(art => state.bookmarkedIds.includes(art.id));
  } else if (state.activeFilter !== 'all') {
    const filterLower = state.activeFilter.toLowerCase();
    results = results.filter(art => {
      // Matches either source category or tag keyword list
      const sourceCat = (art.source_category || '').toLowerCase();
      const tags = (art.tags || '').toLowerCase().split(',');
      return sourceCat === filterLower || tags.includes(filterLower);
    });
  }

  // 2. Filter by search query
  if (state.searchQuery) {
    const searchLower = state.searchQuery.toLowerCase();
    results = results.filter(art => {
      const title = (art.title || '').toLowerCase();
      const content = (art.content || '').toLowerCase();
      const source = (art.source_name || '').toLowerCase();
      return title.includes(searchLower) || content.includes(searchLower) || source.includes(searchLower);
    });
  }

  state.filteredArticles = results;
  renderArticles();
}

// Render Articles Grid with Dynamic Inline Ads
function renderArticles() {
  const grid = elements.articlesGrid;
  if (!grid) return;
  
  grid.innerHTML = '';
  elements.articleCount.textContent = `${state.filteredArticles.length} stories`;
  
  // Set feed title text
  if (state.activeFilter === 'all') {
    elements.feedTitle.textContent = state.searchQuery ? `Search Results` : 'Latest Updates';
  } else if (state.activeFilter === 'bookmarks') {
    elements.feedTitle.textContent = 'Bookmarked Stories';
  } else {
    elements.feedTitle.textContent = `${state.activeFilter} Articles`;
  }

  if (state.filteredArticles.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg>
        <h3>No articles found</h3>
        <p>Try refining your search keyword or selecting another tab category.</p>
      </div>
    `;
    return;
  }

  state.filteredArticles.forEach((article, index) => {
    
    // ====================================================
    // DYNAMIC INLINE AD CARD PLACEMENT
    // Every 6 articles, we insert a native ad card block
    // ====================================================
    if (index > 0 && index % 6 === 0) {
      const adCard = document.createElement('div');
      adCard.className = 'ad-card glass';
      adCard.innerHTML = `
        <span class="ad-card-badge">Sponsored</span>
        <h4>Premium Smart Reader</h4>
        <p>Support this news service. Learn more about advertising or sign up for an ad-free experience.</p>
        
        <!-- ========================================== -->
        <!-- INLINE CARD AD CODE                        -->
        <!-- Paste your native card ad code script here -->
        <!-- ========================================== -->
        <!-- <script type="text/javascript"> ... </script> -->
        <a href="#" class="btn btn-secondary btn-block" onclick="event.preventDefault(); alert('Sample advertisement link clicked!')">Visit Site</a>
      `;
      grid.appendChild(adCard);
    }

    const isBookmarked = state.bookmarkedIds.includes(article.id);
    const relativeTime = formatRelativeTime(article.pub_date || article.created_at);
    
    // Tag parsing
    const tagsArray = article.tags ? article.tags.split(',') : [];
    const tagsHtml = tagsArray
      .filter(t => t && t !== 'General')
      .map(tag => `<span class="tag-badge">${tag}</span>`)
      .join('');

    const card = document.createElement('article');
    card.className = 'article-card glass';
    card.innerHTML = `
      <div class="card-meta">
        <span class="source-tag">${article.source_name || 'RSS Feed'}</span>
        <span class="article-time">${relativeTime}</span>
      </div>
      <h3><a href="${article.link}" target="_blank" rel="noopener noreferrer">${escapeHTML(article.title)}</a></h3>
      <div class="article-tags">${tagsHtml}</div>
      <p class="article-snippet">${escapeHTML(article.content || '')}</p>
      <div class="card-footer">
        <span class="article-creator">By ${escapeHTML(article.creator || 'Staff')}</span>
        <div class="card-actions">
          <button class="icon-btn btn-bookmark ${isBookmarked ? 'active' : ''}" data-id="${article.id}" aria-label="Bookmark article">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
          <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="icon-btn" aria-label="Open article website">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  // Attach bookmarks click listeners
  grid.querySelectorAll('.btn-bookmark').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = parseInt(btn.dataset.id);
      toggleBookmark(id, btn);
    });
  });
}

// Helper to escape HTML to prevent XSS
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Toggle bookmark state in array & localstorage
function toggleBookmark(id, btnElement) {
  const index = state.bookmarkedIds.indexOf(id);
  if (index === -1) {
    state.bookmarkedIds.push(id);
    btnElement.classList.add('active');
    btnElement.querySelector('svg').setAttribute('fill', 'currentColor');
    showToast('Saved to Bookmarks');
  } else {
    state.bookmarkedIds.splice(index, 1);
    btnElement.classList.remove('active');
    btnElement.querySelector('svg').setAttribute('fill', 'none');
    showToast('Removed from Bookmarks');
    
    // If we're on the bookmarks tab, refresh the view immediately
    if (state.activeFilter === 'bookmarks') {
      filterAndRender();
    }
  }
  localStorage.setItem('pulse_bookmarks', JSON.stringify(state.bookmarkedIds));
}

// Initialize Application Events
function initEvents() {
  if (!elements.searchInput) return;

  // Search text handler
  elements.searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    
    if (state.searchQuery.length > 0) {
      elements.searchClearBtn.style.display = 'block';
    } else {
      elements.searchClearBtn.style.display = 'none';
    }
    
    // Local filtering is instant
    filterAndRender();
  });

  // Clear Search button
  elements.searchClearBtn.addEventListener('click', () => {
    elements.searchInput.value = '';
    state.searchQuery = '';
    elements.searchClearBtn.style.display = 'none';
    filterAndRender();
  });

  // Category filter tabs handler
  elements.categoryTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    
    elements.categoryTabs.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    
    state.activeFilter = btn.dataset.filter;
    filterAndRender();
  });
}

// Bootstrapping
function init() {
  initEvents();
  fetchArticles();
}

// Startup
document.addEventListener('DOMContentLoaded', init);

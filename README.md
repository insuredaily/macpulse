# Pulse | Static News Aggregator & Monetized Feed

Pulse is a premium, self-updating news aggregator built to be hosted **100% free on GitHub Pages**. 

It uses **GitHub Actions** to pull RSS feeds every hour, tags articles automatically, and writes them to a static `articles.json` database. The frontend features a glassmorphic design optimized for high-yield ads (banners, native grid ads, and popunders).

---

## 🏗️ Folder Structure

```
├── .github/workflows/
│   └── update-feeds.yml  # GitHub Actions hourly cron workflow
├── scripts/
│   └── update-feeds.js   # Feed scraper & tagger node script
├── articles.json         # Auto-generated database of articles (static)
├── feeds.json            # List of active RSS sources
├── index.html            # Main feed & search interface (with ad slots)
├── about.html            # About info page (with ad slots)
├── privacy.html          # Privacy Policy page (required for ad approvals)
├── terms.html            # Terms of Service page
├── app.css               # Shared layout & animations stylesheet
├── app.js                # Search, bookmarking, and native ad injector
└── package.json          # Node script & dependencies config
```

---

## 💸 Monetization & Ads Integration

Pulse includes designated slots to paste your ad codes (e.g., AdSense, Adsterra, PropellerAds, PopAds):

1. **Popunders**: Add your script tag at the top of the `<head>` in [index.html](index.html).
2. **Top Leaderboard Banner**: Insert your banner HTML/JS inside the `<section class="ad-placement ad-top-banner">` in [index.html](index.html).
3. **Sidebar Box Ad**: Insert your 300x250 script inside `<div class="ad-placement ad-sidebar">` in [index.html](index.html).
4. **Native Grid Card Ads (Highest Earning)**: Inside [app.js](app.js#L143-L162), look for `DYNAMIC INLINE AD CARD PLACEMENT`. The client automatically inserts a native ad block after every 6 articles in the feed. Replace the mockup card with your script code.
5. **Content Banners**: Place standard size banner codes inside the container `<section class="ad-placement ad-content-banner">` on [about.html](about.html).

---

## 🚀 Deployment Instructions

### Step 1: Create a GitHub Repository
1. Log into [GitHub](https://github.com) and click **New Repository**.
2. Name it (e.g., `pulse-news`) and set it to **Public**.
3. **Do not** initialize it with a README or gitignore.

### Step 2: Push the Code to GitHub
Open a terminal in the `/home/bingparty/news-aggregator` folder and run:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
git push -u origin main
```
*(Replace `YOUR_USERNAME` and `YOUR_REPOSITORY_NAME` with your actual GitHub username and repository name).*

### Step 3: Configure Workflow Permissions (CRITICAL)
For the GitHub Action to commit new articles back to your repo:
1. Go to your repository settings page on GitHub.
2. Select **Actions** -> **General** on the left menu.
3. Scroll down to **Workflow permissions**.
4. Check **Read and write permissions**.
5. Click **Save**.

### Step 4: Enable GitHub Pages
1. Go to your repository settings page on GitHub.
2. Select **Pages** on the left menu.
3. Under **Build and deployment** -> **Source**, make sure **Deploy from a branch** is selected.
4. Under **Branch**, select **main** and root folder `/`, then click **Save**.

Within a few minutes, your site will be live at:
`https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME/`

---

## ⚙️ Customizing RSS Feeds
To add, remove, or edit news sources:
1. Open [feeds.json](feeds.json).
2. Edit the list of sources (specify `name`, `url`, and a target category).
3. Commit and push the changes. The scraper will fetch them automatically.

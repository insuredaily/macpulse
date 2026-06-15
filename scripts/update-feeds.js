import fs from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import Parser from 'rss-parser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FEEDS_FILE = join(__dirname, '../feeds.json');
const ARTICLES_FILE = join(__dirname, '../articles.json');

const parser = new Parser({
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MacPulseAggregator/1.0' },
  timeout: 8000
});

// Mac-specific auto-tagging rules
const TAG_RULES = {
  'Mac': /\b(mac|macbook|imac|mac mini|mac studio|mac pro|macos|sequoia|sonoma)\b/i,
  'iOS': /\b(iphone|ipad|ios|ipados|apple watch|watchos)\b/i,
  'Vision': /\b(vision pro|visionos|spatial computing|ar\/vr|headset)\b/i,
  'Rumors': /\b(rumor|leak|speculative|analyst|prediction|concept|mockup|render)\b/i,
  'Silicon': /\b(m1|m2|m3|m4|m5|apple silicon|chipset|processor|tsmc|gpu)\b/i,
  'App Store': /\b(app store|app|developer|swift|xcode|macos app|ios app)\b/i,
  'Services': /\b(icloud|apple music|apple tv\+|arcade|subscription|pay)\b/i
};

// Fallback high-quality Mac/Apple themed mock data
const mockArticles = [
  {
    id: 9001,
    source_name: 'MacRumors',
    title: 'Apple leaks plans for 2026 MacBook Pro featuring ultra-thin M5 Pro chips',
    link: 'https://www.macrumors.com/item/mock-macbook-pro-m5-leaks/',
    content: 'According to leaked supply chain schematics, the upcoming MacBook Pro lineup will see a dramatic redesign, dropping the chassis thickness by 20% using TSMC\'s new 2nm node M5 architecture.',
    pub_date: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    creator: 'Juli Clover',
    tags: 'Mac,Silicon,Rumors'
  },
  {
    id: 9002,
    source_name: '9to5Mac',
    title: 'Hands-on: macOS 16 Sequoia brings intelligent Window Tiling and System-wide Audio enhancements',
    link: 'https://9to5mac.com/2026/06/10/macos-16-sequoia-review-hands-on/',
    content: 'We take a deep dive into the first developer beta of macOS 16. The new window layout engine is seamless, and the redesigned Sound effects bring a premium acoustic feel to desktops.',
    pub_date: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    creator: 'Chance Miller',
    tags: 'Mac,App Store'
  },
  {
    id: 9003,
    source_name: 'AppleInsider',
    title: 'Apple Vision Pro 2 rumored for late 2026 release with dual-chip setup',
    link: 'https://appleinsider.com/articles/mock-vision-pro-2-dual-chip/',
    content: 'A new research note by supply chain analysts indicates that the next-generation spatial computing headset will feature both an M5 processor and a specialized R2 chip to reduce motion latency to under 5ms.',
    pub_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    creator: 'William Gallagher',
    tags: 'Vision,Silicon,Rumors'
  },
  {
    id: 9004,
    source_name: 'Macworld',
    title: 'Why standard Safari in macOS is outperforming Chrome in battery tests',
    link: 'https://www.macworld.com/article/safari-vs-chrome-macos-battery-tests/',
    content: 'Our detailed browser efficiency benchmark tests reveal that Safari leverages specific macOS kernel-level thread prioritization to extend MacBook Air battery life by up to 3 hours.',
    pub_date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    creator: 'Roman Loyola',
    tags: 'Mac,App Store'
  },
  {
    id: 9005,
    source_name: 'Cult of Mac',
    title: 'Top 10 macOS utilities you should install on your new Apple Silicon Mac',
    link: 'https://www.cultofmac.com/reviews/top-10-macos-utilities/',
    content: 'From window managers to clipboard tools, we round up the must-have software tools optimized for Apple Silicon to supercharge your desktop setup.',
    pub_date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    creator: 'Leander Kahney',
    tags: 'Mac,App Store'
  }
];

function generateTags(title, content) {
  const text = `${title} ${content || ''}`;
  const tags = [];
  for (const [tag, regex] of Object.entries(TAG_RULES)) {
    if (regex.test(text)) {
      tags.push(tag);
    }
  }
  return tags.length > 0 ? tags.join(',') : 'General';
}

async function run() {
  console.log('Starting MacPulse Feed Update Script...');
  
  if (!fs.existsSync(FEEDS_FILE)) {
    console.error('Error: feeds.json not found!');
    process.exit(1);
  }

  const feeds = JSON.parse(fs.readFileSync(FEEDS_FILE, 'utf-8'));
  let existingArticles = [];

  if (fs.existsSync(ARTICLES_FILE)) {
    try {
      existingArticles = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf-8'));
    } catch (e) {
      console.warn('Failed to parse articles.json, starting fresh.', e.message);
    }
  }

  const newArticles = [];
  let nextId = existingArticles.length > 0 ? Math.max(...existingArticles.map(a => a.id || 0)) + 1 : 1;

  for (const feedConfig of feeds) {
    console.log(`Fetching feed: ${feedConfig.name} (${feedConfig.url})`);
    try {
      const feed = await parser.parseURL(feedConfig.url);
      for (const item of feed.items) {
        const title = item.title || 'Untitled';
        const link = item.link || item.guid || '';
        if (!link) continue;

        const content = item.contentSnippet || item.content || item.summary || '';
        const pub_date = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();
        const creator = item.creator || item.author || feedConfig.name;
        const tags = generateTags(title, content);

        newArticles.push({
          source_name: feedConfig.name,
          title,
          link,
          content,
          pub_date,
          creator,
          tags
        });
      }
      console.log(`Successfully parsed ${feed.items.length} items from ${feedConfig.name}`);
    } catch (err) {
      console.warn(`⚠️ Warning: Failed to fetch ${feedConfig.name}:`, err.message);
    }
  }

  if (newArticles.length === 0 && existingArticles.length === 0) {
    console.log('No new articles fetched and articles.json is empty. Using mock data fallback...');
    newArticles.push(...mockArticles);
  }

  const mergedMap = new Map();
  existingArticles.forEach(art => mergedMap.set(art.link, art));
  
  newArticles.forEach(art => {
    const existing = mergedMap.get(art.link);
    if (existing) {
      art.id = existing.id;
    } else {
      art.id = nextId++;
    }
    mergedMap.set(art.link, art);
  });

  const mergedArticles = Array.from(mergedMap.values()).sort((a, b) => {
    return new Date(b.pub_date || b.created_at) - new Date(a.pub_date || a.created_at);
  });

  const trimmedArticles = mergedArticles.slice(0, 300);

  fs.writeFileSync(ARTICLES_FILE, JSON.stringify(trimmedArticles, null, 2));
  console.log(`Successfully wrote ${trimmedArticles.length} Mac articles to articles.json.`);
}

run().catch(err => {
  console.error('Fatal script error:', err);
  process.exit(1);
});

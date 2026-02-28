const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const BASE_URL = 'https://www.tinybutmightykittenrescue.org';
const OUTPUT_DIR = path.join(__dirname, '..', 'live');

// Known pages from site navigation
const KNOWN_PAGES = [
  '/',
  '/adopt',
  '/adoptable',
  '/subsidized-spay-neuter',
  '/about-3',
  '/favourites',
  '/lotto-for-cats',
  '/donate',
  '/empties',
  '/faq',
];

// Wix asset domains we want to download
const ASSET_DOMAINS = [
  'static.wixstatic.com',
  'static.parastorage.com',
  'static.cdn-website.com',
];

// Track downloaded assets to avoid duplicates
const downloadedAssets = new Map(); // url -> local path

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function sanitizeFilename(url) {
  url = decodeHtmlEntities(url);
  const parsed = new URL(url);
  let name = parsed.pathname.replace(/^\//, '').replace(/\//g, '_');
  if (parsed.search) {
    const params = parsed.search.replace(/[?&=]/g, '_').slice(0, 80);
    name += params;
  }
  if (!path.extname(name)) {
    name += '.bin';
  }
  if (name.length > 200) {
    const ext = path.extname(name);
    name = name.slice(0, 200 - ext.length) + ext;
  }
  return name;
}

function guessAssetSubdir(url) {
  const lower = url.toLowerCase();
  if (/\.(png|jpg|jpeg|gif|svg|webp|ico|avif)/.test(lower)) return 'images';
  if (/\.(css)/.test(lower)) return 'css';
  if (/\.(woff2?|ttf|otf|eot)/.test(lower)) return 'fonts';
  if (/\.(js|mjs)/.test(lower)) return 'js';
  return 'other';
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const request = protocol.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        resolve(false);
        return;
      }
      const stream = fs.createWriteStream(destPath);
      res.pipe(stream);
      stream.on('finish', () => { stream.close(); resolve(true); });
      stream.on('error', (err) => { reject(err); });
    });
    request.on('error', () => { resolve(false); });
    request.setTimeout(15000, () => { request.destroy(); resolve(false); });
  });
}

async function downloadAsset(url) {
  try {
    url = decodeHtmlEntities(url).replace(/^["']|["']$/g, '');
    // Skip URLs that aren't fully qualified
    if (!url.startsWith('http://') && !url.startsWith('https://')) return null;
    new URL(url); // validate it's a real URL
  } catch {
    return null;
  }
  if (downloadedAssets.has(url)) return downloadedAssets.get(url);

  const subdir = guessAssetSubdir(url);
  const filename = sanitizeFilename(url);
  const relPath = `assets/${subdir}/${filename}`;
  const absPath = path.join(OUTPUT_DIR, relPath);

  await ensureDir(path.dirname(absPath));

  const success = await downloadFile(url, absPath);
  if (success) {
    downloadedAssets.set(url, relPath);
    return relPath;
  }
  return null;
}

function extractAssetUrls(html) {
  const urls = new Set();
  const patterns = [
    /(?:src|href|poster)=["']([^"']+)["']/gi,
    /url\(["']?([^"')]+)["']?\)/gi,
    /srcset=["']([^"']+)["']/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      let url = match[1];
      if (pattern.source.includes('srcset')) {
        const parts = url.split(',').map(s => s.trim().split(/\s+/)[0]);
        parts.forEach(u => { if (isDownloadableUrl(u)) urls.add(u); });
      } else {
        if (isDownloadableUrl(url)) urls.add(url);
      }
    }
  }
  return urls;
}

function isDownloadableUrl(url) {
  if (!url || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('#')) return false;
  url = decodeHtmlEntities(url).replace(/^["']|["']$/g, '');
  try {
    const parsed = new URL(url, BASE_URL);
    return ASSET_DOMAINS.some(d => parsed.hostname.includes(d)) ||
           parsed.hostname === new URL(BASE_URL).hostname;
  } catch {
    return false;
  }
}

function normalizeUrl(url) {
  try {
    url = decodeHtmlEntities(url).replace(/^["']|["']$/g, '');
    if (url.startsWith('//')) url = 'https:' + url;
    if (url.startsWith('/')) url = BASE_URL + url;
    return url;
  } catch {
    return url;
  }
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 100);
    });
  });
}

async function discoverPages(page) {
  console.log('Discovering pages from navigation...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const links = await page.evaluate((baseUrl) => {
    const anchors = document.querySelectorAll('a[href]');
    const pages = new Set();
    const baseHostname = new URL(baseUrl).hostname;
    anchors.forEach(a => {
      try {
        const url = new URL(a.href, baseUrl);
        if (url.hostname === baseHostname && !url.hash && url.pathname !== '') {
          pages.add(url.pathname.replace(/\/$/, '') || '/');
        }
      } catch {}
    });
    return [...pages];
  }, BASE_URL);

  const allPages = new Set([...KNOWN_PAGES, ...links]);
  console.log(`Found ${allPages.size} pages:`, [...allPages]);
  return [...allPages];
}

async function scrapePage(page, pagePath) {
  const url = pagePath === '/' ? BASE_URL : `${BASE_URL}${pagePath}`;
  console.log(`\nScraping: ${url}`);

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (err) {
    console.log(`  Warning: Navigation timeout for ${url}, continuing anyway...`);
  }

  await page.waitForTimeout(3000);
  await autoScroll(page);
  await page.waitForTimeout(2000);

  // Take screenshot
  const screenshotDir = path.join(OUTPUT_DIR, 'screenshots');
  await ensureDir(screenshotDir);
  const screenshotName = (pagePath === '/' ? 'home' : pagePath.replace(/\//g, '_').replace(/^_/, '')) + '.png';
  await page.screenshot({
    path: path.join(screenshotDir, screenshotName),
    fullPage: true,
  });
  console.log(`  Screenshot saved: screenshots/${screenshotName}`);

  // Get rendered HTML (strip Wix runtime scripts)
  let html = await page.evaluate(() => {
    const scripts = document.querySelectorAll('script');
    scripts.forEach(s => {
      const src = s.src || '';
      const content = s.textContent || '';
      if (src.includes('parastorage.com') ||
          src.includes('wix.com') ||
          content.includes('wixBiSession') ||
          content.includes('thunderbolt') ||
          content.includes('clientTopology')) {
        s.remove();
      }
    });
    return document.documentElement.outerHTML;
  });

  // Extract and download assets from HTML
  const assetUrls = extractAssetUrls(html);
  console.log(`  Found ${assetUrls.size} asset URLs`);

  let downloadCount = 0;
  for (const rawUrl of assetUrls) {
    const fullUrl = normalizeUrl(rawUrl);
    const localPath = await downloadAsset(fullUrl);
    if (localPath) {
      const pageDir = pagePath === '/' ? '' : pagePath.replace(/^\//, '');
      const depth = pageDir.split('/').filter(Boolean).length;
      const prefix = depth > 0 ? '../'.repeat(depth) : '';
      html = html.split(rawUrl).join(prefix + localPath);
      downloadCount++;
    }
  }
  console.log(`  Downloaded ${downloadCount} assets`);

  // Also capture background-image URLs from computed styles
  const bgImages = await page.evaluate(() => {
    const urls = [];
    const elements = document.querySelectorAll('*');
    elements.forEach(el => {
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg !== 'none') {
        const matches = bg.match(/url\(["']?([^"')]+)["']?\)/g);
        if (matches) {
          matches.forEach(m => {
            const url = m.replace(/url\(["']?/, '').replace(/["']?\)/, '');
            if (url && !url.startsWith('data:')) urls.push(url);
          });
        }
      }
    });
    return urls;
  });

  for (const rawUrl of bgImages) {
    const fullUrl = normalizeUrl(rawUrl);
    if (isDownloadableUrl(fullUrl)) {
      const localPath = await downloadAsset(fullUrl);
      if (localPath) {
        const pageDir = pagePath === '/' ? '' : pagePath.replace(/^\//, '');
        const depth = pageDir.split('/').filter(Boolean).length;
        const prefix = depth > 0 ? '../'.repeat(depth) : '';
        html = html.split(rawUrl).join(prefix + localPath);
      }
    }
  }

  // Save HTML file
  const outputPath = pagePath === '/'
    ? path.join(OUTPUT_DIR, 'index.html')
    : path.join(OUTPUT_DIR, pagePath.replace(/^\//, ''), 'index.html');

  await ensureDir(path.dirname(outputPath));

  const htmlAttrs = html.match(/<html([^>]*)>/)?.[1] || '';
  await fs.promises.writeFile(
    outputPath,
    `<!DOCTYPE html>\n<html${htmlAttrs}>\n${html.replace(/<html[^>]*>/, '')}</html>`,
    'utf-8'
  );
  console.log(`  Saved: ${path.relative(OUTPUT_DIR, outputPath)}`);
}

async function main() {
  console.log('=== Tiny But Mighty Kitten Rescue - Site Scraper ===\n');
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  await ensureDir(OUTPUT_DIR);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  try {
    const pages = await discoverPages(page);

    for (const pagePath of pages) {
      await scrapePage(page, pagePath);
    }

    console.log(`\n=== Done! ===`);
    console.log(`Total assets downloaded: ${downloadedAssets.size}`);
    console.log(`Pages scraped: ${pages.length}`);
    console.log(`Output: ${OUTPUT_DIR}`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

main();

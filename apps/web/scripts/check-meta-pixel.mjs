// Checks that the Meta Pixel actually fires on a page — no Events Manager
// access needed. Drives a real Chrome, loads the URL, and reports the network
// requests the pixel makes, including the /tr beacon that carries the event.
//
//   node scripts/check-meta-pixel.mjs https://www.btlee-eg.com/ar
//   node scripts/check-meta-pixel.mjs https://www.btlee-eg.com/ar --nav
//
// --nav also clicks an internal link afterwards, to confirm a PageView is sent
// for in-app navigations (fbevents.js patches history.pushState and does this
// on its own — the check is that it happens exactly once, not zero or twice).
//
// Two things will make a healthy pixel look broken, so both are handled here:
//   - Meta drops events from automated browsers, so this sends a normal
//     Chrome user agent.
//   - Meta does not accept events from localhost, so point this at the
//     deployed site, not a dev server.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

const [url, ...flags] = process.argv.slice(2);
const withNav = flags.includes('--nav');

if (!url) {
  console.error('usage: node scripts/check-meta-pixel.mjs <url> [--nav]');
  process.exit(2);
}

const CHROME_PATHS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];
const browser = CHROME_PATHS.find((p) => existsSync(p));
if (!browser) {
  console.error('No Chrome or Edge found. Add its path to CHROME_PATHS.');
  process.exit(2);
}

const PORT = 9400 + Math.floor(Math.random() * 400);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(browser, [
  '--headless=new',
  '--disable-gpu',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.env.TEMP || '/tmp'}/meta-pixel-check-${PORT}`,
  'about:blank',
], { stdio: 'ignore' });

let socket;
for (let i = 0; i < 60 && !socket; i++) {
  try {
    const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
    const page = targets.find((t) => t.type === 'page');
    if (page) socket = new WebSocket(page.webSocketDebuggerUrl);
  } catch {
    await sleep(250);
  }
}
if (!socket) {
  chrome.kill();
  console.error('Could not attach to the browser.');
  process.exit(2);
}
await new Promise((resolve) => (socket.onopen = resolve));

let messageId = 0;
const pending = new Map();
const events = [];
const scripts = [];

socket.onmessage = (message) => {
  const frame = JSON.parse(message.data);
  if (frame.id && pending.has(frame.id)) {
    pending.get(frame.id)(frame.result);
    pending.delete(frame.id);
    return;
  }
  if (frame.method !== 'Network.requestWillBeSent') return;

  const { url: requested } = frame.params.request;
  if (/facebook\.com\/tr/.test(requested)) {
    const params = new URL(requested).searchParams;
    events.push({ event: params.get('ev'), id: params.get('id'), page: params.get('dl') });
  } else if (/connect\.facebook\.net/.test(requested)) {
    scripts.push(requested.replace('https://connect.facebook.net/', ''));
  }
};

const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++messageId;
    pending.set(id, resolve);
    socket.send(JSON.stringify({ id, method, params }));
  });

await send('Network.enable');
await send('Page.enable');
await send('Network.setUserAgentOverride', {
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  acceptLanguage: 'ar-EG,ar;q=0.9,en;q=0.8',
  platform: 'Win32',
});

console.log(`Loading ${url} …`);
await send('Page.navigate', { url });
await sleep(12_000);

const onLoad = events.splice(0);

let navigation = null;
if (withNav) {
  await send('Runtime.evaluate', { expression: 'window.__sameDocument = true' });
  const clicked = await send('Runtime.evaluate', {
    expression: `(() => {
      const link = [...document.querySelectorAll('a[href^="/"]')]
        .find((a) => new URL(a.href).pathname !== location.pathname);
      if (!link) return null;
      link.click();
      return link.getAttribute('href');
    })()`,
    returnByValue: true,
  });
  await sleep(8000);
  const state = await send('Runtime.evaluate', {
    expression: 'JSON.stringify({ path: location.pathname, sameDocument: !!window.__sameDocument })',
    returnByValue: true,
  });
  navigation = { target: clicked.result.value, ...JSON.parse(state.result.value), events: events.splice(0) };
}

socket.close();
chrome.kill();

const line = (ok, text) => console.log(`${ok ? '  OK  ' : ' FAIL '} ${text}`);

console.log('\nPixel library');
line(scripts.some((s) => s.includes('fbevents.js')), 'fbevents.js requested');
const config = scripts.find((s) => s.includes('signals/config/'));
line(Boolean(config), config ? `config loaded for pixel ${config.split('/')[2].split('?')[0]}` : 'no pixel config request');

console.log('\nEvents on page load');
if (onLoad.length === 0) {
  line(false, 'no event reached Meta — the pixel is not sending');
} else {
  for (const e of onLoad) line(true, `${e.event} → pixel ${e.id}`);
}

const pixelIds = new Set(onLoad.map((e) => e.id));
if (pixelIds.size > 1) line(false, `more than one pixel id is firing: ${[...pixelIds].join(', ')}`);

const pageViews = onLoad.filter((e) => e.event === 'PageView').length;
if (pageViews > 1) line(false, `PageView fired ${pageViews} times on one load — the snippet is duplicated`);

if (navigation) {
  console.log('\nIn-app navigation');
  line(navigation.sameDocument, `moved to ${navigation.path} without reloading the page`);
  const navPageViews = navigation.events.filter((e) => e.event === 'PageView').length;
  line(navPageViews === 1, `PageView sent ${navPageViews} time(s) for the new page`);
}

const healthy = onLoad.some((e) => e.event === 'PageView') && pixelIds.size <= 1 && pageViews === 1;
console.log(`\n${healthy ? 'Pixel is firing correctly.' : 'Pixel is NOT firing correctly.'}`);
process.exit(healthy ? 0 : 1);

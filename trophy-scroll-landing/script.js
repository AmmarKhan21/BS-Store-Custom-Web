/* eslint-disable no-console */

const CONFIG = {
  framesDir: './frames',
  frameCount: 270, // ezgif-frame-001.jpg ... ezgif-frame-270.jpg renamed to frame_0001.jpg ... frame_0270.jpg
  // naming: frame_0001.jpg ... frame_0270.jpg
  framePad: 4,
  preloadAhead: 1, // keep simple; we preload all anyway
  easing: 0.12,
  prefersReducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false,
  dbUrl: '../database.json',
};

const el = {
  topNav: document.getElementById('topNav'),
  reelCanvas: document.getElementById('reel'),
  loadingPill: document.getElementById('loadingPill'),
  productTitle: document.getElementById('productTitle'),
  productSubtitle: document.getElementById('productSubtitle'),
  progressText: document.getElementById('progressText'),
  progressFill: document.getElementById('progressFill'),
  productGrid: document.getElementById('productGrid'),
  productsNote: document.getElementById('productsNote'),
};

const ctx = el.reelCanvas.getContext('2d', { alpha: false });
const offscreen = document.createElement('canvas');
const offCtx = offscreen.getContext('2d', { willReadFrequently: true });

let bgHex = '#000000';
let images = new Array(CONFIG.frameCount);
let loadedCount = 0;
let firstFrameLoaded = false;
let currentFrame = 0;
let targetProgress = 0;
let readyToDraw = false;
let canvasW = 0;
let canvasH = 0;
let dpr = 1;

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

function padNumber(n, width) {
  return String(n).padStart(width, '0');
}

function rgbToHex(r, g, b) {
  const to = (x) => x.toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

function sampleBackgroundFromFrame(img) {
  // Sample corners (dominant background color). Frames are meant to share a single background.
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  if (!w || !h) return bgHex;

  offscreen.width = w;
  offscreen.height = h;
  offCtx.clearRect(0, 0, w, h);
  offCtx.drawImage(img, 0, 0, w, h);

  const sampleSize = Math.max(6, Math.floor(Math.min(w, h) * 0.02));

  const points = [
    { x: 0, y: 0 },
    { x: w - sampleSize, y: 0 },
    { x: 0, y: h - sampleSize },
    { x: w - sampleSize, y: h - sampleSize },
  ];

  const colors = [];
  for (const p of points) {
    const data = offCtx.getImageData(p.x, p.y, sampleSize, sampleSize).data;
    let rr = 0;
    let gg = 0;
    let bb = 0;
    const count = sampleSize * sampleSize;
    // average
    for (let i = 0; i < data.length; i += 4) {
      rr += data[i];
      gg += data[i + 1];
      bb += data[i + 2];
    }
    colors.push({
      r: Math.round(rr / count),
      g: Math.round(gg / count),
      b: Math.round(bb / count),
    });
  }

  // median of 4 corner averages for stability
  const rs = colors.map((c) => c.r).sort((a, b) => a - b);
  const gs = colors.map((c) => c.g).sort((a, b) => a - b);
  const bs = colors.map((c) => c.b).sort((a, b) => a - b);
  const r = rs[1];
  const g = gs[1];
  const b = bs[1];
  return rgbToHex(r, g, b);
}

function setBg(hex) {
  bgHex = hex;
  document.documentElement.style.setProperty('--bg', bgHex);
  document.body.style.backgroundColor = bgHex;
  el.reelCanvas.style.backgroundColor = bgHex;
  ctx.fillStyle = bgHex;
}

function resizeCanvas() {
  const rect = el.reelCanvas.getBoundingClientRect();
  dpr = Math.max(1, window.devicePixelRatio || 1);
  canvasW = Math.max(1, Math.floor(rect.width * dpr));
  canvasH = Math.max(1, Math.floor(rect.height * dpr));
  el.reelCanvas.width = canvasW;
  el.reelCanvas.height = canvasH;
}

function drawFrame(frameIndex) {
  if (!readyToDraw) return;
  const img = images[frameIndex];
  if (!img) return;

  // Always clear with the exact background color so no edge appears.
  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, canvasW, canvasH);

  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;

  // Contain fit: keep full frame visible; background color fills any leftover space.
  const scale = Math.min(canvasW / iw, canvasH / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (canvasW - dw) / 2;
  const dy = (canvasH - dh) / 2;

  ctx.drawImage(img, 0, 0, iw, ih, dx, dy, dw, dh);
}

function getProgress() {
  const scrollArea = document.getElementById('scroll-area');
  if (!scrollArea) return 0;

  const start = scrollArea.offsetTop;
  const end = start + scrollArea.offsetHeight - window.innerHeight;
  if (end <= start) return 0;
  const p = (window.scrollY - start) / (end - start);
  return clamp01(p);
}

function setScrollProgress() {
  targetProgress = getProgress();
  if (el.progressText) el.progressText.textContent = `${Math.round(targetProgress * 100)}%`;
  if (el.progressFill) el.progressFill.style.width = `${Math.round(targetProgress * 100)}%`;

  if (el.topNav) {
    const scrolled = window.scrollY > 10 || targetProgress > 0.02;
    el.topNav.classList.toggle('scrolled', scrolled);
  }
}

async function preloadFrames() {
  const loaded = new Array(CONFIG.frameCount).fill(false);
  for (let i = 1; i <= CONFIG.frameCount; i++) {
    const idx = i - 1;
    const filename = `frame_${padNumber(i, CONFIG.framePad)}.jpg`;
    const src = `${CONFIG.framesDir}/${filename}`;

    const img = new Image();
    img.decoding = 'async';
    img.loading = 'eager';
    img.referrerPolicy = 'no-referrer';
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      loaded[idx] = true;
      loadedCount++;

      // As soon as first frame is available, compute exact background color.
      if (!firstFrameLoaded && idx === 0) {
        firstFrameLoaded = true;
        try {
          const hex = sampleBackgroundFromFrame(img);
          setBg(hex);
        } catch (e) {
          console.warn('Background sample failed, fallback to #000', e);
          setBg('#000000');
        }

        // prepare sizes and initial draw
        resizeCanvas();
        drawFrame(0);
        readyToDraw = true;
        if (el.loadingPill) el.loadingPill.style.display = 'none';
      }
    };

    img.onerror = () => {
      console.warn('Failed to load frame', src);
    };

    images[idx] = img;
    img.src = src;
  }

  // Wait until first frame loaded at least; then keep rendering while others load.
  const waitFirst = new Promise((resolve) => {
    const t = setInterval(() => {
      if (firstFrameLoaded) {
        clearInterval(t);
        resolve();
      }
    }, 40);
  });

  await waitFirst;
}

function pickFrameFromProgress(p) {
  const lastIndex = CONFIG.frameCount - 1;
  return Math.round(p * lastIndex);
}

function animate() {
  if (!readyToDraw) {
    requestAnimationFrame(animate);
    return;
  }

  const targetFrame = pickFrameFromProgress(targetProgress);

  if (CONFIG.prefersReducedMotion) {
    currentFrame = targetFrame;
    drawFrame(currentFrame);
    requestAnimationFrame(animate);
    return;
  }

  currentFrame += (targetFrame - currentFrame) * CONFIG.easing;
  const show = Math.round(currentFrame);
  if (show >= 0 && show < CONFIG.frameCount) {
    // If the exact frame isn't loaded yet, draw the last loaded one behind it.
    // Simple: we only draw if the image has a valid natural size.
    const img = images[show];
    if (img && (img.naturalWidth || img.width)) drawFrame(show);
  }

  requestAnimationFrame(animate);
}

function renderProductGrid(products) {
  if (!el.productGrid) return;
  el.productGrid.innerHTML = '';

  const trophy = (products || []).filter((p) => String(p.category || '').toLowerCase().includes('trophy'));
  const list = trophy.length ? trophy : (products || []);

  if (!list.length) {
    el.productsNote.textContent = 'No products found.';
    return;
  }

  const safeParseArray = (v) => {
    if (Array.isArray(v)) return v;
    if (typeof v === 'string') {
      try {
        const parsed = JSON.parse(v);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // ignore
      }
    }
    return [];
  };

  for (const p of list.slice(0, 8)) {
    const imgs = safeParseArray(p.images);
    const imgUrl = imgs[0] || '';
    const price = typeof p.price === 'number' ? p.price : Number(p.price || 0);
    const name = p.name || 'Product';

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-thumb">
        ${
          imgUrl
            ? `<img src="${imgUrl}" alt="${escapeHtml(name)}" loading="lazy" />`
            : `<div style="height:100%;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.6)">No image</div>`
        }
      </div>
      <div class="product-name">${escapeHtml(name)}</div>
      <div class="product-price">Rs. ${isFinite(price) ? price.toLocaleString('en-PK') : '-'}</div>
    `;
    el.productGrid.appendChild(card);
  }
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function loadStoreProducts() {
  // Optional: fetch your existing DB to populate the store section under the reel.
  try {
    const res = await fetch(CONFIG.dbUrl);
    if (!res.ok) throw new Error(`DB fetch failed: ${res.status}`);
    const data = await res.json();
    const products = Array.isArray(data.products) ? data.products : data;

    renderProductGrid(products);

    // Update HUD with the first trophy product name/price.
    const trophy = (products || []).find((p) => String(p.category || '').toLowerCase().includes('trophy')) || products?.[0];
    if (trophy) {
      el.productTitle.textContent = trophy.name || el.productTitle.textContent;
      const price = typeof trophy.price === 'number' ? trophy.price : Number(trophy.price || 0);
      el.productSubtitle.textContent = isFinite(price) ? `Rs. ${price.toLocaleString('en-PK')} · 17.5cm gold metallic` : el.productSubtitle.textContent;
    }
  } catch (e) {
    console.warn('Store products section skipped:', e);
    if (el.productsNote) {
      el.productsNote.textContent = 'Store products are not loaded (DB fetch failed).';
    }
  }
}

// ---------- Boot ----------
function init() {
  resizeCanvas();
  setScrollProgress();
  window.addEventListener('scroll', setScrollProgress, { passive: true });
  window.addEventListener('resize', () => {
    resizeCanvas();
    if (readyToDraw) drawFrame(Math.round(currentFrame));
  });

  // Preload frames and render.
  preloadFrames()
    .then(() => {
      if (el.loadingPill) el.loadingPill.style.display = 'none';
    })
    .catch((e) => console.error('Frame preload failed', e));

  // Start animation immediately (it will wait for first frame).
  animate();

  // Load your store products below.
  loadStoreProducts();
}

init();


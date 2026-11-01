const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// --- PNG ENCODER ---
function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  typeBuf.copy(chunk, 4);
  data.copy(chunk, 8);
  const crcTarget = Buffer.concat([typeBuf, data]);
  const crc = zlib.crc32(crcTarget);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function createPng(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(6, 9); // color type 6 (RGBA)
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  const rowStride = width * 4;
  const rawData = Buffer.alloc((1 + rowStride) * height);
  for (let y = 0; y < height; y++) {
    const rawOffset = y * (1 + rowStride);
    rawData[rawOffset] = 0; // Filter: None
    rgbaBuffer.copy(rawData, rawOffset + 1, y * rowStride, (y + 1) * rowStride);
  }

  const deflated = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// --- 2D CANVAS DRAWING PRIMITIVES ---
class Canvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.buffer = Buffer.alloc(width * height * 4);
  }

  setPixel(x, y, r, g, b, a = 255) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    const idx = (Math.floor(y) * this.width + Math.floor(x)) * 4;
    if (a === 255) {
      this.buffer[idx] = r;
      this.buffer[idx + 1] = g;
      this.buffer[idx + 2] = b;
      this.buffer[idx + 3] = 255;
    } else {
      const alpha = a / 255;
      const invAlpha = 1 - alpha;
      this.buffer[idx] = Math.round(r * alpha + this.buffer[idx] * invAlpha);
      this.buffer[idx + 1] = Math.round(g * alpha + this.buffer[idx + 1] * invAlpha);
      this.buffer[idx + 2] = Math.round(b * alpha + this.buffer[idx + 2] * invAlpha);
      this.buffer[idx + 3] = Math.min(255, this.buffer[idx + 3] + a);
    }
  }

  fill(r, g, b, a = 255) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = (y * this.width + x) * 4;
        this.buffer[idx] = r;
        this.buffer[idx + 1] = g;
        this.buffer[idx + 2] = b;
        this.buffer[idx + 3] = a;
      }
    }
  }

  fillRect(x, y, w, h, r, g, b, a = 255) {
    const x1 = Math.max(0, Math.floor(x));
    const y1 = Math.max(0, Math.floor(y));
    const x2 = Math.min(this.width, Math.floor(x + w));
    const y2 = Math.min(this.height, Math.floor(y + h));
    for (let py = y1; py < y2; py++) {
      for (let px = x1; px < x2; px++) {
        this.setPixel(px, py, r, g, b, a);
      }
    }
  }

  fillRoundedRect(x, y, w, h, radius, r, g, b, a = 255) {
    const x1 = Math.floor(x);
    const y1 = Math.floor(y);
    const x2 = Math.floor(x + w);
    const y2 = Math.floor(y + h);
    const rad = Math.min(radius, w / 2, h / 2);

    for (let py = Math.max(0, y1); py < Math.min(this.height, y2); py++) {
      for (let px = Math.max(0, x1); px < Math.min(this.width, x2); px++) {
        let inside = true;
        // Top-left
        if (px < x1 + rad && py < y1 + rad) {
          const dx = px - (x1 + rad);
          const dy = py - (y1 + rad);
          if (dx * dx + dy * dy > rad * rad) inside = false;
        }
        // Top-right
        else if (px >= x2 - rad && py < y1 + rad) {
          const dx = px - (x2 - rad);
          const dy = py - (y1 + rad);
          if (dx * dx + dy * dy > rad * rad) inside = false;
        }
        // Bottom-left
        else if (px < x1 + rad && py >= y2 - rad) {
          const dx = px - (x1 + rad);
          const dy = py - (y2 - rad);
          if (dx * dx + dy * dy > rad * rad) inside = false;
        }
        // Bottom-right
        else if (px >= x2 - rad && py >= y2 - rad) {
          const dx = px - (x2 - rad);
          const dy = py - (y2 - rad);
          if (dx * dx + dy * dy > rad * rad) inside = false;
        }

        if (inside) {
          this.setPixel(px, py, r, g, b, a);
        }
      }
    }
  }

  fillCircle(cx, cy, radius, r, g, b, a = 255) {
    const x1 = Math.max(0, Math.floor(cx - radius));
    const y1 = Math.max(0, Math.floor(cy - radius));
    const x2 = Math.min(this.width, Math.ceil(cx + radius));
    const y2 = Math.min(this.height, Math.ceil(cy + radius));
    const r2 = radius * radius;

    for (let py = y1; py <= y2; py++) {
      for (let px = x1; px <= x2; px++) {
        const dx = px - cx;
        const dy = py - cy;
        if (dx * dx + dy * dy <= r2) {
          this.setPixel(px, py, r, g, b, a);
        }
      }
    }
  }

  drawBoldRA(cx, cy, fontSize, color = [255, 255, 255]) {
    // Draws large bold "RA" centered at cx, cy
    const [cr, cg, cb] = color;
    const h = fontSize;
    const letterWidth = h * 0.58;
    const stroke = Math.max(3, Math.round(h * 0.17));
    const gap = h * 0.14;
    const totalW = letterWidth * 2 + gap;
    const startX = cx - totalW / 2;
    const startY = cy - h / 2;

    // --- Letter R ---
    const rx = startX;
    const ry = startY;
    // Left vertical spine
    this.fillRect(rx, ry, stroke, h, cr, cg, cb);
    // Top bar
    this.fillRoundedRect(rx, ry, letterWidth, stroke, stroke / 2, cr, cg, cb);
    // Middle bar
    this.fillRect(rx, ry + h * 0.44, letterWidth * 0.88, stroke, cr, cg, cb);
    // Right curve of R loop
    const loopH = h * 0.44 + stroke;
    this.fillRect(rx + letterWidth - stroke, ry, stroke, loopH, cr, cg, cb);
    // Diagonal leg of R
    const legStartX = rx + letterWidth * 0.45;
    const legStartY = ry + h * 0.46;
    const legW = rx + letterWidth - legStartX;
    const legH = h - (legStartY - ry);
    for (let step = 0; step < legH; step++) {
      const px = legStartX + (step / legH) * legW;
      const py = legStartY + step;
      this.fillRect(px, py, stroke * 1.05, 2, cr, cg, cb);
    }

    // --- Letter A ---
    const ax = startX + letterWidth + gap;
    const ay = startY;
    const aMid = ax + letterWidth / 2;
    // Left diagonal leg
    for (let step = 0; step < h; step++) {
      const px = aMid - (step / h) * (letterWidth / 2);
      const py = ay + step;
      this.fillRect(px - stroke / 2, py, stroke, 2, cr, cg, cb);
    }
    // Right diagonal leg
    for (let step = 0; step < h; step++) {
      const px = aMid + (step / h) * (letterWidth / 2);
      const py = ay + step;
      this.fillRect(px - stroke / 2, py, stroke, 2, cr, cg, cb);
    }
    // Horizontal crossbar
    const crossY = ay + h * 0.58;
    const crossLeft = aMid - (0.58 * (letterWidth / 2));
    const crossW = (aMid + (0.58 * (letterWidth / 2))) - crossLeft;
    this.fillRect(crossLeft, crossY, crossW, stroke * 0.9, cr, cg, cb);
    // Apex cap
    this.fillRect(aMid - stroke * 0.6, ay, stroke * 1.2, stroke, cr, cg, cb);
  }

  // Basic 5x7 font rendering for legible banner text
  drawText(text, x, y, scale = 2, color = [255, 255, 255]) {
    const [cr, cg, cb] = color;
    let curX = x;
    const FONT_MAP = {
      'A': [0x70,0x88,0x88,0xF8,0x88,0x88,0x88],
      'B': [0xF0,0x88,0x88,0xF0,0x88,0x88,0xF0],
      'C': [0x78,0x84,0x80,0x80,0x80,0x84,0x78],
      'D': [0xF0,0x88,0x88,0x88,0x88,0x88,0xF0],
      'E': [0xF8,0x80,0x80,0xF0,0x80,0x80,0xF8],
      'F': [0xF8,0x80,0x80,0xF0,0x80,0x80,0x80],
      'G': [0x78,0x84,0x80,0x9C,0x84,0x84,0x7C],
      'H': [0x88,0x88,0x88,0xF8,0x88,0x88,0x88],
      'I': [0x70,0x20,0x20,0x20,0x20,0x20,0x70],
      'J': [0x18,0x08,0x08,0x08,0x88,0x88,0x70],
      'K': [0x88,0x90,0xA0,0xC0,0xA0,0x90,0x88],
      'L': [0x80,0x80,0x80,0x80,0x80,0x80,0xF8],
      'M': [0x88,0xD8,0xA8,0x88,0x88,0x88,0x88],
      'N': [0x88,0xC8,0xA8,0x98,0x88,0x88,0x88],
      'O': [0x70,0x88,0x88,0x88,0x88,0x88,0x70],
      'P': [0xF0,0x88,0x88,0xF0,0x80,0x80,0x80],
      'Q': [0x70,0x88,0x88,0x88,0xA8,0x90,0x68],
      'R': [0xF0,0x88,0x88,0xF0,0xA0,0x90,0x88],
      'S': [0x78,0x80,0x80,0x70,0x08,0x08,0xF0],
      'T': [0xF8,0x20,0x20,0x20,0x20,0x20,0x20],
      'U': [0x88,0x88,0x88,0x88,0x88,0x88,0x70],
      'V': [0x88,0x88,0x88,0x88,0x88,0x50,0x20],
      'W': [0x88,0x88,0x88,0xA8,0xA8,0xD8,0x88],
      'X': [0x88,0x88,0x50,0x20,0x50,0x88,0x88],
      'Y': [0x88,0x88,0x50,0x20,0x20,0x20,0x20],
      'Z': [0xF8,0x08,0x10,0x20,0x40,0x80,0xF8],
      '0': [0x70,0x88,0x98,0xA8,0xC8,0x88,0x70],
      '1': [0x20,0x60,0x20,0x20,0x20,0x20,0x70],
      '2': [0x70,0x88,0x08,0x30,0x40,0x80,0xF8],
      '3': [0xF8,0x08,0x10,0x30,0x08,0x88,0x70],
      '4': [0x10,0x30,0x50,0x90,0xF8,0x10,0x10],
      '5': [0xF8,0x80,0xF0,0x08,0x08,0x88,0x70],
      '6': [0x38,0x40,0x80,0xF0,0x88,0x88,0x70],
      '7': [0xF8,0x08,0x10,0x20,0x40,0x40,0x40],
      '8': [0x70,0x88,0x88,0x70,0x88,0x88,0x70],
      '9': [0x70,0x88,0x88,0x78,0x08,0x10,0xE0],
      ' ': [0x00,0x00,0x00,0x00,0x00,0x00,0x00],
      '-': [0x00,0x00,0x00,0xF8,0x00,0x00,0x00],
      '+': [0x00,0x20,0x20,0xF8,0x20,0x20,0x00],
      ':': [0x00,0x60,0x60,0x00,0x60,0x60,0x00],
      '.': [0x00,0x00,0x00,0x00,0x00,0x60,0x60],
      '/': [0x08,0x10,0x10,0x20,0x40,0x40,0x80],
      '%': [0x68,0x70,0x10,0x20,0x40,0x70,0x58],
      '₹': [0xF8,0x20,0xF8,0x20,0xF0,0x28,0x24]
    };

    const upper = text.toUpperCase();
    for (let i = 0; i < upper.length; i++) {
      const ch = upper[i];
      const glyph = FONT_MAP[ch] || FONT_MAP[' '];
      for (let row = 0; row < 7; row++) {
        const bits = glyph[row];
        for (let col = 0; col < 5; col++) {
          if ((bits & (0x80 >> col)) !== 0) {
            this.fillRect(curX + col * scale, y + row * scale, scale, scale, cr, cg, cb);
          }
        }
      }
      curX += (5 + 1.5) * scale;
    }
    return curX;
  }

  toPngBuffer() {
    return createPng(this.width, this.height, this.buffer);
  }
}

// ==========================================
// 1. GENERATE ICON-192.PNG (192 x 192)
// ==========================================
function generateIcon192() {
  const c = new Canvas(192, 192);
  // Brand Green Background #15803d = rgb(21, 128, 61)
  c.fill(21, 128, 61);

  // Subtle rounded inner frame / shine
  c.fillRoundedRect(8, 8, 176, 176, 32, 22, 140, 68);
  c.fillRoundedRect(12, 12, 168, 168, 28, 21, 128, 61);

  // Large White RA text with yellow accent dot
  c.drawBoldRA(96, 96, 86, [255, 255, 255]);
  // Golden yellow brand accent dot
  c.fillCircle(142, 128, 7, 250, 204, 21);

  return c.toPngBuffer();
}

// ==========================================
// 2. GENERATE ICON-512.PNG (512 x 512, Maskable Safe)
// ==========================================
function generateIcon512() {
  const c = new Canvas(512, 512);
  // Brand Green #15803d
  c.fill(21, 128, 61);

  // Subtle circular gradient-like depth
  c.fillCircle(256, 256, 230, 24, 142, 69);
  c.fillCircle(256, 256, 205, 21, 128, 61);

  // Center "RA" inside the safe maskable 80% circle (radius < 204)
  c.drawBoldRA(256, 252, 210, [255, 255, 255]);

  // Golden brand dot
  c.fillCircle(370, 330, 16, 250, 204, 21);

  return c.toPngBuffer();
}

// ==========================================
// 3. GENERATE SCREENSHOT-NARROW.PNG (1080 x 1920)
// ==========================================
function generateScreenshotNarrow() {
  const c = new Canvas(1080, 1920);
  // Background light slate/zinc
  c.fill(248, 250, 252);

  // 1. Status Bar (Dark green)
  c.fillRect(0, 0, 1080, 64, 17, 100, 48);
  c.drawText('9:41', 54, 24, 3, [255, 255, 255]);
  c.drawText('5G', 910, 24, 3, [255, 255, 255]);
  c.drawText('100%', 980, 24, 3, [255, 255, 255]);

  // 2. App Header (Green #15803d)
  c.fillRect(0, 64, 1080, 200, 21, 128, 61);
  // Mini Logo badge
  c.fillRoundedRect(54, 96, 68, 68, 14, 255, 255, 255);
  c.drawBoldRA(88, 130, 40, [21, 128, 61]);
  // Header text
  c.drawText('RA STORE', 140, 98, 5, [255, 255, 255]);
  c.drawText('ANANTAPUR - 15 MIN DELIVERY', 142, 145, 3, [220, 252, 231]);

  // Search Bar inside header
  c.fillRoundedRect(54, 185, 972, 60, 30, 255, 255, 255);
  c.drawText('SEARCH FRESH VEGGIES, MILK, RICE...', 90, 204, 3, [148, 163, 184]);

  // 3. Hero Promo Banner
  const bannerY = 285;
  c.fillRoundedRect(54, bannerY, 972, 240, 24, 22, 101, 52);
  c.fillRect(54, bannerY, 14, 240, 250, 204, 21); // Yellow accent stripe
  c.drawText('SUPER SAVER GROCERY DAYS', 90, bannerY + 36, 4, [250, 204, 21]);
  c.drawText('UP TO 40% OFF ON FRESH PRODUCE', 90, bannerY + 95, 5, [255, 255, 255]);
  c.drawText('DIRECT FROM FARM TO YOUR DOORSTEP', 90, bannerY + 155, 3, [220, 252, 231]);
  // CTA pill
  c.fillRoundedRect(90, bannerY + 185, 210, 42, 21, 250, 204, 21);
  c.drawText('SHOP NOW', 130, bannerY + 196, 3, [21, 128, 61]);

  // 4. Category Pills
  const catY = 550;
  c.drawText('EXPLORE CATEGORIES', 54, catY, 4, [15, 23, 42]);
  const categories = [
    { name: 'VEGETABLES', w: 220, color: [220, 252, 231], tc: [21, 128, 61] },
    { name: 'FRESH FRUITS', w: 230, color: [254, 243, 199], tc: [180, 83, 9] },
    { name: 'DAIRY & EGGS', w: 220, color: [224, 242, 254], tc: [3, 105, 161] },
    { name: 'SNACKS', w: 160, color: [254, 226, 226], tc: [185, 28, 28] },
  ];
  let catX = 54;
  for (const cat of categories) {
    c.fillRoundedRect(catX, catY + 35, cat.w, 54, 27, ...cat.color);
    c.drawText(cat.name, catX + 24, catY + 52, 3, cat.tc);
    catX += cat.w + 18;
  }

  // 5. Popular Items Grid (2x2)
  const gridY = 675;
  c.drawText('POPULAR IN ANANTAPUR', 54, gridY, 4, [15, 23, 42]);

  const products = [
    { title: 'FARM FRESH TOMATO', weight: '1 KG', price: '₹38', mrp: '₹55', imgCol: [239, 68, 68] },
    { title: 'AMUL FRESH MILK', weight: '1 LITRE', price: '₹64', mrp: '₹68', imgCol: [59, 130, 246] },
    { title: 'SONA MASOORI RICE', weight: '5 KG', price: '₹340', mrp: '₹420', imgCol: [245, 158, 11] },
    { title: 'FRESH GREEN CHILLI', weight: '250 GM', price: '₹18', mrp: '₹30', imgCol: [34, 197, 94] },
  ];

  const cardW = 468;
  const cardH = 480;
  for (let i = 0; i < products.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const px = 54 + col * (cardW + 36);
    const py = gridY + 45 + row * (cardH + 30);

    // Card white background + border
    c.fillRoundedRect(px, py, cardW, cardH, 24, 255, 255, 255);
    c.fillRoundedRect(px + 1, py + 1, cardW - 2, 2, 226, 232, 240); // subtle border top

    // Product image box placeholder
    c.fillRoundedRect(px + 24, py + 24, cardW - 48, 230, 18, 241, 245, 249);
    c.fillCircle(px + cardW / 2, py + 135, 60, ...products[i].imgCol);
    c.drawBoldRA(px + cardW / 2, py + 135, 48, [255, 255, 255]);

    // Product Title
    c.drawText(products[i].title, px + 24, py + 276, 3, [15, 23, 42]);
    // Weight
    c.drawText(products[i].weight, px + 24, py + 320, 2.8, [100, 116, 139]);

    // Price & MRP
    c.drawText(products[i].price, px + 24, py + 375, 4, [21, 128, 61]);
    c.drawText(products[i].mrp, px + 140, py + 382, 3, [148, 163, 184]);

    // Green ADD button
    c.fillRoundedRect(px + cardW - 140, py + 365, 116, 52, 26, 21, 128, 61);
    c.drawText('ADD', px + cardW - 105, py + 380, 3, [255, 255, 255]);
  }

  // 6. Bottom Navigation Bar
  c.fillRect(0, 1920 - 140, 1080, 140, 255, 255, 255);
  c.fillRect(0, 1920 - 140, 1080, 2, 226, 232, 240); // divider

  const tabs = ['HOME', 'CART', 'ORDERS', 'ACCOUNT'];
  for (let i = 0; i < 4; i++) {
    const tabX = 135 + i * 270;
    const isHome = i === 0;
    const color = isHome ? [21, 128, 61] : [100, 116, 139];
    c.fillCircle(tabX, 1920 - 90, 18, ...color);
    c.drawText(tabs[i], tabX - 35, 1920 - 50, 2.5, color);
    if (isHome) {
      c.fillRoundedRect(tabX - 25, 1920 - 138, 50, 4, 2, 21, 128, 61);
    }
  }

  return c.toPngBuffer();
}

// ==========================================
// 4. GENERATE SCREENSHOT-WIDE.PNG (1920 x 1080)
// ==========================================
function generateScreenshotWide() {
  const c = new Canvas(1920, 1080);
  // Slate background
  c.fill(248, 250, 252);

  // 1. Desktop Header Bar
  c.fillRect(0, 0, 1920, 88, 21, 128, 61);

  // Logo
  c.fillRoundedRect(48, 16, 56, 56, 12, 255, 255, 255);
  c.drawBoldRA(76, 44, 34, [21, 128, 61]);
  c.drawText('RA STORE', 120, 22, 4.5, [255, 255, 255]);
  c.drawText('ANANTAPUR GROCERY HUB', 122, 56, 2.4, [220, 252, 231]);

  // Search input
  c.fillRoundedRect(440, 18, 700, 52, 26, 255, 255, 255);
  c.drawText('SEARCH 1,000+ GROCERY & HOUSEHOLD ESSENTIALS...', 470, 34, 3, [148, 163, 184]);

  // Header Quick Links
  c.drawText('DAILY DEALS', 1200, 36, 3, [255, 255, 255]);
  c.drawText('MY ORDERS', 1380, 36, 3, [255, 255, 255]);

  // Cart button
  c.fillRoundedRect(1540, 18, 160, 52, 26, 250, 204, 21);
  c.drawText('CART (3)', 1575, 34, 3, [21, 128, 61]);

  // Account button
  c.fillRoundedRect(1720, 18, 150, 52, 26, 24, 142, 69);
  c.drawText('ACCOUNT', 1750, 34, 3, [255, 255, 255]);

  // 2. Left Category Sidebar
  const sideW = 320;
  c.fillRect(48, 120, sideW, 900, 255, 255, 255);
  c.fillRoundedRect(48, 120, sideW, 900, 16, 255, 255, 255);
  c.drawText('ALL CATEGORIES', 72, 145, 3.5, [15, 23, 42]);
  c.fillRect(72, 180, sideW - 48, 2, 226, 232, 240);

  const sideCats = [
    'FRESH VEGETABLES',
    'SEASONAL FRUITS',
    'DAIRY, BREAD & EGGS',
    'RICE, ATTA & DALS',
    'EDIBLE OILS & GHEE',
    'SNACKS & BISCUITS',
    'BEVERAGES & TEAS',
    'CLEANING & HOUSEHOLD',
    'PERSONAL CARE'
  ];
  for (let i = 0; i < sideCats.length; i++) {
    const isAct = i === 0;
    const itemY = 205 + i * 65;
    if (isAct) {
      c.fillRoundedRect(64, itemY - 10, sideW - 32, 48, 12, 220, 252, 231);
      c.drawText(sideCats[i], 80, itemY + 4, 2.8, [21, 128, 61]);
    } else {
      c.drawText(sideCats[i], 80, itemY + 4, 2.8, [71, 85, 105]);
    }
  }

  // 3. Main Hero Banner
  const mainX = 400;
  c.fillRoundedRect(mainX, 120, 1472, 260, 20, 22, 101, 52);
  c.fillRect(mainX, 120, 16, 260, 250, 204, 21); // gold stripe
  c.drawText('ANANTAPURS FASTEST GROCERY STORE', mainX + 48, 155, 3.8, [250, 204, 21]);
  c.drawText('FRESH ESSENTIALS DELIVERED IN 15 MINUTES', mainX + 48, 210, 5.5, [255, 255, 255]);
  c.drawText('FREE DELIVERY ON ORDERS ABOVE ₹199 - ORDER ON RA STORE', mainX + 48, 280, 3.5, [220, 252, 231]);

  // CTA button
  c.fillRoundedRect(mainX + 48, 318, 200, 44, 22, 250, 204, 21);
  c.drawText('ORDER NOW', mainX + 85, 331, 3.2, [21, 128, 61]);

  // 4. Products Grid in Main Section (4 cards)
  c.drawText('BESTSELLING GROCERIES TODAY', mainX, 415, 4, [15, 23, 42]);

  const deskProducts = [
    { title: 'FARM FRESH TOMATO (1 KG)', price: '₹38', mrp: '₹50', col: [239, 68, 68] },
    { title: 'AMUL FRESH MILK (1 L)', price: '₹64', mrp: '₹68', col: [59, 130, 246] },
    { title: 'SONA MASOORI RICE (5 KG)', price: '₹340', mrp: '₹420', col: [245, 158, 11] },
    { title: 'SUNFLOWER OIL (1 L)', price: '₹145', mrp: '₹175', col: [168, 85, 247] }
  ];

  const pCardW = 345;
  const pCardH = 440;
  for (let i = 0; i < deskProducts.length; i++) {
    const px = mainX + i * (pCardW + 30);
    const py = 460;

    c.fillRoundedRect(px, py, pCardW, pCardH, 18, 255, 255, 255);
    c.fillRoundedRect(px + 1, py + 1, pCardW - 2, 2, 226, 232, 240);

    // Image box
    c.fillRoundedRect(px + 20, py + 20, pCardW - 40, 220, 14, 241, 245, 249);
    c.fillCircle(px + pCardW / 2, py + 130, 56, ...deskProducts[i].col);
    c.drawBoldRA(px + pCardW / 2, py + 130, 44, [255, 255, 255]);

    // Product Title
    c.drawText(deskProducts[i].title, px + 20, py + 265, 2.5, [15, 23, 42]);
    // Price
    c.drawText(deskProducts[i].price, px + 20, py + 350, 4, [21, 128, 61]);
    c.drawText(deskProducts[i].mrp, px + 120, py + 356, 3, [148, 163, 184]);

    // ADD button
    c.fillRoundedRect(px + pCardW - 120, py + 342, 100, 44, 22, 21, 128, 61);
    c.drawText('ADD', px + pCardW - 90, py + 355, 2.8, [255, 255, 255]);
  }

  // 5. Store info bar at bottom
  c.fillRoundedRect(mainX, 930, 1472, 80, 16, 255, 255, 255);
  c.drawText('100% QUALITY GUARANTEE', mainX + 48, 960, 3, [21, 128, 61]);
  c.drawText('EXPRESS 15-MIN DELIVERY IN ANANTAPUR', mainX + 540, 960, 3, [21, 128, 61]);
  c.drawText('CASH ON DELIVERY & UPI ACCEPTED', mainX + 1040, 960, 3, [21, 128, 61]);

  return c.toPngBuffer();
}

// ==========================================
// EXECUTE AND WRITE FILES
// ==========================================
console.log('Generating PWA images...');

const icon192 = generateIcon192();
const icon512 = generateIcon512();
const screenNarrow = generateScreenshotNarrow();
const screenWide = generateScreenshotWide();

const targets = [
  { name: 'icon-192.png', buf: icon192, w: 192, h: 192 },
  { name: 'icon-512.png', buf: icon512, w: 512, h: 512 },
  { name: 'screenshot-narrow.png', buf: screenNarrow, w: 1080, h: 1920 },
  { name: 'screenshot-wide.png', buf: screenWide, w: 1920, h: 1080 }
];

const dirs = [
  path.resolve(__dirname),
  path.resolve(__dirname, 'public')
];

for (const dir of dirs) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  for (const t of targets) {
    const dest = path.join(dir, t.name);
    fs.writeFileSync(dest, t.buf);
    console.log(`Saved ${dest} (${t.w}x${t.h}, ${t.buf.length} bytes)`);
  }
}

console.log('All 4 real binary PNG assets generated successfully!');

const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Version Bump in index.html
html = html.replace(
  'RA Store v2.1.1 • Anantapur, Andhra Pradesh',
  'RA Store v2.1.2 • Anantapur, Andhra Pradesh'
);

html = html.replace(
  'const APP_VERSION = "v2.1.1";',
  'const APP_VERSION = "v2.1.2";'
);

// 2. Add CSS for Categories Screen before </style> at line 643
const categoriesCss = `
    /* Categories Screen Grid (Blinkit / Zepto Native Style) */
    .categories-screen-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    @media (min-width: 640px) {
      .categories-screen-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 14px;
      }
    }

    .category-tile {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      min-height: 110px;
      cursor: pointer;
      position: relative;
      transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .category-tile:active {
      transform: scale(0.97);
      background: #F8F9FA;
    }
    .category-tile.empty-cat {
      opacity: 0.65;
      background: #F9FAFB;
    }
    .category-tile-icon {
      font-size: 32px;
      line-height: 1;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 36px;
    }
    .category-tile-name {
      font-size: 13px;
      font-weight: 700;
      color: var(--text);
      line-height: 1.3;
      max-height: 2.6em;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      word-break: break-word;
    }
    .category-tile-count {
      font-size: 11px;
      color: var(--muted);
      margin-top: 4px;
      font-weight: 500;
    }
    .category-tile-badge-na {
      font-size: 10px;
      color: #991B1B;
      background: #FEE2E2;
      padding: 2px 6px;
      border-radius: 6px;
      margin-top: 4px;
      font-weight: 600;
      display: inline-block;
    }
    .category-tile-skeleton {
      min-height: 110px;
      background: #F3F4F6;
      border-radius: 12px;
      border: 1px solid var(--border);
      position: relative;
      overflow: hidden;
    }
    .category-tile-skeleton::after {
      content: "";
      position: absolute;
      top: 0; right: 0; bottom: 0; left: 0;
      transform: translateX(-100%);
      background-image: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0) 0,
        rgba(255, 255, 255, 0.4) 20%,
        rgba(255, 255, 255, 0.7) 60%,
        rgba(255, 255, 255, 0)
      );
      animation: shimmer 1.5s infinite;
    }
`;

html = html.replace(
  '      .floating-contact-wrap {\n        bottom: calc(120px + env(safe-area-inset-bottom, 0px)) !important;\n      }\n    }\n\n  </style>',
  `      .floating-contact-wrap {\n        bottom: calc(120px + env(safe-area-inset-bottom, 0px)) !important;\n      }\n    }\n${categoriesCss}\n  </style>`
);

// 3. Add #categoriesView in HTML between #homeView and #accountView
const categoriesViewHtml = `
  <!-- ============================================== -->
  <!-- PART C2: CATEGORIES SCREEN VIEW (Full Height)  -->
  <!-- ============================================== -->
  <div id="categoriesView" style="display: none; padding: 14px 16px 140px; min-height: calc(100vh - 56px); background: #F8FAFC;">
    <div class="categories-header" style="margin-bottom: 14px;">
      <h2 id="categoriesViewTitle" style="font-size: 18px; font-weight: 800; margin: 0; color: var(--text);">All Categories</h2>
      <p id="categoriesViewSub" style="font-size: 12px; color: var(--muted); margin: 3px 0 0;">Browse fresh groceries by category</p>
    </div>
    <div id="categoriesGrid" class="categories-screen-grid" role="region" aria-label="Categories Directory"></div>
  </div>
`;

html = html.replace(
  '</div>\n\n  <!-- ============================================== -->\n  <!-- PART D: ACCOUNT IN-PAGE VIEW (Full Height)     -->',
  `</div>\n${categoriesViewHtml}\n  <!-- ============================================== -->\n  <!-- PART D: ACCOUNT IN-PAGE VIEW (Full Height)     -->`
);

// 4. Update applyLanguage to also call renderCategoriesScreen()
html = html.replace(
  '      checkStoreHours();\n      renderCategoryChips();\n      renderLandmarkChips();',
  '      checkStoreHours();\n      renderCategoryChips();\n      renderCategoriesScreen();\n      renderLandmarkChips();'
);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Step 1 of index.html patch applied successfully.');

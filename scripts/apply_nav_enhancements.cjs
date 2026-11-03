const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');
const isCrlf = html.includes('\r\n');
const EOL = isCrlf ? '\r\n' : '\n';

function replaceStrict(str, target, replacement, label) {
  const normalizedTarget = target.replace(/\r?\n/g, EOL);
  const normalizedReplacement = replacement.replace(/\r?\n/g, EOL);
  if (!str.includes(normalizedTarget)) {
    throw new Error(`Target not found for: ${label}`);
  }
  return str.replace(normalizedTarget, normalizedReplacement);
}

// 1. Update overlay-open CSS so mobile-bottom-nav stays visible during Cart & Orders, with z-index 450
const oldOverlayCss = `    body.overlay-open .mobile-bottom-nav,
    body.overlay-open .bottom-bar,
    body.signin-open .mobile-bottom-nav,
    body.signin-open .bottom-bar {
      transform: translateY(calc(100% + env(safe-area-inset-bottom, 0px) + 20px)) !important;
      pointer-events: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      transition: transform 220ms ease, opacity 220ms ease, visibility 0s linear 0.22s !important;
    }

    @media (min-width: 481px) {
      body.overlay-open .mobile-bottom-nav,
      body.overlay-open .bottom-bar,
      body.signin-open .mobile-bottom-nav,
      body.signin-open .bottom-bar {
        transform: translate(-50%, calc(100% + env(safe-area-inset-bottom, 0px) + 20px)) !important;
        pointer-events: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        transition: transform 220ms ease, opacity 220ms ease, visibility 0s linear 0.22s !important;
      }
    }`;

const newOverlayCss = `    /* Persistent Bottom Navigation: Keep visible on Cart & Orders, hide only floating cart bar & during checkout/signin */
    .mobile-bottom-nav {
      z-index: 450 !important;
    }
    body.overlay-open .bottom-bar,
    body.signin-open .bottom-bar,
    body.signin-open .mobile-bottom-nav,
    body.checkout-open .mobile-bottom-nav {
      transform: translateY(calc(100% + env(safe-area-inset-bottom, 0px) + 20px)) !important;
      pointer-events: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      transition: transform 220ms ease, opacity 220ms ease, visibility 0s linear 0.22s !important;
    }

    @media (min-width: 481px) {
      body.overlay-open .bottom-bar,
      body.signin-open .bottom-bar,
      body.signin-open .mobile-bottom-nav,
      body.checkout-open .mobile-bottom-nav {
        transform: translate(-50%, calc(100% + env(safe-area-inset-bottom, 0px) + 20px)) !important;
        pointer-events: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        transition: transform 220ms ease, opacity 220ms ease, visibility 0s linear 0.22s !important;
      }
    }`;

html = replaceStrict(html, oldOverlayCss, newOverlayCss, 'Overlay CSS');

// 2. Add checkout-open class in openModal('checkoutModal')
const openModalTarget = `        if (id === 'loginModal') {
          document.body.classList.add('signin-open');
        }`;

const openModalReplacement = `        if (id === 'loginModal') {
          document.body.classList.add('signin-open');
        }
        if (id === 'checkoutModal') {
          document.body.classList.add('checkout-open');
        }`;

html = replaceStrict(html, openModalTarget, openModalReplacement, 'openModal checkout-open');

const closeModalTarget = `      document.body.classList.remove('modal-open');
      document.body.classList.remove('overlay-open');
      document.body.classList.remove('signin-open');`;

const closeModalReplacement = `      document.body.classList.remove('modal-open');
      document.body.classList.remove('overlay-open');
      document.body.classList.remove('signin-open');
      document.body.classList.remove('checkout-open');`;

html = replaceStrict(html, closeModalTarget, closeModalReplacement, 'closeModal checkout-open');

// 3. Update popstate listener to handle e.state.tab === 'categories'
const popstateTarget = `      if (currentNavTab === 'home' && e.state && e.state.from === 'categories') {
        // Back from filtered items returns to Categories screen
        openCategoriesScreen();
        return;
      }`;

const popstateReplacement = `      if (e.state && e.state.tab === 'categories') {
        // Back to Categories screen
        openCategoriesScreen();
        return;
      }
      if (currentNavTab === 'home' && e.state && e.state.from === 'categories') {
        // Back from filtered items returns to Categories screen
        openCategoriesScreen();
        return;
      }`;

html = replaceStrict(html, popstateTarget, popstateReplacement, 'popstate categories return');

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html enhancements applied successfully!');

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

const landmarkFunction = `
    function renderLandmarkChips() {
      const container = document.getElementById('landmarkChipsContainer');
      const addrContainer = document.getElementById('addrLandmarkChips');
      const cfg = window.APP_CONFIG || {};
      const enList = cfg.landmarks || ["Tower Clock", "Subhash Road", "Saptagiri Circle", "Rudrampeta", "Kamalanagar", "Old Town"];
      const teList = cfg.landmarksTelugu || ["టవర్ క్లాక్", "సుభాష్ రోడ్డు", "సప్తగిరి సర్కిల్", "రుద్రంపేట", "కమలానగర్", "ఓల్డ్ టౌన్"];
      const isTe = currentLang === 'te';

      const generateHtml = () => enList.map((en, idx) => {
        const label = (isTe && teList[idx]) ? teList[idx] : en;
        const val = \`\${en}, Anantapur\`;
        return \`<button type="button" class="landmark-chip" data-val="\${escapeHtml(val)}">\${escapeHtml(label)}</button>\`;
      }).join('');

      if (container) container.innerHTML = generateHtml();
      if (addrContainer) addrContainer.innerHTML = generateHtml();
    }
`;

if (!content.includes('function renderLandmarkChips(')) {
  // Insert before applyLanguage / renderLandmarkChips call
  content = content.replace('function parseHourToDecimal', landmarkFunction + '\n    function parseHourToDecimal');
  console.log('✅ Defined function renderLandmarkChips() in index.html');
}

// Ensure click delegation on landmarkChipsContainer
if (!content.includes("document.getElementById('landmarkChipsContainer')?.addEventListener('click'")) {
  const delegationCode = `
    document.getElementById('landmarkChipsContainer')?.addEventListener('click', (e) => {
      const chip = e.target.closest('.landmark-chip');
      if (chip) {
        const val = chip.getAttribute('data-val');
        const input = document.getElementById('custAddress');
        if (input && val) {
          if (!input.value.trim()) {
            input.value = val;
          } else if (!input.value.includes(val)) {
            input.value += ', ' + val;
          }
          input.focus();
        }
      }
    });
`;
  content = content.replace("document.querySelectorAll('.landmark-chip').forEach", delegationCode + "\n    // Quick landmark chips click delegated\n    // document.querySelectorAll('.landmark-chip').forEach");
  console.log('✅ Added click delegation for landmarkChipsContainer');
}

fs.writeFileSync(indexPath, content, 'utf8');
console.log('🎉 Landmark chips successfully patched!');


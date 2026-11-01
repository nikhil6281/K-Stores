const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Destructure setIsOwnerMode and add route listener
const oldStoreDestructure = `  const {
    isOwnerMode,
    products,
    selectedCategory,
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
    activeOrder,
    setIsTrackingOpen,
    setIsSupportOpen,
    language,
    t
  } = useStore();`;

const newStoreDestructure = `  const {
    isOwnerMode,
    setIsOwnerMode,
    products,
    selectedCategory,
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
    activeOrder,
    setIsTrackingOpen,
    setIsSupportOpen,
    language,
    t
  } = useStore();

  // HashRouter & Subpath Route Listener (#/admin, #/staff, #/worker)
  React.useEffect(() => {
    const handleRoute = () => {
      const hash = (window.location.hash || '').toLowerCase();
      const path = (window.location.pathname || '').toLowerCase();
      if (hash === '#/admin' || hash === '#admin' || hash === '#/owner' || path.endsWith('/admin') || path.endsWith('/admin/')) {
        setIsOwnerMode(true);
      } else if (hash === '#/staff' || hash === '#staff' || hash === '#/worker' || hash === '#worker' || path.endsWith('/staff') || path.endsWith('/worker')) {
        if (!window.location.pathname.endsWith('worker.html')) {
          window.location.href = window.location.pathname.replace(/\\/([^\\/]*)$/, '/worker.html');
        }
      }
    };
    handleRoute();
    window.addEventListener('hashchange', handleRoute);
    return () => window.removeEventListener('hashchange', handleRoute);
  }, [setIsOwnerMode]);`;

content = content.replace(/\r\n/g, '\n');
if (content.includes(oldStoreDestructure)) {
  content = content.replace(oldStoreDestructure, newStoreDestructure);
  console.log('Added route listener and setIsOwnerMode');
} else {
  console.log('Warning: oldStoreDestructure not matched directly');
}

// 2. Remove illegal useEffect inside if (isOwnerMode)
content = content.replace(
  /if\s*\(\s*isOwnerMode\s*\)\s*\{\s*React\.useEffect\s*\(\s*\(\)\s*=>\s*\{\s*return\s*\(\)\s*=>\s*\{\s*\}\s*;\s*\}\s*,\s*\[\s*\]\s*\);/g,
  'if (isOwnerMode) {'
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('App.tsx successfully updated.');

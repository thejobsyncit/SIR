import fs from 'fs';
import path from 'path';

console.log('=== Verifying Naukri-Style Filter Popup Implementation ===');
let passed = 0;
let total = 0;

function assert(desc, condition, details = '') {
  total++;
  if (condition) {
    console.log(`[PASS] ${desc}`);
    passed++;
  } else {
    console.error(`[FAIL] ${desc} ${details}`);
  }
}

const jobsPagePath = path.resolve('src/pages/JobsPage.jsx');
const content = fs.readFileSync(jobsPagePath, 'utf-8');

// 1. Popup Modal State
assert('Filter popup states exist (popupCategory, tempSelected, popupSearchQuery)', 
  content.includes('const [popupCategory, setPopupCategory] = useState(null)') &&
  content.includes('const [tempSelected, setTempSelected] = useState([])') &&
  content.includes('const [popupSearchQuery, setPopupSearchQuery] = useState(\'\')')
);

// 2. Open / Close / Toggle / Apply Handlers
assert('Popup handlers exist (openFilterPopup, closeFilterPopup, toggleTempItem, applyFilterPopup)',
  content.includes('const openFilterPopup = (categoryKey)') &&
  content.includes('const closeFilterPopup = ()') &&
  content.includes('const toggleTempItem = (item)') &&
  content.includes('const applyFilterPopup = ()')
);

// 3. Popup Config exists with all required categories
assert('popupConfig maps country, city, industry, function, experience, and jobType',
  content.includes("case 'country':") &&
  content.includes("case 'city':") &&
  content.includes("case 'industry':") &&
  content.includes("case 'function':") &&
  content.includes("case 'experience':") &&
  content.includes("case 'jobType':")
);

// 4. Modal Layout: Centered max-width, white/navy-950, shadow-2xl, rounded-2xl, 80vh max-height
assert('Modal container has centered layout with max-w-[920px], max-h-[80vh], rounded-2xl, shadow-2xl',
  content.includes('max-w-[920px]') &&
  content.includes('max-h-[80vh]') &&
  content.includes('rounded-2xl') &&
  content.includes('shadow-2xl') &&
  content.includes('bg-white dark:bg-navy-950')
);

// 5. Header: title, category icon, real-time search input, close button
assert('Modal fixed header contains title, category icon, real-time search bar, and close button',
  content.includes('id="filter-popup-title"') &&
  content.includes('popupConfig.placeholder') &&
  content.includes('onChange={(e) => setPopupSearchQuery(e.target.value)}') &&
  content.includes('aria-label="Close dialog"')
);

// 6. 3-Column Desktop Grid
assert('Modal body contains 3-column grid for desktop (md:grid-cols-3 lg:grid-cols-3) with checkboxes and counts',
  content.includes('grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3') &&
  content.includes('popupConfig.counts[item]') &&
  content.includes('toggleTempItem(item)')
);

// 7. Footer: Selected count, Clear Selection, Cancel, Apply Filters
assert('Modal footer contains Selected count, Clear Selection, Cancel, and Apply Filters',
  content.includes('Selected:') &&
  content.includes('Clear Selection') &&
  content.includes('closeFilterPopup') &&
  content.includes('Apply Filters') &&
  content.includes('applyFilterPopup')
);

// 8. Scroll lock & Escape key listener
assert('Background scrolling lock and Escape key listener implemented',
  content.includes("e.key === 'Escape'") &&
  content.includes("document.body.style.overflow = 'hidden'")
);

// 9. Removed Company, Freshness, and Language from sidebar
assert('Removed Company, Freshness, and Language categories from sidebar filter rendering',
  !content.includes("sectionKey: 'company'") &&
  !content.includes("sectionKey: 'freshness'") &&
  !content.includes("sectionKey: 'language'")
);

// 10. Sidebar trigger: "+ View More" and ensure Maximize2 is removed
assert('Sidebar category has "+ View More" button and Maximize2 icon is removed',
  content.includes('openFilterPopup(sectionKey)') &&
  content.includes('+ View More') &&
  !content.includes('<Maximize2')
);

console.log(`\nResults: ${passed}/${total} checks passed.`);
if (passed === total) {
  console.log('ALL POPUP MODAL CHECKS PASSED SUCCESSFULLY!');
  process.exit(0);
} else {
  process.exit(1);
}

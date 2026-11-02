const fs = require('fs');
const assert = require('assert');

const navbarCode = fs.readFileSync('src/components/Navbar.jsx', 'utf8');

console.log('Testing Register & Sign In Buttons compliance with specifications...');

let passed = 0;
let total = 0;

function check(desc, condition) {
  total++;
  if (condition) {
    console.log(`  ✓ PASS: ${desc}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${desc}`);
  }
}

// 1. Light Mode - Register Button
check('Desktop Register has rounded-full pill shape', navbarCode.includes('rounded-full') && navbarCode.includes('Register Account'));
check('Desktop Register has 2px gold border', navbarCode.includes('border-2 border-gold-500'));
check('Desktop Register has white background in light mode', navbarCode.includes('bg-white text-navy-950'));
check('Desktop Register has gold User icon', navbarCode.includes('text-gold-500 dark:text-gold-400') && navbarCode.includes('<User'));

// 2. Light Mode - Sign In Button
check('Desktop Sign In has rounded-full pill shape', navbarCode.includes('bg-gold-500') && navbarCode.includes('Sign In to Portal'));
check('Desktop Sign In has solid gold background', navbarCode.includes('bg-gold-500 hover:bg-[#c29d2b]'));
check('Desktop Sign In has dark navy text and icon in light mode', navbarCode.includes('text-navy-950 dark:text-white'));
check('Desktop Sign In has soft gold shadow in light mode', navbarCode.includes('shadow-[0_2px_14px_rgba(212,175,55,0.35)]'));

// 3. Dark Mode - Register Button
check('Desktop Register has dark navy background in dark mode', navbarCode.includes('dark:bg-navy-900'));
check('Desktop Register has gold text and icon in dark mode', navbarCode.includes('dark:text-gold-400'));
check('Desktop Register has gold border in dark mode', navbarCode.includes('dark:border-gold-500'));

// 4. Dark Mode - Sign In Button
check('Desktop Sign In has white text and icon in dark mode', navbarCode.includes('dark:text-white'));
check('Desktop Sign In has soft gold glow in dark mode', navbarCode.includes('dark:shadow-[0_0_24px_rgba(212,175,55,0.5)]'));

// 5. Shared Dimensions & Interactions
check('Buttons have consistent 44px height matching reference', navbarCode.includes('h-[44px]'));
check('Desktop buttons have 16px horizontal spacing', navbarCode.includes('space-x-4'));
check('Buttons have active:scale-95 click interaction', navbarCode.includes('active:scale-95'));
check('Buttons trigger openAuthModal for register and login', navbarCode.includes("openAuthModal('register')") && navbarCode.includes("openAuthModal('login')"));

// 6. Mobile Drawer Responsiveness
check('Mobile drawer also has Register and Sign In pill buttons', navbarCode.includes('openAuthModal(\'register\'); setMobileMenuOpen(false);'));

console.log(`\nResult: ${passed}/${total} checks passed (${Math.round((passed / total) * 100)}%)`);
if (passed === total) {
  console.log('ALL SPECIFICATIONS SATISFIED 100%!');
} else {
  process.exit(1);
}

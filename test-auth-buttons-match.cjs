const fs = require('fs');
const assert = require('assert');
const path = require('path');

console.log('================================================================');
console.log('   VERIFY REGISTER & SIGN IN BUTTONS: 1:1 REFERENCE MATCH');
console.log('================================================================\n');

const navbarPath = path.join(__dirname, 'src', 'components', 'Navbar.jsx');
const content = fs.readFileSync(navbarPath, 'utf8');

let passed = 0;
let total = 0;

function check(desc, condition) {
  total++;
  if (condition) {
    console.log(`✅ PASS: ${desc}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${desc}`);
  }
}

// 1. Spacing and Alignment
check('Desktop buttons container uses space-x-4 (16px gap)', content.includes('hidden sm:flex items-center space-x-4'));

// 2. Light Mode: Register Button
check('Register button has white background in light mode', /<button[\s\S]*?openAuthModal\('register'\)[\s\S]*?bg-white/.test(content));
check('Register button has 2px gold border', /<button[\s\S]*?openAuthModal\('register'\)[\s\S]*?border-2 border-gold-500/.test(content));
check('Register button has dark navy text in light mode', /<button[\s\S]*?openAuthModal\('register'\)[\s\S]*?text-navy-950/.test(content));
check('Register button has rounded pill shape', /<button[\s\S]*?openAuthModal\('register'\)[\s\S]*?rounded-full/.test(content));
check('Register button renders User icon with gold stroke', /<User[\s\S]*?text-gold-500/.test(content));

// 3. Light Mode: Sign In Button
const signInButtonMatch = content.match(/<button[\s\S]*?openAuthModal\('login'\)[\s\S]*?<\/button>/);
const signInButtonStr = signInButtonMatch ? signInButtonMatch[0] : '';
check('Sign In button has solid gold background (no gradient shimmer)', signInButtonStr.includes('bg-gold-500') && !signInButtonStr.includes('bg-gold-shimmer'));
check('Sign In button has dark navy text in light mode', /<button[\s\S]*?openAuthModal\('login'\)[\s\S]*?text-navy-950/.test(content));
check('Sign In button has dark navy LogIn icon in light mode', /<LogIn[\s\S]*?text-navy-950/.test(content));
check('Sign In button has rounded pill shape', /<button[\s\S]*?openAuthModal\('login'\)[\s\S]*?rounded-full/.test(content));
check('Sign In button has subtle gold shadow in light mode', /<button[\s\S]*?openAuthModal\('login'\)[\s\S]*?shadow-\[0_0_20px_rgba\(212,175,55,0\.35\)\]/.test(content));

// 4. Dark Mode: Register Button
check('Register button matches dark header background', /<button[\s\S]*?openAuthModal\('register'\)[\s\S]*?dark:bg-transparent/.test(content));
check('Register button has gold border in dark mode', /<button[\s\S]*?openAuthModal\('register'\)[\s\S]*?dark:border-gold-500/.test(content));
check('Register button has gold text in dark mode', /<button[\s\S]*?openAuthModal\('register'\)[\s\S]*?dark:text-gold-400/.test(content));
check('Register button has gold User icon in dark mode', /<User[\s\S]*?dark:text-gold-400/.test(content));

// 5. Dark Mode: Sign In Button
check('Sign In button has solid gold background in dark mode', /<button[\s\S]*?openAuthModal\('login'\)[\s\S]*?dark:bg-gold-500/.test(content));
check('Sign In button has white text in dark mode', /<button[\s\S]*?openAuthModal\('login'\)[\s\S]*?dark:text-white/.test(content));
check('Sign In button has white LogIn icon in dark mode', /<LogIn[\s\S]*?dark:text-white/.test(content));
check('Sign In button has soft gold glow against dark header', /<button[\s\S]*?openAuthModal\('login'\)[\s\S]*?dark:shadow-\[0_0_25px_rgba\(212,175,55,0\.45\)\]/.test(content));

// 6. Mobile Drawer Synchronization
check('Mobile drawer Register button matches styling', /<button[\s\S]*?register[\s\S]*?dark:bg-transparent[\s\S]*?border-gold-500/.test(content));
check('Mobile drawer Sign In button has solid gold bg and dark:text-white', /<button[\s\S]*?login[\s\S]*?bg-gold-500[\s\S]*?dark:text-white/.test(content));

console.log(`\n================================================================`);
console.log(`   RESULTS: ${passed}/${total} PASSED (${Math.round((passed/total)*100)}%)`);
console.log('================================================================\n');

if (passed !== total) {
  process.exit(1);
}

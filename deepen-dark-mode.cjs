const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'CandidatePortal.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace standard darks with deeper absolute darks
content = content.replace(/dark:bg-\[\#0a0a0a\]/g, 'dark:bg-black');
content = content.replace(/dark:bg-\[\#111\]/g, 'dark:bg-[#050505]');
content = content.replace(/dark:bg-\[\#1a1a1a\]/g, 'dark:bg-[#0a0a0a]');

// Also replace the radial gradient center if any
content = content.replace(/dark:via-\[\#0a0a0a\]/g, 'dark:via-black');
content = content.replace(/dark:to-\[\#0a0a0a\]/g, 'dark:to-black');

// For the main app background just in case it's hardcoded somewhere
content = content.replace(/bg-\[\#0a0a0a\]/g, 'bg-black');
content = content.replace(/bg-\[\#111\]/g, 'bg-[#050505]');
content = content.replace(/bg-\[\#1a1a1a\]/g, 'bg-[#0a0a0a]');

fs.writeFileSync(filePath, content);
console.log('Successfully deepened the dark mode colors in CandidatePortal.jsx');

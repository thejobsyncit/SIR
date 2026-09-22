const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'CandidatePortal.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace dark mode text colors with brighter variants for better contrast on pitch black
content = content.replace(/dark:text-slate-600/g, 'dark:text-slate-400');
content = content.replace(/dark:text-slate-700/g, 'dark:text-slate-400');
content = content.replace(/dark:text-slate-500/g, 'dark:text-slate-300');

// specifically for the kanban board dashed boxes:
content = content.replace(/text-slate-600 font-bold text-\[10px\]/g, 'text-slate-400 font-bold text-[10px]');
content = content.replace(/text-slate-500 font-sans/g, 'text-slate-400 font-sans');
content = content.replace(/text-slate-500 text-\[10px\]/g, 'text-slate-400 text-[10px]');
content = content.replace(/text-slate-400 font-sans text-sm mt-3/g, 'text-slate-300 font-sans text-sm mt-3');

// For hover states
content = content.replace(/dark:hover:text-slate-300/g, 'dark:hover:text-white');
content = content.replace(/dark:hover:text-slate-400/g, 'dark:hover:text-slate-200');

fs.writeFileSync(filePath, content);
console.log('Successfully brightened text colors in CandidatePortal.jsx for better contrast');

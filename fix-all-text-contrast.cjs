const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'CandidatePortal.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// A function to inject a class into a className string
function ensureDarkText(match) {
  // If it already has dark:text-slate-200, 300, 400, or dark:text-white, leave it
  if (/dark:text-(white|slate-[1234]00)/.test(match)) {
    return match;
  }
  // Otherwise, add dark:text-slate-300
  return match.replace(/"$/, ' dark:text-slate-300"').replace(/`$/, ' dark:text-slate-300`').replace(/'$/, " dark:text-slate-300'");
}

// Find all className="" or className={``} strings
const regex = /className=(?:\"[^\"]*\"|`[^`]*`|'[^']*')/g;

content = content.replace(regex, (match) => {
  // If the element has text-slate-500, text-slate-600, or text-slate-700
  if (/(text-slate-500|text-slate-600|text-slate-700|text-slate-400)/.test(match)) {
    return ensureDarkText(match);
  }
  return match;
});

// For good measure, let's also make sure placeholders in inputs are visible
content = content.replace(/placeholder:text-slate-400 dark:placeholder:text-slate-600/g, 'placeholder:text-slate-400 dark:placeholder:text-slate-400');
content = content.replace(/placeholder:text-slate-600/g, 'placeholder:text-slate-400 dark:placeholder:text-slate-400');
content = content.replace(/text-slate-400 dark:text-slate-500/g, 'text-slate-400 dark:text-slate-300');


fs.writeFileSync(filePath, content);
console.log('Successfully applied universal dark text contrast fix to CandidatePortal.jsx');

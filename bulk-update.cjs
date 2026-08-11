const fs = require('fs');
const path = require('path');

const walk = function(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          if (file.endsWith('.jsx')) results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

const replacements = [
  // Backgrounds
  { from: /(?<!dark:)\bbg-navy-950\b(?!\/)/g, to: 'bg-white dark:bg-navy-950' },
  { from: /(?<!dark:)\bbg-navy-900\b(?!\/)/g, to: 'bg-slate-50 dark:bg-navy-900' },
  { from: /(?<!dark:)\bbg-navy-950\/(\d+)\b/g, to: 'bg-slate-900/$1 dark:bg-navy-950/$1' },
  { from: /(?<!dark:)\bbg-navy-900\/(\d+)\b/g, to: 'bg-slate-800/$1 dark:bg-navy-900/$1' },

  // Text Colors
  { from: /(?<!dark:)\btext-white\b(?!\/)/g, to: 'text-slate-900 dark:text-white' },
  { from: /(?<!dark:)\btext-slate-100\b(?!\/)/g, to: 'text-slate-800 dark:text-slate-100' },
  { from: /(?<!dark:)\btext-slate-200\b(?!\/)/g, to: 'text-slate-700 dark:text-slate-200' },
  { from: /(?<!dark:)\btext-slate-300\b(?!\/)/g, to: 'text-slate-600 dark:text-slate-300' },
  { from: /(?<!dark:)\btext-slate-400\b(?!\/)/g, to: 'text-slate-500 dark:text-slate-400' },
  { from: /(?<!dark:)\btext-navy-950\b(?!\/)/g, to: 'text-slate-900 dark:text-white' },

  // Borders
  { from: /(?<!dark:)\bborder-navy-800\b(?!\/)/g, to: 'border-slate-200 dark:border-navy-800' },
  { from: /(?<!dark:)\bborder-navy-700\b(?!\/)/g, to: 'border-slate-300 dark:border-navy-700' },
  { from: /(?<!dark:)\bborder-gold-500\/(\d+)\b/g, to: 'border-slate-200 dark:border-gold-500/$1' },
];

const processFiles = (directories) => {
  directories.forEach(dir => {
    walk(dir, (err, files) => {
      if (err) throw err;
      files.forEach(file => {
        let content = fs.readFileSync(file, 'utf8');
        let originalContent = content;

        // Skip files in erp/ or crm/ as they were already handled or don't need this broad brush
        if (file.includes('src\\erp') || file.includes('src/erp') || file.includes('src\\crm') || file.includes('src/crm')) {
          return;
        }

        replacements.forEach(rep => {
          content = content.replace(rep.from, rep.to);
        });

        // Clean up duplicates if any accidentally introduced
        content = content.replace(/\bbg-white bg-white\b/g, 'bg-white');
        content = content.replace(/\btext-slate-900 text-slate-900\b/g, 'text-slate-900');
        
        if (content !== originalContent) {
          fs.writeFileSync(file, content, 'utf8');
          console.log(`Updated: ${file}`);
        }
      });
    });
  });
};

processFiles([
  path.join(__dirname, 'src/pages'),
  path.join(__dirname, 'src/components')
]);

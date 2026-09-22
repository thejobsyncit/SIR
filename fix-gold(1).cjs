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

const processFiles = (directories) => {
  directories.forEach(dir => {
    walk(dir, (err, files) => {
      if (err) throw err;
      files.forEach(file => {
        let content = fs.readFileSync(file, 'utf8');
        let originalContent = content;

        if (file.includes('src\\erp') || file.includes('src/erp') || file.includes('src\\crm') || file.includes('src/crm')) {
          return;
        }

        content = content.replace(/bg-gold-shimmer(\s+hover:opacity-95)?\s+text-slate-900\s+dark:text-white/g, 'bg-gold-shimmer$1 text-navy-950');
        content = content.replace(/bg-gold-500\s+text-slate-900\s+dark:text-white/g, 'bg-gold-500 text-navy-950');
        
        // Also fix Footer.jsx double dark:text-white
        content = content.replace(/dark:text-white\s+dark:text-white/g, 'dark:text-white');

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

const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  content = content.replace(/SIR Recruitment/gi, 'Revival International');
  content = content.replace(/SIR RECRUITMENT/g, 'REVIVAL INTERNATIONAL');
  content = content.replace(/SIR_Recruitment/g, 'Revival_International');
  content = content.replace(/sirrecruitment\.com/g, 'revivalinternational.com');
  content = content.replace(/sirrecruitment/g, 'revivalinternational');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build', '.gemini'].includes(file)) {
        walkDir(fullPath);
      }
    } else {
      if (/\.(js|jsx|ts|tsx|html|css|json)$/i.test(file)) {
        replaceInFile(fullPath);
      }
    }
  }
}

walkDir(path.join(__dirname, 'src'));
walkDir(path.join(__dirname, 'server'));
if (fs.existsSync(path.join(__dirname, 'index.html'))) {
  replaceInFile(path.join(__dirname, 'index.html'));
}
if (fs.existsSync(path.join(__dirname, 'public'))) {
  walkDir(path.join(__dirname, 'public'));
}
console.log("Done");

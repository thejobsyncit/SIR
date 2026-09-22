const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'src/crm/pages');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(f => {
  let content = fs.readFileSync(path.join(dir, f), 'utf8');
  if (content.includes('import ScrollReveal')) return;

  // 1. Add import
  content = content.replace(/(import .*?;[\r\n]+)/, `$1import ScrollReveal from '../../components/ScrollReveal';\n`);

  // 2. Wrap the return statement div in ScrollReveal
  content = content.replace(/return \([\r\n\s]*<div className="space-y-6/g, `return (\n    <ScrollReveal>\n    <div className="space-y-6`);
  
  // 3. Close the ScrollReveal tag at the end
  content = content.replace(/<\/div>[\r\n\s]*\);[\r\n\s]*};[\r\n\s]*$/, `</div>\n    </ScrollReveal>\n  );\n};\n`);
  
  fs.writeFileSync(path.join(dir, f), content);
  console.log('Updated ' + f);
});

const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  content = content.replace(/Arogyavruksham Silks/gi, 'Arogyavruksham');
  content = content.replace(/arogyavrukshamsilks/gi, 'arogyavruksham');
  content = content.replace(/Arogyavruksham\.silks/gi, 'arogyavruksham');
  
  // Specific replacements
  content = content.replace(/handwoven silk, soft cottons, and elegant georgettes/gi, 'medicinal plants, rare herbs, and organic wellness products');
  content = content.replace(/dual-tone silk plant/gi, 'dual-tone plant');
  content = content.replace(/category='Silk'/gi, "category='Plants'");
  content = content.replace(/category: 'Silk'/gi, "category: 'Plants'");
  content = content.replace(/category="Silk"/gi, 'category="Plants"');
  content = content.replace(/category=Silk/gi, 'category=Plants');
  content = content.replace(/'Silk' \| 'Banarasi' \| 'Cotton' \| 'Georgette'/g, "'Plants' | 'Herbs' | 'Seeds' | 'Pots'");
  content = content.replace(/Pure Silk/gi, 'Pure Plants');
  content = content.replace(/setCategory\('Silk'\)/g, "setCategory('Plants')");
  content = content.replace(/\? Silk :/g, "? Plants :");
  content = content.replace(/ : 'Silk'/g, " : 'Plants'");
  
  if (original !== content) {
    fs.writeFileSync(filePath, content);
    console.log('Updated: ' + filePath);
  }
}

function walk(dir) {
  if (dir.includes('node_modules') || dir.includes('.git') || dir.includes('.next')) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.md')) {
      replaceInFile(fullPath);
    }
  }
}

walk(path.join(__dirname, '..', 'src'));

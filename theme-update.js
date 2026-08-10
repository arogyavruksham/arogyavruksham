const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const adminDir = path.join('C:\\Users\\saiva\\OneDrive\\Desktop\\WEBSITES\\Arogyavruksham', 'src', 'app', 'admin');

walkDir(adminDir, function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Generic replacements for primary brand color across Admin
    content = content.replace(/bg-gray-900/g, 'bg-emerald-800');
    content = content.replace(/hover:bg-black/g, 'hover:bg-emerald-900');
    content = content.replace(/border-gray-900/g, 'border-emerald-800');
    content = content.replace(/focus:border-gray-900/g, 'focus:border-emerald-800');
    content = content.replace(/focus:ring-gray-900/g, 'focus:ring-emerald-800');
    content = content.replace(/ring-gray-900/g, 'ring-emerald-800');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  }
});

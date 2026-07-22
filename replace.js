const fs = require('fs');
const path = require('path');

const DIRECTORIES = ['src', 'supabase'];
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.sql', '.md'];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  // Replacements
  const replacements = [
    { regex: /Preethi/g, replacement: 'Arogyavruksham' },
    { regex: /preethi/g, replacement: 'arogyavruksham' },
    { regex: /PREETHI/g, replacement: 'AROGYAVRUKSHAM' },
    { regex: /Sarees/g, replacement: 'Plants' },
    { regex: /sarees/g, replacement: 'plants' },
    { regex: /SAREES/g, replacement: 'PLANTS' },
    { regex: /Saree/g, replacement: 'Plant' },
    { regex: /saree/g, replacement: 'plant' },
    { regex: /SAREE/g, replacement: 'PLANT' },
    { regex: /Saris/g, replacement: 'Plants' },
    { regex: /saris/g, replacement: 'plants' },
    { regex: /SARIS/g, replacement: 'PLANTS' },
    { regex: /Sari/g, replacement: 'Plant' },
    { regex: /sari/g, replacement: 'plant' },
    { regex: /SARI/g, replacement: 'PLANT' }
  ];

  let changed = false;
  for (const { regex, replacement } of replacements) {
    if (regex.test(newContent)) {
      newContent = newContent.replace(regex, replacement);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile()) {
      const ext = path.extname(fullPath);
      if (EXTENSIONS.includes(ext)) {
        replaceInFile(fullPath);
      }
    }
  }
}

for (const dir of DIRECTORIES) {
  processDirectory(path.join(__dirname, dir));
}
console.log('Done');

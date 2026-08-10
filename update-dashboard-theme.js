const fs = require('fs');
const path = 'C:\\Users\\saiva\\OneDrive\\Desktop\\WEBSITES\\Arogyavruksham\\src\\app\\admin\\page.tsx';

let content = fs.readFileSync(path, 'utf8');

content = content.replace(/#111827/g, '#059669');
content = content.replace(/text-gray-900/g, 'text-emerald-900');
content = content.replace(/bg-emerald-800/g, 'bg-emerald-600');
content = content.replace(/hover:border-emerald-800/g, 'hover:border-emerald-600');
content = content.replace(/border-emerald-800/g, 'border-emerald-600');
content = content.replace(/text-emerald-800/g, 'text-emerald-600');

fs.writeFileSync(path, content, 'utf8');

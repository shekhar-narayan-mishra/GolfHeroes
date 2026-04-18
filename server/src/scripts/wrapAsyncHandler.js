const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '../routes');
const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(routesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Insert import if not exists
  if (!content.includes('asyncHandler.js')) {
    content = content.replace(/(import .*?;)/, "$1\nimport { asyncHandler } from '../utils/asyncHandler.js';");
  }

  // Find all router.METHOD(...) calls and wrap the last argument
  const regex = /(router\.(?:get|post|put|delete|patch)\([^,]+(?:,\s*[^,()]+)*,\s*)([A-Za-z0-9_]+)(\s*\);)/g;
  
  content = content.replace(regex, (match, prefix, handler, suffix) => {
    // If it's already wrapped or something weird, skip
    if (prefix.includes('asyncHandler(') || handler === 'asyncHandler') return match;
    return `${prefix}asyncHandler(${handler})${suffix}`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});

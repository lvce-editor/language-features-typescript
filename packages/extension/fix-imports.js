import fs from 'fs';
import path from 'path';

function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace .ts imports with .js imports in compiled files
    content = content.replace(/from ['"](\.\.?\/.*?)\.ts['"]/g, "from '$1.js'");
    content = content.replace(/import ['"](\.\.?\/.*?)\.ts['"]/g, "import '$1.js'");

    fs.writeFileSync(filePath, content);
    console.log(`Fixed imports in: ${filePath}`);
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

function findJsFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findJsFiles(fullPath));
    } else if (item.endsWith('.js') && !item.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Find all JavaScript files in dist
const jsFiles = findJsFiles('packages/extension/dist');

// Fix imports in all files
jsFiles.forEach(fixImportsInFile);

console.log('Import fixes complete!');

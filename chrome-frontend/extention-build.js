// chrome-frontend/extension-build.js
const fs = require('fs');
const path = require('path');

// Source and destination paths
const sourceDir = path.join(__dirname, 'out');
const iconsDir = path.join(__dirname, 'public/icons');
const destDir = path.join(__dirname, 'extension-dist');

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy the Next.js build output
copyFolderSync(sourceDir, destDir);

// Copy the manifest.json file
const manifestSource = path.join(__dirname, 'manifest/manifest.json');
const manifestDest = path.join(destDir, 'manifest.json');
fs.copyFileSync(manifestSource, manifestDest);

// Copy the background script
const backgroundSource = path.join(__dirname, 'public/background.js');
const backgroundDest = path.join(destDir, 'background.js');
fs.copyFileSync(backgroundSource, backgroundDest);

// Copy the inject script
const injectSource = path.join(__dirname, 'public/inject.js');
const injectDest = path.join(destDir, 'inject.js');
fs.copyFileSync(injectSource, injectDest);

// Copy icons if they exist
if (fs.existsSync(iconsDir)) {
  const iconsDest = path.join(destDir, 'icons');
  if (!fs.existsSync(iconsDest)) {
    fs.mkdirSync(iconsDest, { recursive: true });
  }
  copyFolderSync(iconsDir, iconsDest);
}

console.log('Extension build complete!');

// Helper function to copy folders recursively
function copyFolderSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);

    const stats = fs.statSync(sourcePath);
    if (stats.isDirectory()) {
      copyFolderSync(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}
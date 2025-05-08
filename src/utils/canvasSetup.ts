import { registerFont } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';

const fontDir = path.join(__dirname, '../assets/font');
const loadedFonts: String[] = []

fs.readdirSync(fontDir).forEach(file => {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.ttf' || ext === '.otf') {
    const fullPath = path.join(fontDir, file);
    const fontName = path.basename(file, ext); // use filename as font family
    registerFont(fullPath, { family: fontName });
    loadedFonts.push(fontName)
  }
});

console.log("Loaded Fonts: " + loadedFonts)
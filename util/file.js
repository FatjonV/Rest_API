import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES Modules don’t have __dirname by default — we rebuild it like this:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clearImage = (filePath) => {
  const fullPath = path.join(__dirname, '..', filePath);
  fs.unlink(fullPath, (err) => {
    if (err) console.log(err);
  });
};

export default clearImage;

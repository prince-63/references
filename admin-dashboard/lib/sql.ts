import fs from 'fs';
import path from 'path';

export function loadSQL(file: string) {
  return fs.readFileSync(path.join(process.cwd(), 'sql', file), 'utf8');
}

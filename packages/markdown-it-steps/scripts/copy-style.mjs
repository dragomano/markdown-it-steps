import { copyFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../src/style.css', import.meta.url));
const target = fileURLToPath(new URL('../dist/style.css', import.meta.url));

await mkdir(dirname(target), { recursive: true });
await copyFile(source, target);

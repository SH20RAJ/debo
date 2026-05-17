import { cp } from 'node:fs/promises';
import { resolve } from 'node:path';

async function testCopy() {
  const src = resolve('node_modules/hast-util-to-html');
  const dest = resolve('.open-next/server-functions/api/node_modules/hast-util-to-html-test');
  
  try {
    await cp(src, dest, { recursive: true });
    console.log('Copy succeeded');
  } catch (err) {
    console.error('Copy failed:', err);
  }
}

testCopy();

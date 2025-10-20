import { translate } from './index.js';
import { Readable } from 'node:stream';

const text = process.argv[2] || 'Hello, world!';
const targetLang = (process.argv[3] || 'ja') as 'ja' | 'en';
const useNodeStream = process.argv[4] === '--node-stream';

console.log(`Translating to ${targetLang}: "${text}"`);
console.log(`Using ${useNodeStream ? 'Node.js Stream' : 'Web ReadableStream'}\n`);

const stream = await translate({ text, targetLang, useNodeStream });

if (stream instanceof Readable) {
  // Node.js Stream API
  stream.on('data', (chunk) => {
    process.stdout.write(chunk);
  });

  stream.on('end', () => {
    console.log('\n');
  });

  stream.on('error', (error) => {
    console.error('Error:', error);
    process.exit(1);
  });
} else {
  // Web API ReadableStream (fallback)
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      process.stdout.write(value);
    }
    console.log('\n');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

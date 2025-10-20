import { translate } from './index.js';

const text = process.argv[2] || 'Hello, world!';
const targetLang = (process.argv[3] || 'ja') as 'ja' | 'en';

console.log(`Translating to ${targetLang}: "${text}"\n`);

const stream = await translate({ text, targetLang });
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

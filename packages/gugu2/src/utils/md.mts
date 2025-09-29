import fs from 'fs';
import readline from 'readline';

export async function readUntilMore(
  filepath: string,
  splitter = '<!-- more -->',
) {
  const stream = fs.createReadStream(filepath, { encoding: 'utf-8' });
  const rl = readline.createInterface({ input: stream });

  const lines: string[] = [];

  try {
    for await (const line of rl) {
      if (line.trim() === splitter) {
        break;
      }
      lines.push(line);
    }
  } finally {
    // The for...await...of loop ensures that rl.close() is called.
    // We must manually close the stream, as rl.close() does not do so.
    stream.close();
  }

  return lines.join('\n');
}

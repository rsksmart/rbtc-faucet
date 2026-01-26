
import { FaucetHistory } from '@/types/types';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'tmp', 'faucetHistory.json');

export function saveFaucetHistory(data: FaucetHistory) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('error saving to file', error);
  }
}

export function loadFaucetHistory() {
  if (fs.existsSync(filePath)) {
    const rawData = fs.readFileSync(filePath);
    return JSON.parse(rawData.toString());
  }
  return {};
}
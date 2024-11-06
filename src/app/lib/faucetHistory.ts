
import { FaucetHistory } from '@/types/types';
import fs from 'fs';
import path from 'path';

const filePath = path.join(__dirname, 'faucetHistory.json');

export function saveFaucetHistory(data: FaucetHistory) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error al guardar en el archivo:', error);
  }
}

export function loadFaucetHistory() {
  if (fs.existsSync(filePath)) {
    const rawData = fs.readFileSync(filePath);
    return JSON.parse(rawData.toString());
  }
  return {};
}
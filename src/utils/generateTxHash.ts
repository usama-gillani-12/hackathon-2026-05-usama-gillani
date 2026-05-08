const HEX = '0123456789abcdef';

export function generateTxHash(): string {
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += HEX[Math.floor(Math.random() * 16)];
  }
  return hash;
}

export function generateIntentId(): string {
  const ts = Date.now().toString(36);
  let rand = '';
  for (let i = 0; i < 8; i++) rand += HEX[Math.floor(Math.random() * 16)];
  return `pi_${ts}_${rand}`;
}

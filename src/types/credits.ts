export interface CreditPackage {
  id: string;
  credits: number;
  usdcAmount: number;
  label: string;
  highlight?: boolean;
}

export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

export type TransactionType = 'purchase' | 'unlock';

export interface CreditTransaction {
  id: string;
  type: TransactionType;
  packageId?: string;
  packageLabel?: string;
  credits: number;
  usdcAmount: number;
  txHash: string;
  status: TransactionStatus;
  createdAt: number;
  productId?: string;
  productTitle?: string;
  network: 'mock' | 'testnet' | 'mainnet';
}

export interface UnlockRecord {
  productId: string;
  unlockedAt: number;
  creditsSpent: number;
  txHash: string;
}

export interface UsdcPaymentIntent {
  intentId: string;
  packageId: string;
  usdcAmount: number;
  credits: number;
  network: 'mock' | 'testnet' | 'mainnet';
  receivingAddress: string;
  expiresAt: number;
}

export interface UsdcPaymentResult {
  intentId: string;
  txHash: string;
  status: TransactionStatus;
  confirmedAt: number;
}

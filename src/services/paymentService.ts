import { CreditPackage, CreditTransaction, UsdcPaymentIntent, UsdcPaymentResult } from '../types/credits';
import { generateIntentId, generateTxHash } from '../utils/generateTxHash';
import { addCredits, recordTransaction } from './creditService';

/**
 * PaymentService is the abstraction over the USDC credit purchase flow.
 *
 * Production note (do NOT ignore when promoting beyond MVP):
 *   - Real USDC settlement must be verified by a backend service that watches the
 *     receiving wallet and confirms the on-chain transaction (e.g. Base/Polygon USDC).
 *   - The mobile client must NEVER hold private keys, seed phrases, or sign transfers.
 *   - Replace MockPaymentService with an HTTP-backed implementation that calls
 *     POST /payments/intent and POST /payments/verify on a trusted server.
 */
export interface PaymentService {
  readonly mode: 'mock' | 'testnet' | 'mainnet';
  createUsdcPaymentIntent(pkg: CreditPackage): Promise<UsdcPaymentIntent>;
  verifyUsdcPayment(intentId: string): Promise<UsdcPaymentResult>;
  addCredits(pkg: CreditPackage, paymentResult: UsdcPaymentResult): Promise<CreditTransaction>;
}

const MOCK_RECEIVING_ADDRESS = '0x000DemoReceivingWallet000000000000000USDC';

class MockPaymentServiceImpl implements PaymentService {
  readonly mode = 'mock' as const;

  async createUsdcPaymentIntent(pkg: CreditPackage): Promise<UsdcPaymentIntent> {
    return {
      intentId: generateIntentId(),
      packageId: pkg.id,
      usdcAmount: pkg.usdcAmount,
      credits: pkg.credits,
      network: 'mock',
      receivingAddress: MOCK_RECEIVING_ADDRESS,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };
  }

  async verifyUsdcPayment(intentId: string): Promise<UsdcPaymentResult> {
    // Simulate the latency a real on-chain confirmation would take.
    await delay(1400);
    return {
      intentId,
      txHash: generateTxHash(),
      status: 'confirmed',
      confirmedAt: Date.now(),
    };
  }

  async addCredits(pkg: CreditPackage, paymentResult: UsdcPaymentResult): Promise<CreditTransaction> {
    await addCredits(pkg.credits);
    const tx: CreditTransaction = {
      id: paymentResult.txHash,
      type: 'purchase',
      packageId: pkg.id,
      packageLabel: `${pkg.label} (${pkg.credits} credits)`,
      credits: pkg.credits,
      usdcAmount: pkg.usdcAmount,
      txHash: paymentResult.txHash,
      status: paymentResult.status,
      createdAt: paymentResult.confirmedAt,
      network: 'mock',
    };
    await recordTransaction(tx);
    return tx;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const MockPaymentService: PaymentService = new MockPaymentServiceImpl();

let activeService: PaymentService = MockPaymentService;

export function getPaymentService(): PaymentService {
  return activeService;
}

export function setPaymentService(service: PaymentService): void {
  activeService = service;
}

export function isDemoPaymentMode(): boolean {
  return activeService.mode === 'mock';
}

import { createPublicClient, http, parseUnits } from 'viem';
import { baseSepolia } from 'viem/chains';
import { getWalletClient } from '@wagmi/core';
import { CreditPackage, CreditTransaction, UsdcPaymentIntent, UsdcPaymentResult } from '../types/credits';
import { generateIntentId, generateTxHash } from '../utils/generateTxHash';
import {
  addCredits,
  getTotalCredits,
  incrementChainVolume,
  recordTransaction,
} from './creditService';
import {
  BASE_SEPOLIA_RPC,
  BASE_SEPOLIA_TREASURY,
  BASE_SEPOLIA_USDC_CONTRACT,
  TX_POLL_INTERVAL_MS,
  TX_POLL_MAX_ATTEMPTS,
  USDC_DECIMALS,
} from '../constants';
import { wagmiConfig } from '../config/wagmi';

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

// ─── ERC-20 minimal ABI (transfer only) ──────────────────────────────────────

const ERC20_TRANSFER_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

const baseSepPublicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(BASE_SEPOLIA_RPC),
});

// Module-level map: intentId → usdcAmount (cleared after addCredits)
const pendingIntents = new Map<string, number>();

class BaseSepoliaPaymentServiceImpl implements PaymentService {
  readonly mode = 'testnet' as const;

  async createUsdcPaymentIntent(pkg: CreditPackage): Promise<UsdcPaymentIntent> {
    const intentId = generateIntentId();
    pendingIntents.set(intentId, pkg.usdcAmount);
    return {
      intentId,
      packageId: pkg.id,
      usdcAmount: pkg.usdcAmount,
      credits: pkg.credits,
      network: 'base-sepolia',
      receivingAddress: BASE_SEPOLIA_TREASURY,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };
  }

  async verifyUsdcPayment(intentId: string): Promise<UsdcPaymentResult> {
    const walletClient = await getWalletClient(wagmiConfig);
    if (!walletClient) {
      throw new Error('No wallet connected. Please connect your wallet first.');
    }

    const usdcAmount = pendingIntents.get(intentId);
    if (usdcAmount === undefined) {
      throw new Error('Payment intent not found or expired.');
    }

    const [userAddress] = await walletClient.getAddresses();
    const usdcAmountRaw = parseUnits(usdcAmount.toString(), USDC_DECIMALS);

    const txHash = await walletClient.writeContract({
      address: BASE_SEPOLIA_USDC_CONTRACT,
      abi: ERC20_TRANSFER_ABI,
      functionName: 'transfer',
      args: [BASE_SEPOLIA_TREASURY, usdcAmountRaw],
      chain: baseSepolia,
      account: userAddress,
    });

    const receipt = await this.waitForReceipt(txHash);

    return {
      intentId,
      txHash,
      status: receipt.status === 'success' ? 'confirmed' : 'failed',
      confirmedAt: Date.now(),
    };
  }

  async addCredits(pkg: CreditPackage, paymentResult: UsdcPaymentResult): Promise<CreditTransaction> {
    const totalCredits = getTotalCredits(pkg);
    await addCredits(totalCredits);
    const tx: CreditTransaction = {
      id: paymentResult.txHash,
      type: 'purchase',
      packageId: pkg.id,
      packageLabel: `${pkg.label} (${totalCredits} credits)`,
      credits: totalCredits,
      usdcAmount: pkg.usdcAmount,
      txHash: paymentResult.txHash,
      status: paymentResult.status,
      createdAt: paymentResult.confirmedAt,
      network: 'base-sepolia',
    };
    await recordTransaction(tx);
    await incrementChainVolume(pkg.usdcAmount);
    pendingIntents.delete(paymentResult.intentId);
    return tx;
  }

  private async waitForReceipt(txHash: `0x${string}`): Promise<{ status: 'success' | 'reverted' }> {
    for (let i = 0; i < TX_POLL_MAX_ATTEMPTS; i++) {
      await delay(TX_POLL_INTERVAL_MS);
      const receipt = await baseSepPublicClient
        .getTransactionReceipt({ hash: txHash })
        .catch(() => null);
      if (receipt) return receipt;
    }
    throw new Error('Transaction not confirmed after 60 seconds. Check block explorer.');
  }
}

export const BaseSepoliaPaymentService: PaymentService = new BaseSepoliaPaymentServiceImpl();

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

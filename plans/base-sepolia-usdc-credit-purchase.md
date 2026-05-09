# Base Sepolia USDC Credit Purchase — Feature Plan

## Why This Feature

TrendPro credits are the core monetisation unit. Rather than wrapping a traditional payment processor (Stripe, IAP), the credit purchase flow settles on-chain using **USDC on Base Sepolia testnet** — giving the investor demo a real Web3 payment story without involving real money.

The flow proves:
- Users pay with crypto (USDC) via any WalletConnect v2 wallet (MetaMask, Rainbow, etc.)
- Every transaction is verifiable on a public blockchain explorer
- Credits are credited immediately after on-chain confirmation

---

## Architecture

### Payment Service Abstraction

All payment logic sits behind a single interface (`PaymentService`) with two concrete implementations that are hot-swapped at startup:

```
App.tsx
  └─ setPaymentService(MockPaymentService | BaseSepoliaPaymentService)
       └─ getPaymentService()  ← consumed by BuyCreditsScreen + NetworkModeBanner
```

The active service is stored in a module-level variable (`activeService`) in `paymentService.ts`. Only `App.tsx` sets it — no other file should call `setPaymentService`.

### Mode Toggle (single line in App.tsx)

```ts
// App.tsx:23
const USE_MOCK_PAYMENT = true;   // ← true = demo/simulator, false = real testnet
```

| `USE_MOCK_PAYMENT` | Service | Mode string | UI badge |
|---|---|---|---|
| `true` | `MockPaymentService` | `'mock'` | Amber "USDC DEMO MODE" |
| `false` | `BaseSepoliaPaymentService` | `'testnet'` | Green "BASE SEPOLIA TESTNET" |

### Data Flow (real testnet path)

```
User taps "Pay X USDC"
  └─ BuyCreditsScreen.onPay()
       └─ service.createUsdcPaymentIntent(pkg)
            → generates intentId, stores usdcAmount in pendingIntents Map
            → returns UsdcPaymentIntent { intentId, receivingAddress, expiresAt }
       └─ service.verifyUsdcPayment(intentId)
            → getWalletClient(wagmiConfig)         ← WalletConnect session via wagmi
            → walletClient.writeContract(          ← signs ERC-20 transfer in wallet app
                USDC contract, transfer(),
                to: TREASURY, value: usdcAmount * 10^6
              )
            → waitForReceipt(txHash)               ← polls baseSepPublicClient every 3s, max 20×
            → returns UsdcPaymentResult { txHash, status: 'confirmed' | 'failed' }
       └─ service.addCredits(pkg, result)
            → creditService.addCredits(totalCredits)      ← AsyncStorage via Zustand persist
            → creditService.recordTransaction(tx)         ← audit log in transaction history
            → creditService.incrementChainVolume(usdc)    ← InvestorMetrics dashboard counter
            → pendingIntents.delete(intentId)             ← cleanup
            → returns CreditTransaction
       └─ navigation.navigate('PaymentSuccess', { transaction, packageInfo })
```

### Data Flow (mock path)

Identical call sites, but `MockPaymentServiceImpl`:
- Generates a fake `intentId` and `0x…` 64-char hex txHash
- Simulates ~1.4s latency via `delay(1400)`
- Marks status `'confirmed'` immediately — no RPC call, no wallet

---

## Files Changed

| File | Change |
|------|--------|
| `src/services/paymentService.ts` | Core file — `PaymentService` interface, `MockPaymentServiceImpl`, `BaseSepoliaPaymentServiceImpl`, `setPaymentService`, `getPaymentService` |
| `src/services/walletService.ts` | `WalletSession` persistence helpers (`getWalletSession`, `saveWalletSession`, `clearWalletSession`) |
| `src/stores/useWalletStore.ts` | Zustand store for wallet connection state (`session`, `isConnecting`, `error`) |
| `src/config/wagmi.ts` | `defaultWagmiConfig` for Base Sepolia + `createWeb3Modal` with `EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID` |
| `src/types/credits.ts` | `CreditPackage`, `CreditTransaction`, `UsdcPaymentIntent`, `UsdcPaymentResult`, `ChainVolumeSnapshot` interfaces |
| `src/services/creditService.ts` | `CREDIT_PACKAGES` array, `addCredits`, `recordTransaction`, `incrementChainVolume`, `getTotalCredits` |
| `src/screens/BuyCreditsScreen.tsx` | Full purchase UI — package selector, pay button, wallet connect gate, ROI ticker, subscription tab |
| `src/components/WalletConnectButton.tsx` | Connect / disconnect button using `useAccount` + `useWeb3Modal` from wagmi |
| `src/components/NetworkModeBanner.tsx` | Pulsing mode banner (amber = mock, green = testnet) shown on BuyCreditsScreen |
| `src/components/SubscriptionPassCard.tsx` | Monthly Pass tab UI card |
| `src/constants/index.ts` | `BASE_SEPOLIA_CHAIN_ID`, `BASE_SEPOLIA_RPC`, `BASE_SEPOLIA_USDC_CONTRACT`, `BASE_SEPOLIA_TREASURY`, `USDC_DECIMALS`, `TX_POLL_INTERVAL_MS`, `TX_POLL_MAX_ATTEMPTS` |
| `App.tsx` | `setPaymentService` called at startup; `USE_MOCK_PAYMENT` constant; `WagmiProvider` + `Web3Modal` wrappers |
| `src/navigation/AppNavigator.tsx` | `WalletStore.initialize()` called on mount — removed stale `setPaymentService` override |
| `ios/Podfile` | Platform bumped `13.4 → 14.0` (required by `react-native-netinfo@12`) |
| `ios/TrendPro.xcodeproj/project.pbxproj` | `IPHONEOS_DEPLOYMENT_TARGET` bumped `13.4 → 14.0` (all 4 entries) |
| `ios/TrendPro/Info.plist` | Added `FontAwesome6_Brands/Regular/Solid.ttf` + `Fontisto.ttf` to `UIAppFonts` |
| `.env` | `EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID` (was `WALLETCONNECT_PROJECT_ID` — wrong prefix, not inlined by Babel) |

---

## Key Constants

| Constant | Value | Purpose |
|---|---|---|
| `BASE_SEPOLIA_CHAIN_ID` | `84532` | Chain ID for wagmi config |
| `BASE_SEPOLIA_RPC` | `https://base-sepolia-rpc.publicnode.com` | Free public RPC, no key needed |
| `BASE_SEPOLIA_USDC_CONTRACT` | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | Circle's official USDC on Base Sepolia |
| `BASE_SEPOLIA_TREASURY` | `0x10Bc9282030dd5a2CF4c7D0fc88e3ad2Ef894C24` | Receiving wallet for credit purchases |
| `USDC_DECIMALS` | `6` | ERC-20 decimal places for `parseUnits()` |
| `TX_POLL_INTERVAL_MS` | `3000` | Receipt polling interval |
| `TX_POLL_MAX_ATTEMPTS` | `20` | Max ~60s before timeout error |

## Credit Packages

| ID | Credits | Bonus | Total | USDC | Savings |
|---|---|---|---|---|---|
| `starter` | 5 | 0 | 5 | 4 | — |
| `pro` | 12 | 3 | 15 | 9 | 20% |
| `elite` | 25 | 10 | 35 | 15 | 42% |
| `power` | 60 | 30 | 90 | 28 | 55% |
| `sub-monthly` | 25 | — | 25 | 19 | — (subscription) |

---

## UI States (BuyCreditsScreen)

| State | Condition | UI |
|---|---|---|
| Mock mode | `service.mode === 'mock'` | Amber badge, WalletConnect hidden, pay button always enabled |
| Testnet — wallet disconnected | `isTestnet && !isConnected` | Green badge, WalletConnect button shown, pay button shows "Connect Wallet to Continue" (disabled) |
| Testnet — wallet connected | `isTestnet && isConnected` | Pay button enabled, shows amount + credits |
| Processing | `processing === true` | Button pulses, spinner + "Confirming on-chain…" label |

---

## Packages Added

```json
"@walletconnect/react-native-compat": "^2.23.9",
"@walletconnect/core": "^2.23.9",
"@walletconnect/ethereum-provider": "2.11.0",
"@walletconnect/sign-client": "^2.23.9",
"@web3modal/wagmi-react-native": "^2.0.5",
"wagmi": "^3.6.11",
"viem": "^2.48.11",
"@react-native-community/netinfo": "^12.0.1"
```

Polyfill imports in `index.js` (must be first):
```ts
import 'react-native-get-random-values';
import '@ethersproject/shims';
import '@walletconnect/react-native-compat';
import 'react-native-url-polyfill/auto';
```

---

## Verification

```bash
# Type check
yarn ts:check

# Simulator (mock mode)
# App.tsx: const USE_MOCK_PAYMENT = true
yarn start --reset-cache
yarn ios
```

**Mock flow test (simulator):**
1. Credits tab → confirm amber "USDC DEMO MODE" badge visible ✓
2. No WalletConnect button shown ✓
3. Select any package → tap "Pay X USDC · Get Y Credits" ✓
4. ~1.4s spinner → PaymentSuccess screen with fake `0x…` hash ✓
5. Credits tab → balance incremented ✓
6. Tap "History" → transaction recorded with amount, timestamp, hash ✓

**Real testnet flow test (physical device):**
1. `App.tsx`: set `USE_MOCK_PAYMENT = false`
2. Install MetaMask on device → switch to Base Sepolia network
3. Get testnet USDC from Base Sepolia faucet
4. `yarn ios --device`
5. Credits tab → confirm green "BASE SEPOLIA TESTNET" badge ✓
6. Tap WalletConnect button → scan QR / deep-link into MetaMask ✓
7. Select package → tap pay → sign transaction in MetaMask ✓
8. Wait for on-chain confirmation (~9s) → PaymentSuccess with real txHash ✓
9. Verify tx on `https://sepolia.basescan.org/tx/<txHash>` ✓

---

## Known Limitations (MVP)

- **No server-side verification** — credits are granted client-side after receipt confirmation. A production implementation must verify the receipt on a trusted backend before granting credits.
- **Treasury wallet is static** — `BASE_SEPOLIA_TREASURY` is hardcoded. Production should generate per-intent deposit addresses.
- **No refund flow** — failed transactions (reverted on-chain) do not auto-retry or refund credits.

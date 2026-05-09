import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi-react-native';
import { http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { BASE_SEPOLIA_RPC } from '@constants';

// Get your free project ID at https://cloud.walletconnect.com
const PROJECT_ID: string = (process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID as string) ?? '';

const metadata = {
  name: 'TrendPro',
  description: 'Discover high-margin dropshipping products using AI scoring',
  url: 'https://trendpro.app',
  icons: ['https://trendpro.app/icon.png'],
};

export const wagmiConfig = defaultWagmiConfig({
  chains: [baseSepolia],
  projectId: PROJECT_ID,
  metadata,
  transports: {
    [baseSepolia.id]: http(BASE_SEPOLIA_RPC),
  },
});

createWeb3Modal({
  wagmiConfig,
  projectId: PROJECT_ID,
  defaultChain: baseSepolia,
  enableAnalytics: false,
});

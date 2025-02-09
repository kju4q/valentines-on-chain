import { usePrivy } from "@privy-io/react-auth";
import LandingPage from "./components/LandingPage";
import MainPage from "./components/MainPage";
import { PrivyProvider } from "./providers/PrivyProvider";
import HeartLoader from "./components/HeartLoader";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Chain } from "@thirdweb-dev/chains";
import { UserProfileProvider } from "./contexts/UserProfileContext";

export const baseSepolia: Chain = {
  chainId: 84532,
  rpc: ["https://sepolia.base.org"],
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  shortName: "base-sepolia",
  slug: "base-sepolia",
  testnet: true,
  chain: "Base Sepolia",
  name: "Base Sepolia Testnet",
  icon: {
    url: "ipfs://QmW5Vn15HeRkScMfPcW12ZdZcC2yUASpu6ehS6NAVUrz9S",
    height: 512,
    width: 512,
  },
  explorers: [
    {
      name: "Base Sepolia Explorer",
      url: "https://sepolia.basescan.org",
      icon: "basescan",
      standard: "EIP3091",
    },
  ],
};

function AppContent() {
  const { ready, authenticated } = usePrivy();

  if (!ready) {
    return <HeartLoader text="Loading..." />;
  }

  return authenticated ? <MainPage /> : <LandingPage />;
}

function App() {
  return (
    <ThirdwebProvider
      activeChain={baseSepolia}
      clientId={import.meta.env.VITE_THIRDWEB_CLIENT_ID}
    >
      <PrivyProvider>
        <UserProfileProvider>
          <AppContent />
        </UserProfileProvider>
      </PrivyProvider>
    </ThirdwebProvider>
  );
}

export default App;

import { usePrivy } from "@privy-io/react-auth";
import LandingPage from "./components/LandingPage.js";
import MainPage from "./components/MainPage.js";
import { PrivyProvider } from "./providers/PrivyProvider.js";
import HeartLoader from "./components/HeartLoader.js";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Chain } from "@thirdweb-dev/chains";
import { UserProfileProvider } from "./contexts/UserProfileContext.js";
import { useEffect, useState } from "react";
import { TransactionModal } from "./components/TransactionModal";

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
    format: "png",
  },
  explorers: [
    {
      name: "Base Sepolia Explorer",
      url: "https://sepolia.basescan.org",
      icon: {
        url: "basescan",
        width: 32,
        height: 32,
        format: "png",
      },
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
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState({
    amount: "",
    token: "",
    recipient: "",
    message: "",
  });

  useEffect(() => {
    // Handle deep link parameters if they exist
    const params = new URLSearchParams(window.location.search);
    if (params.has("amount") && params.has("to")) {
      setTransactionDetails({
        amount: params.get("amount") || "",
        token: params.get("token") || "ETH",
        recipient: params.get("to") || "",
        message: params.get("message") || "",
      });
      setShowTransactionModal(true);
    }
  }, []);

  return (
    <ThirdwebProvider
      activeChain={baseSepolia}
      clientId={import.meta.env.VITE_THIRDWEB_CLIENT_ID}
    >
      <PrivyProvider>
        <UserProfileProvider>
          <AppContent />
          <TransactionModal
            show={showTransactionModal}
            onClose={() => setShowTransactionModal(false)}
            defaultValues={transactionDetails}
          />
        </UserProfileProvider>
      </PrivyProvider>
    </ThirdwebProvider>
  );
}

export default App;

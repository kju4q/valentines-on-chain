import { PrivyProvider as Privy } from "@privy-io/react-auth";
import type { PrivyClientConfig } from "@privy-io/react-auth";
import { baseSepolia } from "viem/chains";

interface PrivyProviderProps {
  children: React.ReactNode;
}

// Configuration optimized for Twitter bot integration
const privyConfig: PrivyClientConfig = {
  loginMethods: ["email", "wallet", "twitter"],
  embeddedWallets: {
    createOnLogin: "users-without-wallets",
  },
  appearance: {
    theme: "light",
    accentColor: "#ec4899",
    showWalletLoginFirst: true,
    walletList: ["metamask", "coinbase_wallet", "rainbow"],
  },
  defaultChain: baseSepolia,
  supportedChains: [baseSepolia],
};

export function PrivyProvider({ children }: PrivyProviderProps) {
  return (
    <Privy appId={import.meta.env.VITE_PRIVY_APP_ID} config={privyConfig}>
      {children}
    </Privy>
  );
}

import { PrivyProvider as Privy } from "@privy-io/react-auth";

interface PrivyProviderProps {
  children: React.ReactNode;
}

export function PrivyProvider({ children }: PrivyProviderProps) {
  return (
    <Privy
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        loginMethods: ["wallet", "email"],
        appearance: {
          theme: "light",
          accentColor: "#ec4899", // Tailwind pink-500
          showWalletLoginFirst: true,
        },
      }}
    >
      {children}
    </Privy>
  );
}

import { createContext, useContext, useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { generateNickname } from "../utils/nicknames";

// Move this to a shared constants file
export const VALENTINE_NICKNAMES = [
  "HopelessRomantic",
  "LoveChampion",
  "HeartBreaker",
  "CupidArrow",
  "SweetHeart",
  "LovePoet",
  "RoseKeeper",
  "DreamLover",
  "RomanticSoul",
  "LoveWarrior",
  "HeartMaker",
  "ValentineKing",
  "LoveCrafter",
  "HeartWhisperer",
  "RomanceArtist",
];

interface UserProfile {
  address: string;
  nickname: string;
  shortAddress: string;
}

interface UserProfileContextType {
  userProfile: UserProfile | null;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(
  undefined
);

export const UserProfileProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = usePrivy();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user?.wallet?.address) {
      const address = user.wallet.address;
      const nickname = generateNickname(address);
      const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

      setUserProfile({
        address,
        nickname,
        shortAddress,
      });
    } else {
      setUserProfile(null);
    }
  }, [user?.wallet?.address]);

  return (
    <UserProfileContext.Provider value={{ userProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
};

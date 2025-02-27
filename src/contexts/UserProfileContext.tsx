import React, { createContext, useContext, useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";

// Define a more general set of nicknames for the platform
const CELEBRATION_NICKNAMES = [
  "GiftGiver",
  "Celebrator",
  "JoyBringer",
  "KindSoul",
  "Generous",
  "Thoughtful",
  "Appreciator",
  "FriendIndeed",
  "Supporter",
  "WellWisher",
  "GiftMaster",
  "Brightener",
  "Encourager",
  "Uplifter",
  "Recognizer",
];

interface UserProfile {
  nickname: string;
  shortAddress: string;
}

interface UserProfileContextType {
  userProfile: UserProfile | null;
}

const UserProfileContext = createContext<UserProfileContextType>({
  userProfile: null,
});

export const useUserProfile = () => useContext(UserProfileContext);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = usePrivy();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user?.wallet?.address) {
      // Generate nickname based on user's address
      const address = user.wallet.address;
      const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

      // Use the last few characters of the address to determine the nickname index
      const index =
        parseInt(address.slice(-4), 16) % CELEBRATION_NICKNAMES.length;
      const nickname = `${CELEBRATION_NICKNAMES[index]}`;

      setUserProfile({
        nickname,
        shortAddress,
      });
    } else {
      setUserProfile(null);
    }
  }, [user]);

  return (
    <UserProfileContext.Provider value={{ userProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

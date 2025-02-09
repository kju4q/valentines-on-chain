import { VALENTINE_NICKNAMES } from "../contexts/UserProfileContext";

export const generateNickname = (address: string) => {
  const index = parseInt(address.slice(-4), 16) % VALENTINE_NICKNAMES.length;
  return `0x${VALENTINE_NICKNAMES[index]}`;
};

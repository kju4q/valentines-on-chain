import { useCallback, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import {
  VALENTINE_GIFTS_ADDRESS,
  VALENTINE_GIFTS_ABI,
  USDC_ADDRESS,
  USDC_ABI,
} from "../../contracts/ValentineGifts";

export function useValentineGifts() {
  const { ready } = usePrivy();
  const { wallets } = useWallets();
  const [isLoading, setIsLoading] = useState(false);

  const sendEthGift = useCallback(
    async (to: string, amount: string) => {
      if (!ready || !wallets?.[0]) {
        throw new Error("Wallet not connected");
      }

      setIsLoading(true);
      try {
        const wallet = wallets[0];
        await wallet.switchChain(84532);

        // Get the provider and signer
        const privyProvider = await wallet.getEthereumProvider();
        const provider = new ethers.providers.Web3Provider(privyProvider);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(
          VALENTINE_GIFTS_ADDRESS,
          VALENTINE_GIFTS_ABI,
          signer
        );

        const tx = await contract.sendEthGift(to, {
          value: ethers.utils.parseEther(amount),
        });
        await tx.wait();

        return true;
      } catch (error) {
        console.error("Error sending ETH gift:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [wallets, ready]
  );

  const sendUsdcGift = useCallback(
    async (to: string, amount: string) => {
      if (!ready || !wallets?.[0]) {
        throw new Error("Wallet not connected");
      }

      setIsLoading(true);
      try {
        const wallet = wallets[0];
        await wallet.switchChain(84532);

        // Get the provider and signer
        const privyProvider = await wallet.getEthereumProvider();
        const provider = new ethers.providers.Web3Provider(privyProvider);
        const signer = provider.getSigner();

        // First approve USDC
        const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
        const amountInWei = ethers.utils.parseUnits(amount, 6); // USDC has 6 decimals

        const approveTx = await usdc.approve(
          VALENTINE_GIFTS_ADDRESS,
          amountInWei
        );
        await approveTx.wait();

        // Then send the gift
        const contract = new ethers.Contract(
          VALENTINE_GIFTS_ADDRESS,
          VALENTINE_GIFTS_ABI,
          signer
        );

        const tx = await contract.sendUsdcGift(to, amountInWei);
        await tx.wait();

        return true;
      } catch (error) {
        console.error("Error sending USDC gift:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [wallets, ready]
  );

  const sendSheFiGift = useCallback(
    async (to: string) => {
      if (!ready || !wallets?.[0]) {
        throw new Error("Wallet not connected");
      }

      setIsLoading(true);
      try {
        const wallet = wallets[0];
        await wallet.switchChain(84532);

        // Get the provider and signer
        const privyProvider = await wallet.getEthereumProvider();
        const provider = new ethers.providers.Web3Provider(privyProvider);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(
          VALENTINE_GIFTS_ADDRESS,
          VALENTINE_GIFTS_ABI,
          signer
        );

        const tx = await contract.giftSheFiCourse(to);
        await tx.wait();

        return true;
      } catch (error) {
        console.error("Error sending SheFi gift:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [wallets, ready]
  );

  return {
    sendEthGift,
    sendUsdcGift,
    sendSheFiGift,
    isLoading,
    ready,
  };
}

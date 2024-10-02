// src/components/Wallet.tsx
"use client";

import { useTonConnectUI } from "@tonconnect/ui-react";
import { useCallback, useEffect, useState } from "react";
import TonWeb from 'tonweb';

export default function Wallet() {
  const [tonConnectUi] = useTonConnectUI();
  const [tonWalletAddress, setTonWalletAddress] = useState<string | null>(null);
  const [isTransactionVerified, setIsTransactionVerified] = useState(false);
  const recipientAddress = "UQDyqwrrgddMbVvUjSb5kODdSoYMlMHB1ApkkjQOAYB2klvF";
  const toncenterAPI = "https://toncenter.com/api/v2/jsonRPC";
  const tonWeb = new TonWeb(new TonWeb.HttpProvider(toncenterAPI));

  const handleWalletConnection = useCallback((address: string) => {
    setTonWalletAddress(address);
    console.log("Connected to wallet:", address);

    if (!localStorage.getItem("walletConnected")) {
      localStorage.setItem("walletConnected", "true");
      window.location.reload();
    }
  }, []);

  const handleWalletDisconnection = useCallback(() => {
    setTonWalletAddress(null);
    console.log("Wallet disconnected");
    localStorage.removeItem("walletConnected");
  }, []);

  useEffect(() => {
    const checkWalletConnection = () => {
      if (tonConnectUi.account?.address) {
        handleWalletConnection(tonConnectUi.account.address);
      } else {
        handleWalletDisconnection();
      }
    };

    checkWalletConnection();

    const unsubscribe = tonConnectUi.onStatusChange((wallet) => {
      if (wallet) {
        handleWalletConnection(wallet.account.address);
      } else {
        handleWalletDisconnection();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [tonConnectUi, handleWalletConnection, handleWalletDisconnection]);

  const handleWalletAction = async () => {
    if (tonWalletAddress) {
      await tonConnectUi.disconnect();
      handleWalletDisconnection();
    } else {
      await tonConnectUi.openModal();
    }
  };

  const handleTransaction = async () => {
    try {
      await tonConnectUi.sendTransaction({
        validUntil: Date.now() + 5 * 60 * 1000,
        messages: [
          {
            address: recipientAddress,
            amount: "5000000",  // 0.5 TON en nanotones
          },
        ],
      });

      console.log("Transaction sent successfully!");
      setIsTransactionVerified(true);
    } catch (error) {
      console.error("Failed to send transaction:", error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div>
      {tonWalletAddress ? (
        <div>
          <p>Connected: {formatAddress(tonWalletAddress)}</p>
          <button onClick={handleWalletAction}>Disconnect wallet</button>
          {isTransactionVerified ? (
            <p>Verificado</p>
          ) : (
            <button onClick={handleTransaction}>Send 0.5 TON</button>
          )}
        </div>
      ) : (
        <button onClick={handleWalletAction}>Connect wallet</button>
      )}
    </div>
  );
}

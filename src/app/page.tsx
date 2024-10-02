// Home.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import WebApp from "@twa-dev/sdk";
import { TonConnectUI } from "@tonconnect/ui";
import { UserData, saveOrUpdateUserInFirestore, fetchUserData } from "@/app/components/userService";

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const tonConnectUI = new TonConnectUI({
    manifestUrl: 'https://raw.githubusercontent.com/Rokan87/mitest/refs/heads/main/manifest.json'
  });

  // Manejar la conexión de la billetera
  const handleWalletConnection = useCallback((address: string) => {
    setWalletAddress(address);
    console.log("Conectado a la billetera:", address);
  }, []);

  // Manejar la desconexión de la billetera
  const handleWalletDisconnection = useCallback(() => {
    setWalletAddress(null);
    console.log("Billetera desconectada");
  }, []);

  // Función para abrir la conexión o desconectar la billetera
  const handleWalletAction = async () => {
    if (walletAddress) {
      await tonConnectUI.disconnect();
      handleWalletDisconnection();
    } else {
      const connection = await tonConnectUI.connectWallet();
      handleWalletConnection(connection.account.address);
    }
  };

  useEffect(() => {
    // Verificar si la billetera está conectada
    if (tonConnectUI.account?.address) {
      handleWalletConnection(tonConnectUI.account.address);
    }

    const unsubscribe = tonConnectUI.onStatusChange((wallet) => {
      if (wallet) {
        handleWalletConnection(wallet.address);
      } else {
        handleWalletDisconnection();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [tonConnectUI, handleWalletConnection, handleWalletDisconnection]);

  // Función para generar y compartir el enlace de referido
  const inviteFriends = () => {
    if (userData?.referralCode) {
      const referralLink = `https://t.me/mytestingsambot?start=${userData.referralCode}`;
      const message = `Hey! Te invito a aprender sobre la blockchain y cobrar por aprender: ${referralLink}`;
      window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (WebApp.initDataUnsafe.user) {
          const user = WebApp.initDataUnsafe.user as unknown as UserData;
          const referralCode = "defaultReferralCode";
          setUserData(user);

          await saveOrUpdateUserInFirestore(user, referralCode);
          const userDataFromFirestore = await fetchUserData(user.id);
          setUserData(userDataFromFirestore);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Formatear la dirección de la billetera
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <main>
      {userData ? (
        <div>
          <h1>
            Bienvenido a GeTon, {userData.userName}!
          </h1>
          <p>
            {userData.isPremium
              ? "¡Eres un usuario premium!"
              : "No eres un usuario premium."}
          </p>
          <p>Puntos: {userData.points}</p>
          <p>Usuarios Invitados: {userData.invitedUsersCount}</p>

          {/* Botón para invitar amigos */}
          <button onClick={inviteFriends}>Invitar a amigos</button>

          {/* Mostrar la dirección de la billetera conectada o el botón para conectar */}
          {walletAddress ? (
            <div>
              <p>Dirección de la billetera: {formatAddress(walletAddress)}</p>
              <button onClick={handleWalletAction}>Desconectar Billetera</button>
            </div>
          ) : (
            <button onClick={handleWalletAction}>Conectar Billetera</button>
          )}
        </div>
      ) : (
        <p>Cargando....</p>
      )}
    </main>
  );
}

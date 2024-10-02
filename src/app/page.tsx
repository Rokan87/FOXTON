// Home.tsx
"use client";

import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import { TonConnectUI } from "@tonconnect/ui";
import { UserData, saveOrUpdateUserInFirestore, fetchUserData } from "@/app/components/userService";

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);  // Estado para almacenar la dirección de la billetera conectada

  // Función para generar y compartir el enlace de referido
  const inviteFriends = () => {
    if (userData?.referralCode) {
      const referralLink = `https://t.me/mytestingsambot?start=${userData.referralCode}`;
      const message = `Hey! Te invito a aprender sobre la blockchain y cobrar por aprender: ${referralLink}`;

      window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  // Función para conectarse a la billetera de Telegram
  const connectWallet = async () => {
    try {
      const tonConnectUI = new TonConnectUI({
        manifestUrl: 'https://raw.githubusercontent.com/Rokan87/mitest/refs/heads/main/manifest.json'
      });
      const connection = await tonConnectUI.connectWallet();
      const connectedWalletAddress = connection.account.address;

      // Mostrar la dirección de la billetera conectada
      setWalletAddress(connectedWalletAddress);

      console.log("Conectado a la billetera de Telegram:", connectedWalletAddress);
    } catch (error) {
      console.error("Error al conectar a la billetera:", error);
    }
  };

  // Función para desconectar la billetera
  const disconnectWallet = async () => {
    try {
      const tonConnectUI = new TonConnectUI({
        manifestUrl: 'https://raw.githubusercontent.com/Rokan87/mitest/refs/heads/main/manifest.json'
      });

      await tonConnectUI.disconnect();
      setWalletAddress(null);  // Limpiar el estado de la dirección de la billetera
      console.log("Billetera desconectada.");
    } catch (error) {
      console.error("Error al desconectar la billetera:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (WebApp.initDataUnsafe.user) {
          const user = WebApp.initDataUnsafe.user as unknown as UserData;
          const referralCode = "defaultReferralCode";  // Usa un código de referido predeterminado
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

          <button onClick={inviteFriends}>Invitar a amigos</button>

          {/* Mostrar siempre el botón para conectar la billetera */}
          <button onClick={connectWallet}>
            {walletAddress ? "Conectar otra billetera" : "Conectar Billetera"}
          </button>

          {/* Mostrar la dirección de la billetera conectada, si existe */}
          {walletAddress && (
            <div>
              <p>Dirección de la billetera: {walletAddress}</p>
              <button onClick={disconnectWallet}>Desconectar Billetera</button>
            </div>
          )}
        </div>
      ) : (
        <p>Cargando....</p>
      )}
    </main>
  );
}

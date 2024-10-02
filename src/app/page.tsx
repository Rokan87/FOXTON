// Home.tsx
"use client";

import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import TonWeb from "tonweb";
import TonConnectUI from "@tonconnect/ui";
import { UserData, saveOrUpdateUserInFirestore, fetchUserData } from "@/app/components/userService";

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);

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
      const tonConnectUI = TonConnectUI;
      const connector = new tonConnectUI.TonConnect();
      connector.connect({ jsBridgeKey: 'your-js-bridge-key' });
      console.log("Conectado a la billetera de Telegram");
    } catch (error) {
      console.error("Error al conectar a la billetera:", error);
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
          <button onClick={connectWallet}>Conectar Billetera</button>
        </div>
      ) : (
        <p>Cargando....</p>
      )}
    </main>
  );
}
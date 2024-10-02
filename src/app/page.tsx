// Home.tsx
"use client";

import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import { UserData, saveOrUpdateUserInFirestore, fetchUserData } from "@/app/components/userService";
import Wallet from '@/app/components/Wallet'; // Importa el componente de la billetera

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

          {/* Componente de la billetera */}
          <Wallet /> {/* Añadir el componente Wallet para las funcionalidades de la billetera */}
        </div>
      ) : (
        <p>Cargando....</p>
      )}
    </main>
  );
}

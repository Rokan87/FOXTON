"use client";

import WebApp from "@twa-dev/sdk";
import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCw1tODXPV9ECaPzalvTwHnvi4U9HKnpnc",
  authDomain: "xiton-7871a.firebaseapp.com",
  projectId: "xiton-7871a",
  storageBucket: "xiton-7871a.appspot.com",
  messagingSenderId: "1023682562627",
  appId: "1:1023682562627:web:fa31f6aa123c5ff584e2f6",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Interfaz del userData
interface UserData {
  id: number;
  userName: string;
  isPremium: boolean;
  referralCode: string;
  points: number;
  invitedUsers: string[];
  verifiedWallete: boolean;
  walletAddress: string;
  tasksDone: string[];
}

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);

  // Función para guardar o actualizar el usuario en Firestore
  const saveOrUpdateUserInFirestore = async (user: UserData, referralCode: string) => {
    const userRef = doc(db, "users", user.id.toString());
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      const newUser = {
        userName: user.userName,
        isPremium: user.isPremium || false,
        referralCode: referralCode,
        points: 0,
        invitedUsers: [],
        verifiedWallete: false,
        walletAddress: '',
        tasksDone: []
      };

      await setDoc(userRef, newUser);
      console.log("Nuevo usuario guardado en Firestore:", newUser);
    } else {
      console.log("El usuario ya existe en Firestore.");
    }
  };

  // Función para generar y compartir el enlace de referido
  const inviteFriends = async () => {
    if (userData?.referralCode) {
      const referralLink = `https://t.me/mytestingsambot?start=${userData.referralCode}`;
      const message = `Hey! Te invito a aprender sobre la blockchain y cobrar por aprender: ${referralLink}`;

      // Abrir el enlace para compartir en Telegram
      window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  useEffect(() => {
    const fetchUserData = async (userId: number) => {
      const userRef = doc(db, "users", userId.toString());
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      }
    };

    const fetchData = async () => {
      try {
        if (WebApp.initDataUnsafe.user) {
          const user = WebApp.initDataUnsafe.user as unknown as UserData;
          const referralCode = "defaultReferralCode";  // Usa un código de referido predeterminado
          setUserData(user);

          await saveOrUpdateUserInFirestore(user, referralCode);
          await fetchUserData(user.id);
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

          {/* Botón para invitar a amigos */}
          <button onClick={inviteFriends}>Invitar a amigos</button>
        </div>
      ) : (
        <p>Cargando....</p>
      )}
    </main>
  );
}

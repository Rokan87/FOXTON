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
  const [referralCount, setReferralCount] = useState<number>(0);

  // Función para guardar o actualizar el usuario en Firestore
  const saveOrUpdateUserInFirestore = async (user: UserData, referralCode: string) => {
    const userRef = doc(db, "users", user.id.toString());
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Crear un nuevo registro de usuario en Firestore con la estructura proporcionada
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

  useEffect(() => {
    const fetchUserData = async (userId: number) => {
      const userRef = doc(db, "users", userId.toString());
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userDataFromDB = userDoc.data() as UserData;
        setUserData(userDataFromDB);

        // Calcular el número de referidos (usuarios invitados)
        const numReferrals = userDataFromDB.invitedUsers ? userDataFromDB.invitedUsers.length : 0;
        setReferralCount(numReferrals);
      }
    };

    const fetchData = async () => {
      try {
        if (WebApp.initDataUnsafe.user) {
          const user = WebApp.initDataUnsafe.user as unknown as UserData;
          const referralCode = "defaultReferralCode";  // Usa un código de referido predeterminado
          setUserData(user);

          // Guardar o actualizar los datos del usuario en Firestore
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
          <p>Referidos: {referralCount}</p> {/* Mostrar número de referidos */}
        </div>
      ) : (
        <p>Cargando....</p>
      )}
    </main>
  );
}

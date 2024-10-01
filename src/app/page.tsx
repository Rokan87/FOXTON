"use client";

import WebApp from "@twa-dev/sdk";
import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid"; // Para generar el código de referido único

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
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  count?: number;
  verified?: boolean;
  friends?: string[];
  referralCode?: string;
  points?: number; // Añadir puntos
  referrals?: number; // Añadir referidos
}

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);

  // Función para guardar el usuario en Firestore
  const saveUserToFirestore = async (user: UserData) => {
    const userRef = doc(db, "users", user.id.toString());
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      let referralCode;

      // Generar un código de referencia único
      do {
        referralCode = uuidv4().slice(0, 8);
        const existingDoc = await getDoc(doc(db, "users", referralCode));
        if (!existingDoc.exists()) break; // Si no existe, salimos del bucle
      } while (true);

      // Crear los datos adicionales
      const userDataToSave = {
        ...user,
        count: 0, // Inicialmente el conteo de referidos es 0
        verified: false, // No verificado al principio
        friends: [], // Lista vacía de amigos
        referralCode, // Código de referido único
        points: 0, // Inicialmente los puntos son 0
        referrals: 0, // Inicialmente los referidos son 0
      };

      // Guardar en Firestore
      await setDoc(userRef, userDataToSave);
      console.log("Usuario guardado en Firestore:", userDataToSave);

      // Verificar si el usuario se registró mediante un enlace de referido
      const urlParams = new URLSearchParams(window.location.search);
      const referrerCode = urlParams.get('start');
      if (referrerCode) {
        const referrerQuery = doc(db, "users", referrerCode);
        const referrerDoc = await getDoc(referrerQuery);
        if (referrerDoc.exists()) {
          const referrerData = referrerDoc.data() as UserData;
          await updateDoc(referrerQuery, {
            friends: arrayUnion(user.username || ""),
            points: increment(100),
            referrals: increment(1)
          });
          await updateDoc(userRef, {
            points: increment(100)
          });
          console.log("Datos del referente actualizados:", referrerData);
        }
      }
    } else {
      console.log("El usuario ya existe en Firestore");
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
          const user = WebApp.initDataUnsafe.user as UserData;
          setUserData(user);

          // Esperar a que se guarde el usuario antes de obtener sus datos
          await saveUserToFirestore(user);
          await fetchUserData(user.id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const copyReferralLink = async () => {
    if (userData?.referralCode) {
      const userRef = doc(db, "users", userData.id.toString());
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const user = userDoc.data() as UserData;
        const appUrl = window.location.origin; // URL de la aplicación
        const referralLink = `${appUrl}?start=${user.referralCode}`;
        await navigator.clipboard.writeText(referralLink);
        alert("¡Enlace de referido copiado al portapapeles!");
      }
    }
  };

  return (
    <main>
      {userData ? (
        <div>
          <h1>
            Welcome to GeTon
            <p>the place where you learn to earn</p>
            {userData.first_name}!
          </h1>
          <p>
            {userData.is_premium
              ? "You're a premium user!"
              : "You're not a premium user."}
          </p>
          <p>Puntos: {userData.points}</p>
          <p>Referidos: {userData.referrals}</p>
          <button onClick={copyReferralLink}>Copiar enlace de referido</button>
        </div>
      ) : (
        <p>Cargando...</p>
      )}
    </main>
  );
}

"use client";

import WebApp from "@twa-dev/sdk";
import { useEffect, useState } from "react";

interface userData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string; // Añadimos el campo para la URL de la foto
}

export default function Home() {
  const [userData, setUserData] = useState<userData | null>(null);

  useEffect(() => {
    if (WebApp.initDataUnsafe.user) {
      console.log("User data:", WebApp.initDataUnsafe.user); // Log para verificar los datos del usuario
      setUserData(WebApp.initDataUnsafe.user as userData);
    }
  }, []);

  return (
    <main>
      {userData ? (
        <div>
          <h1>Welcome, {userData.first_name}!</h1>
          {userData.photo_url ? (
            <img
              src={userData.photo_url}
              alt={`${userData.first_name}'s profile`}
              style={{ width: "150px", height: "150px", borderRadius: "50%" }} // Estilo para mostrar la imagen circular
              onError={() => console.error("Error loading image at", userData.photo_url)} // Log para errores de carga de imagen
            />
          ) : (
            <p>No profile picture available.</p>
          )}
          <p>
            {userData.is_premium
              ? "You're a premium user!"
              : "You're not a premium user."}
          </p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </main>
  );
}

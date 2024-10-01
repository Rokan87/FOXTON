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
}

export default function Home() {
  const [userData, setUserData] = useState<userData | null>(null);  

  useEffect(() => {
    if (WebApp.initDataUnsafe.user) {
      setUserData(WebApp.initDataUnsafe.user as userData);
    }
  } , []);
  return (
    <main>
      {userData ? (
        <div>
          <h1>Welcome, {userData.first_name}!</h1>
          <p>
            {userData.is_premium ? "You're a premium user!" : "You're not a premium user."}
          </p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </main>
  );
}
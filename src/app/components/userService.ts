// userService.ts
import { db } from '@/app/firebaseConfig';
import { doc, getDoc, setDoc } from "firebase/firestore";

// Interfaz del userData
export interface UserData {
  id: number;
  userName: string;
  isPremium: boolean;
  referralCode: string;
  points: number;
  invitedUsers: string[];
  invitedUsersCount: number;
  verifiedWallete: boolean;
  walletAddress: string;
  tasksDone: string[];
}

// Función para guardar o actualizar el usuario en Firestore
export const saveOrUpdateUserInFirestore = async (user: UserData, referralCode: string) => {
  const userRef = doc(db, "users", user.id.toString());
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    const newUser = {
      userName: user.userName,
      isPremium: user.isPremium || false,
      referralCode: referralCode,
      points: 0,
      invitedUsers: [],
      invitedUsersCount: 0,
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

// Función para obtener datos del usuario
export const fetchUserData = async (userId: number) => {
  const userRef = doc(db, "users", userId.toString());
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    return userDoc.data() as UserData;
  }
  return null;
};

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
//import { auth, db } from "./firebase-init";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { toast } from "sonner";

const firebaseConfig = {
  apiKey: "AIzaSyClUa9uO02-Q4ST4qYOTHzgmRlwZy4wHgg",
  authDomain: "library-management-syste-4a288.firebaseapp.com",
  projectId: "library-management-syste-4a288",
  storageBucket: "library-management-syste-4a288.firebasestorage.app",
  messagingSenderId: "678717826842",
  appId: "1:678717826842:web:4a486a2d8fbb65a3d56ea3",
  measurementId: "G-X6GH42W922"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);


export const googleLogin = async () => {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user exists in Firestore
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // If new user, add to Firestore
      await setDoc(docRef, {
        email: user.email,
        uid: user.uid,
        createdAt: new Date(),
      });
      toast.success("Account created via Google!");
    } else {
      toast.success("Welcome back!");
    }

    // Optional: redirect user to dashboard/home
    console.log("Google login successful:", user);
  } catch (error: any) {
    console.error("Google login failed:", error);
    if (error.code === "auth/popup-closed-by-user") {
      toast.error("Login cancelled");
    } else {
      toast.error("Google login failed. Try again later.");
    }
  }
};

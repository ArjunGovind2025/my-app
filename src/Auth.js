// Auth.js
import { auth, provider, signInWithPopup } from './firebaseConfig';

export const handleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("User signed in: ", user);
  } catch (error) {
    console.error("Error signing in: ", error);
  }
};

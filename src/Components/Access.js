import { db } from '../firebaseConfig'; 
import { doc, getDoc } from 'firebase/firestore';

export const checkApiCallCount = async (userId) => {
    try {
      const userDocRef = doc(db, 'userData', userId);
      const userDoc = await getDoc(userDocRef);
  
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.apiCallCount >= 10;
      } else {
        console.error("User document does not exist");
        return false;
      }
    } catch (error) {
      console.error("Error checking API call count: ", error);
      return false;
    }
};

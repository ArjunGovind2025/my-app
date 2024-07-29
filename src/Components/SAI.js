import { db } from '../firebaseConfig'; 
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export const updateSAI = async (userId, SAI) => {
    try {
        const userDocRef = doc(db, 'userData', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Check if the SAI field exists and update it
            if ('SAI' in userData) {
                // SAI field exists, update it
                await updateDoc(userDocRef, { SAI });
            } else {
                // SAI field does not exist, add it
                await setDoc(userDocRef, { SAI }, { merge: true });
            }

            console.log('SAI field updated successfully.');
        } else {
            console.error("User document does not exist");
        }
    } catch (error) {
        console.error("Error updating SAI field: ", error);
    }
};


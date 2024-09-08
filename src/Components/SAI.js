import { db } from '../firebaseConfig'; 
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export const updateSAI = async (userId, SAI) => {
    try {
        const userDocRef = doc(db, 'userData', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            
            
            if ('SAI' in userData) {
                await updateDoc(userDocRef, { SAI });
            } else {   
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


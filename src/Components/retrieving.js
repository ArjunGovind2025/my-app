import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export const retrieveCurrentStep = async (user) => {
    try {
        const userDocRef = doc(db, 'userData', user.uid); // Replace 'user.uid' with your user identifier logic if different
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            console.log('User data retrieved:', userData); // Log the entire user data

            if (userData.currentStep !== undefined) {
                console.log('Current step retrieved:', userData.currentStep);
                return userData.currentStep;
            } else {
                console.log('currentStep field does not exist.');
                return null; // Return null if the field does not exist
            }
        } else {
            console.log('No such document!');
            return null; // Return null if the document does not exist
        }
    } catch (error) {
        console.error('Error retrieving currentStep:', error);
        return null; // Return null if an error occurs
    }
};

export default retrieveCurrentStep;

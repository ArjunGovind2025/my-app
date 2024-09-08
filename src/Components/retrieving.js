import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export const retrieveCurrentStep = async (user) => {
    try {
        const userDocRef = doc(db, 'userData', user.uid); 
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            console.log('User data retrieved:', userData);

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

export const fetchUserAccessLevel = async (uid) => {
    try {
      const userDocRef = doc(db, 'userData', uid);
      const userDocSnap = await getDoc(userDocRef);
  
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const access = userData.access || 'Free';
        return access;
      } else {
        console.error('No such document!');
        return 'Free'; // Default to 'Free' if no document exists
      }
    } catch (error) {
      console.error('Error fetching user access level:', error);
      return 'Free'; // Default to 'Free' in case of an error
    }
  };

export default retrieveCurrentStep;

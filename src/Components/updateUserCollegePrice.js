import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const updateUserCollegePrice = async (userId, ipedsId, name, myPrice) => {
  try {
    if (!userId || !ipedsId) {
      console.error('Invalid userId or ipedsId:', { userId, ipedsId });
      return;
    }

    // Format myPrice as a currency string
    console.log(myPrice);
    const formattedMyPrice = `$${myPrice.toLocaleString()}`;

    console.log(`Updating user college price for userId: ${userId}, ipedsId: ${ipedsId}, name: ${name}, myPrice: ${formattedMyPrice}`);
    
    const userDocRef = doc(db, 'userData', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log(`Existing user data: ${JSON.stringify(userData, null, 2)}`);
      
      const existingCollegeData = userData.myColleges && userData.myColleges[ipedsId] ? userData.myColleges[ipedsId] : {};
      console.log(`Existing college data for IPEDS ID ${ipedsId}: ${JSON.stringify(existingCollegeData, null, 2)}`);
      
      const updatedMyColleges = {
        ...userData.myColleges,
        [ipedsId]: {
          ...existingCollegeData,
          myPrice: formattedMyPrice
        }
      };
      console.log(`Updated myColleges data: ${JSON.stringify(updatedMyColleges, null, 2)}`);
      
      await updateDoc(userDocRef, { myColleges: updatedMyColleges });
      console.log(`Updated user document for college: ${name}, IPEDS ID: ${ipedsId}, myPrice: ${formattedMyPrice}`);
    } else {
      console.log(`User document for user ID ${userId} does not exist.`);
    }
  } catch (error) {
    console.error('Error updating user document:', error);
  }
};

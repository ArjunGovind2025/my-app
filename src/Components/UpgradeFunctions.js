import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig'; // Ensure this path is correct

// Define the unlockSchool function
export const unlockSchool = async (ipedsId, setVisibleSchools) => {
  if (!auth.currentUser) {
    console.log("unlockSchool: No authenticated user found");
    return;
  }

  try {
    console.log("unlockSchool: Attempting to unlock school with IPEDS ID:", ipedsId);
    const userDocRef = doc(db, 'userData', auth.currentUser.uid);
    const userData = (await getDoc(userDocRef)).data();
    console.log("unlockSchool: User data fetched from Firestore:", userData);

    // Add the unlocked school to Firestore visibleColleges array
    await updateDoc(userDocRef, {
      visibleColleges: [...(userData.visibleColleges || []), ipedsId], // Add the school to visibleColleges in Firestore
    });
    console.log("unlockSchool: Successfully updated Firestore with the unlocked school");

    // Update local state to reflect the unlocked school
    setVisibleSchools((prevVisibleSchools) => {
      const updatedVisibleSchools = [...prevVisibleSchools, ipedsId];
      console.log("unlockSchool: Updated visibleSchools in state:", updatedVisibleSchools);
      return updatedVisibleSchools;
    });

  } catch (error) {
    console.error("unlockSchool: Error unlocking school:", error);
  }
};

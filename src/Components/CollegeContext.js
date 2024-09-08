import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth, provider, signInWithPopup,signOut} from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { updateCollegePricesWithNeedAid } from './updating'; 

// Create Context
const CombinedContext = createContext();

export const useCombined = () => useContext(CombinedContext);

export const CombinedProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [myColleges, setMyColleges] = useState({});
  const [userDoc, setUserDoc] = useState({});


  useEffect(() => {
    onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        console.log('User signed in:', currentUser.uid);
        const userDocRef = doc(db, 'userData', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserDoc(userDocSnap.data());
          setMyColleges(userDocSnap.data().myColleges || {});
        }
      } else {
        console.log('No user signed in.');
      }
    });
  }, []);

  const fetchUserDoc = async (currentUser) => {
    if (currentUser) {
      const userDocRef = doc(db, 'userData', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setUserDoc(userData);
        setMyColleges(userData.myColleges || {});
      }
    }
  };

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUser(user);
      console.log("User signed in: ", user);
    } catch (error) {
      console.error("Error signing in: ", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // sign out the user from Firebase Auth
      setUser(null); // Clear the user state
      setMyColleges({}); // Clear the user's colleges
      setUserDoc({}); // Clear the user document
      console.log("User signed out.");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const addCollegeToUser = async (college) => {
    if (!user) {
      console.log('User is not signed in.');
      return;
    }
  
    try {
      const userDocRef = doc(db, 'userData', user.uid);
      const userDocSnap = await getDoc(userDocRef);

  
      const collegeData = {
        "Name": college.Name,
        "IPEDS ID": college['IPEDS ID'],
        "Total price for in-state students 2022-23": college['Total price for in-state students 2022-23'],
        "Total price for out-of-state students 2022-23": college['Total price for out-of-state students 2022-23'],
        "myPrice": college['Total price for out-of-state students 2022-23'],
        "myPrice_need": college['Total price for out-of-state students 2022-23'],
        "Avg % of Need met for Freshman": college['Avg % of Need met for Freshman'],
        "Avg merit award for Freshman w/out need": college['Avg merit award for Freshman w/out need'],
        "State Abbr": college['State Abbr'],
        "Merit Aid Cutoff Score": college['Merit Aid Cutoff Score'],

      };

    
      if (!userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const accessLevel = userData.access || 'Free';
        // User document does n't exist, create a new one
      
        
        const maxVisible = accessLevel === 'Free' ? 5 : accessLevel === 'Standard' ? 15 : 30;
        const newVisibleColleges = [collegeData['IPEDS ID']]; // Initialize with the first college
      
        await setDoc(userDocRef, {
          myColleges: {
            [collegeData['IPEDS ID']]: collegeData
          },
          visibleColleges: newVisibleColleges,
          access: "Free" 
        });
      
        setMyColleges({
          [collegeData['IPEDS ID']]: collegeData
        });
      
        console.log('College added to new user document:', collegeData.Name);
        return; 
      }
      
      const userData = userDocSnap.data();
      const currentVisibleColleges = userData.visibleColleges || [];
      const currentMyColleges = userData.myColleges || {};
      const accessLevel = userData.access || 'Free';
      console.log('accessLevel:', accessLevel)

      const maxVisible = accessLevel === 'Free' ? 5 : accessLevel === 'Standard' ? 15 : 30;
      console.log('maxVisible:', maxVisible)

      let newVisibleColleges = [...currentVisibleColleges];
      console.log('newVisibleColleges:', newVisibleColleges)
      
      // Check if we can add the new college to visibleColleges
      if (newVisibleColleges.length < maxVisible) {
        newVisibleColleges.push(collegeData['IPEDS ID']);
      }
      
      await updateDoc(userDocRef, {
        [`myColleges.${collegeData['IPEDS ID']}`]: collegeData,
        visibleColleges: newVisibleColleges
      });
      
      setMyColleges(prev => ({
        ...prev,
        [collegeData['IPEDS ID']]: collegeData
      }));
      console.log('College added to existing user document:', college.Name);

      


      const updatedUserDocSnap = await getDoc(userDocRef);
          if (updatedUserDocSnap.exists()) {
            if (userData.stateAbbr && userData.stateAbbr === collegeData['State Abbr']) {
              collegeData['myPrice'] = collegeData['Total price for in-state students 2022-23'];
              collegeData.myPrice_need = collegeData['Total price for in-state students 2022-23'];
            }
      }
            

 


      // Apply need-based aid if applicable
     
      if (userData && typeof userData.SAI === 'number') {
        const myPrice = parseFloat(collegeData['myPrice'].replace(/[^0-9.]/g, ''));
        if (!isNaN(myPrice) && userData.SAI < myPrice) {
          await updateCollegePricesWithNeedAid(userData.SAI, user);
  
          // Refresh the user document after updating prices with need aid
          const updatedUserDocSnap = await getDoc(userDocRef);
          if (updatedUserDocSnap.exists()) {
            // Apply in-state tuition if applicable
            console.log('USERSTATE: ', userData.stateAbbr)
            console.log('SCHOOLSTATE: ', collegeData['State Abbr'])

            

            const updatedUserData = updatedUserDocSnap.data();
            const updatedCollegeData = updatedUserData.myColleges[college['IPEDS ID']];
            collegeData['myPrice'] = updatedCollegeData['myPrice']; // Use the updated myPrice
            collegeData['myPrice_need'] = updatedCollegeData['myPrice_need'];
            console.log(`Updated myPrice after need aid: ${collegeData['myPrice']}`);
          }
        }
      }
  
      // Apply merit-based aid if applicable
      if (userData.meritScore && collegeData['Merit Aid Cutoff Score']) {
        const meritScore = userData.meritScore;
        const meritCutoffScore = parseFloat(collegeData['Merit Aid Cutoff Score']);
  
        console.log("YOU ARE HERE 3");
        console.log(meritScore);
        console.log(meritCutoffScore);
  
        if (meritScore >= meritCutoffScore) {
          console.log("YOU ARE HERE 4");
          const avgMeritAidAward = parseFloat(collegeData['Avg merit award for Freshman w/out need'].replace(/[^0-9.]/g, ''));
          const myPrice = parseFloat(collegeData['myPrice'].replace(/[^0-9.]/g, ''));
  
          console.log(`Average Merit Aid Award: ${avgMeritAidAward}`);
          console.log(`My Price before Merit Aid: ${myPrice}`);
  
          collegeData['myPrice'] = `$${(myPrice - avgMeritAidAward).toLocaleString()}`;
          collegeData['meritQualified'] = true;
  
          console.log(`My Price after Merit Aid: ${collegeData['myPrice']}`);
        } else {
          collegeData['meritQualified'] = false; // Ensure the field exists
        }
  
        // Update the document with merit aid changes
        await updateDoc(userDocRef, {
          [`myColleges.${college['IPEDS ID']}`]: collegeData
        });
        setMyColleges(prev => ({
          ...prev,
          [college['IPEDS ID']]: collegeData
        }));
        console.log('College updated with merit aid:', college.Name);
      }
    } catch (error) {
      console.error('Error adding college to user document:', error);
    }
  };
  

  const addCollegeByIpedsId = async (ipedsId) => {
    if (!user) {
      console.log('User is not signed in.');
      return;
    }

    try {
      console.log('Fetching college data for IPEDS ID:', ipedsId);
      const docRef = doc(db, 'searchData2', 'allData');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const allData = docSnap.data();
        const collegeData = allData[ipedsId]; 
        

        console.log('College data retrieved:', collegeData);

        if (collegeData) {
          const userDocRef = doc(db, 'userData', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          const collegeToAdd = {
            "Name": collegeData.Name,
            "IPEDS ID": collegeData['IPEDS ID'],
            "Total price for in-state students 2022-23": collegeData['Total price for in-state students 2022-23'],
            "Total price for out-of-state students 2022-23": collegeData['Total price for out-of-state students 2022-23'],
            "myPrice": collegeData['Total price for out-of-state students 2022-23'],
            "myPrice_need": collegeData['Total price for out-of-state students 2022-23'],
            "Avg % of Need met for Freshman": collegeData['Avg % of Need met for Freshman'],
            "Avg merit award for Freshman w/out need": collegeData['Avg merit award for Freshman w/out need'],
            "State Abbr": collegeData['State Abbr'],
            "Merit Aid Cutoff Score": collegeData['Merit Aid Cutoff Score'],
         
          };

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const currentVisibleColleges = userData.visibleColleges || [];
            const accessLevel = userData.access

            let newVisibleColleges = currentVisibleColleges;
            if (currentVisibleColleges.length < (accessLevel === 'Free' ? 5 : accessLevel === 'Standard' ? 15 : Infinity)) {
              newVisibleColleges = [...currentVisibleColleges, collegeData['IPEDS ID']];
            }

            // Check if meritScore exists and compare it to the Merit Aid Cutoff Score
            if (userData.meritScore && collegeToAdd['Merit Aid Cutoff Score']) {
              const meritScore = userData.meritScore;
              const meritCutoffScore = parseFloat(collegeToAdd['Merit Aid Cutoff Score']);

              if (meritScore >= meritCutoffScore) {
                const avgMeritAidAward = parseFloat(collegeToAdd['Avg merit award for Freshman w/out need'].replace(/[^0-9.]/g, ''));
                const myPrice = parseFloat(collegeToAdd['myPrice'].replace(/[^0-9.]/g, ''));
                collegeToAdd['myPrice'] = `$${(myPrice - avgMeritAidAward).toLocaleString()}`;
              }
            }

            await updateDoc(userDocRef, {
              [`myColleges.${collegeData['IPEDS ID']}`]: collegeToAdd,
              visibleColleges: newVisibleColleges,
              access: "Free"
            });
          
            // Update the local state with the new college
            setMyColleges(prev => ({
              ...prev,
              [collegeData['IPEDS ID']]: collegeToAdd
            }));
          
            console.log('College added to existing user document:', collegeData.Name);
          } else {
            const newVisibleColleges = [collegeData['IPEDS ID']];
          
            await setDoc(userDocRef, {
              myColleges: {
                [collegeData['IPEDS ID']]: collegeToAdd
              },
              visibleColleges: newVisibleColleges,
              access: "Free" 
            });
          
         
            setMyColleges({
              [collegeData['IPEDS ID']]: collegeToAdd
            });
          
            console.log('College added to new user document:', collegeData.Name);
          }

          // Check if SAI field is present and is a number less than myPrice
          const userData = userDocSnap.data();
          if (userData && typeof userData.SAI === 'number') {
            const myPrice = parseFloat(collegeData['myPrice'].replace(/[^0-9.]/g, ''));
            if (!isNaN(myPrice) && userData.SAI < myPrice) {
              await updateCollegePricesWithNeedAid(userData.SAI, user);
            }
          }

        } else {
          console.log('No college found with IPEDS ID:', ipedsId);
        }
      } else {
        console.log('No document found for allData');
      }
    } catch (error) {
      console.error('Error adding college by IPEDS ID:', error);
    }
  };

  return (
    <CombinedContext.Provider value={{ user, userDoc, myColleges, fetchUserDoc, addCollegeToUser, handleLogin, addCollegeByIpedsId, handleLogout }}>
      {children}
    </CombinedContext.Provider>
  );
};

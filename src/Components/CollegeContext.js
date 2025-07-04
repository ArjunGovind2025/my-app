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
  const [uid, setUID] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myColleges, setMyColleges] = useState({});
  const [visibleColleges, setVisibleColleges] = useState({});
  const [userDoc, setUserDoc] = useState({});


  useEffect(() => {
    onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed:', currentUser ? `User signed in: ${currentUser.uid}` : 'No user signed in.');
  
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, 'userData', currentUser.uid);
        console.log('Fetching user document:', userDocRef.path);
  
        let userDocSnap = await getDoc(userDocRef);
        console.log('Initial userDocSnap exists:', userDocSnap.exists());
  
        if (!userDocSnap.exists()) {
          console.log('User document does not exist, creating with default fields...');
          try {
            await setDoc(userDocRef, {
              myColleges: {},
              visibleColleges: [],
              access: "Free", // Set the default access level
            });
            console.log('User document successfully created with access: Free');
  
            // Re-fetch the document after creation
            userDocSnap = await getDoc(userDocRef);
            console.log('Re-fetched userDocSnap exists:', userDocSnap.exists());
          } catch (error) {
            console.error('Error creating user document:', error);
          }
        }
  
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          console.log('Fetched user data:', userData);
  
          setUserDoc(userData);
          setMyColleges(userData.myColleges || {});
          setVisibleColleges(userData.visibleColleges || {});
          setUID(currentUser.uid);
          console.log('State updated with user data.');
        } else {
          console.warn('User document still does not exist after creation attempt.');
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
        setVisibleColleges(userData.visibleColleges || {});
      }
      setLoading(false); 
    }
  };

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      // Set user state
      setUser(user);
      console.log("User signed in: ", user);
  
      // Reference to the user document in Firestore
      const userDocRef = doc(db, "userData", user.uid);
  
      // Check if the user document exists
      const userDocSnap = await getDoc(userDocRef);
  
      if (!userDocSnap.exists()) {
        // Create the user document with `access = "Free"`
        await setDoc(userDocRef, { access: "Free" });
        console.log("User document created with access: Free");
      } else {
        console.log("User already exists, no changes made.");
      }
    } catch (error) {
      console.error("Error signing in: ", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // sign out the user from Firebase Auth
      setUser(null); // Clear the user state
      setMyColleges({}); // Clear the user's colleges
      setVisibleColleges({})
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
          //access: "Free" 
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
        if (!newVisibleColleges.includes(collegeData['IPEDS ID'])) {
          newVisibleColleges.push(collegeData['IPEDS ID']);
        } else {
          console.log('College already visible, skipping:', collegeData['IPEDS ID']);
        }
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
          const avgMeritAidAward = collegeData['Avg merit award for Freshman w/out need']
          ? parseFloat(collegeData['Avg merit award for Freshman w/out need'].toString().replace(/[^0-9.]/g, ''))
          : 0; // Default to 0 if the value is null or undefined
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
  

  const addCollegeByIpedsId = async (ipedsId, isRecommended = false) => {
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
            "recommended": isRecommended, // Mark as recommended
          };

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const currentVisibleColleges = userData.visibleColleges || [];
            const accessLevel = userData.access

            let newVisibleColleges = [...currentVisibleColleges];
            if (newVisibleColleges.length < (accessLevel === 'Free' ? 5 : accessLevel === 'Standard' ? 15 : Infinity)) {
              if (!newVisibleColleges.includes(collegeData['IPEDS ID'])) {
                newVisibleColleges.push(collegeData['IPEDS ID']);
              } else {
                console.log('College already visible, skipping:', collegeData['IPEDS ID']);
              }
            }

            // Check if meritScore exists and compare it to the Merit Aid Cutoff Score
            if (userData.meritScore && collegeToAdd['Merit Aid Cutoff Score']) {
              const meritScore = userData.meritScore;
              const meritCutoffScore = parseFloat(collegeToAdd['Merit Aid Cutoff Score']);

              if (meritScore >= meritCutoffScore) {


                const avgMeritAidAward = parseFloat(
                  (collegeData['Avg merit award for Freshman w/out need'] || '0').replace(/[^0-9.]/g, '')
                ) || 7500; //DEFAULT MERIT AID AMOUNT
                
                const myPrice = parseFloat(
                  (collegeToAdd['myPrice'] || '0').replace(/[^0-9.]/g, '')
                ) || 0;
                
                collegeToAdd['myPrice'] = `$${(myPrice - avgMeritAidAward).toLocaleString()}`;
                
              }
            }

            await updateDoc(userDocRef, {
              [`myColleges.${collegeData['IPEDS ID']}`]: collegeToAdd,
              visibleColleges: newVisibleColleges,
              //access: "Free"
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
              //access: "Free" 
            });
          
         
            setMyColleges({
              [collegeData['IPEDS ID']]: collegeToAdd
            });
          
            console.log('College added to new user document:', collegeData.Name);
          }

          // Check if SAI field is present and is a number less than myPrice
          const userData = userDocSnap.data();
          if (userData && typeof userData.SAI === 'number') {
            const myPrice = parseFloat(
              ((collegeData['myPrice'] || '0').toString()).replace(/[^0-9.]/g, '')
            );
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
    <CombinedContext.Provider value={{ user, uid, userDoc, myColleges, fetchUserDoc, addCollegeToUser, handleLogin, addCollegeByIpedsId, handleLogout, visibleColleges }}>
      {children}
    </CombinedContext.Provider>
  );
};

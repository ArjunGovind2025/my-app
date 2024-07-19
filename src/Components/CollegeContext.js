import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth, provider, signInWithPopup } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

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
          setUserDoc(userDocSnap.data())
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
        "Avg % of Need met for Freshman" : college['Avg % of Need met for Freshman'],
        "Avg merit award for Freshman w/out need" : college['Avg merit award for Freshman w/out need'],
        "State Abbr" : college['State Abbr'],
        "Merit Aid Cutoff Score" : college['Merit Aid Cutoff Score'],
        // Add other relevant data here
      };
  
      if (userDocSnap.exists()) {

        await updateDoc(userDocRef, {
          [`myColleges.${college['IPEDS ID']}`]: collegeData
        });
        setMyColleges(prev => ({
          ...prev,
          [college['IPEDS ID']]: collegeData
        }));
        console.log('College added to existing user document:', college.Name);
      } else {
        await setDoc(userDocRef, {
          myColleges: {
            [college['IPEDS ID']]: collegeData
          }
        });
        setMyColleges({
          [college['IPEDS ID']]: collegeData
        });
        console.log('College added to new user document:', college.Name);
      }
    } catch (error) {
      console.error('Error adding college to user document:', error);
    }
  };

  const addCollegeByIpedsId = async (ipedsId) => {
    console.log('Made it here 1');
    if (!user) {
      console.log('User is not signed in.');
      return;
    }
    console.log('Made it here 2');
  
    try {
      console.log('Fetching college data for IPEDS ID:', ipedsId);
      const docRef = doc(db, 'searchData2', 'allData');
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const allData = docSnap.data();
        const collegeData = allData[ipedsId]; // Assuming IPEDS ID is the key
  
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
            "Avg % of Need met for Freshman" : collegeData['Avg % of Need met for Freshman'],
            "Avg merit award for Freshman w/out need" : collegeData['Avg merit award for Freshman w/out need'],
            "State Abbr" : collegeData['State Abbr'],
            "Merit Aid Cutoff Score" : collegeData['Merit Aid Cutoff Score'],
            
            // Add other relevant data here
          };
  
          if (userDocSnap.exists()) {
            await updateDoc(userDocRef, {
              [`myColleges.${collegeData['IPEDS ID']}`]: collegeToAdd
            });
            setMyColleges(prev => ({
              ...prev,
              [collegeData['IPEDS ID']]: collegeToAdd
            }));
            console.log('College added to existing user document:', collegeData.Name);
          } else {
            await setDoc(userDocRef, {
              myColleges: {
                [collegeData['IPEDS ID']]: collegeToAdd
              }
            });
            setMyColleges({
              [collegeData['IPEDS ID']]: collegeToAdd
            });
            console.log('College added to new user document:', collegeData.Name);
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
    <CombinedContext.Provider value={{ user, userDoc, myColleges, fetchUserDoc, addCollegeToUser, handleLogin, addCollegeByIpedsId, addCollegeToUser}}>
      {children}
    </CombinedContext.Provider>
  );
};

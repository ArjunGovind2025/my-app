import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, deleteField } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import './MySchools.css';
import ThreeDotsMenu from './ThreeDotsMenu';
import { FaLock } from 'react-icons/fa'; 
import { UpgradeTooltipNoBlur } from './UpgradeTooltip';
import { Badge } from "./ui/badge"; // Adjust the path based on your project setup



const MySchools = () => {
  const [mySchools, setMySchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleSchools, setVisibleSchools] = useState([]); // Track visible schools

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        subscribeToMySchools(currentUser.uid);
      } else {
        setMySchools([]);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const subscribeToMySchools = (uid) => {
    const userDocRef = doc(db, 'userData', uid);
    const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        const collegesObject = userData.myColleges || {};
        const collegesArray = Object.values(collegesObject).map(college => {
          const priceChanged = college.myPrice !== college['Total price for out-of-state students 2022-23'];
          return { ...college, priceChanged };
        });

        const visibleCollegesFromDoc = userData.visibleColleges || [];
        setVisibleSchools(visibleCollegesFromDoc);

        setMySchools(collegesArray);
        setLoading(false);
      } else {
        setDoc(userDocRef, { myColleges: {}, visibleColleges: [] });
        setMySchools([]);
        setLoading(false);
      }
    }, (error) => {
      setLoading(false);
      console.error("Error fetching user document:", error);
    });

    return unsubscribeSnapshot;
  };

  const unlockSchool = async (ipedsId) => {
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
      setVisibleSchools(prevVisibleSchools => {
        const updatedVisibleSchools = [...prevVisibleSchools, ipedsId];
        console.log("unlockSchool: Updated visibleSchools in state:", updatedVisibleSchools);
        return updatedVisibleSchools;
      });
  
    } catch (error) {
      console.error("unlockSchool: Error unlocking school:", error);
    }
  };

  const resetMyPrice = async (ipedsId, outOfStatePrice) => {
    if (!auth.currentUser) return;

    try {
      const userDocRef = doc(db, 'userData', auth.currentUser.uid);
      await updateDoc(userDocRef, {
        [`myColleges.${ipedsId}.myPrice`]: outOfStatePrice,
        [`myColleges.${ipedsId}.myPrice_need`]: outOfStatePrice,
        [`myColleges.${ipedsId}.meritQualified`]: false,
      });

      setMySchools(prevSchools =>
        prevSchools.map(school =>
          school['IPEDS ID'] === ipedsId
            ? { ...school, myPrice: outOfStatePrice, myPrice_need: outOfStatePrice, priceChanged: false }
            : school
        )
      );
    } catch (error) {
      console.error("Error resetting myPrice and myPrice_need:", error);
    }
  };

  const removeSchool = async (ipedsId) => {
    if (!auth.currentUser) return;

    try {
      const userDocRef = doc(db, 'userData', auth.currentUser.uid);
      await updateDoc(userDocRef, {
        [`myColleges.${ipedsId}`]: deleteField()
      });

      setMySchools(prevSchools => prevSchools.filter(school => school['IPEDS ID'] !== ipedsId));
      setVisibleSchools(prevVisible => prevVisible.filter(id => id !== ipedsId));
    } catch (error) {
      console.error("Error removing school:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ul className="schools-list">
      {mySchools.length > 0 ? (
        mySchools
          .sort((b, a) => visibleSchools.indexOf(a['IPEDS ID']) - visibleSchools.indexOf(b['IPEDS ID'])) // Sort to keep visible schools on top
          .map((school, index) => (
            <li key={index} className="school-item">
              <div
                className="school-container2 relative bg-opacity-50 hover:bg-gray-100 transition-colors"
                // Add relative positioning
               
              >
                {/* Pocketly Recommended Badge */}
                {school.recommended && (
                  <div className="absolute top-0 right-0 mr-1">
                 {/* <span class="custom-star">
  ★
</span>*/}
                </div>
                )}
                <div className="column-left2">
                  <Link to={`/school/${school['IPEDS ID']}`} className="school-link">
                    <strong>{school.Name}</strong>
                  </Link>
                </div>

                <div className="column-right2">
                  
                  
                  {!visibleSchools.includes(school['IPEDS ID']) && (
                    <UpgradeTooltipNoBlur
                      uid={auth.currentUser.uid}
                      ipedsId={school['IPEDS ID']}
                      onUnlock={() => unlockSchool(school['IPEDS ID'])} // Pass the unlock function
                    >
                      <div className="lock">
                        <FaLock style={{ fontSize: ".85em" }} />
                      </div>
                    </UpgradeTooltipNoBlur>
                  )}
                  <span
                    className={`chakra-badge css-y5xvhi`}
                    style={{
                      backgroundColor: visibleSchools.includes(school['IPEDS ID']) && school.priceChanged ? '#e7f9f6' : '',
                      color: visibleSchools.includes(school['IPEDS ID']) && school.priceChanged ? '#00b473' : '',
                    }}
                  >
                    {visibleSchools.includes(school['IPEDS ID']) ? school.myPrice : school['Total price for out-of-state students 2022-23']}
                  </span>

                  <ThreeDotsMenu
                    onEdit={() => console.log('Edit clicked for school with IPEDS ID:', school['IPEDS ID'])}
                    onExport={() => console.log('Export clicked for school with IPEDS ID:', school['IPEDS ID'])}
                    onRemove={() => removeSchool(school['IPEDS ID'])}
                    onReset={() => resetMyPrice(school['IPEDS ID'], school['Total price for out-of-state students 2022-23'])}
                  />
                  <br />
                </div>
              </div>
            </li>
          ))
      ) : (
        <li>No schools added yet.</li>
      )}
    </ul>
  );
};

export default MySchools;

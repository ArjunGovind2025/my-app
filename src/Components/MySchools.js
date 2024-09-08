import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, deleteField } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import './MySchools.css';
import SmallerPieChartComponent from './SmallerPieChartComponent';
import { useCombined } from './CollegeContext';
import ThreeDotsMenu from './ThreeDotsMenu';
import { fetchUserAccessLevel } from './retrieving';
import { FaLock } from 'react-icons/fa'; 
import {UpgradeTooltipNoBlur} from './UpgradeTooltip';


const MySchools = () => {
  const { user, myColleges } = useCombined();
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

    return () => unsubscribeAuth();
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

        // Set visible schools directly from user document's visibleColleges field
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
      console.error('Error fetching user document:', error);
      setLoading(false);
    });

    return unsubscribeSnapshot;
  };

  const resetMyPrice = async (ipedsId, outOfStatePrice) => {
    if (!user) {
      console.log('User is not signed in.');
      return;
    }
  
    try {
      const userDocRef = doc(db, 'userData', user.uid);
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
      console.log('myPrice and myPrice_need reset for college with IPEDS ID:', ipedsId);
    } catch (error) {
      console.error('Error resetting myPrice and myPrice_need:', error);
    }
  };

  const removeSchool = async (ipedsId) => {
    if (!user) {
      console.log('User is not signed in.');
      return;
    }

    try {
      const userDocRef = doc(db, 'userData', user.uid);
      await updateDoc(userDocRef, {
        [`myColleges.${ipedsId}`]: deleteField()
      });

      setMySchools(prevSchools => prevSchools.filter(school => school['IPEDS ID'] !== ipedsId));
      setVisibleSchools(prevVisible => prevVisible.filter(id => id !== ipedsId));
      console.log('Removed college with IPEDS ID:', ipedsId);
    } catch (error) {
      console.error('Error removing school:', error);
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
              <Link to={`/school/${school['IPEDS ID']}`} className="school-link">
                <div className="school-container2">
                  <div className="column-left2">
                    <strong>{school.Name}</strong>
                  </div>
                  
                  <div className="column-right2">
                    {!visibleSchools.includes(school['IPEDS ID']) && (
                      <UpgradeTooltipNoBlur>
                        <div className="lock">
                          <FaLock style={{ fontSize: '.85em' }} />
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
                      {!visibleSchools.includes(school['IPEDS ID']) 
                        ? school['Total price for out-of-state students 2022-23'] 
                        : school.myPrice}
                    </span>
                    <ThreeDotsMenu
                      onEdit={() => console.log('Edit clicked')}
                      onExport={() => console.log('Export clicked')}
                      onRemove={() => removeSchool(school['IPEDS ID'])}
                      onReset={() => resetMyPrice(school['IPEDS ID'], school['Total price for out-of-state students 2022-23'])}
                    />
                    <br />
                  </div>
                </div>
              </Link>
            </li>

          ))
      ) : (
        <li>No schools added yet.</li>
      )}
    </ul>
  );
};

export default MySchools;

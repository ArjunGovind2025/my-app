import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import './MySchools.css';
import SmallerPieChartComponent from './SmallerPieChartComponent';
import { useCombined } from './CollegeContext';



const MySchools = () => {
  const { user, myColleges } = useCombined(); // Destructure myColleges from the context
  const [mySchools, setMySchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
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
        setMySchools(collegesArray);
        setLoading(false);
      } else {
        console.log('No such document!');
        // Optionally create a new document for the user if it doesn't exist
        setDoc(userDocRef, { myColleges: {} });
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
        [`myColleges.${ipedsId}.myPrice_need`]: outOfStatePrice, // Resetting myPrice_need
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
  

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <ul className="schools-list">
        {mySchools.length > 0 ? (
          mySchools.map((school, index) => (
            <li key={index} className="school-item">
              <div className="school-container">
                <div className="column-left2">
                  <Link to={`/school/${school['IPEDS ID']}`} className="school-link">
                    <strong>{school.Name}</strong>
                  </Link>
                </div>
                <div className="column-right">
                  <span
                    className="chakra-badge css-y5xvhi"
                    style={{
                      backgroundColor: school.priceChanged ? '#e7f9f6' : '', // Red background if price changed
                      color: school.priceChanged ? '#00b473' : '',
                    }}
                  >
                    {school.myPrice}
                  </span>
                  <button
                    onClick={() => resetMyPrice(school['IPEDS ID'], school['Total price for out-of-state students 2022-23'])}
                    className="reset-button"
                  >
                    --R
                  </button>
                  <br />
                </div>
              </div>
            </li>
          ))
        ) : (
          <li>No schools added yet.</li>
        )}
      </ul>
    </div>
  );
};

export default MySchools;

import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const updateUserCollegePrice = async (userId, ipedsId, name, myPrice) => {
  try {
    if (!userId || !ipedsId) {
      console.error('Invalid userId or ipedsId:', { userId, ipedsId });
      return;
    }

    // Format myPrice as a currency string
    const formattedMyPrice = `$${myPrice.toLocaleString()}`;

    console.log(`Updating user college price for userId: ${userId}, ipedsId: ${ipedsId}, name: ${name}, myPrice: ${formattedMyPrice}`);
    
    const userDocRef = doc(db, 'userData', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log(`Existing user data: ${JSON.stringify(userData, null, 2)}`);
      
      const existingCollegeData = userData.myColleges && userData.myColleges[ipedsId] ? userData.myColleges[ipedsId] : {};
      console.log(`Existing college data for IPEDS ID ${ipedsId}: ${JSON.stringify(existingCollegeData, null, 2)}`);
      
      // Determine meritQualified status
      const avgMeritAid = parseFloat(userData.avgMeritAid) || 0;
      const meritQualified = true;

      // Create the updated college data
      const updatedCollegeData = {
        ...existingCollegeData,
        myPrice: formattedMyPrice,
        meritQualified: meritQualified,
      };
      
      // Update the specific field in Firestore
      await updateDoc(userDocRef, {
        [`myColleges.${ipedsId}`]: updatedCollegeData
      });

      console.log(`Updated user document for college: ${name}, IPEDS ID: ${ipedsId}, myPrice: ${formattedMyPrice}, meritQualified: ${meritQualified}`);
    } else {
      console.log(`User document for user ID ${userId} does not exist.`);
    }
  } catch (error) {
    console.error('Error updating user document:', error);
  }
};


export const fetchMeritAidData = async (userId, userScore, ipedsIds) => {
  console.log(`Fetching merit aid data for User ID: ${userId}, User Score: ${userScore}`);
  const results = [];
  
  try {
    const userDocRef = doc(db, 'userData', userId);
    console.log(`User doc reference created: ${userDocRef.path}`);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const myColleges = userData.myColleges || {};

      console.log(`User's colleges: ${JSON.stringify(myColleges)}`);

      for (const ipedsId of ipedsIds) {
        if (typeof ipedsId !== 'string') {
          console.error(`Invalid IPEDS ID: ${ipedsId}`);
          continue;
        }

        const college = myColleges[ipedsId];
        const collegeData = college;

        if (collegeData) {
          const name = collegeData["Name"];
          const cutoffScore = collegeData['Merit Aid Cutoff Score'];
          const avgMeritAward = collegeData['Avg merit award for Freshman w/out need'];
          const outOfStateCost = parseFloat(collegeData['Total price for out-of-state students 2022-23'].replace(/[^0-9.-]+/g,""));
          const myPriceCurr = parseFloat(collegeData.myPrice.replace(/[^0-9.-]+/g,""));

          console.log(`College Name: ${name}`);
          console.log(`User Score: ${userScore}, Cutoff Score: ${cutoffScore}`);
          console.log(`avgMeritAward Type: ${typeof avgMeritAward}, Value: ${avgMeritAward}`);

          console.log("cutoffScore is a number:", !isNaN(cutoffScore), "Value:", cutoffScore);
          console.log("outOfStateCost is a number:", !isNaN(outOfStateCost), "Value:", outOfStateCost);
          console.log("myPriceCurr is a number:", !isNaN(myPriceCurr), "Value:", myPriceCurr);

          if (!isNaN(cutoffScore) && !isNaN(outOfStateCost) && !isNaN(myPriceCurr)) {
            if (userScore >= cutoffScore) {
              results.push(`${name}: You qualify for merit aid. Average merit award: ${avgMeritAward}`);

              // Ensure avgMeritAward is a string before replacing
              if (typeof avgMeritAward === 'string') {
                const avgMeritAwardValue = parseFloat(avgMeritAward.replace(/[^0-9.-]+/g,""));
                console.log(`Parsed avgMeritAward Value: ${avgMeritAwardValue}`);

                if (!isNaN(avgMeritAwardValue)) {
                  const myPrice = myPriceCurr - avgMeritAwardValue;

                  console.log(`myPriceCurr: ${myPriceCurr}, avgMeritAwardValue: ${avgMeritAwardValue}, Calculated myPrice: ${myPrice}`);

                  // Update user's document in Firestore using the new function
                  await updateUserCollegePrice(userId, ipedsId, name, myPrice);
                } else {
                  console.error(`Invalid avgMeritAward value for college: ${name}`);
                }
              } else {
                console.error(`avgMeritAward is not a string for college: ${name}`);
              }
            } else {
              results.push(`${name}: You do not qualify for merit aid.`);
            }
          } else {
            console.error(`Invalid data for college: ${name}`);
            results.push(`${name}: Invalid data.`);
          }
        } else {
          results.push(`No data available for IPEDS ID: ${ipedsId}`);
        }
      }
    } else {
      results.push('No user data available.');
    }
  } catch (error) {
    console.error('Error fetching merit aid data:', error);
    results.push('Error fetching merit aid data.');
  }
  
  return results;
};

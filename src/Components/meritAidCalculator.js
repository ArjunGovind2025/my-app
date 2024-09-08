import { getDoc, setDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const calculateMeritAidEligibilityScore = async (userId, gpa, testScore, testType = 'SAT') => {
     // Normalize GPA
     const normalizedGpa = (gpa - 2.5) / (4.0 - 2.5);

     // Normalize test score based on the test type
     let normalizedTestScore;
     if (testType === 'SAT') {
       normalizedTestScore = testScore / 1600;
     } else if (testType === 'ACT') {
       normalizedTestScore = testScore / 36;
     } else {
       throw new Error("Invalid test type. Please use 'SAT' or 'ACT'.");
     }
     
 
     // Calculate combined score
     const combinedScore = (normalizedGpa + normalizedTestScore) / 2;

     try {
      // Ensure userId is a string
      userId = String(userId); // Convert userId to string if it's not
  

      console.log(`Updating meritScore for userId: ${userId}`);
  
      // Get the user's document reference
      const userDocRef = doc(db, 'userData', userId);
      console.log(`Document reference created: ${userDocRef.path}`);
  

      const userDocSnap = await getDoc(userDocRef);
      console.log(`Document snapshot obtained: ${userDocSnap.exists()}`);
  
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
  

        console.log('Current userData:', userData);
  

        await updateDoc(userDocRef, { meritScore: combinedScore });
        console.log('meritScore updated or created successfully.');
  

        const updatedDocSnap = await getDoc(userDocRef);
        console.log('Updated userData:', updatedDocSnap.data());
      } else {
        console.error('User document does not exist.');
      }
    } catch (error) {
      console.error('Error updating meritScore:', error.message);
      console.error('Error stack:', error.stack);
    }
  
    return combinedScore;
  };
  

export const updateUserCollegePrice = async (userId, ipedsId, name, myPrice) => {
  try {
    if (!userId || !ipedsId) {
      console.error('Invalid userId or ipedsId:', { userId, ipedsId });
      return;
    }


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
        if (!college) {
          results.push(`No data available for IPEDS ID: ${ipedsId}`);
          continue;
        }

        const name = college["Name"];
        const cutoffScore = college['Merit Aid Cutoff Score'];
        const avgMeritAward = college['Avg merit award for Freshman w/out need'];
        const outOfStateCostStr = college['Total price for out-of-state students 2022-23'];
        const myPriceCurrStr = college.myPrice;
        const myPrice_needStr = college.myPrice_need;
        const meritQualified = college["meritQualified"];

        if (!name || cutoffScore === undefined || avgMeritAward === undefined || !outOfStateCostStr || !myPriceCurrStr || !myPrice_needStr) {
          console.error(`Invalid data for college: ${name}`);
          results.push(`${name}: Invalid data.`);
          continue;
        }

        const outOfStateCost = parseFloat(outOfStateCostStr.replace(/[^0-9.-]+/g,""));
        const myPriceCurr = parseFloat(myPriceCurrStr.replace(/[^0-9.-]+/g,""));
        const myPrice_need = parseFloat(myPrice_needStr.replace(/[^0-9.-]+/g,""));

        console.log(`College Name: ${name}`);
        console.log(`User Score: ${userScore}, Cutoff Score: ${cutoffScore}`);
        console.log(`avgMeritAward Type: ${typeof avgMeritAward}, Value: ${avgMeritAward}`);
        console.log("cutoffScore is a number:", !isNaN(cutoffScore), "Value:", cutoffScore);
        console.log("outOfStateCost is a number:", !isNaN(outOfStateCost), "Value:", outOfStateCost);
        console.log("myPriceCurr is a number:", !isNaN(myPriceCurr), "Value:", myPriceCurr);
        console.log("myPrice_need is a number:", !isNaN(myPrice_need), "Value:", myPrice_need);

        if (!isNaN(cutoffScore) && !isNaN(outOfStateCost) && !isNaN(myPriceCurr) && !isNaN(myPrice_need)) {
          if (userScore >= cutoffScore) {
            results.push(`${name}: You qualify for merit aid. Average merit award: ${avgMeritAward}`);

            if (typeof avgMeritAward === 'string') {
              const avgMeritAwardValue = parseFloat(avgMeritAward.replace(/[^0-9.-]+/g,""));
              console.log(`Parsed avgMeritAward Value: ${avgMeritAwardValue}`);

              if (!isNaN(avgMeritAwardValue)) {
                let myPrice = myPriceCurr;

                if (meritQualified) {
                  console.log("I ENDED UP HERE 1");
                  myPrice = myPrice_need - avgMeritAwardValue;
                } else {
                  console.log("I ENDED UP HERE 2");
                  myPrice = myPriceCurr - avgMeritAwardValue;
                }

                console.log(`myPriceCurr: ${myPriceCurr}, avgMeritAwardValue: ${avgMeritAwardValue}, Calculated myPrice: ${myPrice}`);

                // Update user's document in Firestore using the new function
                await updateUserCollegePrice(userId, ipedsId, name, myPrice);
              } else {
                console.error(`Invalid avgMeritAward value for college: ${name}`);
              }
            } else if (typeof avgMeritAward === 'number') {
              let myPrice = myPriceCurr;

              if (!isNaN(avgMeritAward)) {
                if (meritQualified) {
                  console.log("I ENDED UP HERE 1");
                  myPrice = myPrice_need - avgMeritAward;
                } else {
                  console.log("I ENDED UP HERE 2");
                  myPrice = myPriceCurr - avgMeritAward;
                }

                console.log(`myPriceCurr: ${myPriceCurr}, avgMeritAward: ${avgMeritAward}, Calculated myPrice: ${myPrice}`);

                // Update user's document in Firestore using the new function
                await updateUserCollegePrice(userId, ipedsId, name, myPrice);
              } else {
                console.error(`avgMeritAward is NaN for college: ${name}`);
              }
            } else {
              console.error(`avgMeritAward is neither a string nor a number for college: ${name}`);
            }
          } else {
            //results.push(`${name}: You do not qualify for merit aid.`);
          }
        } else {
          console.error(`Invalid data for college: ${name}`);
          //results.push(`${name}: Invalid data.`);
        }
      }
    } else {
      //results.push('No user data available.');
    }
  } catch (error) {
    console.error('Error fetching merit aid data:', error);
    //results.push('Error fetching merit aid data.');
  }

  return results;
};

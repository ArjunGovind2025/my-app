import { db } from '../firebaseConfig'; 
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateSAI } from './SAI'; 

export const updateCollegePricesWithNeedAid = async (SAI, user) => {

    try {
        const userDocRef = doc(db, 'userData', user.uid); 
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const colleges = userData.myColleges || {};

            console.log('User data retrieved:', userData); 
            console.log('Colleges data:', colleges); 

            const parsedSAI = parseFloat(SAI); 

            if (isNaN(parsedSAI)) {
                console.error(`Invalid SAI value: ${SAI}`);
                return null; 
            }

            console.log(`Parsed SAI: ${parsedSAI} (type: ${typeof parsedSAI})`); 

            for (const collegeId in colleges) {
                const college = colleges[collegeId];

                console.log(`Processing college ID: ${collegeId}`); 

                if (college.myPrice && college['Avg % of Need met for Freshman']) {
                    const myPriceString = college.myPrice.replace(/[^0-9.]/g, '');
                    const myPrice = parseFloat(myPriceString);
                    const avgNeedMet = parseFloat(college['Avg % of Need met for Freshman']) / 100;

     
                    console.log(`Raw myPrice: ${college.myPrice}, Converted myPrice: ${myPrice}`);
                    console.log(`Raw Avg % of Need met for Freshman: ${college['Avg % of Need met for Freshman']}, Converted avgNeedMet: ${avgNeedMet}`);
                    console.log(`SAI: ${parsedSAI}`);

                    // Check if the conversions were successful
                    if (isNaN(myPrice) || isNaN(avgNeedMet)) {
                        console.error(`Invalid number conversion for college ID: ${collegeId}`);
                        console.error(`myPrice: ${myPrice}, avgNeedMet: ${avgNeedMet}, SAI: ${parsedSAI}`);
                        continue; // Skip this college and move to the next one
                    }

                    // Break down the calculation into steps and log each part
                    const priceDifference = myPrice - parsedSAI;
                    if(priceDifference <= 0) {
                        continue
                    }
                    const adjustedDifference = priceDifference * avgNeedMet;
                    const newPrice = adjustedDifference;
                    const finalPrice = myPrice - newPrice ;

                    // Log intermediate and final values
                    console.log(`Price Difference (myPrice - parsedSAI): ${priceDifference}`);
                    console.log(`Adjusted Difference (priceDifference * avgNeedMet): ${adjustedDifference}`);
                    console.log(`New Price (myPrice_need) for college ${college['Name'] || collegeId}: ${newPrice}`);

                    // Update the college map with the new field
                    colleges[collegeId]['myPrice_need'] = String(finalPrice);

                    const formattedPrice = `$${finalPrice.toLocaleString()}`;

                    const collegeFieldPathNeed = `myColleges.${collegeId}.myPrice_need`;
                    const collegeFieldPath = `myColleges.${collegeId}.myPrice`;
                    await updateDoc(userDocRef, { [collegeFieldPathNeed]: String(formattedPrice)});
                    await updateDoc(userDocRef, { [collegeFieldPath]: String(formattedPrice)});
                    await updateSAI(user.uid, parsedSAI); 

                } else {
                    console.log(`Skipping college ID: ${collegeId} - Missing myPrice or Avg % of Need met for Freshman`);
                }
            }

           
            console.log('Updated college prices with need aid successfully.');
            return colleges; 
        } else {
            console.log('No such document!');
        }
    } catch (error) {
        console.error('Error updating college prices with need aid:', error);
    }
    return null;
};

export const updateCurrentStep = async (user, currentStep) => {
    try {
        const userDocRef = doc(db, 'userData', user.uid); 
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            console.log('User data retrieved:', userData); 

            if (userData.currentStep === undefined) {
                console.log('currentStep field does not exist, adding it.');
            } else {
                console.log('currentStep field exists, updating it.');
            }

            await updateDoc(userDocRef, { currentStep });
            console.log('Updated currentStep successfully:', currentStep);
        } else {
            console.log('No such document!');
        }
    } catch (error) {
        console.error('Error updating currentStep:', error);
    }
};

export default updateCollegePricesWithNeedAid;
import { useCombined } from './CollegeContext'; // Import your context
import { getChatResponse } from './API'; // Import your existing API call
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Import Firebase config

export const useGenerateCollegeRecommendations = () => {
  const { addCollegeByIpedsId } = useCombined(); // Destructure addCollegeByIpedsId

  const generateCollegeRecommendations = async (userId, findCollegeIdByName, recommendationCount = 5) => {
    try {
      console.log('🔄 AI RECOMMENDATION PROCESS STARTED');

      // Step 1: Fetch user data
      const userDocRef = doc(db, 'userData', userId);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        throw new Error('❌ User document does not exist.');
      }

      const userData = userDocSnap.data();
      const myColleges = userData.myColleges || {};
      const userStats = {
        GPA: userData.GPA || 'N/A',
        TestScore: userData['Test Score'] || 'N/A',
        State: userData.stateAbbr || 'N/A',
      };

      const collegeNames = Object.values(myColleges).map((college) => college.Name).join(', ');

      console.log(`📋 Current Colleges: ${collegeNames}`);
      console.log(`📊 User Stats: GPA=${userStats.GPA}, Test Score=${userStats.TestScore}, State=${userStats.State}`);

      // Step 2: Call AI for recommendations
      const input = `Here are the user's current colleges: ${collegeNames}. The user's GPA is ${userStats.GPA}, test score is ${userStats.TestScore}, and state is ${userStats.State}. Recommend ${recommendationCount} additional colleges of similar caliber, not necessarily from their state. Return only the college names. If user data is NA just provide good schools`;

      console.log('🚀 Sending to Chat API:', input);
      const aiResponse = await getChatResponse(userId, input, 'Provide short and concise answers.');

      console.log('🧠 Raw AI Response:', aiResponse);

      // Step 3: Process and clean AI response
      const recommendedCollegeNames = aiResponse
        .split('\n')
        .map((line) => line.replace(/^\d+\.\s*/, '').trim())
        .filter((line) => line.length > 0);

      console.log('🏫 Cleaned College Names:', recommendedCollegeNames);

      // Step 4: Convert college names to IDs
      const recommendedColleges = [];
      for (const collegeName of recommendedCollegeNames) {
        if (typeof collegeName !== 'string' || collegeName.trim() === '') continue;

        const matches = await findCollegeIdByName(collegeName);

        if (matches.length > 0) {
          const { id, name } = matches[0];
          await addCollegeByIpedsId(id, true); // Pass 'recommended' flag
          recommendedColleges.push({ id, name });
        }
      }

      // Step 5: Update Firestore with recommendations
      if (recommendedColleges.length > 0) {
        await updateDoc(userDocRef, {
          recommendedColleges: arrayUnion(...recommendedColleges),
        });
      } else {
        console.warn('⚠️ No valid recommendations to add.');
      }
    } catch (error) {
      console.error('🚨 Error generating college recommendations:', error);
      throw error; // Propagate the error to the calling component
    } finally {
      console.log('🔚 AI RECOMMENDATION PROCESS COMPLETED');
    }
  };

  return { generateCollegeRecommendations };
};

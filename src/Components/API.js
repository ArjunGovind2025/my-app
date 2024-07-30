import axios from 'axios';
import { doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import config from '../config.json';
import { checkApiCallCount } from './Access'; // Ensure this path is correct

const OPENAI_API_KEY = config.OPENAI_API_KEY;

const incrementApiCallCount = async (userDocId) => {
  const userDocRef = doc(db, 'userData', userDocId);
  try {
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();

      if (!userData.apiCallCount) {
        // Initialize the field if it doesn't exist
        await updateDoc(userDocRef, { apiCallCount: 1 });
      } else {
        // Increment the existing field
        await updateDoc(userDocRef, { apiCallCount: increment(1) });
      }
    } else {
      console.error('User document does not exist!');
    }
  } catch (error) {
    console.error('Error incrementing API call count:', error);
  }
};

export const getChatResponse = async (userDocId, input, customMessage = '', setShowModal) => {
  try {
    const hasExceededLimit = await checkApiCallCount(userDocId);

    if (hasExceededLimit) {
      setShowModal(true); // Show the modal popup
      throw new Error('API call limit exceeded.');
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `You are an advisor for financing college. ${customMessage}` }, 
          { role: 'user', content: input }
        ],
        max_tokens: 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    await incrementApiCallCount(userDocId);

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    throw new Error('Sorry, I could not process your request at this time.');
  }
};

export const getShortChatResponse = async (userDocId, input, userDoc, myColleges, customMessage = '', setShowModal) => {
  const collegesObject = typeof myColleges === 'object' && myColleges !== null ? myColleges : {};
  const mySchools = Object.values(collegesObject).map(college => college.Name).filter(name => name).join(', ');

  try {
    const hasExceededLimit = await checkApiCallCount(userDocId);

    if (hasExceededLimit) {
      setShowModal(true); // Show the modal popup
      throw new Error('API call limit exceeded.');
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `You are a college advisor. Provide concise and accurate information. Here are the colleges the user is interested in: ${mySchools}. Here is the student's GPA: ${userDoc.GPA} and test score: ${userDoc['Test Score']}. Here is the students financial situation, Student Aid Index(SAI)/EFC: ${userDoc.SAI}. ${customMessage}` },
          { role: 'user', content: 'based on my details ' + input }
        ],
        max_tokens: 300,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    await incrementApiCallCount(userDocId);

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    throw new Error('Sorry, I could not process your request at this time.');
  }
};
